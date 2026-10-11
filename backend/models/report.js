
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        reason: {
            type: String,
            enum: ["spam", "fraud", "incorrect", "other"],
            required: true,
        },

        details: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open",
        },
    },
    { timestamps: true }
);

reportSchema.index(
    { product: 1, reporter: 1 },
    { unique: true }
);

export default mongoose.model("Report", reportSchema);
