import express from "express";
import mongoose from "mongoose";

import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

import Product from "../models/product.js";
import Report from "../models/report.js";

const router = express.Router();

const REASONS = ["spam", "fraud", "incorrect", "other"];

function validId(id) {
    return mongoose.isObjectIdOrHexString(id);
}

// Օգտատերը բողոք է ուղարկում
router.post("/", requireAuth, async (req, res, next) => {
    try {
        const { productId, reason, details = "" } = req.body || {};

        if (
            !validId(productId) ||
            !REASONS.includes(reason) ||
            typeof details !== "string" ||
            details.length > 1000
        ) {
            return res.status(400).json({
                message: "Սխալ տվյալներ։",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Հայտարարությունը չի գտնվել։",
            });
        }

        if (String(product.owner) === String(req.userId)) {
            return res.status(400).json({
                message: "Ձեր հայտարարության մասին բողոք ուղարկել չի կարելի։",
            });
        }

        const report = await Report.findOneAndUpdate(
            {
                product: productId,
                reporter: req.userId,
            },
            {
                $set: {
                    reason,
                    details: details.trim(),
                    status: "open",
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            },
        );

        return res.status(201).json({
            message: "Բողոքը հաջողությամբ ուղարկվեց։",
            id: report._id,
        });
    } catch (error) {
        next(error);
    }
});

// Ադմինը տեսնում է բողոքները
router.get("/admin", requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const page = Math.max(
            1,
            Math.min(100000, Number.parseInt(req.query.page, 10) || 1),
        );

        const limit = 15;

        const status = req.query.status;

        const filter = ["open", "resolved"].includes(status) ? { status } : {};

        const [items, total] = await Promise.all([
            Report.find(filter)
                .populate("product", "title price status images")
                .populate("reporter", "name surname email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            Report.countDocuments(filter),
        ]);

        return res.json({
            items,
            total,
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
});

// Ադմինը մշակում է բողոքը
router.patch(
    "/admin/:id",
    requireAuth,
    requireAdmin,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { action } = req.body || {};

            if (!validId(id)) {
                return res.status(400).json({
                    message: "Սխալ բողոքի ID։",
                });
            }

            if (!["resolve", "reopen", "hide-product"].includes(action)) {
                return res.status(400).json({
                    message: "Սխալ գործողություն։",
                });
            }

            const report = await Report.findById(id);

            if (!report) {
                return res.status(404).json({
                    message: "Բողոքը չի գտնվել։",
                });
            }

            if (action === "hide-product") {
                const product = await Product.findById(report.product);

                if (!product) {
                    return res.status(404).json({
                        message: "Հայտարարությունն արդեն ջնջված է։",
                    });
                }

                product.status = "draft";
                await product.save();

                report.status = "resolved";
            }

            if (action === "resolve") {
                report.status = "resolved";
            }

            if (action === "reopen") {
                report.status = "open";
            }

            await report.save();

            return res.json({
                message: "Գործողությունը հաջողությամբ կատարվեց։",
                report,
            });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
