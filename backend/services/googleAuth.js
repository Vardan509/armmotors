import { OAuth2Client } from "google-auth-library";

import User from "../models/user.js";
import { createAuthResult } from "./authServices.js";
import { isAdminEmail } from "../middleware/requireAdmin.js";
import { httpError } from "../utils/http.js";

const googleClient = new OAuth2Client();

async function verifyGoogleCredential(credential) {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        throw httpError(503, "Google մուտքը դեռ կարգավորված չէ։");
    }

    if (
        typeof credential !== "string" ||
        !credential ||
        credential.length > 10000
    ) {
        throw httpError(400, "Սխալ Google տվյալներ։");
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });

        const payload = ticket.getPayload();

        if (
            !payload?.sub ||
            !payload?.email ||
            payload.email_verified !== true
        ) {
            throw httpError(401, "Google email-ը հաստատված չէ։");
        }

        return {
            googleId: payload.sub,
            email: payload.email.trim().toLowerCase(),
            name: payload.given_name || payload.name || "Օգտատեր",
            surname: payload.family_name || "",
        };
    } catch (error) {
        if (error.status === 401) {
            throw error;
        }

        throw httpError(401, "Google մուտքը ստուգել չհաջողվեց։");
    }
}

export async function googleLogin(credential) {
    const google = await verifyGoogleCredential(credential);

    let user = await User.findOne({
        googleId: google.googleId,
    });

    if (!user) {
        const existing = await User.findOne({
            email: google.email,
        });

        if (existing) {
            throw httpError(
                409,
                "Այս email-ով հաշիվ արդեն կա։ Նախ մուտք գործեք գաղտնաբառով և կապեք Google հաշիվը։",
            );
        }

        if (isAdminEmail(google.email)) {
            throw httpError(
                403,
                "Ադմինի հաշիվը նախ պետք է ստեղծել և կապել Google-ին։",
            );
        }

        try {
            user = await User.create({
                googleId: google.googleId,
                email: google.email,
                name: google.name,
                surname: google.surname,
                role: "user",
                isVerified: true,
            });
        } catch (error) {
            if (error.code !== 11000) {
                throw error;
            }

            user = await User.findOne({
                googleId: google.googleId,
            });

            if (!user) {
                throw httpError(409, "Այս email-ով հաշիվ արդեն կա։");
            }
        }
    }

    if (user.banned) {
        throw httpError(403, "Ձեր հաշիվն արգելափակված է։");
    }

    return createAuthResult(user);
}

export async function linkGoogle(userId, credential) {
    if (!userId) {
        throw httpError(401, "Նախ մուտք գործեք Ձեր հաշիվ։");
    }

    const google = await verifyGoogleCredential(credential);

    const user = await User.findById(userId);

    if (!user) {
        throw httpError(404, "Օգտատերը չի գտնվել։");
    }

    if (user.banned) {
        throw httpError(403, "Ձեր հաշիվն արգելափակված է։");
    }

    if (user.email.trim().toLowerCase() !== google.email) {
        throw httpError(
            400,
            "Google email-ը պետք է համընկնի Ձեր հաշվի email-ին։",
        );
    }

    const alreadyLinked = await User.findOne({
        googleId: google.googleId,
        _id: { $ne: user._id },
    });

    if (alreadyLinked) {
        throw httpError(
            409,
            "Այս Google հաշիվն արդեն կապված է այլ օգտատիրոջ հետ։",
        );
    }

    if (user.googleId && user.googleId !== google.googleId) {
        throw httpError(409, "Այս հաշվին արդեն այլ Google հաշիվ է կապված։");
    }

    user.googleId = google.googleId;
    user.isVerified = true;

    try {
        await user.save();
    } catch (error) {
        if (error.code === 11000) {
            throw httpError(409, "Այս Google հաշիվն արդեն օգտագործվում է։");
        }

        throw error;
    }

    return {
        message: "Google հաշիվը հաջողությամբ կապվել է։",
    };
}
