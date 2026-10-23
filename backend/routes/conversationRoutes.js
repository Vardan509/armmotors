
import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import Conversation from "../models/conversation.js";
import Product from "../models/product.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

const sendLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Շատ հաղորդագրություններ։ Փորձեք մի փոքր ուշ։",
    },
});

const validId = (id) => mongoose.isObjectIdOrHexString(id);

function isParticipant(conversation, userId) {
    return (
        String(conversation.buyer) === String(userId) ||
        String(conversation.seller) === String(userId)
    );
}

function formatConversation(conversation, userId) {
    const messages = conversation.messages || [];

    return {
        _id: conversation._id,
        product: conversation.product,
        buyer: conversation.buyer,
        seller: conversation.seller,
        lastMessageAt: conversation.lastMessageAt,
        lastMessage: messages.at(-1)?.text || "",
        unreadCount: messages.filter(
            (message) =>
                String(message.sender) !== String(userId) &&
                !message.readBy.some(
                    (id) => String(id) === String(userId)
                )
        ).length,
    };
}

// Սկսել զրույց հայտարարության վաճառողի հետ
router.post("/start", sendLimiter, async (req, res, next) => {
    try {
        const { productId } = req.body || {};

        if (!validId(productId)) {
            return res.status(400).json({
                message: "Սխալ հայտարարության ID։",
            });
        }

        const product = await Product.findById(productId);

        if (!product || product.status !== "active") {
            return res.status(404).json({
                message: "Հայտարարությունը հասանելի չէ։",
            });
        }

        if (String(product.owner) === String(req.userId)) {
            return res.status(400).json({
                message: "Ձեր սեփական հայտարարության հետ զրույց սկսել չի կարելի։",
            });
        }

        const conversation = await Conversation.findOneAndUpdate(
            {
                product: product._id,
                buyer: req.userId,
            },
            {
                $setOnInsert: {
                    product: product._id,
                    buyer: req.userId,
                    seller: product.owner,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            id: conversation._id,
        });
    } catch (error) {
        if (error.code === 11000) {
            const existing = await Conversation.findOne({
                product: req.body.productId,
                buyer: req.userId,
            });

            if (existing) {
                return res.json({ id: existing._id });
            }
        }

        next(error);
    }
});

// Իմ զրույցները
router.get("/", async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            $or: [
                { buyer: req.userId },
                { seller: req.userId },
            ],
        })
            .sort({ lastMessageAt: -1 })
            .limit(100)
            .populate("product", "title images price status")
            .populate("buyer", "name surname")
            .populate("seller", "name surname")
            .lean();

        return res.json({
            items: conversations.map((conversation) =>
                formatConversation(conversation, req.userId)
            ),
        });
    } catch (error) {
        next(error);
    }
});

// Մեկ զրույցի հաղորդագրությունները
router.get("/:id", async (req, res, next) => {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({
                message: "Սխալ զրույցի ID։",
            });
        }

        const conversation = await Conversation.findById(
            req.params.id
        );

        if (
            !conversation ||
            !isParticipant(conversation, req.userId)
        ) {
            return res.status(404).json({
                message: "Զրույցը չի գտնվել։",
            });
        }

        const unreadIds = conversation.messages
            .filter(
                (message) =>
                    String(message.sender) !== String(req.userId) &&
                    !message.readBy.some(
                        (id) => String(id) === String(req.userId)
                    )
            )
            .map((message) => message._id);

        if (unreadIds.length) {
            await Conversation.updateOne(
                { _id: conversation._id },
                {
                    $addToSet: {
                        "messages.$[message].readBy": req.userId,
                    },
                },
                {
                    arrayFilters: [
                        { "message._id": { $in: unreadIds } },
                    ],
                }
            );
        }

        return res.json({
            _id: conversation._id,
            productId: conversation.product,
            buyerId: conversation.buyer,
            sellerId: conversation.seller,
            messages: conversation.messages.map((message) => ({
                _id: message._id,
                sender: message.sender,
                text: message.text,
                createdAt: message.createdAt,
                read: message.readBy.some(
                    (id) =>
                        String(id) !== String(message.sender)
                ),
            })),
        });
    } catch (error) {
        next(error);
    }
});

// Ուղարկել հաղորդագրություն
router.post(
    "/:id/messages",
    sendLimiter,
    async (req, res, next) => {
        try {
            if (!validId(req.params.id)) {
                return res.status(400).json({
                    message: "Սխալ զրույցի ID։",
                });
            }

            const text = req.body?.text;

            if (
                typeof text !== "string" ||
                text.trim().length < 1 ||
                text.trim().length > 2000
            ) {
                return res.status(400).json({
                    message: "Հաղորդագրությունը պետք է պարունակի 1–2000 նիշ։",
                });
            }

            const conversation = await Conversation.findOne({
                _id: req.params.id,
                $or: [
                    { buyer: req.userId },
                    { seller: req.userId },
                ],
            });

            if (!conversation) {
                return res.status(404).json({
                    message: "Զրույցը չի գտնվել։",
                });
            }

            // Պաշտպանություն անսահման մեծ MongoDB փաստաթղթից։
            if (conversation.messages.length >= 500) {
                return res.status(409).json({
                    message:
                        "Այս զրույցի հաղորդագրությունների սահմանաչափը լրացել է։",
                });
            }

            conversation.messages.push({
                sender: req.userId,
                text: text.trim(),
                readBy: [req.userId],
            });

            conversation.lastMessageAt = new Date();

            await conversation.save();

            return res.status(201).json({
                message: "Հաղորդագրությունն ուղարկվեց։",
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
