import express from "express";
import mongoose from "mongoose";
import crypto from "node:crypto";

import Product from "../models/product.js";
import ProductTranslation from "../models/ProductTranslation.js";

const router = express.Router();

const SUPPORTED_LANGUAGES = new Set(["hy", "ru", "en"]);

/*
 * Նույն նկարագրության միաժամանակյա հարցումները
 * օգտագործում են մեկ թարգմանության գործողություն։
 */
const pendingTranslations = new Map();

function detectLanguage(text) {
    const armenian = (text.match(/[\u0531-\u0556\u0561-\u0587]/g) || []).length;

    const cyrillic = (text.match(/[\u0400-\u04FF]/g) || []).length;

    const latin = (text.match(/[a-z]/gi) || []).length;

    if (!armenian && !cyrillic && !latin) {
        return null;
    }

    if (armenian >= cyrillic && armenian >= latin) {
        return "hy";
    }

    if (cyrillic >= latin) {
        return "ru";
    }

    return "en";
}

function getTextHash(text, sourceLanguage) {
    return crypto
        .createHash("sha256")
        .update(
            JSON.stringify({
                version: 2,
                sourceLanguage,
                text,
            }),
        )
        .digest("hex");
}

/*
 * Բաժանում ենք UTF-8 բայթերի չափով։
 * Ոչ մի բառ կամ տառ չի կորչում։
 */
function splitText(text, maxBytes = 450) {
    const chunks = [];

    let current = "";
    let currentBytes = 0;

    for (const character of text) {
        const size = Buffer.byteLength(character, "utf8");

        if (current && currentBytes + size > maxBytes) {
            chunks.push(current);
            current = "";
            currentBytes = 0;
        }

        current += character;
        currentBytes += size;
    }

    if (current) {
        chunks.push(current);
    }

    return chunks;
}

async function translateChunk(text, sourceLanguage, targetLanguage, signal) {
    if (!text.trim()) {
        return text;
    }

    const leadingWhitespace = text.match(/^\s*/u)?.[0] || "";
    const trailingWhitespace = text.match(/\s*$/u)?.[0] || "";

    const params = new URLSearchParams({
        q: text.trim(),
        langpair: `${sourceLanguage}|${targetLanguage}`,
        mt: "1",
    });

    const response = await fetch(
        `https://api.mymemory.translated.net/get?${params}`,
        {
            headers: {
                Accept: "application/json",
            },
            signal,
        },
    );

    if (!response.ok) {
        throw new Error(`TRANSLATION_HTTP_${response.status}`);
    }

    const result = await response.json();

    if (Number(result.responseStatus) !== 200) {
        throw new Error("TRANSLATION_PROVIDER_ERROR");
    }

    const translated = result.responseData?.translatedText;

    if (typeof translated !== "string" || !translated.trim()) {
        throw new Error("TRANSLATION_EMPTY");
    }

    if (
        /MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID LANGUAGE PAIR|QUOTA EXCEEDED/i.test(
            translated,
        )
    ) {
        throw new Error("TRANSLATION_PROVIDER_LIMIT");
    }

    return leadingWhitespace + translated.trim() + trailingWhitespace;
}

async function translateDescription(text, sourceLanguage, targetLanguage) {
    /*
     * Ամբողջ գործողության ընդհանուր ժամկետը։
     */
    const signal = AbortSignal.timeout(45000);
    const paragraphs = text.split(/(\r?\n+)/);

    const translatedParts = [];

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            translatedParts.push(paragraph);
            continue;
        }

        const chunks = splitText(paragraph);
        const results = [];

        for (const chunk of chunks) {
            signal.throwIfAborted();

            const translated = await translateChunk(
                chunk,
                sourceLanguage,
                targetLanguage,
                signal,
            );

            results.push(translated);
        }

        translatedParts.push(results.join(""));
    }

    return translatedParts.join("");
}

async function getTranslation({
    productId,
    language,
    sourceLanguage,
    sourceHash,
    original,
}) {
    const cached = await ProductTranslation.findOne({
        product: productId,
        language,
        sourceHash,
    }).lean();

    if (cached?.translatedDescription) {
        return {
            description: cached.translatedDescription,
            cached: true,
        };
    }

    const description = await translateDescription(
        original,
        sourceLanguage,
        language,
    );

    /*
     * Պահպանման սխալի պատճառով պատրաստ թարգմանությունը
     * չենք կորցնում։
     */
    try {
        await ProductTranslation.findOneAndUpdate(
            {
                product: productId,
                language,
            },
            {
                $set: {
                    sourceHash,
                    translatedDescription: description,
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            },
        );
    } catch {
        console.error("[ArmMotors Translation] Could not cache translation.");
    }

    return {
        description,
        cached: false,
    };
}

router.get("/:id/description", async (req, res) => {
    const language = String(req.query.lang || "hy")
        .trim()
        .toLowerCase();

    res.set("Cache-Control", "no-store");

    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                code: "INVALID_PRODUCT_ID",
            });
        }

        if (!SUPPORTED_LANGUAGES.has(language)) {
            return res.status(400).json({
                code: "UNSUPPORTED_LANGUAGE",
            });
        }

        const product = await Product.findById(id)
            .select("description status")
            .lean();

        if (!product || product.status !== "active") {
            return res.status(404).json({
                code: "PRODUCT_NOT_FOUND",
            });
        }

        const original = String(product.description || "").trim();

        const sourceLanguage = detectLanguage(original);

        if (!original) {
            return res.json({
                language,
                sourceLanguage,
                description: "",
                translated: false,
                cached: false,
                fallback: false,
                ready: true,
            });
        }

        /*
         * Նկարագրությունն արդեն ընտրված լեզվով է,
         * կամ ընդհանրապես տառեր չի պարունակում։
         */
        if (!sourceLanguage || sourceLanguage === language) {
            return res.json({
                language,
                sourceLanguage,
                description: original,
                translated: false,
                cached: false,
                fallback: false,
                ready: true,
            });
        }

        const sourceHash = getTextHash(original, sourceLanguage);

        const requestKey = [id, language, sourceHash].join(":");

        let pending = pendingTranslations.get(requestKey);

        if (!pending) {
            pending = getTranslation({
                productId: id,
                language,
                sourceLanguage,
                sourceHash,
                original,
            });

            pendingTranslations.set(requestKey, pending);
        }

        try {
            const result = await pending;

            return res.json({
                language,
                sourceLanguage,
                description: result.description,
                translated: true,
                cached: result.cached,
                fallback: false,
                ready: true,
            });
        } catch {
            console.error("[ArmMotors Translation] Translation unavailable.");

            return res.json({
                language,
                sourceLanguage,
                description: original,
                translated: false,
                cached: false,
                fallback: true,
                ready: false,
            });
        } finally {
            if (pendingTranslations.get(requestKey) === pending) {
                pendingTranslations.delete(requestKey);
            }
        }
    } catch {
        console.error("[ArmMotors Translation] Request failed.");

        return res.status(500).json({
            code: "TRANSLATION_ERROR",
            ready: false,
        });
    }
});

export default router;
