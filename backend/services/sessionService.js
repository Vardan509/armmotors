import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import RefreshSession from "../models/RefreshSession.js";

const ACCESS_TOKEN_SECONDS = 15 * 60;
const REMEMBER_DAYS = 30;
const SHORT_SESSION_DAYS = 1;

const COOKIE_NAME = "armmotors_refresh";

function createError(message, status = 401) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function generateRefreshToken() {
    return crypto.randomBytes(48).toString("hex");
}

function getCookieOptions(maxAge) {
    const production = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: production,
        sameSite: production ? "none" : "lax",
        path: "/api/auth",
        maxAge: Math.max(0, maxAge),
    };
}

function getUserPayload(user) {
    return {
        id: user._id,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        email: user.email,
        isAdmin: user.role === "admin",
    };
}

function signAccessToken(user) {
    if (!process.env.JWT_SECRET) {
        throw createError("JWT_SECRET-ը կարգավորված չէ։", 500);
    }

    return jwt.sign(
        {
            userId: user._id.toString(),
            version: user.tokenVersion || 0,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_SECONDS,
        },
    );
}

function getExpiry(remember) {
    const days = remember ? REMEMBER_DAYS : SHORT_SESSION_DAYS;

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function getRefreshToken(req) {
    const raw = req.headers.cookie || "";

    const entry = raw
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith(`${COOKIE_NAME}=`));

    if (!entry) {
        return null;
    }

    const token = entry.slice(COOKIE_NAME.length + 1);

    return /^[a-f0-9]{96}$/.test(token) ? token : null;
}

export function clearSessionCookie(res) {
    const options = getCookieOptions(0);

    delete options.maxAge;

    res.clearCookie(COOKIE_NAME, options);
}

// ==========================================
// CREATE SESSION
// ==========================================

export async function createSession(user, req, res, remember = false) {
    if (!user || user.banned) {
        throw createError("Այս հաշվի համար մուտքն անհասանելի է։", 403);
    }

    // Նախ ստուգում ենք JWT-ի կարգավորումը,
    // հետո միայն ստեղծում refresh session։
    const accessToken = signAccessToken(user);

    const refreshToken = generateRefreshToken();
    const expiresAt = getExpiry(remember);

    await RefreshSession.create({
        user: user._id,
        tokenHash: hashToken(refreshToken),
        tokenVersion: user.tokenVersion || 0,
        expiresAt,
        createdIp: String(req.ip || "").slice(0, 100),
        userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
    });

    res.cookie(
        COOKIE_NAME,
        refreshToken,
        getCookieOptions(expiresAt.getTime() - Date.now()),
    );

    return {
        token: accessToken,
        user: getUserPayload(user),
    };
}

// ==========================================
// REFRESH SESSION
// ==========================================

export async function refreshSession(req, res) {
    const oldToken = getRefreshToken(req);

    if (!oldToken) {
        throw createError("Ակտիվ session չի գտնվել։");
    }

    const oldHash = hashToken(oldToken);

    const session = await RefreshSession.findOne({
        tokenHash: oldHash,
        revokedAt: null,
        expiresAt: {
            $gt: new Date(),
        },
    });

    if (!session) {
        clearSessionCookie(res);

        throw createError("Session-ը ավարտվել է։");
    }

    const user = await User.findById(session.user);

    if (
        !user ||
        user.banned ||
        (session.tokenVersion || 0) !== (user.tokenVersion || 0)
    ) {
        await RefreshSession.updateOne(
            {
                _id: session._id,
            },
            {
                $set: {
                    revokedAt: new Date(),
                },
            },
        );

        clearSessionCookie(res);

        throw createError("Մուտքի տվյալները փոխվել են։ Կրկին մուտք գործեք։");
    }

    const accessToken = signAccessToken(user);

    const newToken = generateRefreshToken();

    // Նույն refresh token-ը կարող է
    // հաջող օգտագործվել միայն մեկ անգամ։
    const rotated = await RefreshSession.findOneAndUpdate(
        {
            _id: session._id,
            tokenHash: oldHash,
            revokedAt: null,
            tokenVersion: user.tokenVersion || 0,
            expiresAt: {
                $gt: new Date(),
            },
        },
        {
            $set: {
                tokenHash: hashToken(newToken),
                lastUsedAt: new Date(),
            },
        },
        {
            new: true,
        },
    );

    if (!rotated) {
        clearSessionCookie(res);

        throw createError("Session-ը թարմացնել չհաջողվեց։");
    }

    // Պահպանվում է սկզբնական ժամկետը։
    const remainingMs = rotated.expiresAt.getTime() - Date.now();

    if (remainingMs <= 0) {
        clearSessionCookie(res);

        throw createError("Session-ի ժամկետն ավարտվել է։");
    }

    // Վերջնական ստուգում՝ գաղտնաբառը
    // թարմացման ընթացքում փոխված չլինի։
    const currentUser = await User.findById(user._id).select(
        "tokenVersion banned",
    );

    if (
        !currentUser ||
        currentUser.banned ||
        (currentUser.tokenVersion || 0) !== (user.tokenVersion || 0)
    ) {
        await RefreshSession.updateOne(
            { _id: rotated._id },
            {
                $set: {
                    revokedAt: new Date(),
                },
            },
        );

        clearSessionCookie(res);

        throw createError("Մուտքը պետք է կրկին հաստատել։");
    }

    res.cookie(COOKIE_NAME, newToken, getCookieOptions(remainingMs));

    return {
        token: accessToken,
        user: getUserPayload(user),
    };
}

// ==========================================
// LOGOUT CURRENT SESSION
// ==========================================

export async function revokeSession(req, res) {
    const token = getRefreshToken(req);

    if (token) {
        await RefreshSession.updateOne(
            {
                tokenHash: hashToken(token),
                revokedAt: null,
            },
            {
                $set: {
                    revokedAt: new Date(),
                },
            },
        );
    }

    clearSessionCookie(res);
}

// ==========================================
// LOGOUT ALL DEVICES
// ==========================================

export async function revokeAllUserSessions(userId) {
    await RefreshSession.updateMany(
        {
            user: userId,
            revokedAt: null,
        },
        {
            $set: {
                revokedAt: new Date(),
            },
        },
    );
}

export const SESSION_CONFIG = {
    accessTokenSeconds: ACCESS_TOKEN_SECONDS,
    rememberDays: REMEMBER_DAYS,
    cookieName: COOKIE_NAME,
};
