import { useEffect, useMemo, useState } from "react";
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

function Preview({ file, onRemove, disabled }) {
    const url = useMemo(() => URL.createObjectURL(file), [file]);

    useEffect(() => {
        return () => URL.revokeObjectURL(url);
    }, [url]);

    return (
        <div className="am-upload-preview">
            <img src={url} alt={file.name} />

            <button
                type="button"
                disabled={disabled}
                onClick={onRemove}
                aria-label="Հեռացնել նկարը"
            >
                ×
            </button>
        </div>
    );
}

export default function ImageUploader({ onUploaded, disabled = false }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleSelect(event) {
        const selected = Array.from(event.target.files || []);

        setError("");
        setSuccess("");

        const invalid = selected.some(
            (file) =>
                !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                ) || file.size > MAX_SIZE,
        );

        if (invalid) {
            setError("Ընտրեք JPEG, PNG կամ WebP նկարներ՝ մինչև 5 ՄԲ։");

            event.target.value = "";
            return;
        }

        if (files.length + selected.length > MAX_FILES) {
            setError(`Թույլատրվում է առավելագույնը ${MAX_FILES} նկար։`);

            event.target.value = "";
            return;
        }

        setFiles((current) => [...current, ...selected]);

        event.target.value = "";
    }

    function removeFile(index) {
        setFiles((current) => current.filter((_, i) => i !== index));
    }

    async function handleUpload() {
        if (files.length === 0 || uploading || disabled) {
            return;
        }

        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const body = new FormData();

            const prepared = await Promise.all(files.map(compressImage));

            prepared.forEach((file) => {
                body.append("images", file);
            });

            const result = await apiRequest("/uploads/products", {
                method: "POST",
                body,
            });

            const urls = result.urls || [];

            if (!urls.length) {
                throw new Error("Սերվերը նկարների հղումներ չվերադարձրեց։");
            }

            onUploaded?.(urls);

            setFiles([]);
            setSuccess(`${urls.length} նկար հաջողությամբ պահպանվեց։`);
        } catch (err) {
            setError(err.message || "Նկարները վերբեռնել չհաջողվեց։");
        } finally {
            setUploading(false);
        }
    }

    return (
        <section className="am-uploader">
            <div className="am-uploader-heading">
                <h3>Հայտարարության նկարներ</h3>

                <p>
                    Ընտրեք մինչև 12 նկար ձեր համակարգչից։ Նկարները վերբեռնելուց
                    առաջ հնարավորության դեպքում ավտոմատ սեղմվում են։
                    Թույլատրվում են JPEG, PNG և WebP ձևաչափերը։
                </p>
            </div>

            <label className="am-uploader-dropzone">
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={disabled || uploading}
                    onChange={handleSelect}
                />

                <span className="am-uploader-symbol">+</span>

                <strong>Ընտրել նկարներ</strong>

                <small>Մինչև 5 ՄԲ յուրաքանչյուր նկար</small>
            </label>

            {files.length > 0 && (
                <>
                    <div className="am-uploader-count">
                        Ընտրված է {files.length} նկար
                    </div>

                    <div className="am-uploader-grid">
                        {files.map((file, index) => (
                            <Preview
                                key={`${file.name}-${file.lastModified}-${index}`}
                                file={file}
                                disabled={uploading}
                                onRemove={() => removeFile(index)}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        className="am-uploader-submit"
                        disabled={uploading || disabled}
                        onClick={handleUpload}
                    >
                        {uploading
                            ? "Նկարները վերբեռնվում են..."
                            : "Վերբեռնել նկարները"}
                    </button>
                </>
            )}

            {error && (
                <p className="am-uploader-error" role="alert">
                    {error}
                </p>
            )}

            {success && (
                <p className="am-uploader-success" role="status">
                    {success}
                </p>
            )}
        </section>
    );
}
