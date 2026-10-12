import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import listingQueryRoutes from "./routes/listingQueryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import monetizationRoutes from "./routes/monetizationRoutes.js";

function getAllowedOrigins() {
    const configured = process.env.CLIENT_ORIGIN || "";

    const defaults = ["http://localhost:5173", "http://127.0.0.1:5173"];

    return new Set(
        [...defaults, ...configured.split(",")]
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => {
                try {
                    return new URL(item).origin;
                } catch {
                    console.warn(
                        "[ArmMotors] Invalid CLIENT_ORIGIN entry ignored.",
                    );
                    return "";
                }
            })
            .filter(Boolean),
    );
}

export function createApp() {
    const app = express();

    const allowedOrigins = getAllowedOrigins();

    app.disable("x-powered-by");

    app.use(
        cors({
            origin(origin, callback) {
                callback(null, !origin || allowedOrigins.has(origin));
            },

            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

            allowedHeaders: ["Content-Type", "Authorization"],
        }),
    );

    app.use(express.json({ limit: "100kb" }));

    // Backend-ի և MongoDB-ի առողջության ստուգում
    app.get("/api/health", (req, res) => {
        const connected = mongoose.connection.readyState === 1;

        res.status(connected ? 200 : 503).json({
            status: connected ? "ok" : "degraded",
            service: "ArmMotors API",
            database: connected ? "connected" : "disconnected",
        });
    });

    // Եթե MongoDB-ն չի աշխատում
    app.use("/api", (req, res, next) => {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                code: "DATABASE_UNAVAILABLE",
                message:
                    "Տվյալների բազան ժամանակավորապես անհասանելի է։ Ստուգեք MongoDB-ի միացումը։",
            });
        }

        next();
    });

    const limiter = (options) =>
        rateLimit({
            standardHeaders: "draft-8",
            legacyHeaders: false,
            ...options,
        });

    // AUTH
    app.use(
        "/api/auth",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 60,

            skip: (req) => req.method === "GET",

            message: {
                message: "Շատ փորձեր։ Փորձեք ավելի ուշ։",
            },
        }),
        authRoutes,
    );

    // Վճարումներ, TOP, հայտարարության թարմացում
    app.use("/api/monetization", monetizationRoutes);

    // PRODUCTS
    app.use("/api/products", productRoutes);

    // LISTINGS
    app.use("/api/listings", listingQueryRoutes);

    // UPLOADS
    app.use("/api/uploads", uploadRoutes);

    // MESSAGES
    app.use("/api/messages", messageRoutes);

    // CONVERSATIONS
    app.use("/api/conversations", conversationRoutes);

    // FAVORITES
    app.use("/api/favorites", favoriteRoutes);

    // ORDERS
    app.use(
        "/api/orders",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 100,
        }),
        orderRoutes,
    );

    // ADMIN
    app.use("/api/admin", adminRoutes);

    // REPORTS
    app.use(
        "/api/reports",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 20,
        }),
        reportRoutes,
    );

    // 404
    app.use((req, res) => {
        res.status(404).json({
            message: "API հասցեն չի գտնվել։",
        });
    });

    // ERROR HANDLER
    app.use(errorHandler);

    return app;
}
