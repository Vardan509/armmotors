import "dotenv/config";
import mongoose from "mongoose";

const port = process.env.PORT || "3001";
const uri = process.env.MONGO_URI?.trim() || "";
const jwt = process.env.JWT_SECRET || "";

const origins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

console.log("\n=== ArmMotors backend diagnostics ===");

console.log("Node.js:", process.version);
console.log("PORT:", port);

console.log(
    "JWT_SECRET:",
    jwt ? "configured" : "MISSING"
);

console.log(
    "MONGO_URI:",
    uri ? "configured" : "MISSING"
);

console.log(
    "CLIENT_ORIGIN entries:",
    origins.length
);

if (!jwt || !uri) {
    console.error(
        "\nԼրացրեք backend/.env-ի պարտադիր դաշտերը։"
    );

    process.exitCode = 1;
} else {
    let dbType = "unknown";

    try {
        const parsed = new URL(uri);

        dbType = [
            "localhost",
            "127.0.0.1",
            "::1",
        ].includes(parsed.hostname)
            ? "LOCAL MongoDB"
            : "REMOTE MongoDB";
    } catch {
        console.error(
            "MONGO_URI սխալ ձևաչափով է։"
        );

        process.exitCode = 1;
    }

    console.log("MongoDB type:", dbType);

    if (dbType === "LOCAL MongoDB") {
        console.log(
            "Windows PowerShell-ը բացեք Administrator-ով և ստուգեք Get-Service MongoDB։"
        );
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 6000,
        });

        console.log(
            "MongoDB connection: SUCCESS"
        );
    } catch (error) {
        console.error(
            "MongoDB connection: FAILED (",
            error?.name || "Error",
            ")"
        );

        console.error(
            "Ստուգեք ծառայությունը, հասցեն, տվյալները կամ Atlas IP allowlist-ը։"
        );

        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
}

console.log("=====================================\n");