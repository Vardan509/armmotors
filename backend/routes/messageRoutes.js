import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import Message from "../models/message.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

const messageLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Շատ հաղորդագրություններ։ Փորձեք 15 րոպե անց։"
    }
});

router.post("/", messageLimiter, async (req, res, next) => {
    try {
        const {
            name,
            email,
            text,
            listingId = ""
        } = req.body || {};

        const invalidTypes = [name, email, text, listingId]
            .some(value => typeof value !== "string");

        if (
            invalidTypes ||
            name.trim().length < 2 ||
            name.trim().length > 80 ||
            text.trim().length < 5 ||
            text.trim().length > 2000 ||
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            listingId.length > 80
        ) {
            return res.status(400).json({
                message: "Լրացրեք անունը, ճիշտ email-ը և 5–2000 նիշ հաղորդագրություն։"
            });
        }

        const message = await Message.create({
            name,
            email,
            text,
            listingId
        });

        res.status(201).json({
            id: message._id,
            message: "Հաղորդագրությունը փոխանցվել է ադմինին։"
        });
    } catch (error) {
        next(error);
    }
});

router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const page = Math.max(
            1,
            Math.floor(Number(req.query.page) || 1)
        );

        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * 30)
            .limit(30)
            .select("-__v");

        const total = await Message.countDocuments();

        res.json({
            messages,
            total,
            page
        });
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
    try {
        if (
            !mongoose.isObjectIdOrHexString(req.params.id) ||
            !["new", "resolved"].includes(req.body?.status)
        ) {
            return res.status(400).json({
                message: "Սխալ տվյալներ։"
            });
        }

        const message = await Message.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!message) {
            return res.status(404).json({
                message: "Հաղորդագրությունը չի գտնվել։"
            });
        }

        res.json(message);
    } catch (error) {
        next(error);
    }
});

export default router;
