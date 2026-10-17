import { fnLogin, fnRegistration } from "../services/authServices.js";

import {
    requestPasswordReset,
    validatePasswordResetToken,
    resetPassword,
} from "../services/passwordResetService.js";

import {
    createSession,
    revokeAllUserSessions,
} from "../services/sessionService.js";

import User from "../models/user.js";

// ==========================================
// ERROR HANDLER
// ==========================================

function sendError(res, error) {
    const status =
        error.code === 11000
            ? 409
            : error.name === "ValidationError"
              ? 400
              : error.status || 500;

    if (status >= 500) {
        console.error("[ArmMotors Auth]", error);
    }

    const message =
        error.code === 11000
            ? "Այս email-ն արդեն գրանցված է։"
            : status >= 500
              ? "Սերվերի սխալ։"
              : error.message;

    return res.status(status).json({
        message,
    });
}

// ==========================================
// LOGIN
// ==========================================

export async function controllerLogin(req, res) {
    try {
        const { login, password, remember = false } = req.body || {};

        // Օգտագործում ենք քո գործող login service-ը,
        // որպեսզի չփոխվի գաղտնաբառի և հաշվի ստուգումը։
        const result = await fnLogin(login, password);

        const user = await User.findById(result.user.id);

        if (!user) {
            return res.status(401).json({
                message: "Օգտատերը չի գտնվել։",
            });
        }

        const session = await createSession(user, req, res, remember === true);

        return res.status(200).json(session);
    } catch (error) {
        return sendError(res, error);
    }
}

// ==========================================
// REGISTRATION
// ==========================================

export async function controllerRegistration(req, res) {
    try {
        const {
            name,
            surname,
            phone,
            email,
            password,
            repetPassword,
            remember = false,
        } = req.body || {};

        const result = await fnRegistration(
            name,
            surname,
            phone,
            email,
            password,
            repetPassword,
        );

        const user = await User.findById(result.user.id);

        if (!user) {
            return res.status(500).json({
                message: "Հաշիվը ստեղծվել է, բայց մուտքը չհաջողվեց։",
            });
        }

        const session = await createSession(user, req, res, remember === true);

        return res.status(201).json(session);
    } catch (error) {
        return sendError(res, error);
    }
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

export async function controllerForgotPassword(req, res) {
    try {
        const result = await requestPasswordReset(req.body?.email);

        return res.status(200).json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

// ==========================================
// VALIDATE RESET TOKEN
// ==========================================

export async function controllerCheckResetToken(req, res) {
    try {
        const result = await validatePasswordResetToken(req.query?.token);

        return res.status(200).json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

// ==========================================
// RESET PASSWORD
// ==========================================

export async function controllerResetPassword(req, res) {
    try {
        const result = await resetPassword({
            token: req.body?.token,
            password: req.body?.password,
            repeatPassword: req.body?.repeatPassword,
        });

        // Գաղտնաբառը փոխելուց հետո
        // դադարեցնում ենք բոլոր refresh session-ները։
        // Reset token-ը արդեն սպառված է, ուստի
        // գտնում ենք հաշիվը վերադարձված userId-ով։
        if (result.userId) {
            await revokeAllUserSessions(result.userId);
        }

        return res.status(200).json({
            message: result.message,
        });
    } catch (error) {
        return sendError(res, error);
    }
}
