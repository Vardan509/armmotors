import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";

export default async function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Հայտարարություն տեղադրելու համար մուտք գործեք։"
        });
    }

    let decoded;

    try {
        const token = authorization.slice(7);
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            typeof decoded !== "object" ||
            !mongoose.isObjectIdOrHexString(decoded.userId)
        ) {
            throw new Error("Invalid token");
        }
    } catch {
        return res.status(401).json({
            message: "Մուտքի ժամկետն ավարտվել է։ Կրկին մուտք գործեք։"
        });
    }

    try {
        const user = await User.findById(decoded.userId)
            .select("_id email name surname role banned tokenVersion");

        if (!user) {
            return res.status(401).json({
                message: "Օգտատերը չի գտնվել։ Կրկին մուտք գործեք։"
            });
        }
        if (user.banned) return res.status(403).json({ message: "Ձեր հաշիվն արգելափակված է։", code: "ACCOUNT_BANNED" });
        if ((decoded.version || 0) !== (user.tokenVersion || 0)) return res.status(401).json({ message: "Կրկին մուտք գործեք։" });

        req.userId = user._id;
        req.user = user;

        next();
    } catch {
        res.status(500).json({
            message: "Սերվերի սխալ։"
        });
    }
}
