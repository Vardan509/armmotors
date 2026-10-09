import { fnLogin, fnRegistration } from "../services/authServices.js";

function sendError(res, error) {
    const status =
        error.code === 11000
            ? 409
            : error.name === "ValidationError"
              ? 400
              : error.status || 500;

    const message =
        error.code === 11000
            ? "Այս email-ն արդեն գրանցված է։"
            : status === 500
              ? "Սերվերի սխալ։"
              : error.message;

    res.status(status).json({ message });
}

export async function controllerLogin(req, res) {
    try {
        const { login, password } = req.body || {};

        const result = await fnLogin(login, password);

        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

export async function controllerRegistration(req, res) {
    try {
        const { name, surname, phone, email, password, repetPassword } =
            req.body || {};

        const result = await fnRegistration(
            name,
            surname,
            phone,
            email,
            password,
            repetPassword,
        );

        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}
