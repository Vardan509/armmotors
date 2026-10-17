import { useEffect, useRef, useState } from "react";
import "./SearchableSelect.css";

export default function SearchableSelect({
    label,
    value = "",
    options = [],
    onChange,
    placeholder = "Բոլորը",
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    const items = options.map((option) =>
        typeof option === "string"
            ? { value: option, label: option }
            : {
                  value: String(option.value),
                  label: String(option.label),
              },
    );

    const selected = items.find((item) => item.value === value);

    const filtered = items.filter((item) =>
        item.label
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
    );

    useEffect(() => {
        if (!open) return;

        inputRef.current?.focus();

        function onKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        function onOutside(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onOutside);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onOutside);
        };
    }, [open]);

    function choose(nextValue) {
        onChange(nextValue);
        setQuery("");
        setOpen(false);
    }

    return (
        <div
            ref={rootRef}
            className={`am-select ${
                disabled ? "disabled" : ""
            } ${open ? "is-open" : ""}`}
        >
            {label && <label className="am-select-label">{label}</label>}

            <button
                type="button"
                className="am-select-trigger"
                disabled={disabled}
                aria-expanded={open}
                onClick={() => {
                    setOpen((current) => !current);
                    setQuery("");
                }}
            >
                <span>{selected?.label || placeholder}</span>
                <span className="am-select-arrow">{open ? "⌃" : "⌄"}</span>
            </button>

            {open && (
                <div className="am-select-popup">
                    <div className="am-select-search">
                        <input
                            ref={inputRef}
                            type="search"
                            placeholder="Որոնել..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>

                    <div className="am-select-options">
                        <button
                            type="button"
                            className="am-select-option"
                            onClick={() => choose("")}
                        >
                            {placeholder}
                        </button>

                        {filtered.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                className={`am-select-option ${
                                    item.value === value ? "selected" : ""
                                }`}
                                onClick={() => choose(item.value)}
                            >
                                <span>{item.label}</span>
                                {item.value === value && <span>✓</span>}
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="am-select-empty">
                                Արդյունք չի գտնվել
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
