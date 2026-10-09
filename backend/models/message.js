import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 254
        },

        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 2000
        },

        listingId: {
            type: String,
            maxlength: 80,
            default: ""
        },

        status: {
            type: String,
            enum: ["new", "resolved"],
            default: "new"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Message", messageSchema);