import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import notificationRoutes from "./routes/notificationRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
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
import monetizationRoutes from "./routes/monetizationRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const backendDirectory = fileURLToPath(new URL("./", import.meta.url));

const uploadsDirectory = path.join(backendDirectory, "uploads");

function getAllowedOrigins() {
    const configured = process.env.CLIENT_ORIGIN || "";

    const defaults = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ];

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

    if (process.env.TRUST_PROXY === "1") {
        app.set("trust proxy", 1);
    }

    app.use((req, res, next) => {
        res.setHeader("X-Content-Type-Options", "nosniff");

        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        res.setHeader("X-Frame-Options", "DENY");

        res.setHeader(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        );

        next();
    });

    app.use(
        cors({
            origin(origin, callback) {
                if (!origin) {
                    return callback(null, true);
                }

                return callback(null, allowedOrigins.has(origin));
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        }),
    );

    app.use(
        express.json({
            limit: "100kb",
        }),
    );

    // Public uploaded images
    app.use(
        "/uploads",
        express.static(uploadsDirectory, {
            dotfiles: "deny",
            index: false,
            fallthrough: false,
            maxAge: "1d",
            setHeaders(res) {
                res.setHeader("X-Content-Type-Options", "nosniff");

                res.setHeader(
                    "Content-Security-Policy",
                    "default-src 'none'; sandbox",
                );
            },
        }),
    );

    app.get("/api/health", (req, res) => {
        const connected = mongoose.connection.readyState === 1;

        return res.status(connected ? 200 : 503).json({
            status: connected ? "ok" : "degraded",
            service: "ArmMotors API",
            database: connected ? "connected" : "disconnected",
        });
    });

    app.use("/api", (req, res, next) => {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                code: "DATABASE_UNAVAILABLE",
                message:
                    "Տվյալների բազան ժամանակավորապես անհասանելի է։ Ստուգեք MongoDB-ի միացումը։",
            });
        }

        return next();
    });

    const limiter = (options) =>
        rateLimit({
            standardHeaders: "draft-8",
            legacyHeaders: false,
            ...options,
        });

    app.use("/api/notifications", notificationRoutes);

    app.use("/api/auth", authRoutes);

    app.use("/api/monetization", monetizationRoutes);

    app.use("/api/products", productRoutes);

    app.use("/api/sellers", sellerRoutes);

    app.use("/api/listings", listingQueryRoutes);

    app.use(
        "/api/translations",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 30,
            message: {
                code: "TRANSLATION_RATE_LIMIT",
                message:
                    "Թարգմանության հարցումների սահմանաչափը լրացել է։ Փորձեք ավելի ուշ։",
            },
        }),
        translationRoutes,
    );

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
        orderRoutes,
    );

    app.use("/api/admin", adminRoutes);

    app.use(
        "/api/reports",
        limiter({
            windowMs: 15 * 60 * 1000,
            limit: 20,
        }),
        reportRoutes,
    );

    app.use((req, res) => {
        return res.status(404).json({
            message: "API հասցեն չի գտնվել։",
        });
    });

    app.use(errorHandler);

    return app;
}
