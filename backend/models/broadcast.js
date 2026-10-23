import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
            maxlength: 150,
        },
        text: {
            type: String,
            required: true,
            maxlength: 10000,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["draft", "preparing", "queued", "completed", "cancelled"],
            default: "draft",
            index: true,
        },
        total: {
            type: Number,
            default: 0,
        },
        startedAt: Date,
    },
    { timestamps: true },
);

export const Broadcast = mongoose.model("Broadcast", schema);

const deliverySchema = new mongoose.Schema(
    {
        broadcast: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Broadcast",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "sending",
                "sent",
                "failed",
                "uncertain",
                "skipped",
            ],
            default: "pending",
            index: true,
        },
        error: {
            type: String,
            default: "",
        },
        sentAt: Date,

        // Կայքի ներսում նամակը կարդալու ժամանակը
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

deliverySchema.index({ broadcast: 1, user: 1 }, { unique: true });

deliverySchema.index({
    user: 1,
    readAt: 1,
});

export const BroadcastDelivery = mongoose.model(
    "BroadcastDelivery",
    deliverySchema,
);
