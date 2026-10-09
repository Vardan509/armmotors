import "dotenv/config";

import mongoose from "mongoose";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI չկա .env ֆայլում");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const app = createApp();

        app.listen(PORT || 3001, () => {
            console.log(`ArmMotors backend: http://localhost:${PORT}`);
            console.log(`Products: http://localhost:${PORT}/api/products`);
            console.log(`Health: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error("Backend start error:");
        console.error(error);

        process.exit(1);
    }
}

startServer();
