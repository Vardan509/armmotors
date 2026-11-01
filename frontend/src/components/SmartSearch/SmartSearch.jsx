import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useInterfaceText from "../../utils/interfaceText";
import { useI18n } from "../../utils/i18n";

import "./SmartSearch.css";
import "./SmartSearchMobile.css";

const PLACEHOLDERS = {
    hy: "Որոնել մեքենա…",
    ru: "Найти автомобиль…",
    en: "Search cars…",
};

export default function SmartSearch({
    value,
    onChange,
    onSearch,
    initialValue = "",
    className = "",
}) {
    const navigate = useNavigate();
    const { tr } = useInterfaceText();
    const { language } = useI18n();

    const [internalValue, setInternalValue] = useState(initialValue);

    const controlled = value !== undefined;
    const query = controlled ? String(value ?? "") : internalValue;

    function changeQuery(event) {
        const next = event.target.value;

        if (!controlled) {
            setInternalValue(next);
        }

        onChange?.(next);
    }

    function submit(event) {
        event.preventDefault();

        const search = query.trim();

        if (onSearch) {
            onSearch(search);
            return;
        }

        const params = new URLSearchParams();

        if (search) {
            params.set("q", search);
        }

        navigate(params.size ? `/search?${params.toString()}` : "/search");
    }

    return (
        <div className={`smart-search ${className}`.trim()}>
            <form
                className="smart-search-form"
                role="search"
                aria-label={tr("searchLabel")}
                onSubmit={submit}
            >
                <div className="smart-search-input-wrap">
                    <input
                        className="smart-search-input"
                        type="search"
                        value={query}
                        onChange={changeQuery}
                        placeholder={PLACEHOLDERS[language] || PLACEHOLDERS.hy}
                        aria-label={tr("searchLabel")}
                    />
                </div>

                <button
                    className="smart-search-button"
                    type="submit"
                    aria-label={tr("search")}
                >
                    <span className="smart-search-button-text">
                        {tr("search")}
                    </span>

                    <svg
                        className="smart-search-submit-icon"
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="10.5" cy="10.5" r="6.5" />
                        <path d="m16 16 4.5 4.5" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
