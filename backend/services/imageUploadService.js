
import { v2 as cloudinary } from "cloudinary";

export function configureImageStorage() {
    const {
        CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET,
    } = process.env;

    if (
        !CLOUDINARY_CLOUD_NAME ||
        !CLOUDINARY_API_KEY ||
        !CLOUDINARY_API_SECRET
    ) {
        throw new Error(
            "Cloudinary-ի կարգավորումները բացակայում են։"
        );
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export async function uploadProductImage(buffer) {
    configureImageStorage();

    return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "armmotors/products",
                resource_type: "image",
                transformation: [
                    {
                        width: 1800,
                        height: 1400,
                        crop: "limit",
                        quality: "auto",
                        fetch_format: "auto",
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                if (!result?.secure_url) {
                    reject(new Error("Նկարը չպահպանվեց։"));
                    return;
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        stream.end(buffer);
    });
}
