import express from "express";
import mongoose from "mongoose";

import User from "../models/user.js";
import PromotionPayment from "../models/promotionPayment.js";

import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

import {
    PACKAGES,
    ensurePublicationCounter,
    requestRefresh,
    createUpgradeRequest,
    approvePayment,
} from "../services/monetizationService.js";

const router = express.Router();

// Բոլոր գործողությունները պահանջում են մուտք։
router.use(requireAuth);

// -----------------------------------------
// ՓԱԹԵԹՆԵՐԻ ԳՆԵՐ ԵՎ ԱՆՎՃԱՐ ՍԱՀՄԱՆԱՉԱՓ
// GET /api/monetization/plans
// -----------------------------------------

router.get("/plans", async (req, res, next) => {
    try {
        await ensurePublicationCounter(req.userId);

        const user = await User.findById(req.userId).select(
            "freePublicationsUsed",
        );

        res.json({
            freeLimit: 5,

            used: user.freePublicationsUsed || 0,

            packages: PACKAGES,

            // Իրական օնլայն վճարումը դեռ միացված չէ։
            paymentMode: "manual-review",
        });
    } catch (error) {
        next(error);
    }
});

// -----------------------------------------
// ՕԳՏԱՏԻՐՈՋ ՎՃԱՐՈՒՄՆԵՐԻ ՊԱՏՄՈՒԹՅՈՒՆ
// GET /api/monetization/payments
// -----------------------------------------

router.get("/payments", async (req, res, next) => {
    try {
        const payments = await PromotionPayment.find({
            user: req.userId,
        })
            .sort({
                createdAt: -1,
            })
            .limit(100)
            .lean();

        res.json(payments);
    } catch (error) {
        next(error);
    }
});

// -----------------------------------------
// ԱՆՎՃԱՐ ԹԱՐՄԱՑՈՒՄ՝ 4 ՕՐԸ ՄԵԿ
// POST /api/monetization/products/:id/refresh
// -----------------------------------------

router.post("/products/:id/refresh", async (req, res, next) => {
    try {
        const product = await requestRefresh(req.params.id, req.userId);

        res.json(product);
    } catch (error) {
        next(error);
    }
});

// -----------------------------------------
// TOP / ԱՎՏՈԹԱՐՄԱՑՄԱՆ ՓԱԹԵԹԻ ՀԱՅՏ
// POST /api/monetization/products/:id/upgrade
// -----------------------------------------

router.post("/products/:id/upgrade", async (req, res, next) => {
    try {
        const payment = await createUpgradeRequest(
            req.userId,
            req.params.id,
            req.body?.kind,
        );

        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
});

// -----------------------------------------
// ADMIN — ՍՊԱՍՈՂ ՎՃԱՐՈՒՄՆԵՐ
// GET /api/monetization/admin/payments
// -----------------------------------------

router.get("/admin/payments", requireAdmin, async (req, res, next) => {
    try {
        const payments = await PromotionPayment.find({
            status: "pending",
        })
            .sort({
                createdAt: 1,
            })
            .limit(200)
            .populate("user", "name email")
            .populate("product", "title")
            .lean();

        res.json(payments);
    } catch (error) {
        next(error);
    }
});

// -----------------------------------------
// ADMIN — ՎՃԱՐՄԱՆ ՀԱՍՏԱՏՈՒՄ
// POST /api/monetization/admin/payments/:id/approve
// -----------------------------------------

router.post(
    "/admin/payments/:id/approve",
    requireAdmin,
    async (req, res, next) => {
        try {
            if (
                typeof req.body?.paymentReference !== "string" ||
                !req.body.paymentReference.trim()
            ) {
                return res.status(400).json({
                    message: "Նշեք փաստացի ստացված վճարման հղումը/համարը։",
                });
            }

            const payment = await approvePayment(
                req.params.id,

                req.body.paymentReference.trim(),

                req.body.note,
            );

            res.json(payment);
        } catch (error) {
            next(error);
        }
    },
);

// -----------------------------------------
// ADMIN — ՎՃԱՐՄԱՆ ՄԵՐԺՈՒՄ
// POST /api/monetization/admin/payments/:id/reject
// -----------------------------------------

router.post(
    "/admin/payments/:id/reject",
    requireAdmin,
    async (req, res, next) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    message: "Սխալ ID",
                });
            }

            const payment = await PromotionPayment.findOneAndUpdate(
                {
                    _id: req.params.id,

                    status: "pending",
                },

                {
                    $set: {
                        status: "rejected",

                        adminNote: String(req.body?.note || "").slice(0, 500),
                    },
                },

                {
                    new: true,
                },
            );

            if (!payment) {
                return res.status(409).json({
                    message: "Հայտը սպասման մեջ չէ։",
                });
            }

            res.json(payment);
        } catch (error) {
            next(error);
        }
    },
);

export default router;
