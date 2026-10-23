import express from "express";
import Product from "../models/product.js";
import Order from "../models/order.js";
import requireAuth from "../middleware/requireAuth.js";
import { objectId, httpError } from "../utils/http.js";
const router = express.Router();
router.use(requireAuth);
router.get("/", async (req, res, next) => { try { res.json(await Order.find({ buyer: req.userId }).sort({ createdAt: -1 }).limit(100)); } catch (error) { next(error); } });
router.post("/", async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: objectId(req.body?.productId), status: { $nin: ["draft", "sold"] } });
        if (!product) throw httpError(404, "Ապրանքն այլևս հասանելի չէ։");
        if (String(product.owner) === String(req.userId)) throw httpError(400, "Սեփական ապրանքի համար գնման հայտ չի ստեղծվում։");
        const note = typeof req.body.note === "string" ? req.body.note.trim().slice(0, 1000) : "";
        const order = await Order.findOneAndUpdate({ buyer: req.userId, product: product._id, status: "pending" },
            { $setOnInsert: { title: product.title, amount: product.price, currency: "AMD", note } }, { upsert: true, returnDocument: "after", runValidators: true });
        res.status(201).json(order);
    } catch (error) { if (error.code === 11000) return res.status(409).json({ message: "Գնման հայտ արդեն կա։" }); next(error); }
});
router.patch("/:id/cancel", async (req, res, next) => {
    try {
        const order = await Order.findOneAndUpdate({ _id: objectId(req.params.id), buyer: req.userId, status: "pending" }, { $set: { status: "cancelled" } }, { returnDocument: "after" });
        if (!order) throw httpError(409, "Միայն սպասող հայտը կարելի է չեղարկել։");
        res.json(order);
    } catch (error) { next(error); }
});
export default router;

