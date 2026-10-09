import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import { createAuthResult } from "./authServices.js";
import { isAdminEmail } from "../middleware/requireAdmin.js";
import { httpError } from "../utils/http.js";

export async function googleLogin(credential) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw httpError(503, "Google մուտքը դեռ կարգավորված չէ։");
    if (typeof credential !== "string" || credential.length > 10000)
        throw httpError(400, "Սխալ Google տվյալներ։");
    let payload;
    try {
        const ticket = await new OAuth2Client(clientId).verifyIdToken({
            idToken: credential,
            audience: clientId,
        });
        payload = ticket.getPayload();
    } catch {
        throw httpError(401, "Google մուտքը ստուգել չհաջողվեց։");
    }
    if (!payload?.sub || !payload.email || !payload.email_verified)
        throw httpError(401, "Google email-ը հաստատված չէ։");
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ googleId: payload.sub }).select(
        "+googleId",
    );
    if (!user) {
        const existing = await User.findOne({ email });
        // Existing password accounts must explicitly link Google while signed in.
        if (existing)
            throw httpError(
                409,
                "Այս email-ով հաշիվ կա։ Մուտք գործեք գաղտնաբառով և Google-ը կապեք հաշվի բաժնում։",
            );
        if (isAdminEmail(email))
            throw httpError(
                403,
                "Ադմինի համար օգտագործեք նախապես ստեղծված հաշիվը։",
            );
        try {
            user = await User.create({
                googleId: payload.sub,
                email,
                name: payload.given_name || payload.name || "Օգտատեր",
                surname: payload.family_name || "",
                isVerified: true,
            });
        } catch (error) {
            if (error.code !== 11000) throw error;
            user = await User.findOne({ googleId: payload.sub });
            if (!user) throw httpError(409, "Այս email-ով հաշիվ արդեն կա։");
        }
    }
    if (user.banned) throw httpError(403, "Ձեր հաշիվն արգելափակված է։");
    return createAuthResult(user);
}

export async function linkGoogle(userId, credential) {
    if (!process.env.GOOGLE_CLIENT_ID)
        throw httpError(503, "Google մուտքը դեռ կարգավորված չէ։");
    if (typeof credential !== "string" || credential.length > 10000)
        throw httpError(400, "Սխալ Google տվյալներ։");
    let payload;
    try {
        payload = (
            await new OAuth2Client(process.env.GOOGLE_CLIENT_ID).verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            })
        ).getPayload();
    } catch {
        throw httpError(401, "Սխալ Google token։");
    }
    const user = await User.findById(userId);
    if (
        !payload?.sub ||
        !payload.email ||
        !payload.email_verified ||
        payload.email.toLowerCase() !== user.email
    )
        throw httpError(
            400,
            "Google email-ը պետք է համընկնի Ձեր հաշվի email-ին։",
        );
    user.googleId = payload.sub;
    await user.save();
    return { message: "Google հաշիվը կապվել է։" };
}
