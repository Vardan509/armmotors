import crypto from "node:crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import User from "../models/user.js";

const RESET_EXPIRY_MS = 30 * 60 * 1000;

const GENERIC_RESPONSE = {
    message:
        "Եթե նշված email-ով հաշիվ գոյություն ունի, կստանաք գաղտնաբառի վերականգնման նամակ։",
};

function createError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function isValidToken(token) {
    return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

function getTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw createError("Email սերվերը կարգավորված չէ։", 503);
    }

    const port = Number(SMTP_PORT);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw createError("SMTP_PORT-ը սխալ է։", 503);
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

function getResetUrl(token) {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw createError("FRONTEND_URL-ը կարգավորված չէ։", 503);
    }

    const url = new URL(frontendUrl);

    if (
        url.protocol !== "https:" &&
        !(
            url.protocol === "http:" &&
            ["localhost", "127.0.0.1"].includes(url.hostname)
        )
    ) {
        throw createError("FRONTEND_URL-ը պետք է լինի HTTPS։", 503);
    }

    const basePath = url.pathname.replace(/\/+$/, "");

    url.pathname = `${basePath}/reset-password`;
    url.search = "";
    url.hash = "";
    url.searchParams.set("token", token);

    return url.toString();
}

// ==========================================
// REQUEST PASSWORD RESET
// ==========================================

export async function requestPasswordReset(email) {
    if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        throw createError("Մուտքագրեք վավեր email։");
    }

    const user = await User.findOne({
        email: email.trim().toLowerCase(),
    }).select("+password");

    // Նույն պատասխանն ենք տալիս նաև
    // գոյություն չունեցող email-ի համար։
    if (!user || !user.password) {
        return GENERIC_RESPONSE;
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = hashToken(token);

    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = expiresAt;

    await user.save({
        validateBeforeSave: false,
    });

    const resetUrl = getResetUrl(token);

    try {
        const transporter = getTransporter();

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,

            to: user.email,

            subject: "ArmMotors — Գաղտնաբառի վերականգնում",

            text: [
                "Բարև Ձեզ։",
                "",
                "Ձեր ArmMotors հաշվի գաղտնաբառը",
                "վերականգնելու համար բացեք հղումը.",
                "",
                resetUrl,
                "",
                "Հղումն ուժի մեջ է 30 րոպե։",
                "",
                "Եթե Դուք չեք խնդրել վերականգնել",
                "գաղտնաբառը, անտեսեք այս նամակը։",
            ].join("\n"),
        });
    } catch (error) {
        console.error("[ArmMotors] Password reset email failed:", error);

        await User.updateOne(
            {
                _id: user._id,
                passwordResetTokenHash: tokenHash,
            },
            {
                $unset: {
                    passwordResetTokenHash: "",
                    passwordResetExpires: "",
                },
            },
        );

        throw createError("Նամակն ուղարկել չհաջողվեց։", 503);
    }

    return GENERIC_RESPONSE;
}

// ==========================================
// VALIDATE RESET TOKEN
// ==========================================

export async function validatePasswordResetToken(token) {
    if (!isValidToken(token)) {
        throw createError("Վերականգնման հղումը սխալ է կամ ժամկետանց։");
    }

    const user = await User.findOne({
        passwordResetTokenHash: hashToken(token),

        passwordResetExpires: {
            $gt: new Date(),
        },
    }).select("_id");

    if (!user) {
        throw createError("Վերականգնման հղումը սխալ է կամ ժամկետանց։");
    }

    return {
        valid: true,
    };
}

// ==========================================
// RESET PASSWORD
// ==========================================

export async function resetPassword({ token, password, repeatPassword }) {
    if (!isValidToken(token)) {
        throw createError("Վերականգնման հղումը սխալ է կամ ժամկետանց։");
    }

    if (
        typeof password !== "string" ||
        password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        throw createError("Գաղտնաբառը պետք է ունենա առնվազն 8 նիշ։");
    }

    if (password !== repeatPassword) {
        throw createError("Գաղտնաբառերը չեն համընկնում։");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Ատոմային թարմացում՝ նույն reset token-ը
    // հնարավոր չէ կրկնակի օգտագործել։
    const user = await User.findOneAndUpdate(
        {
            passwordResetTokenHash: hashToken(token),

            passwordResetExpires: {
                $gt: new Date(),
            },
        },
        {
            $set: {
                password: passwordHash,
            },

            $inc: {
                tokenVersion: 1,
            },

            $unset: {
                passwordResetTokenHash: "",
                passwordResetExpires: "",
            },
        },
        {
            new: true,
            runValidators: true,
        },
    ).select("_id");

    if (!user) {
        throw createError("Վերականգնման հղումը սխալ է կամ ժամկետանց։");
    }

    return {
        userId: user._id,

        message:
            "Գաղտնաբառը հաջողությամբ փոխվել է։ Այժմ կարող եք մուտք գործել։",
    };
}
