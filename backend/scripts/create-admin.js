import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

const promote = process.argv.includes("--promote");
const resetPassword = process.argv.includes("--reset-password");

async function main() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Ստուգեք ADMIN_EMAIL-ը backend/.env-ում։");
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI-ն սահմանված չէ։");
    }

    if (
        (resetPassword || !password) &&
        (!password ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 72)
    ) {
        throw new Error(
            "ADMIN_PASSWORD-ը պետք է ունենա առնվազն 12 նիշ և առավելագույնը 72 byte։",
        );
    }

    await mongoose.connect(process.env.MONGO_URI);

    let user = await User.findOne({ email }).select("+password");

    if (!user) {
        if (
            !password ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            throw new Error("Նոր ադմինի համար սահմանեք ուժեղ ADMIN_PASSWORD։");
        }

        user = await User.create({
            name: "Admin",
            surname: "ArmMotors",
            email,
            role: "admin",
            isVerified: true,
            banned: false,
            password: await bcrypt.hash(password, 12),
        });

        console.log("Ադմինի հաշիվը հաջողությամբ ստեղծվեց։");
        return;
    }

    if (user.role !== "admin" && !promote) {
        throw new Error(
            "Հաշիվը սովորական օգտատեր է։ Դերը փոխելու համար օգտագործեք --promote։",
        );
    }

    let changed = false;

    if (promote && user.role !== "admin") {
        user.role = "admin";
        user.banned = false;
        user.isVerified = true;
        changed = true;
    }

    if (resetPassword) {
        user.password = await bcrypt.hash(password, 12);
        changed = true;
    }

    if (changed) {
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        console.log(
            "Ադմինի հաշիվը թարմացվեց։ Նախկին մուտքի token-ներն անվավեր են։",
        );
    } else {
        console.log(
            "Ադմինի հաշիվն արդեն գոյություն ունի։ Գաղտնաբառը չի փոխվել։",
        );
    }
}

try {
    await main();
} catch (error) {
    console.error("ADMIN ERROR:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
