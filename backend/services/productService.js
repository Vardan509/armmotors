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
    return Product.find({
        status: { $nin: ["draft", "sold"] },
    })
        .select("-__v")
        .sort({ createdAt: -1 });
}

export async function getMyProducts(userId) {
    return Product.find({ owner: userId })
        .select("-__v")
        .sort({ createdAt: -1 });
}

export async function getProductById(id) {
    validateId(id);

    const product = await Product.findOneAndUpdate(
        {
            _id: id,
            status: { $ne: "draft" },
        },
        { $inc: { views: 1 } },
        { new: true },
    ).select("-__v");

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    return product;
}

export async function addProduct(body, userId) {
    const data = pickFields(body);

    return Product.create({
        ...data,
        owner: userId,
    });
}

export async function updateById(id, body, userId) {
    validateId(id);

    const product = await Product.findById(id);

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    if (!product.owner || String(product.owner) !== String(userId)) {
        throw createError("Կարող եք խմբագրել միայն Ձեր հայտարարությունը։", 403);
    }

    const data = pickFields(body);

    if (body.status !== undefined) {
        if (!["active", "draft", "sold"].includes(body.status)) {
            throw createError("Սխալ կարգավիճակ։", 400);
        }

        data.status = body.status;
    }

    if (!Object.keys(data).length) {
        throw createError("Խմբագրման տվյալներ չկան։", 400);
    }

    Object.assign(product, data);

    return product.save();
}

export async function deleteProduct(id, userId) {
    validateId(id);

    const product = await Product.findById(id);

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    if (!product.owner || String(product.owner) !== String(userId)) {
        throw createError("Կարող եք ջնջել միայն Ձեր հայտարարությունը։", 403);
    }

    await product.deleteOne();
}
