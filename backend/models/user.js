import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 1,
            trim: true,
        },

        surname: {
            type: String,
            default: "",
            trim: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
            validate: {
                validator: (value) =>
                    !value ||
                    /^\+?[0-9]{8,15}$/.test(value.replace(/[\s()-]/g, "")),
                message: "Հեռախոսահամարը սխալ է։",
            },
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            select: false,
        },

        googleId: { type: String, unique: true, sparse: true, select: false },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        banned: { type: Boolean, default: false },
        banReason: { type: String, maxlength: 500, default: "" },
        tokenVersion: { type: Number, default: 0 },
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

        isVerified: {
            type: Boolean,
            default: false,
        },

        verificationCode: {
            type: String,
            default: null,
        },

        verificationCodeExpires: {
            type: Date,
            default: null,
        },

        bajanortagrutyun: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model("User", userSchema);
