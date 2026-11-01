import express from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { randomInt, createHmac } from "node:crypto";

import User from "../models/user.js";
import requireAuth from "../middleware/requireAuth.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

const emailChangeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
    },
    oldEmail: {
        type: String,
        required: true,
    },
    newEmail: {
        type: String,
        required: true,
    },
    codeHash: {
        type: String,
        required: true,
        select: false,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
});

const EmailChange =
    mongoose.models.ProfileEmailChange ||
    mongoose.model("ProfileEmailChange", emailChangeSchema);

const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Մի փոքր սպասեք և կրկին փորձեք։",
    },
});

function publicUser(user) {
    return {
        id: String(user._id),
        name: user.name || "",
        surname: user.surname || "",
        phone: user.phone || "",
        email: user.email || "",
        isAdmin: user.role === "admin",
    };
}

function codeHash(userId, code) {
    return createHmac("sha256", process.env.JWT_SECRET)
        .update(`${userId}:${code}`)
        .digest("hex");
}

function normalizePhone(value) {
    const source = value.trim();

    if (!/^[+\d\s()-]+$/.test(source)) return "";

    let phone = source.replace(/[\s()-]/g, "");

    if (/^0\d{8}$/.test(phone)) {
        phone = `+374${phone.slice(1)}`;
    } else if (/^\d{8}$/.test(phone)) {
        phone = `+374${phone}`;
    }

    return /^\+?[0-9]{8,15}$/.test(phone) ? phone : "";
}

/*
 * Մուտքի ստուգումը կցված է միայն պրոֆիլի հարցումներին։
 * /login, /reg, /refresh և մյուս auth հարցումները
 * այս router-ը չի արգելափակում։
 */

router.get("/profile", requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "Հաշիվը չի գտնվել։",
            });
        }

        return res.json({ user: publicUser(user) });
    } catch (error) {
        return next(error);
    }
});

router.patch("/profile", requireAuth, async (req, res, next) => {
    try {
        const { name, surname, phone } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof surname !== "string" ||
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                message: "Լրացրեք անունը, ազգանունը և հեռախոսահամարը։",
            });
        }

        const cleanName = name.trim();
        const cleanSurname = surname.trim();
        const cleanPhone = normalizePhone(phone);

        if (!cleanName || cleanName.length > 60 || cleanSurname.length > 60) {
            return res.status(400).json({
                message: "Անունը կամ ազգանունը սխալ է։",
            });
        }

        if (!cleanPhone) {
            return res.status(400).json({
                message: "Նշեք ճիշտ հեռախոսահամար։",
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "Հաշիվը չի գտնվել։",
            });
        }

        user.name = cleanName;
        user.surname = cleanSurname;
        user.phone = cleanPhone;

        await user.save();

        return res.json({ user: publicUser(user) });
    } catch (error) {
        return next(error);
    }
});

router.post(
    "/profile/email-request",
    requireAuth,
    emailLimiter,
    async (req, res, next) => {
        try {
            const email = req.body?.email;

            if (
                typeof email !== "string" ||
                email.length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
            ) {
                return res.status(400).json({
                    message: "Նշեք ճիշտ էլ․ փոստ։",
                });
            }

            const newEmail = email.trim().toLowerCase();
            const user = await User.findById(req.userId);

            if (!user) {
                return res.status(404).json({
                    message: "Հաշիվը չի գտնվել։",
                });
            }

            if (newEmail === user.email) {
                return res.status(400).json({
                    message: "Սա արդեն Ձեր էլ․ փոստն է։",
                });
            }

            if (await User.exists({ email: newEmail })) {
                return res.status(409).json({
                    message: "Այդ էլ․ փոստով հաշիվ արդեն կա։",
                });
            }

            const code = String(randomInt(100000, 1000000));
            const hash = codeHash(req.userId, code);

            await EmailChange.findOneAndUpdate(
                { userId: req.userId },
                {
                    $set: {
                        oldEmail: user.email,
                        newEmail,
                        codeHash: hash,
                        attempts: 0,
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    },
                },
                {
                    upsert: true,
                    runValidators: true,
                },
            );

            try {
                await sendEmail(
                    newEmail,
                    "ArmMotors — Email verification",
                    `
                    <div style="font-family:Arial,sans-serif;color:#173454">
                        <h2>ArmMotors</h2>
                        <p>Ձեր էլ․ փոստի հաստատման կոդը՝</p>
                        <p style="font-size:30px;font-weight:bold;letter-spacing:6px">
                            ${code}
                        </p>
                        <p>Կոդը գործում է 10 րոպե։</p>
                        <p>Եթե հարցումը Դուք չեք կատարել, անտեսեք այս նամակը։</p>
                    </div>
                    `,
                );
            } catch {
                await EmailChange.deleteOne({
                    userId: req.userId,
                    codeHash: hash,
                });

                return res.status(503).json({
                    message: "Նամակն ուղարկել չհաջողվեց։ Կրկին փորձեք։",
                });
            }

            return res.json({
                message: "Հաստատման կոդն ուղարկված է։",
            });
        } catch (error) {
            return next(error);
        }
    },
);

router.post("/profile/email-confirm", requireAuth, async (req, res, next) => {
    try {
        const code = String(req.body?.code || "").trim();

        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                message: "Մուտքագրեք 6-նիշ կոդը։",
            });
        }

        const request = await EmailChange.findOneAndUpdate(
            {
                userId: req.userId,
                expiresAt: { $gt: new Date() },
                attempts: { $lt: 5 },
            },
            { $inc: { attempts: 1 } },
            { returnDocument: "after" },
        ).select("+codeHash");

        if (!request) {
            return res.status(400).json({
                message: "Կոդը ժամկետանց է։ Նոր կոդ պահանջեք։",
            });
        }

        if (request.codeHash !== codeHash(req.userId, code)) {
            return res.status(400).json({
                message: "Կոդը սխալ է։",
            });
        }

        const consumed = await EmailChange.findOneAndDelete({
            _id: request._id,
            codeHash: request.codeHash,
            expiresAt: { $gt: new Date() },
        });

        if (!consumed) {
            return res.status(400).json({
                message: "Կոդն արդեն օգտագործվել է։",
            });
        }

        const user = await User.findOneAndUpdate(
            {
                _id: req.userId,
                email: consumed.oldEmail,
            },
            {
                $set: {
                    email: consumed.newEmail,
                    isVerified: true,
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            },
        );

        if (!user) {
            return res.status(409).json({
                message: "Տվյալները փոխվել են։ Թարմացրեք էջը։",
            });
        }

        return res.json({ user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Այդ էլ․ փոստն արդեն օգտագործվում է։",
            });
        }

        return next(error);
    }
});

export default router;
