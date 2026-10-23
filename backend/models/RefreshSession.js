import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },

        // Session-ը կապված է գաղտնաբառի
        // և հաշվի անվտանգության տարբերակին։
        tokenVersion: {
            type: Number,
            required: true,
            default: 0,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: {
                expires: 0,
            },
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        createdIp: {
            type: String,
            default: "",
            maxlength: 100,
        },

        userAgent: {
            type: String,
            default: "",
            maxlength: 500,
        },

        lastUsedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

refreshSessionSchema.index({
    user: 1,
    revokedAt: 1,
});

export default mongoose.model("RefreshSession", refreshSessionSchema);
