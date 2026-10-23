import User from "../models/user.js";

export function isAdminEmail(email) {
    if (typeof email !== "string") {
        return false;
    }

    const emails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

    return emails.includes(email.trim().toLowerCase());
}

export default async function requireAdmin(req, res, next) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: "Նախ մուտք գործեք։",
            });
        }

        const user = await User.findById(req.userId).select(
            "email role banned",
        );

        if (!user || user.banned || user.role !== "admin") {
            return res.status(403).json({
                message: "Միայն ադմինի համար։",
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}
