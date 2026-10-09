import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.js";
dotenv.config();
try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(), password = process.env.ADMIN_PASSWORD;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Լրացրեք ADMIN_EMAIL-ը։");
    if (!process.env.MONGO_URI) throw new Error("Լրացրեք MONGO_URI-ը։");
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email });
    if (existing) {
        if (existing.role === "admin") console.log("Ադմինի հաշիվն արդեն կա։ Գաղտնաբառը չի փոխվել։");
        else if (process.argv.includes("--promote")) { existing.role = "admin"; existing.banned = false; existing.tokenVersion++; await existing.save(); console.log("Հաշիվը ստացել է ադմինի դերը։"); }
        else throw new Error("Հաշիվն արդեն կա։ Դերը փոխելու համար օգտագործեք npm run admin:create -- --promote։");
    } else {
        if (!password || password.length < 12 || Buffer.byteLength(password) > 72) throw new Error("ADMIN_PASSWORD՝ առնվազն 12 նիշ, առավելագույնը 72 UTF-8 byte։");
        await User.create({ email, name: "Admin", surname: "ArmMotors", role: "admin", isVerified: true, password: await bcrypt.hash(password, 12) });
        console.log("Ադմինի հաշիվը ստեղծված է։");
    }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
