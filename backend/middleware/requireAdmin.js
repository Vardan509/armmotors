import User from "../models/user.js";

export function isAdminEmail(email) {
    const emails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(value => value.trim().toLowerCase())
        .filter(Boolean);
    
    return emails.includes(email.toLowerCase());
}

export default async function requireAdmin(req, res, next) {
    try {
        const user = await User.findById(req.userId)
            .select("email role banned");

        if (!user || user.banned || (user.role !== "admin" && !isAdminEmail(user.email))) {
            return res.status(403).json({
                message: "Միայն ադմինի համար։"
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}
