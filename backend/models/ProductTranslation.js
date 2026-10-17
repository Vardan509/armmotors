import mongoose from "mongoose";

const productTranslationSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        language: {
            type: String,
            enum: ["hy", "ru", "en"],
            required: true,
        },

        sourceHash: {
            type: String,
            required: true,
        },

        translatedDescription: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

productTranslationSchema.index({ product: 1, language: 1 }, { unique: true });

export default mongoose.model("ProductTranslation", productTranslationSchema);
