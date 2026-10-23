import mongoose from "mongoose";

import Product from "../models/product.js";
import User from "../models/user.js";

import PromotionPayment from "../models/promotionPayment.js";

export const PACKAGES = Object.freeze({
    publication: {
        amount: 100,
        label: "Հայտարարության հրապարակում",
    },

    top7: {
        amount: 200,
        days: 7,
        label: "TOP՝ 7 օր",
    },

    top30: {
        amount: 600,
        days: 30,
        label: "TOP՝ 30 օր",
    },

    auto7: {
        amount: 100,
        days: 7,
        label: "Ավտոթարմացում՝ 7 օր",
    },
});

const DAY = 24 * 60 * 60 * 1000;

const AUTO_REFRESH_CHECK_INTERVAL = 60 * 1000;

let lastAutoRefreshCheck = 0;
let autoRefreshPromise = null;

function createError(status, message) {
    const error = new Error(message);
    error.status = status;

    return error;
}

// =========================================
// PUBLICATION COUNTER
// =========================================

export async function ensurePublicationCounter(userId) {
    const user = await User.findById(userId).select("freePublicationsUsed");

    if (!user) {
        throw createError(401, "Օգտատերը չի գտնվել։");
    }

    if (
        user.freePublicationsUsed !== null &&
        user.freePublicationsUsed !== undefined
    ) {
        return;
    }

    const historical = await Product.countDocuments({
        owner: userId,

        paymentPending: {
            $ne: true,
        },
    });

    await User.updateOne(
        {
            _id: userId,
            freePublicationsUsed: null,
        },

        {
            $set: {
                freePublicationsUsed: Math.min(historical, 5),
            },
        },
    );
}

// =========================================
// CREATE PRODUCT
// =========================================

export async function publishOrRequestPayment(body, userId, pickFields) {
    await ensurePublicationCounter(userId);

    const product = new Product({
        ...pickFields(body),

        owner: userId,

        status: "draft",
        paymentPending: true,
    });

    await product.validate();

    const slot = await User.findOneAndUpdate(
        {
            _id: userId,

            freePublicationsUsed: {
                $lt: 5,
            },
        },

        {
            $inc: {
                freePublicationsUsed: 1,
            },
        },

        {
            new: true,
        },
    );

    if (slot) {
        try {
            product.status = "active";
            product.paymentPending = false;

            await product.save();

            return product;
        } catch (error) {
            await User.updateOne(
                { _id: userId },
                {
                    $inc: {
                        freePublicationsUsed: -1,
                    },
                },
            );

            throw error;
        }
    }

    await product.save();

    try {
        const payment = await PromotionPayment.create({
            user: userId,
            product: product._id,
            kind: "publication",
            amount: PACKAGES.publication.amount,
        });

        return {
            product,
            payment,
            requiresPayment: true,
        };
    } catch (error) {
        await Product.deleteOne({
            _id: product._id,
            paymentPending: true,
        });

        throw error;
    }
}

// =========================================
// AUTOMATIC REFRESH
// =========================================

async function runAutoRefresh() {
    const now = new Date();

    const oneDayAgo = new Date(now.getTime() - DAY);

    // Պարզ updateMany:
    // չի օգտագործում $dateAdd կամ բարդ pipeline։
    const result = await Product.updateMany(
        {
            status: "active",

            paymentPending: {
                $ne: true,
            },

            autoRefreshUntil: {
                $gt: now,
            },

            $or: [
                {
                    lastRefreshedAt: {
                        $lte: oneDayAgo,
                    },
                },

                {
                    lastRefreshedAt: null,
                },
            ],
        },

        {
            $set: {
                lastRefreshedAt: now,
            },
        },
    );

    return result.modifiedCount || 0;
}

export async function autoRefreshDue() {
    // Միևնույն պահին մի քանի հարցման դեպքում
    // MongoDB-ին չենք ուղարկում բազմաթիվ
    // նույն ավտոթարմացման գործողություններ։
    if (autoRefreshPromise) {
        return autoRefreshPromise;
    }

    const now = Date.now();

    if (now - lastAutoRefreshCheck < AUTO_REFRESH_CHECK_INTERVAL) {
        return 0;
    }

    lastAutoRefreshCheck = now;

    autoRefreshPromise = runAutoRefresh()
        .catch((error) => {
            // Ավտոթարմացման խափանումը չպետք է
            // անջատի հայտարարությունների ցուցակը։
            console.error("[ArmMotors] Auto refresh error:", error);

            lastAutoRefreshCheck = 0;

            return 0;
        })
        .finally(() => {
            autoRefreshPromise = null;
        });

    return autoRefreshPromise;
}

// =========================================
// FREE REFRESH — EVERY 4 DAYS
// =========================================

