import { useEffect, useId, useRef, useState } from "react";

import { useI18n } from "../../utils/i18n";

import "./SearchableSelect.css";

const TEXTS = {
    hy: {
        all: "Բոլորը",
        search: "Որոնել...",
        empty: "Արդյունք չի գտնվել",
    },
    ru: {
        all: "Все",
        search: "Поиск...",
        empty: "Ничего не найдено",
    },
    en: {
        all: "All",
        search: "Search...",
        empty: "No results found",
    },
};

export default function SearchableSelect({
    label,
    value = "",
    options = [],
    onChange,
    placeholder,
    disabled = false,
}) {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const emptyLabel = placeholder || text.all;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const triggerRef = useRef(null);

    const popupId = useId();

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
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
            }
        }

        function onOutside(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onOutside);
        document.addEventListener("focusin", onOutside);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onOutside);
            document.removeEventListener("focusin", onOutside);
        };
    }, [open]);

    useEffect(() => {
        if (disabled) setOpen(false);
    }, [disabled]);

    function choose(nextValue) {
        onChange(nextValue);
        setQuery("");
        setOpen(false);
        triggerRef.current?.focus();
    }

    return (
        <div
            ref={rootRef}
            className={`am-select ${
                disabled ? "disabled" : ""
            } ${open ? "is-open" : ""}`}
        >
            {label && <span className="am-select-label">{label}</span>}

            <button
                ref={triggerRef}
                type="button"
                className="am-select-trigger"
                disabled={disabled}
                aria-expanded={open && !disabled}
                aria-controls={open && !disabled ? popupId : undefined}
                aria-label={
                    label
                        ? `${label}: ${selected?.label || emptyLabel}`
                        : undefined
                }
                onClick={() => {
                    setOpen((current) => !current);
                    setQuery("");
                }}
            >
                <span>{selected?.label || emptyLabel}</span>

                <span className="am-select-arrow" aria-hidden="true">
                    {open ? "⌃" : "⌄"}
                </span>
            </button>

            {open && !disabled && (
                <div id={popupId} className="am-select-popup">
                    <div className="am-select-search">
                        <input
                            ref={inputRef}
                            type="search"
                            aria-label={text.search}
                            placeholder={text.search}
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
                            {emptyLabel}
                        </button>

                        {filtered.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                className={`am-select-option ${
                                    item.value === value ? "selected" : ""
                                }`}
                                aria-pressed={item.value === value}
                                onClick={() => choose(item.value)}
                            >
                                <span>{item.label}</span>

                                {item.value === value && (
                                    <span aria-hidden="true">✓</span>
                                )}
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="am-select-empty" role="status">
                                {text.empty}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
