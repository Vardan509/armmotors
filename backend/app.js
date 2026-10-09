import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

export function createApp() {
    const app = express();
    app.disable("x-powered-by");
    app.use(
        cors({
            origin: (
                process.env.CLIENT_ORIGIN ||
                "http://localhost:5173,http://127.0.0.1:5173"
            )
                .split(",")
                .map((value) => value.trim()),
        }),
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
            windowMs: 15 * 60000,
            limit: 60,
            skip: (req) => req.method === "GET",
            message: { message: "Շատ փորձեր։ Փորձեք ավելի ուշ։" },
        }),
        authRoutes,
    );
    app.use("/api/products", productRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/favorites", favoriteRoutes);
    app.use(
        "/api/orders",
        limiter({ windowMs: 15 * 60000, limit: 100 }),
        orderRoutes,
    );
    app.use("/api/admin", adminRoutes);
    app.get("/api/health", (req, res) => res.json({ status: "ok" }));

    app.use((error, req, res, next) => {
        if (res.headersSent) return next(error);
        const status =
            error.code === 11000
                ? 409
                : error.name === "ValidationError" ||
                    error.name === "CastError" ||
                    error.type === "entity.parse.failed"
                  ? 400
                  : error.status ||
                    (error.type === "entity.too.large" ? 413 : 500);
        res.status(status).json({
            message:
                status >= 500 && !error.status
                    ? "Սերվերի սխալ։ Փորձեք ավելի ուշ։"
                    : error.code === 11000
                      ? "Տվյալներն արդեն գոյություն ունեն։"
                      : error.message,
        });
    });
    return app;
}
