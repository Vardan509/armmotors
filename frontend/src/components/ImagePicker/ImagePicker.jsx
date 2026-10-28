
import { useEffect, useState } from "react";
import "./ImagePicker.css";

export default function ImagePicker({
    onChange,
    maxFiles = 12,
}) {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const previews = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        return () => {
            previews.forEach((item) => {
                URL.revokeObjectURL(item.url);
            });
        };
    }, [files]);

    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const urls = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setPreviews(urls);

        return () => {
            urls.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [files]);

    function selectFiles(event) {
        const selected = Array.from(event.target.files || []);

        const valid = selected.filter(
            (file) =>
                file.type.startsWith("image/") &&
                file.size <= 5 * 1024 * 1024
        );

        const next = [...files, ...valid].slice(0, maxFiles);

        setFiles(next);
        onChange?.(next);

        event.target.value = "";
    }

    function removeFile(index) {
        const next = files.filter((_, i) => i !== index);

        setFiles(next);
        onChange?.(next);
    }

    return (
        <div className="image-picker">
            <label className="image-picker-dropzone">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={selectFiles}
                />

                <span>Ընտրել նկարներ</span>

                <small>
                    Առավելագույնը {maxFiles} նկար, յուրաքանչյուրը՝ մինչև 5 ՄԲ
                </small>
            </label>

            {previews.length > 0 && (
                <div className="image-picker-grid">
                    {previews.map((item, index) => (
                        <div className="image-picker-item" key={item.url}>
                            <img src={item.url} alt={item.name} />

                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                aria-label="Հեռացնել նկարը"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
