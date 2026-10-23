import mongoose from "mongoose";

export default async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("Backend-ի .env ֆայլում MONGO_URI-ն բացակայում է։");
    }

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB Connected");
}