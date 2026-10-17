import express from "express";
import mongoose from "mongoose";
import crypto from "node:crypto";

import Product from "../models/product.js";
import ProductTranslation from "../models/ProductTranslation.js";

const router = express.Router();

const SUPPORTED_LANGUAGES = ["hy", "en", "ru"];
const SOURCE_LANGUAGE = "hy";

function getTextHash(text) {
    return crypto.createHash("sha256").update(text).digest("hex");
}

function splitText(text, maxLength = 450) {
    const chunks = [];
    const paragraphs = text.match(/.{1,450}(?:\s|$)/gs);

    if (paragraphs) {
        return paragraphs.map((part) => part.trim()).filter(Boolean);
    }

    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }

    return chunks;
}

async function translateChunk(text, targetLanguage) {
    const params = new URLSearchParams({
        q: text,
        langpair: `${SOURCE_LANGUAGE}|${targetLanguage}`,
        mt: "1",
    });

    const response = await fetch(
        `https://api.mymemory.translated.net/get?${params}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(12000),
        },
    );

    if (!response.ok) {
        throw new Error(`TRANSLATION_HTTP_${response.status}`);
    }

    const data = await response.json();

    if (Number(data.responseStatus) !== 200) {
        throw new Error("TRANSLATION_PROVIDER_ERROR");
    }

    const translated = data.responseData?.translatedText;

    if (!translated || typeof translated !== "string") {
        throw new Error("TRANSLATION_EMPTY");
    }

    if (
        /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE PAIR/i.test(
            translated,
        )
    ) {
        throw new Error("TRANSLATION_LIMIT_REACHED");
    }

    return translated.trim();
}

async function translateDescription(text, language) {
    if (language === SOURCE_LANGUAGE) {
        return text;
    }

    const chunks = splitText(text);
    const results = [];

    for (const chunk of chunks) {
        const translated = await translateChunk(chunk, language);
        results.push(translated);
    }

    return results.join(" ");
}

router.get("/:id/description", async (req, res) => {
    try {
        const { id } = req.params;
        const language = String(
            req.query.lang || SOURCE_LANGUAGE,
        ).toLowerCase();

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Սխալ հայտարարության ID։",
            });
        }

        if (!SUPPORTED_LANGUAGES.includes(language)) {
            return res.status(400).json({
                message: "Չաջակցվող լեզու։",
            });
        }

        const product = await Product.findById(id)
            .select("description status")
            .lean();

        if (!product || product.status !== "active") {
            return res.status(404).json({
                message: "Հայտարարությունը չի գտնվել։",
            });
        }

        const original = String(product.description || "").trim();

        if (!original) {
            return res.json({
                language,
                description: "",
                translated: false,
                cached: false,
            });
        }

        if (language === SOURCE_LANGUAGE) {
            return res.json({
                language,
                description: original,
                translated: false,
                cached: false,
            });
        }

        const sourceHash = getTextHash(original);

        const cached = await ProductTranslation.findOne({
            product: id,
            language,
            sourceHash,
        }).lean();

        if (cached) {
            return res.json({
                language,
                description: cached.translatedDescription,
                translated: true,
                cached: true,
            });
        }

        let translated;

        try {
            translated = await translateDescription(original, language);
        } catch (error) {
            console.error("[ArmMotors Translation Provider]", error.message);

            return res.json({
                language,
                description: original,
                translated: false,
                cached: false,
                fallback: true,
            });
        }

        await ProductTranslation.findOneAndUpdate(
            {
                product: id,
                language,
            },
            {
                $set: {
                    sourceHash,
                    translatedDescription: translated,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            },
        );

        return res.json({
            language,
            description: translated,
            translated: true,
            cached: false,
        });
    } catch (error) {
        console.error("[ArmMotors Translation Error]", error.message);

        return res.status(500).json({
            message: "Թարգմանության համակարգի սխալ։",
        });
    }
});

export default router;
