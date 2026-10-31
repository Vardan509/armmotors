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
    "community",
    "settlement",
    "vin",
    "condition",
    "description",
    "phone",
    "images",
    "customsCleared",
    "paintCondition",
    "gasEquipment",
    "gasCylinderReplaced",
    "wheelSize",
    "interiorMaterial",
    "sunroof",
    "headlights",
    "comfort",
];

const FILTER_FIELDS = [
    "type",
    "vehicleType",
    "brand",
    "model",
    "fuel",
    "steering",
    "color",
    "region",
    "condition",
];

function createError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function validateId(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
        throw createError("Սխալ հայտարարության ID։");
    }
}

function readSingle(value, name) {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    if (typeof value !== "string") {
        throw createError(`${name} պարամետրը սխալ է։`);
    }

    return value.trim();
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseNumber(value, name) {
    const text = readSingle(value, name);

    if (!text) return null;

    const number = Number(text);

    if (!Number.isFinite(number) || number < 0) {
        throw createError(`${name} արժեքը սխալ է։`);
    }

    return number;
}

function buildPublicFilter(query = {}) {
    const filter = {
        status: "active",
    };

    for (const field of FILTER_FIELDS) {
        const value = readSingle(query[field], field);

        if (!value) continue;

        if (value.length > 80) {
            throw createError(`${field} արժեքը չափազանց երկար է։`);
        }

        if (field === "brand" || field === "model") {
            filter[field] = {
                $regex: `^${escapeRegex(value)}$`,
                $options: "i",
            };
        } else {
            filter[field] = value;
        }
    }

    const priceFrom = parseNumber(query.priceFrom, "priceFrom");

    const priceTo = parseNumber(query.priceTo, "priceTo");

    const yearFrom = parseNumber(query.yearFrom, "yearFrom");

    const yearTo = parseNumber(query.yearTo, "yearTo");

    if (priceFrom !== null && priceTo !== null && priceFrom > priceTo) {
        throw createError("Նվազագույն գինը չի կարող գերազանցել առավելագույնը։");
    }

    if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
        throw createError("Սկզբնական տարեթիվը չի կարող գերազանցել վերջնականը։");
    }

    if (yearFrom !== null && !Number.isInteger(yearFrom)) {
        throw createError("Տարեթիվը պետք է լինի ամբողջ թիվ։");
    }

    if (yearTo !== null && !Number.isInteger(yearTo)) {
        throw createError("Տարեթիվը պետք է լինի ամբողջ թիվ։");
    }

    if (priceFrom !== null || priceTo !== null) {
        filter.price = {};

        if (priceFrom !== null) {
            filter.price.$gte = priceFrom;
        }

        if (priceTo !== null) {
            filter.price.$lte = priceTo;
        }
    }

    if (yearFrom !== null || yearTo !== null) {
        filter.year = {};

        if (yearFrom !== null) {
            filter.year.$gte = yearFrom;
        }

        if (yearTo !== null) {
            filter.year.$lte = yearTo;
        }
    }

    const search = readSingle(query.search || query.q, "search");

    if (search) {
        if (search.length > 100) {
            throw createError("Որոնման տեքստը չափազանց երկար է։");
        }

        const safeSearch = escapeRegex(search);

        filter.$or = [
            {
                title: {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                brand: {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
            {
                model: {
                    $regex: safeSearch,
                    $options: "i",
                },
            },
        ];
    }

    return filter;
}

export function pickFields(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw createError("Սխալ տվյալներ։");
    }

    const data = {};

    for (const field of ALLOWED_FIELDS) {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    }

    return data;
}

/* =========================================
   PUBLIC PRODUCTS
========================================= */

export async function getAllProduct(query = {}) {
    const filter = buildPublicFilter(query);

    await autoRefreshDue();

    return Product.aggregate(sortPublicPipeline(filter));
}

/* =========================================
   MY PRODUCTS
========================================= */

export async function getMyProducts(userId) {
    return Product.find({
        owner: userId,
    })
        .select("-__v")
        .sort({
            createdAt: -1,
        });
}

/* =========================================
   PRODUCT DETAILS
========================================= */

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
            returnDocument: "after",
        },
    ).select("-__v");

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    return product;
}

/* =========================================
   CREATE PRODUCT
========================================= */

export async function addProduct(body, userId) {
    const data = pickFields(body);

    return publishOrRequestPayment(data, userId, pickFields);
}

/* =========================================
   UPDATE PRODUCT
========================================= */

export async function updateById(id, body, userId) {
    validateId(id);

    const product = await Product.findById(id);

    if (!product) {
        throw createError("Հայտարարությունը չի գտնվել։", 404);
    }

    if (!product.owner || String(product.owner) !== String(userId)) {
        throw createError("Կարող եք խմբագրել միայն Ձեր հայտարարությունը։", 403);
    }

    if (product.paymentPending) {
        throw createError(
            "Վճարման սպասող հայտարարությունն այս պահին չի խմբագրվում։",
            409,
        );
    }

    const data = pickFields(body);

    if (body.status !== undefined) {
        if (!["active", "draft", "sold"].includes(body.status)) {
            throw createError("Սխալ կարգավիճակ։");
        }

        data.status = body.status;
    }

    if (!Object.keys(data).length) {
        throw createError("Խմբագրման տվյալներ չկան։");
    }

    Object.assign(product, data);

    return product.save();
}

/* =========================================
   DELETE PRODUCT
========================================= */

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
