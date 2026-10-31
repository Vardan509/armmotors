import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../../utils/api";
import useInterfaceText from "../../utils/interfaceText";

import "./ImageUploader.css";

const MAX_FILES = 12;
const MAX_SIZE = 5 * 1024 * 1024;
const TARGET_SIZE = 1600;

async function compressImage(file) {
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

        if (!blob || blob.size >= file.size) return file;

        return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
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
    const { tr } = useInterfaceText();

    const [uploading, setUploading] = useState(false);
    const [errorKey, setErrorKey] = useState("");
    const [previewUrls, setPreviewUrls] = useState([]);

    const previewUrlsRef = useRef([]);
    const mountedRef = useRef(false);
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

        if (!selected.length || busyRef.current || disabled) return;

        setErrorKey("");

        const invalid = selected.some(
            (file) =>
                !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                ) || file.size > MAX_SIZE,
        );

        if (invalid) {
            setErrorKey("invalidPhotos");
            return;
        }

        if (Number(currentCount) + selected.length > MAX_FILES) {
            setErrorKey("tooManyPhotos");
            return;
        }

        busyRef.current = true;
        setUploading(true);

        const urls = selected.map((file) => URL.createObjectURL(file));

        previewUrlsRef.current = urls;
        setPreviewUrls(urls);

        try {
            const prepared = await Promise.all(selected.map(compressImage));

            if (!mountedRef.current) return;

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
                throw new Error("UPLOAD_INCOMPLETE");
            }

            if (mountedRef.current) {
                onUploaded?.(uploadedUrls);
            }
        } catch {
            if (mountedRef.current) {
                setErrorKey("uploadError");
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
                <h3>{tr("photos")}</h3>
                <p>{tr("photoRules")}</p>
            </div>

            <label
                className={`am-uploader-dropzone ${
                    uploading ? "is-uploading" : ""
                }`}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={disabled || uploading}
                    onChange={handleSelect}
                    aria-label={tr("choosePhotos")}
                />

                <span className="am-uploader-symbol" aria-hidden="true">
                    {uploading ? "…" : "+"}
                </span>

                <strong>{tr(uploading ? "uploading" : "choosePhotos")}</strong>

                <small>{tr(uploading ? "waitUpload" : "clickPhotos")}</small>
            </label>

            {uploading && (
                <div className="am-uploader-loading" role="status">
                    <span className="am-uploader-spinner" aria-hidden="true" />

                    <span>{tr("processingPhotos")}</span>
                </div>
            )}

            {previewUrls.length > 0 && (
                <div className="am-uploader-grid">
                    {previewUrls.map((url, index) => (
                        <div className="am-upload-preview" key={url}>
                            <img
                                src={url}
                                alt={tr("selectedPhoto", {
                                    number: index + 1,
                                })}
                            />

                            <span className="am-upload-preview-status">
                                {tr("uploading")}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {errorKey && (
                <p className="am-uploader-error" role="alert">
                    {tr(errorKey)}
                </p>
            )}
        </section>
    );
}
