import User from "../models/user.js";
import { isAdminEmail } from "../middleware/requireAdmin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function createError(message, status) {
    const error = new Error(message);
    error.status = status;

    return error;
}

export function createAuthResult(user) {
    const token = jwt.sign(
        { userId: user._id.toString(), version: user.tokenVersion || 0 },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            email: user.email,
            isAdmin: user.role === "admin" || isAdminEmail(user.email),
        },
    };
}

export async function fnRegistration(
    name,
    surname,
    phone,
    email,
    password,
    repetPassword,
) {
    if (
        typeof name !== "string" ||
        typeof surname !== "string" ||
        typeof phone !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof repetPassword !== "string" ||
        !name.trim() ||
        !surname.trim() ||
        !phone.trim() ||
        !email.trim() ||
        !password ||
        !repetPassword
    ) {
        throw createError("Լրացրեք բոլոր դաշտերը։", 400);
    }

    name = name.trim();
    surname = surname.trim();
    email = email.trim().toLowerCase();
    phone = phone.replace(/[\s()-]/g, "");

    if (name.length < 2 || surname.length < 2) {
        throw createError(
            "Անունն ու ազգանունը պետք է ունենան առնվազն 2 նիշ։",
            400,
        );
    }

    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
        throw createError("Հեռախոսահամարը սխալ է։", 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createError("Email-ը սխալ է։", 400);
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        throw createError("Գաղտնաբառը պետք է ունենա առնվազն 8 նիշ։", 400);
    }

    if (password !== repetPassword) {
        throw createError("Գաղտնաբառերը չեն համընկնում։", 400);
    }

    if (isAdminEmail(email)) {
        throw createError(
            "Այս email-ով հանրային գրանցումը փակ է։ Եթե արդեն հաշիվ ունեք, մուտք գործեք։",
            403,
        );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw createError("Այս email-ն արդեն գրանցված է։", 409);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        surname,
        phone,
        email,
        password: hashPassword,
    });

    return createAuthResult(user);
}

export async function fnLogin(login, password) {
    if (
        typeof login !== "string" ||
        typeof password !== "string" ||
        !login.trim() ||
        !password
    ) {
        throw createError("Լրացրեք email-ն ու գաղտնաբառը։", 400);
    }

    const email = login.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
        throw createError("Email-ը կամ գաղտնաբառը սխալ է։", 401);
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
        throw createError("Email-ը կամ գաղտնաբառը սխալ է։", 401);
    }
    if (user.banned) throw createError("Ձեր հաշիվն արգելափակված է։", 403);

    return createAuthResult(user);
}
