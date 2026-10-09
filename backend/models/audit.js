import mongoose from "mongoose";
export default mongoose.model(
    "Audit",
    new mongoose.Schema(
        {
            actor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            action: { type: String, required: true },
            target: String,
            details: String,
        },
        { timestamps: true },
    ),
);
