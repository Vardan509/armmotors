import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";

import requireAuth from "../middleware/requireAuth.js";

import {
    uploadProductImage,
    deleteProductImage,
} from "../services/imageUploadService.js";

const router = Router();

const MAX_FILES = 12;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
        fields: 0,
    },
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

function detectImage(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return null;
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }

    if (
        buffer
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ) {
        return "image/png";
    }

    if (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
        return "image/webp";
    }

    return null;
}

function getPublicOrigin(req) {
    const configured = process.env.PUBLIC_API_ORIGIN?.trim();

    if (configured) {
        const url = new URL(configured);

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("PUBLIC_API_ORIGIN-ը սխալ է։");
        }

        return url.origin;
    }

    return `${req.protocol}://${req.get("host")}`;
}

router.post(
    "/products",
    requireAuth,
    limiter,
    (req, res, next) => {
        upload.array("images", MAX_FILES)(req, res, (error) => {
            if (error) {
                return next(error);
            }

            next();
        });
    },
    async (req, res, next) => {
        const savedFiles = [];

        try {
            const files = req.files || [];

            if (files.length === 0) {
                return res.status(400).json({
                    message: "Ընտրեք առնվազն մեկ նկար։",
                });
            }

            const validatedFiles = files.map((file) => ({
                buffer: file.buffer,
                mimeType: detectImage(file.buffer),
            }));

            if (validatedFiles.some((file) => file.mimeType === null)) {
                return res.status(400).json({
                    message: "Թույլատրվում են միայն JPEG, PNG և WebP նկարներ։",
                });
            }

            const origin = getPublicOrigin(req);
            const images = [];

            for (const file of validatedFiles) {
                const saved = await uploadProductImage(
                    file.buffer,
                    file.mimeType,
                );

                savedFiles.push(saved.filename);

                images.push({
                    url: `${origin}${saved.path}`,
                    publicId: saved.publicId,
                });
            }

            return res.status(201).json({
                images,
                urls: images.map((image) => image.url),
            });
        } catch (error) {
            for (const filename of savedFiles) {
                try {
                    await deleteProductImage(filename);
                } catch (cleanupError) {
                    console.error("[ArmMotors] Cleanup failed:", cleanupError);
                }
            }

            console.error("[ArmMotors] Image upload failed:", error);

            next(error);
        }
    },
);

export default router;
