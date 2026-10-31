import { useEffect, useState } from "react";

import { useI18n } from "../../utils/i18n";

import "./ImagePicker.css";

const MAX_SIZE = 5 * 1024 * 1024;

const TEXTS = {
    hy: {
        choose: "Ընտրել նկարներ",
        limit: (count) =>
            `Առավելագույնը ${count} նկար, յուրաքանչյուրը՝ մինչև 5 ՄԲ`,
        remove: "Հեռացնել նկարը",
        invalid: "Որոշ ֆայլեր չեն ավելացվել․ ընտրեք միայն նկարներ՝ մինչև 5 ՄԲ։",
        tooMany: (count) => `Թույլատրվում է առավելագույնը ${count} նկար։`,
        selected: "Ընտրված նկար",
    },

    ru: {
        choose: "Выбрать изображения",
        limit: (count) => `Не более ${count} изображений, до 5 МБ каждое`,
        remove: "Удалить изображение",
        invalid:
            "Некоторые файлы не добавлены. Выбирайте только изображения размером до 5 МБ.",
        tooMany: (count) => `Допускается не более ${count} изображений.`,
        selected: "Выбранное изображение",
    },

    en: {
        choose: "Choose images",
        limit: (count) => `Up to ${count} images, up to 5 MB each`,
        remove: "Remove image",
        invalid: "Some files were not added. Choose only images up to 5 MB.",
        tooMany: (count) => `A maximum of ${count} images is allowed.`,
        selected: "Selected image",
    },
};

function Preview({ file, index, text, onRemove, disabled }) {
    const [url, setUrl] = useState("");

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);

        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    return (
        <div className="image-picker-item">
            {url && <img src={url} alt={`${text.selected} ${index + 1}`} />}

            <button
                type="button"
                disabled={disabled}
                onClick={onRemove}
                aria-label={`${text.remove}: ${file.name}`}
            >
                ×
            </button>
        </div>
    );
}

export default function ImagePicker({
    onChange,
    maxFiles = 12,
    disabled = false,
}) {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const [files, setFiles] = useState([]);
    const [notice, setNotice] = useState("");

    const limit = Number.isFinite(Number(maxFiles))
        ? Math.max(0, Math.floor(Number(maxFiles)))
        : 12;

    function selectFiles(event) {
        const selected = Array.from(event.target.files || []);

        event.target.value = "";

        if (disabled || !selected.length) return;

        const valid = selected.filter(
            (file) => file.type.startsWith("image/") && file.size <= MAX_SIZE,
        );

        const exceedsLimit = files.length + valid.length > limit;

        const next = [...files, ...valid].slice(0, limit);

        if (valid.length !== selected.length) {
            setNotice("invalid");
        } else if (exceedsLimit) {
            setNotice("tooMany");
        } else {
            setNotice("");
        }

        setFiles(next);
        onChange?.(next);
    }

    function removeFile(index) {
        if (disabled) return;

        const next = files.filter((_, currentIndex) => currentIndex !== index);

        setFiles(next);
        setNotice("");
        onChange?.(next);
    }

    return (
        <div className="image-picker">
            <label className="image-picker-dropzone">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={disabled}
                    onChange={selectFiles}
                    aria-label={text.choose}
                />

                <span>{text.choose}</span>
                <small>{text.limit(limit)}</small>
            </label>

            {notice && (
                <p role="status" className="form-error">
                    {notice === "tooMany" ? text.tooMany(limit) : text.invalid}
                </p>
            )}

            {files.length > 0 && (
                <div className="image-picker-grid">
                    {files.map((file, index) => (
                        <Preview
                            key={[
                                file.name,
                                file.size,
                                file.lastModified,
                                index,
                            ].join("-")}
                            file={file}
                            index={index}
                            text={text}
                            disabled={disabled}
                            onRemove={() => removeFile(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
