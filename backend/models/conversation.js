import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true },
);

const conversationSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        messages: {
            type: [chatMessageSchema],
            default: [],
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

conversationSchema.index({ product: 1, buyer: 1 }, { unique: true });

conversationSchema.index({
    buyer: 1,
    lastMessageAt: -1,
});

conversationSchema.index({
    seller: 1,
    lastMessageAt: -1,
});

export default mongoose.model("Conversation", conversationSchema);
