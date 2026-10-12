import "dotenv/config";

import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const RETRY_DELAY_MS = 7000;
const MONGO_TIMEOUT_MS = 7000;

let stopping = false;
let server;
let retryTimer;

function mongoErrorHint(error) {
    const message = String(error?.message || "");

    if (/ECONNREFUSED|connect ECONNREFUSED/i.test(message)) {
        return "MongoDB-ը չի աշխատում կամ հասցեն/պորտը սխալ է։ Windows-ում ստուգեք MongoDB service-ը։";
    }

    if (/authentication failed|bad auth/i.test(message)) {
        return "MongoDB-ի օգտանունը կամ գաղտնաբառը սխալ է։ Ստուգեք MONGO_URI-ն։";
    }

    if (/ENOTFOUND|querySrv|ETIMEOUT|ETIMEDOUT/i.test(message)) {
        return "Ստուգեք ինտերնետը, Atlas-ի հասցեն և Network Access (IP allowlist)-ը։";
    }

    return "Ստուգեք MongoDB-ն և backend/.env-ի MONGO_URI-ն։";
}

async function connectMongo() {
    if (stopping) return;

    const uri = process.env.MONGO_URI?.trim();

    if (!uri) {
        console.error(
            "[ArmMotors] MONGO_URI չկա։ Լրացրեք backend/.env-ը և վերագործարկեք։",
        );
        return;
    }

    if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
        console.error(
            "[ArmMotors] MONGO_URI-ի ձևաչափը սխալ է (mongodb:// կամ mongodb+srv://)։",
        );
        return;
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
            maxPoolSize: 10,
        });

        console.log("[ArmMotors] MongoDB connected — API-ն պատրաստ է։");
    } catch (error) {
        console.error(
            "[ArmMotors] MongoDB connection failed:",
            error?.name || "Error",
        );

        console.error("[ArmMotors]", mongoErrorHint(error));

        console.error(
            `[ArmMotors] Կրկին կփորձեմ ${RETRY_DELAY_MS / 1000} վայրկյանից։`,
        );

        if (!stopping) {
            retryTimer = setTimeout(connectMongo, RETRY_DELAY_MS);
        }
    }
}

async function shutdown(signal) {
    if (stopping) return;

    stopping = true;
    clearTimeout(retryTimer);

    console.log(`[ArmMotors] ${signal}: stopping...`);

    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }

    try {
        await mongoose.disconnect();
    } catch (error) {
        console.error("[ArmMotors] MongoDB disconnect failed:", error?.name);
    }

    process.exit(0);
}

function start() {
    if (!process.env.JWT_SECRET) {
        console.error(
            "[ArmMotors] JWT_SECRET չկա։ Սահմանեք այն backend/.env-ում։",
        );

        process.exitCode = 1;
        return;
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.warn(
            "[ArmMotors] JWT_SECRET-ը խորհուրդ է տրվում ունենալ առնվազն 32 պատահական նիշ։",
        );
    }

    const app = createApp();

    // HTTP սերվերը գործարկվում է նույնիսկ MongoDB-ի բացակայության դեպքում։
    server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`[ArmMotors] API listening on port ${PORT}`);
        console.log(`[ArmMotors] Health: http://localhost:${PORT}/api/health`);
    });

    server.on("error", (error) => {
        console.error("[ArmMotors] HTTP server error:", error.message);

        process.exitCode = 1;
    });

    mongoose.connection.on("disconnected", () => {
        if (!stopping) {
            console.warn(
                "[ArmMotors] MongoDB disconnected. API temporarily unavailable.",
            );
        }
    });

    void connectMongo();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start();
