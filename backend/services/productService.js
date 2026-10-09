import mongoose from "mongoose";
import Product from "../models/product.js";

const ALLOWED_FIELDS = [
    "type",
    "title",
    "price",
    "currency",
    "vehicleType",
    "brand",
    "model",
    "year",
    "mileage",
    "fuel",
    "steering",
    "color",
    "region",
    "vin",
    "condition",
    "description",
    "phone",
    "images",
];

function createError(message, status) {
    const error = new Error(message);
    error.status = status;

    return error;
}

function validateId(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
        throw createError("Սխալ հայտարարության ID։", 400);
    }
}

export function pickFields(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw createError("Սխալ տվյալներ։", 400);
    }

    const data = {};

    for (const field of ALLOWED_FIELDS) {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    }

    return data;
}

export async function getAllProduct() {
    const products = await Product.find({ status: { $nin: ["draft", "sold"] } })
        .select("-__v")
        .sort({ createdAt: -1 });

    return products;
}

export async function getProductById(id) {
    validateId(id);

    const product = await Product.findOne({
        _id: id,
        status: { $ne: "draft" },
    }).select("-__v");

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    return product;
}

export async function addProduct(body, userId) {
    const data = pickFields(body);

    return await Product.create({
        ...data,
        owner: userId,
    });
}

export async function updateById(id, body, userId) {
    const product = await getProductById(id);

    if (!product.owner || product.owner.toString() !== userId.toString()) {
        throw createError("Կարող եք խմբագրել միայն Ձեր հայտարարությունը։", 403);
    }

    const data = pickFields(body);

    if (Object.keys(data).length === 0) {
        throw createError("Խմբագրման տվյալներ չկան։", 400);
    }

    Object.assign(product, data);

    return await product.save();
}

export async function deleteProduct(id, userId) {
    const product = await getProductById(id);

    if (!product.owner || product.owner.toString() !== userId.toString()) {
        throw createError("Կարող եք ջնջել միայն Ձեր հայտարարությունը։", 403);
    }

    await product.deleteOne();
}
