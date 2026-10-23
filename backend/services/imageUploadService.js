import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL("../", import.meta.url));

export const PRODUCT_UPLOAD_DIRECTORY = path.join(
    backendDirectory,
    "uploads",
    "products",
);

const IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

export async function configureImageStorage() {
    await mkdir(PRODUCT_UPLOAD_DIRECTORY, {
        recursive: true,
    });
}

export async function uploadProductImage(buffer, mimeType) {
    const extension = IMAGE_EXTENSIONS[mimeType];

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error("Նկարի տվյալները բացակայում են։");
    }

    if (!extension) {
        throw new Error("Նկարի ձևաչափը չի աջակցվում։");
    }

    await configureImageStorage();

    const filename = `${randomUUID()}${extension}`;

    const filePath = path.join(PRODUCT_UPLOAD_DIRECTORY, filename);

    await writeFile(filePath, buffer, {
        flag: "wx",
    });

    return {
        filename,
        publicId: `products/${filename}`,
        path: `/uploads/products/${filename}`,
    };
}

export async function deleteProductImage(filename) {
    if (
        typeof filename !== "string" ||
        !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename)
    ) {
        return;
    }

    const filePath = path.join(PRODUCT_UPLOAD_DIRECTORY, filename);

    try {
        await unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
}