export async function requestRefresh(productId, userId) {
    if (!mongoose.isValidObjectId(productId)) {
        throw createError(400, "Սխալ հայտարարության ID։");
    }

    const now = new Date();

    const fourDaysAgo = new Date(now.getTime() - 4 * DAY);

    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            owner: userId,
            status: "active",

            paymentPending: {
                $ne: true,
            },

            $or: [
                {
                    lastRefreshedAt: {
                        $lte: fourDaysAgo,
                    },
                },

                {
                    lastRefreshedAt: null,
                },
            ],
        },

        {
            $set: {
                lastRefreshedAt: now,
            },
        },

        {
            new: true,
            runValidators: true,
        },
    );

    if (product) {
        return product;
    }

    const existing = await Product.findOne({
        _id: productId,
        owner: userId,
    });

    if (!existing) {
        throw createError(404, "Հայտարարությունը չի գտնվել։");
    }

    if (existing.status !== "active" || existing.paymentPending) {
        throw createError(
            409,
            "Թարմացվում են միայն հրապարակված ակտիվ հայտարարությունները։",
        );
    }

    const lastRefresh = new Date(
        existing.lastRefreshedAt || existing.createdAt,
    );

    const nextRefresh = new Date(lastRefresh.getTime() + 4 * DAY);

    throw createError(
        429,
        `Հաջորդ անվճար թարմացումը հասանելի կլինի ${nextRefresh.toLocaleDateString(
            "hy-AM",
        )}-ից։`,
    );
}

// =========================================
// CREATE TOP / AUTO REFRESH REQUEST
// =========================================

export async function createUpgradeRequest(userId, productId, kind) {
    if (!Object.hasOwn(PACKAGES, kind) || kind === "publication") {
        throw createError(400, "Սխալ փաթեթ։");
    }

    if (!mongoose.isValidObjectId(productId)) {
        throw createError(400, "Սխալ հայտարարության ID։");
    }

    const product = await Product.findOne({
        _id: productId,
        owner: userId,
        status: "active",

        paymentPending: {
            $ne: true,
        },
    });

    if (!product) {
        throw createError(404, "Ակտիվ հայտարարությունը չի գտնվել։");
    }

    const existing = await PromotionPayment.findOne({
        user: userId,
        product: productId,
        kind,
        status: "pending",
    });

    if (existing) {
        return existing;
    }

    return PromotionPayment.create({
        user: userId,
        product: productId,
        kind,
        amount: PACKAGES[kind].amount,
    });
}

// =========================================
// ADMIN PAYMENT APPROVAL
// =========================================

export async function approvePayment(paymentId, reference, note) {
    if (!mongoose.isValidObjectId(paymentId)) {
        throw createError(400, "Սխալ վճարման ID։");
    }

    const payment = await PromotionPayment.findOneAndUpdate(
        {
            _id: paymentId,
            status: "pending",
        },

        {
            $set: {
                status: "processing",
            },
        },

        {
            new: true,
        },
    );

    if (!payment) {
        throw createError(409, "Այս հայտը չի սպասում հաստատման։");
    }

    let applied = false;

    try {
        const product = await Product.findOne({
            _id: payment.product,
            owner: payment.user,
        });

        if (!product) {
            throw createError(404, "Հայտարարությունը չի գտնվել։");
        }

        const now = new Date();

        if (payment.kind === "publication") {
            if (!product.paymentPending) {
                throw createError(409, "Հայտարարությունն արդեն հրապարակված է։");
            }

            product.paymentPending = false;
            product.status = "active";
            product.lastRefreshedAt = now;
        } else {
            if (product.status !== "active" || product.paymentPending) {
                throw createError(
                    409,
                    "Փաթեթը կիրառվում է միայն ակտիվ հայտարարության համար։",
                );
            }

            if (payment.kind === "auto7") {
                const current = product.autoRefreshUntil?.getTime() || 0;

                product.autoRefreshUntil = new Date(
                    Math.max(now.getTime(), current) +
                        PACKAGES.auto7.days * DAY,
                );
            } else {
                const current = product.topUntil?.getTime() || 0;

                product.topUntil = new Date(
                    Math.max(now.getTime(), current) +
                        PACKAGES[payment.kind].days * DAY,
                );
            }
        }

        await product.save();

        applied = true;

        payment.status = "paid";
        payment.paidAt = now;

        payment.paymentReference = String(reference || "").slice(0, 200);

        payment.adminNote = String(note || "").slice(0, 500);

        await payment.save();

        return payment;
    } catch (error) {
        if (!applied) {
            await PromotionPayment.updateOne(
                {
                    _id: payment._id,
                    status: "processing",
                },

                {
                    $set: {
                        status: "pending",
                    },
                },
            );
        }

        throw error;
    }
}

// =========================================
// SORT PRODUCTS — TOP FIRST
// =========================================

export function sortPublicPipeline(filter, now = new Date()) {
    return [
        {
            $match: filter,
        },

        {
            $addFields: {
                topActive: {
                    $cond: [
                        {
                            $gt: ["$topUntil", now],
                        },
                        1,
                        0,
                    ],
                },

                effectiveRefreshDate: {
                    $ifNull: ["$lastRefreshedAt", "$createdAt"],
                },
            },
        },

        {
            $sort: {
                topActive: -1,
                effectiveRefreshDate: -1,
                createdAt: -1,
                _id: -1,
            },
        },
    ];
}
