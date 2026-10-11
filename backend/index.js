import "dotenv/config";

import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable-ը սահմանված չէ");
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable-ը սահմանված չէ");
        }

        const uri = process.env.MONGO_URI || "";

        console.log("MONGO_URI exists:", Boolean(uri));
        console.log(
            "MONGO_URI format valid:",
            uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"),
        );
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log("MongoDB connected successfully");

        const app = createApp();

        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`ArmMotors backend running on port ${PORT}`);
            console.log(
                `Environment: ${process.env.NODE_ENV || "development"}`,
            );
            console.log(`Health endpoint: /api/health`);
            console.log(`Products endpoint: /api/products`);
        });

        async function shutdown(signal) {
            console.log(`${signal} received. Shutting down...`);

            server.close(async () => {
                try {
                    await mongoose.disconnect();
                    console.log("MongoDB disconnected");
                    process.exit(0);
                } catch (error) {
                    console.error("Shutdown error:", error);
                    process.exit(1);
                }
            });
        }

        process.on("SIGTERM", () => {
            shutdown("SIGTERM");
        });

        process.on("SIGINT", () => {
            shutdown("SIGINT");
        });
    } catch (error) {
        console.error("Backend start error:", error.message);
        process.exit(1);
    }
}

startServer();
