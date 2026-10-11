import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";

import requireAuth from "../middleware/requireAuth.js";
import { uploadProductImage } from "../services/imageUploadService.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 12,
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

router.post(
    "/products",
    requireAuth,
    limiter,
    (req, res, next) => {
        upload.array("images", 12)(req, res, (error) => {
            if (error) {
                return next(error);
            }

            next();
        });
    },
    async (req, res, next) => {
        try {
            const files = req.files || [];

            if (files.length === 0) {
                return res.status(400).json({
                    message: "Ընտրեք առնվազն մեկ նկար։",
                });
            }

            const invalid = files.some((file) => !detectImage(file.buffer));

            if (invalid) {
                return res.status(400).json({
                    message: "Թույլատրվում են միայն JPEG, PNG և WebP նկարներ։",
                });
            }

            const images = [];

            for (const file of files) {
                const result = await uploadProductImage(file.buffer);
                images.push(result);
            }

            return res.status(201).json({
                images,
                urls: images.map((image) => image.url),
            });
        } catch (error) {
            console.error("[ArmMotors] Image upload failed:", error);

            next(error);
        }
    },
);

export default router;
