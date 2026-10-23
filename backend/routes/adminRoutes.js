import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import Message from "../models/message.js";
import Audit from "../models/audit.js";
import { Broadcast, BroadcastDelivery } from "../models/broadcast.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin, { isAdminEmail } from "../middleware/requireAdmin.js";
import { pickFields } from "../services/productService.js";
import { queueBroadcast } from "../services/broadcastService.js";
import { emailTemplate, mailConfigured } from "../services/emailService.js";
import {
    objectId,
    pagination,
    literalSearch,
    httpError,
} from "../utils/http.js";

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.param("id", (req, res, next, id) => {
    try {
        objectId(id);
        next();
    } catch (error) {
        next(error);
    }
});
const audit = (req, action, target, details = "") =>
    Audit.create({
        actor: req.userId,
        action,
        target: String(target),
        details,
    });
function productData(body) {
    const data = pickFields(body);
    if (body.status !== undefined) {
        if (!["active", "draft", "sold"].includes(body.status))
            throw httpError(400, "Սխալ ապրանքի կարգավիճակ։");
        data.status = body.status;
    }
    return data;
}
async function broadcastSummary(broadcast) {
    const rows = await BroadcastDelivery.aggregate([
        { $match: { broadcast: broadcast._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return {
        ...broadcast.toObject(),
        counts: Object.fromEntries(rows.map((row) => [row._id, row.count])),
    };
}

router.get("/dashboard", async (req, res) => {
    const period = ["day", "week", "month"].includes(req.query.period)
        ? req.query.period
        : "day";
    const start = new Date(
        Date.now() -
            (period === "day" ? 30 : period === "week" ? 84 : 366) * 86400000,
    );
    const [
        users,
        banned,
        products,
        active,
        pendingOrders,
        messages,
        sales,
        totals,
        recentOrders,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ banned: true }),
        Product.countDocuments(),
        Product.countDocuments({ status: { $nin: ["draft", "sold"] } }),
        Order.countDocuments({ status: "pending" }),
        Message.countDocuments({ status: "new" }),
        Order.aggregate([
            { $match: { status: "completed", paidAt: { $gte: start } } },
            {
                $group: {
                    _id: {
                        $dateTrunc: {
                            date: "$paidAt",
                            unit: period,
                            timezone: "Asia/Yerevan",
                            ...(period === "week"
                                ? { startOfWeek: "monday" }
                                : {}),
                        },
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        Order.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: null,
                    orders: { $sum: 1 },
                    revenue: { $sum: "$amount" },
                },
            },
        ]),
        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("buyer", "name email"),
    ]);
    res.json({
        period,
        timezone: "Asia/Yerevan",
        users,
        banned,
        products,
        active,
        pendingOrders,
        messages,
        revenue: totals[0]?.revenue || 0,
        completedOrders: totals[0]?.orders || 0,
        sales: sales.map((row) => ({
            date: row._id,
            orders: row.orders,
            revenue: row.revenue,
        })),
        recentOrders,
    });
});
router.get("/users", async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const search = literalSearch(req.query.search);
    const query = {
        ...(search
            ? {
                  $or: [
                      { name: new RegExp(search, "i") },
                      { email: new RegExp(search, "i") },
                  ],
              }
            : {}),
        ...(req.query.banned === "true" ? { banned: true } : {}),
    };
    const [items, total] = await Promise.all([
        User.find(query)
            .select("name surname email phone role banned banReason createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(query),
    ]);
    res.json({
        items: items.map((user) => ({
            ...user,
            isAdmin: user.role === "admin" || isAdminEmail(user.email),
        })),
        total,
        page,
        limit,
    });
});
router.patch("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw httpError(404, "Օգտատերը չի գտնվել։");
    if (user.role === "admin" || isAdminEmail(user.email))
        throw httpError(403, "Ադմինի հաշիվը չի կարող արգելափակվել այստեղից։");
    if (typeof req.body?.banned !== "boolean")
        throw httpError(400, "Նշեք ban կամ unban կարգավիճակը։");
    user.banned = req.body.banned;
    user.banReason =
        typeof req.body.reason === "string"
            ? req.body.reason.trim().slice(0, 500)
            : "";
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    await audit(
        req,
        user.banned ? "user.ban" : "user.unban",
        user._id,
        user.banReason,
    );
    res.json({ id: user._id, banned: user.banned });
});
router.delete("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw httpError(404, "Օգտատերը չի գտնվել։");
    if (user.role === "admin" || isAdminEmail(user.email))
        throw httpError(403, "Ադմինի հաշիվը չի կարող ջնջվել այստեղից։");
    await User.updateOne(
        { _id: user._id },
        { $set: { banned: true }, $inc: { tokenVersion: 1 } },
    );
    const ids = (await Product.find({ owner: user._id }).select("_id")).map(
        (product) => product._id,
    );
    await Order.updateMany(
        {
            status: "pending",
            $or: [{ buyer: user._id }, { product: { $in: ids } }],
        },
        { $set: { status: "cancelled" } },
    );
    await Product.deleteMany({ owner: user._id });
    await User.updateMany(
        { favorites: { $in: ids } },
        { $pull: { favorites: { $in: ids } } },
    );
    await BroadcastDelivery.updateMany(
        { user: user._id, status: "pending" },
        { $set: { status: "skipped" } },
    );
    await user.deleteOne();
    await audit(req, "user.delete", req.params.id);
    res.status(204).end();
});
router.get("/products", async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const search = literalSearch(req.query.search);
    const query = search ? { title: new RegExp(search, "i") } : {};
    const [items, total] = await Promise.all([
        Product.find(query)
            .populate("owner", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query),
    ]);
    res.json({ items, total, page, limit });
});
router.post("/products", async (req, res) => {
    const product = await Product.create({
        ...productData(req.body),
        owner: req.userId,
    });
    await audit(req, "product.create", product._id);
    res.status(201).json(product);
});
router.patch("/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw httpError(404, "Ապրանքը չի գտնվել։");
    const data = productData(req.body);
    if (!Object.keys(data).length)
        throw httpError(400, "Խմբագրման տվյալներ չկան։");
    Object.assign(product, data);
    await product.save();
    await audit(req, "product.update", product._id);
    res.json(product);
});
router.delete("/products/:id", async (req, res) => {
    if (!(await Product.findByIdAndDelete(req.params.id)))
        throw httpError(404, "Ապրանքը չի գտնվել։");
    await User.updateMany(
        { favorites: req.params.id },
        { $pull: { favorites: req.params.id } },
    );
    await Order.updateMany(
        { product: req.params.id, status: "pending" },
        { $set: { status: "cancelled" } },
    );
    await audit(req, "product.delete", req.params.id);
    res.status(204).end();
});
router.get("/orders", async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const query = ["pending", "completed", "cancelled"].includes(
        req.query.status,
    )
        ? { status: req.query.status }
        : {};
    const [items, total] = await Promise.all([
        Order.find(query)
            .populate("buyer", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(query),
    ]);
    res.json({ items, total, page, limit });
});
router.patch("/orders/:id", async (req, res) => {
    const status = req.body?.status;
    if (!["completed", "cancelled"].includes(status))
        throw httpError(400, "Սխալ պատվերի կարգավիճակ։");
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== "pending")
        throw httpError(409, "Պատվերն արդեն մշակվել է։");
    if (status === "completed") {
        const product = await Product.findOneAndUpdate(
            { _id: order.product, status: { $nin: ["draft", "sold"] } },
            { $set: { status: "sold" } },
        );
        if (!product)
            throw httpError(409, "Ապրանքն արդեն վաճառված է կամ հասանելի չէ։");
        try {
            const updated = await Order.findOneAndUpdate(
                { _id: order._id, status: "pending" },
                { $set: { status: "completed", paidAt: new Date() } },
                { returnDocument: "after" },
            );
            if (!updated) throw httpError(409, "Պատվերն արդեն մշակվել է։");
            await Order.updateMany(
                { product: order.product, status: "pending" },
                { $set: { status: "cancelled" } },
            );
            await audit(req, "order.completed", order._id);
            return res.json(updated);
        } catch (error) {
            if (!(await Order.exists({ _id: order._id, status: "completed" })))
                await Product.updateOne(
                    { _id: order.product, status: "sold" },
                    { $set: { status: product.status || "active" } },
                );
            throw error;
        }
    }
    const updated = await Order.findOneAndUpdate(
        { _id: order._id, status: "pending" },
        { $set: { status } },
        { returnDocument: "after" },
    );
    if (!updated) throw httpError(409, "Պատվերն արդեն մշակվել է։");
    await audit(req, "order.cancelled", order._id);
    res.json(updated);
});
router.get("/broadcasts", async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const [rows, total, recipients] = await Promise.all([
        Broadcast.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Broadcast.countDocuments(),
        User.countDocuments({ banned: { $ne: true } }),
    ]);
    res.json({
        items: await Promise.all(rows.map(broadcastSummary)),
        total,
        page,
        limit,
        recipients,
        mailConfigured: mailConfigured(),
    });
});
router.post("/broadcasts", async (req, res) => {
    if (
        typeof req.body?.subject !== "string" ||
        typeof req.body?.text !== "string" ||
        !req.body.subject.trim() ||
        !req.body.text.trim()
    )
        throw httpError(400, "Լրացրեք վերնագիրն ու նամակը։");
    const broadcast = await Broadcast.create({
        subject: req.body.subject.trim(),
        text: req.body.text.trim(),
        createdBy: req.userId,
    });
    await audit(req, "broadcast.draft", broadcast._id);
    res.status(201).json(broadcast);
});
router.post("/broadcasts/preview", (req, res) => {
    if (
        typeof req.body?.subject !== "string" ||
        typeof req.body?.text !== "string" ||
        req.body.subject.length > 150 ||
        req.body.text.length > 10000
    )
        throw httpError(400, "Սխալ նամակի տվյալներ։");
    res.json({ html: emailTemplate(req.body.subject, req.body.text) });
});
router.post("/broadcasts/:id/send", async (req, res) => {
    if (req.body?.confirm !== true)
        throw httpError(400, "Հաստատեք ուղարկումը։");
    const broadcast = await queueBroadcast(req.params.id);
    await audit(
        req,
        "broadcast.queue",
        broadcast._id,
        `${broadcast.total} recipients`,
    );
    res.status(202).json(await broadcastSummary(broadcast));
});
router.post("/broadcasts/:id/cancel", async (req, res) => {
    const broadcast = await Broadcast.findOneAndUpdate(
        { _id: req.params.id, status: { $in: ["draft", "queued"] } },
        { $set: { status: "cancelled" } },
        { returnDocument: "after" },
    );
    if (!broadcast)
        throw httpError(409, "Այս նամակը հիմա հնարավոր չէ չեղարկել։");
    await BroadcastDelivery.updateMany(
        { broadcast: broadcast._id, status: "pending" },
        { $set: { status: "skipped" } },
    );
    await audit(req, "broadcast.cancel", broadcast._id);
    res.json(await broadcastSummary(broadcast));
});
router.get("/broadcasts/:id/deliveries", async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const [items, total] = await Promise.all([
        BroadcastDelivery.find({ broadcast: req.params.id })
            .select("email status error sentAt")
            .skip(skip)
            .limit(limit),
        BroadcastDelivery.countDocuments({ broadcast: req.params.id }),
    ]);
    res.json({ items, total, page, limit });
});
router.get("/audit", async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const [items, total] = await Promise.all([
        Audit.find()
            .populate("actor", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Audit.countDocuments(),
    ]);
    res.json({ items, total, page, limit });
});
export default router;
