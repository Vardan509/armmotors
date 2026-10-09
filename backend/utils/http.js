import mongoose from "mongoose";
export function httpError(status, message) { return Object.assign(new Error(message), { status }); }
export function objectId(value) { if (!mongoose.isObjectIdOrHexString(value)) throw httpError(400, "Սխալ ID։"); return value; }
export function pagination(query) {
    const page = Math.max(1, Math.min(100000, Math.floor(Number(query.page) || 1)));
    const limit = Math.max(1, Math.min(100, Math.floor(Number(query.limit) || 20)));
    return { page, limit, skip: (page - 1) * limit };
}
export function literalSearch(value) { return String(value || "").slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
