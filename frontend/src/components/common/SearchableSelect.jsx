
import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./SearchableSelect.css";

export default function SearchableSelect({
    label,
    value = "",
    onChange,
    options = [],
    placeholder = "Ընտրել",
    required = false,
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const listId = useId();

    const normalizedOptions = useMemo(
        () =>
            options.map((option) => {
                const [key, text] = Array.isArray(option)
                    ? option
                    : [option, option];

                return {
                    value: String(key),
                    label: String(text),
                };
            }),
        [options]
    );

    const selected = normalizedOptions.find(
        (option) => option.value === String(value ?? "")
    );

    const filtered = useMemo(() => {
        const search = query.trim().toLocaleLowerCase();

        return normalizedOptions.filter((option) =>
            option.label.toLocaleLowerCase().includes(search)
        );
    }, [normalizedOptions, query]);

    useEffect(() => {
        function closeOnOutside(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
                setQuery("");
            }
        }

        document.addEventListener("pointerdown", closeOnOutside);

        return () =>
            document.removeEventListener(
                "pointerdown",
                closeOnOutside
            );
    }, []);

    function choose(option) {
        onChange(option.value);
        setQuery("");
        setOpen(false);
    }

    return (
        <div
            className="ap-field am-search-select"
            ref={rootRef}
        >
            <span className="ap-field-label">
                {label}
                {required && <em> *</em>}
            </span>

            <div className="am-search-select-control">
                <button
                    type="button"
                    className="am-search-select-trigger"
                    disabled={disabled}
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-haspopup="listbox"
                    onClick={() => {
                        setOpen((current) => !current);
                        setQuery("");

                        if (!open) {
                            requestAnimationFrame(() =>
                                inputRef.current?.focus()
                            );
                        }
                    }}
                >
                    <span className={selected ? "" : "is-placeholder"}>
                        {selected?.label || placeholder}
                    </span>

                    <span aria-hidden="true">
                        {open ? "⌃" : "⌄"}
                    </span>
                </button>

                {open && !disabled && (
                    <div className="am-search-select-menu">
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            placeholder="Որոնել..."
                            aria-label={`${label} որոնում`}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setOpen(false);
                                    setQuery("");
                                }

                                if (
                                    event.key === "Enter" &&
                                    filtered.length > 0
                                ) {
                                    event.preventDefault();
                                    choose(filtered[0]);
                                }
                            }}
                        />

                        <div
                            id={listId}
                            className="am-search-select-list"
                            role="listbox"
                            aria-label={label}
                        >
                            {filtered.length === 0 ? (
                                <p className="am-search-select-empty">
                                    Արդյունք չի գտնվել
                                </p>
                            ) : (
                                filtered.map((option) => (
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={
                                            option.value ===
                                            String(value)
                                        }
                                        key={option.value}
                                        className={
                                            option.value ===
                                            String(value)
                                                ? "is-selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            choose(option)
                                        }
                                    >
                                        <span>
                                            {option.label}
                                        </span>

                                        {option.value ===
                                            String(value) && (
                                            <span aria-hidden="true">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {required && (
                <input
                    type="text"
                    className="am-search-select-validation"
                    value={value ?? ""}
                    required
                    tabIndex={-1}
                    onChange={() => {}}
                    aria-label={label}
                />
            )}
        </div>
    );
}
