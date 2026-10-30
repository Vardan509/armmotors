import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../utils/api";

import "./ImageUploader.css";

const MAX_FILES = 12;
const MAX_SIZE = 5 * 1024 * 1024;
const TARGET_SIZE = 1600;

async function compressImage(file) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Նկարի սխալ ձևաչափ։");
    }

    const bitmap = await createImageBitmap(file);

    try {
        const scale = Math.min(
            1,
            TARGET_SIZE / Math.max(bitmap.width, bitmap.height),
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(bitmap.width * scale));

        canvas.height = Math.max(1, Math.round(bitmap.height * scale));

        const context = canvas.getContext("2d");

        if (!context) return file;

        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/webp", 0.82);
        });

        if (!blob || blob.size >= file.size) {
            return file;
        }

        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
            type: "image/webp",
        });
    } finally {
        bitmap.close();
    }
}

export default function ImageUploader({
    onUploaded,
    disabled = false,
    currentCount = 0,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [previewUrls, setPreviewUrls] = useState([]);

    const inputRef = useRef(null);
    const previewUrlsRef = useRef([]);
    const mountedRef = useRef(true);
    const busyRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;

            previewUrlsRef.current.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            previewUrlsRef.current = [];
        };
    }, []);

    function clearPreviews() {
        previewUrlsRef.current.forEach((url) => {
            URL.revokeObjectURL(url);
        });

        previewUrlsRef.current = [];

        if (mountedRef.current) {
            setPreviewUrls([]);
        }
    }

    async function handleSelect(event) {
        const selected = Array.from(event.target.files || []);

        event.target.value = "";

        if (!selected.length || busyRef.current || disabled) {
            return;
        }

        setError("");

        const invalid = selected.some(
            (file) =>
                !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                ) || file.size > MAX_SIZE,
        );

        if (invalid) {
            setError("Ընտրեք JPEG, PNG կամ WebP նկարներ՝ մինչև 5 ՄԲ։");
            return;
        }

        if (currentCount + selected.length > MAX_FILES) {
            setError(`Թույլատրվում է առավելագույնը ${MAX_FILES} նկար։`);
            return;
        }

        busyRef.current = true;
        setUploading(true);

        const urls = selected.map((file) => URL.createObjectURL(file));

        previewUrlsRef.current = urls;
        setPreviewUrls(urls);

        try {
            const prepared = await Promise.all(selected.map(compressImage));

            const body = new FormData();

            prepared.forEach((file) => {
                body.append("images", file);
            });

            const result = await apiRequest("/uploads/products", {
                method: "POST",
                body,
            });

            const uploadedUrls = Array.isArray(result?.urls) ? result.urls : [];

            if (uploadedUrls.length !== selected.length) {
                throw new Error("Որոշ նկարներ չհաջողվեց վերբեռնել։");
            }

            if (mountedRef.current) {
                onUploaded?.(uploadedUrls);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err.message || "Նկարները վերբեռնել չհաջողվեց։");
            }
        } finally {
            clearPreviews();
            busyRef.current = false;

            if (mountedRef.current) {
                setUploading(false);
            }
        }
    }

    return (
        <section className="am-uploader">
            <div className="am-uploader-heading">
                <h3>Հայտարարության նկարներ</h3>

                <p>
                    Ընտրեք մինչև 12 նկար։ Ընտրելուց հետո դրանք ավտոմատ
                    կվերբեռնվեն։ Թույլատրվում են JPEG, PNG և WebP ձևաչափերը՝
                    մինչև 5 ՄԲ։
                </p>
            </div>

            <label
                className={`am-uploader-dropzone ${
                    uploading ? "is-uploading" : ""
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={disabled || uploading}
                    onChange={handleSelect}
                />

                <span className="am-uploader-symbol">
                    {uploading ? "…" : "+"}
                </span>

                <strong>
                    {uploading
                        ? "Նկարները վերբեռնվում են..."
                        : "Ընտրել նկարներ"}
                </strong>

                <small>
                    {uploading
                        ? "Սպասեք մինչև վերբեռնումն ավարտվի"
                        : "Սեղմեք այստեղ՝ նկարներ ընտրելու համար"}
                </small>
            </label>

            {uploading && (
                <div className="am-uploader-loading" role="status">
                    <span className="am-uploader-spinner" />

                    <span>Նկարները մշակվում և պահպանվում են...</span>
                </div>
            )}

            {previewUrls.length > 0 && (
                <div className="am-uploader-grid">
                    {previewUrls.map((url, index) => (
                        <div className="am-upload-preview" key={url}>
                            <img src={url} alt={`Ընտրված նկար ${index + 1}`} />

                            <span className="am-upload-preview-status">
                                Վերբեռնվում է
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <p className="am-uploader-error" role="alert">
                    {error}
                </p>
            )}
        </section>
    );
}
