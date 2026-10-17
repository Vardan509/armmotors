import express from "express";
import rateLimit from "express-rate-limit";

import {
    controllerLogin,
    controllerRegistration,
    controllerForgotPassword,
    controllerCheckResetToken,
    controllerResetPassword,
} from "../controllers/authControllers.js";

import requireAuth from "../middleware/requireAuth.js";
import { googleLogin, linkGoogle } from "../services/googleAuth.js";

import {
    createSession,
    refreshSession,
    revokeSession,
} from "../services/sessionService.js";

import User from "../models/user.js";

const router = express.Router();

// ==========================================
// RATE LIMITS
// ==========================================

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Չափազանց շատ փորձեր։ Փորձեք ավելի ուշ։",
    },
});

const recoveryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Չափազանց շատ փորձեր։ Փորձեք ավելի ուշ։",
    },
});

// ==========================================
// TRUSTED ORIGIN
// ==========================================

function requireTrustedOrigin(req, res, next) {
    const origin = req.headers.origin;

    if (!origin) {
        return res.status(403).json({
            message: "Հարցման աղբյուրը չի հաստատվել։",
        });
    }

    let normalizedOrigin;

    try {
        normalizedOrigin = new URL(origin).origin;
    } catch {
        return res.status(403).json({
            message: "Հարցման աղբյուրը սխալ է։",
        });
    }

    const configured = process.env.CLIENT_ORIGIN || "";

    const allowed = new Set([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        ...configured.split(",").map((item) => item.trim()),
    ]);

    const normalizedAllowed = new Set();

    for (const value of allowed) {
        try {
            normalizedAllowed.add(new URL(value).origin);
        } catch {
            // Ignore invalid origins.
        }
    }

    if (!normalizedAllowed.has(normalizedOrigin)) {
        return res.status(403).json({
            message: "Այս կայքից հարցումն արգելված է։",
        });
    }

    return next();
}

// ==========================================
// AUTH
// ==========================================

router.post("/login", authLimiter, controllerLogin);

router.post("/reg", authLimiter, controllerRegistration);

// ==========================================
// PASSWORD RECOVERY
// ==========================================

router.post("/forgot-password", recoveryLimiter, controllerForgotPassword);

router.get("/reset-password/validate", controllerCheckResetToken);

router.post("/reset-password", recoveryLimiter, controllerResetPassword);

// ==========================================
// GOOGLE
// ==========================================

router.get("/config", (req, res) => {
    return res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    });
});

router.post("/google", authLimiter, async (req, res, next) => {
    try {
        const result = await googleLogin(req.body?.credential);

        const user = await User.findById(result.user.id);

        if (!user) {
            return res.status(401).json({
                message: "Օգտատերը չի գտնվել։",
            });
        }

        const session = await createSession(
            user,
            req,
            res,
            req.body?.remember === true,
        );

        return res.status(200).json(session);
    } catch (error) {
        return next(error);
    }
});

router.post("/google/link", requireAuth, async (req, res, next) => {
    try {
        const result = await linkGoogle(req.userId, req.body?.credential);

        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

// ==========================================
// REFRESH
// ==========================================

router.post("/refresh", requireTrustedOrigin, async (req, res, next) => {
    try {
        const session = await refreshSession(req, res);

        return res.status(200).json(session);
    } catch (error) {
        return next(error);
    }
});

// ==========================================
// CURRENT USER
// ==========================================

router.get("/me", requireAuth, async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Կրկին մուտք գործեք։",
            });
        }

        return res.status(200).json({
            id: user._id,
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            email: user.email,
            isAdmin: user.role === "admin",
        });
    } catch (error) {
        return next(error);
    }
});

// ==========================================
// LOGOUT
// ==========================================

router.post("/logout", requireTrustedOrigin, async (req, res, next) => {
    try {
        await revokeSession(req, res);

        return res.status(204).end();
    } catch (error) {
        return next(error);
    }
});

export default router;
