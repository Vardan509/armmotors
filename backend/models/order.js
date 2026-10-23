import mongoose from "mongoose";
const schema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "AMD", enum: ["AMD"] },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending", index: true },
    paidAt: { type: Date, index: true },
    note: { type: String, maxlength: 1000, default: "" }
}, { timestamps: true });
schema.index({ buyer: 1, product: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });
export default mongoose.model("Order", schema);
