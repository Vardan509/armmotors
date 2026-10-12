import mongoose from "mongoose";
import Product from "../models/product.js";

import {
    publishOrRequestPayment,
    autoRefreshDue,
    sortPublicPipeline,
} from "./monetizationService.js";

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

// Բոլոր հրապարակված հայտարարությունները
// TOP-երը ցուցադրվում են առաջինը։
export async function getAllProduct() {
    await autoRefreshDue();

    return Product.aggregate(
        sortPublicPipeline({
            status: "active",
        }),
    );
}

// Օգտատիրոջ սեփական հայտարարությունները
export async function getMyProducts(userId) {
    return Product.find({
        owner: userId,
    })
        .select("-__v")
        .sort({
            createdAt: -1,
        });
}

// Մեկ հայտարարության մանրամասները
export async function getProductById(id) {
    validateId(id);

    const product = await Product.findOneAndUpdate(
        {
            _id: id,
            status: {
                $ne: "draft",
            },
        },
        {
            $inc: {
                views: 1,
            },
        },
        {
            new: true,
        },
    ).select("-__v");

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    return product;
}

// Նոր հայտարարության տեղադրում
export async function addProduct(body, userId) {
    const data = pickFields(body);

    return publishOrRequestPayment(data, userId, pickFields);
}

// Հայտարարության խմբագրում
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

    if (product.paymentPending) {
        throw createError(
            "Վճարման սպասող հայտարարությունն այս պահին չի խմբագրվում։",
            409,
        );
    }

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

// Հայտարարության ջնջում
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
