import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        // Վճարման տեսակը
        kind: {
            type: String,
            enum: ["publication", "top7", "top30", "auto7"],
            required: true,
        },

        // Գինը դրամով
        amount: {
            type: Number,
            enum: [100, 200, 600],
            required: true,
        },

        currency: {
            type: String,
            enum: ["AMD"],
            default: "AMD",
        },

        status: {
            type: String,
            enum: ["pending", "processing", "paid", "rejected"],
            default: "pending",
            index: true,
        },

        paymentReference: {
            type: String,
            default: "",
            maxlength: 200,
        },

        adminNote: {
            type: String,
            default: "",
            maxlength: 500,
        },

        paidAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

schema.index({
    user: 1,
    createdAt: -1,
});

schema.index(
    {
        user: 1,
        product: 1,
        kind: 1,
    },
    {
        unique: true,

        partialFilterExpression: {
            status: "pending",
        },
    },
);

export default mongoose.model("PromotionPayment", schema);
