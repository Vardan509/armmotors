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
// RATE LIMIT HELPERS
// ==========================================

function rateLimitMessage(minutes) {
    return {
        message: `Չափազանց շատ անհաջող փորձեր։ Կրկին փորձեք մոտ ${minutes} րոպեից։`,
    };
}

// ==========================================
// LOGIN RATE LIMIT
// 100 անհաջող փորձ՝ 15 րոպեում
// Հաջողված մուտքերը չեն հաշվվում
// ==========================================

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: rateLimitMessage(15),
});

// ==========================================
// REGISTRATION RATE LIMIT
// ==========================================

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 15,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Գրանցման չափազանց շատ հարցումներ։ Փորձեք ավելի ուշ։",
    },
});

// ==========================================
// PASSWORD RECOVERY RATE LIMIT
// ==========================================

const recoveryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Գաղտնաբառի վերականգնման սահմանաչափը լրացել է։ Փորձեք ավելի ուշ։",
    },
});

// ==========================================
// TRUSTED ORIGIN
// ==========================================

function normalizeOrigin(value) {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

function getAllowedOrigins(req) {
    const allowed = new Set();

    // Local development
    allowed.add("http://localhost:5173");
    allowed.add("http://127.0.0.1:5173");

    // Render / production origins
    const configured = process.env.CLIENT_ORIGIN || "";

    for (const value of configured.split(",")) {
        const origin = normalizeOrigin(value.trim());

        if (origin) {
            allowed.add(origin);
        }
    }

    // Same-origin requests
    const host = req.get("host");

    if (host) {
        const protocol =
            process.env.NODE_ENV === "production" ? "https" : req.protocol;

        const currentOrigin = normalizeOrigin(`${protocol}://${host}`);

        if (currentOrigin) {
            allowed.add(currentOrigin);
        }
    }

    return allowed;
}

function requireTrustedOrigin(req, res, next) {
    const origin = req.get("origin");

    if (!origin) {
        return res.status(403).json({
            message: "Հարցման աղբյուրը չի հաստատվել։",
        });
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (!normalizedOrigin) {
        return res.status(403).json({
            message: "Հարցման աղբյուրը սխալ է։",
        });
    }

    const allowedOrigins = getAllowedOrigins(req);

    if (!allowedOrigins.has(normalizedOrigin)) {
        return res.status(403).json({
            message: "Այս կայքից հարցումն արգելված է։",
        });
    }

    return next();
}

// ==========================================
// LOGIN
// ==========================================

router.post("/login", loginLimiter, controllerLogin);

// ==========================================
// REGISTRATION
// ==========================================

router.post("/reg", registrationLimiter, controllerRegistration);

// ==========================================
// PASSWORD RECOVERY
// ==========================================

router.post("/forgot-password", recoveryLimiter, controllerForgotPassword);

router.get("/reset-password/validate", controllerCheckResetToken);

router.post("/reset-password", recoveryLimiter, controllerResetPassword);

// ==========================================
// GOOGLE CONFIG
// ==========================================

router.get("/config", (req, res) => {
    return res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    });
});

// ==========================================
// GOOGLE LOGIN
// ==========================================

router.post("/google", loginLimiter, async (req, res, next) => {
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

// ==========================================
// GOOGLE LINK
// ==========================================

router.post("/google/link", requireAuth, async (req, res, next) => {
    try {
        const result = await linkGoogle(req.userId, req.body?.credential);

        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

// ==========================================
// REFRESH SESSION
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
