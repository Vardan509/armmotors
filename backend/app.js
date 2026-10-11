
import express from "express";
import cors from "cors";
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

export function createApp() {
    const app = express();

    app.disable("x-powered-by");

    const allowedOrigins = (
        process.env.CLIENT_ORIGIN ||
        "http://localhost:5173,http://127.0.0.1:5173"
    )
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    app.use(
        cors({
            origin: allowedOrigins,
        })
    );

    app.use(express.json({ limit: "100kb" }));

    const limiter = (options) =>
        rateLimit({
            standardHeaders: "draft-8",
            legacyHeaders: false,
            ...options,
        });

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
        authRoutes
    );

    app.use("/api/products", productRoutes);
    app.use("/api/listings", listingQueryRoutes);

    app.use("/api/uploads", uploadRoutes);

    app.use("/api/messages", messageRoutes);
    app.use("/api/conversations", conversationRoutes);

    app.use("/api/favorites", favoriteRoutes);

    app.use(
        "/api/orders",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 100,
        }),
        orderRoutes
    );

    app.use("/api/admin", adminRoutes);

    app.use(
        "/api/reports",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 20,
        }),
        reportRoutes
    );

    app.get("/api/health", (req, res) => {
        res.status(200).json({
            status: "ok",
            service: "ArmMotors API",
        });
    });

    app.use((req, res) => {
        res.status(404).json({
            message: "API հասցեն չի գտնվել։",
        });
    });

    app.use(errorHandler);

    return app;
}
