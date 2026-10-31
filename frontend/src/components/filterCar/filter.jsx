import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { ALL_BRANDS, getModels } from "../../data/vehicleCatalog";
import { useI18n } from "../../utils/i18n";
import SearchableSelect from "../common/SearchableSelect";

import "./filter.css";

const LABELS = {
    hy: {
        title: "Գտեք Ձեր մեքենան",
        subtitle: "Ընտրեք մեքենայի նախընտրած տվյալները",
        brand: "Մակնիշ",
        model: "Մոդել",
        priceFrom: "Գին՝ սկսած",
        priceTo: "Գին՝ մինչև",
        yearFrom: "Տարեթիվ՝ սկսած",
        yearTo: "Տարեթիվ՝ մինչև",
        fuel: "Վառելիք",
        any: "Ցանկացած",
        search: "Որոնել մեքենաներ",
        clear: "Մաքրել",
        petrol: "Բենզին",
        diesel: "Դիզել",
        gas: "Գազ",
        hybrid: "Հիբրիդ",
        electric: "Էլեկտրական",
        filters: "Որոնման ֆիլտրեր",
        open: "Բացել ֆիլտրերը",
        close: "Փակել ֆիլտրերը",
        selectBrand: "Որոնել մակնիշ...",
        selectModel: "Որոնել մոդել...",
        enterPrice: "Նշեք գինը",
        enterYear: "Նշեք տարին",
    },
    ru: {
        title: "Найдите свой автомобиль",
        subtitle: "Выберите параметры автомобиля",
        brand: "Марка",
        model: "Модель",
        priceFrom: "Цена от",
        priceTo: "Цена до",
        yearFrom: "Год от",
        yearTo: "Год до",
        fuel: "Топливо",
        any: "Любой",
        search: "Найти автомобили",
        clear: "Сбросить",
        petrol: "Бензин",
        diesel: "Дизель",
        gas: "Газ",
        hybrid: "Гибрид",
        electric: "Электро",
        filters: "Фильтры поиска",
        open: "Открыть фильтры",
        close: "Закрыть фильтры",
        selectBrand: "Поиск марки...",
        selectModel: "Поиск модели...",
        enterPrice: "Укажите цену",
        enterYear: "Укажите год",
    },
    en: {
        title: "Find your next car",
        subtitle: "Choose your preferred vehicle specifications",
        brand: "Brand",
        model: "Model",
        priceFrom: "Price from",
        priceTo: "Price to",
        yearFrom: "Year from",
        yearTo: "Year to",
        fuel: "Fuel",
        any: "Any",
        search: "Search cars",
        clear: "Clear",
        petrol: "Petrol",
        diesel: "Diesel",
        gas: "Gas",
        hybrid: "Hybrid",
        electric: "Electric",
        filters: "Search filters",
        open: "Open filters",
        close: "Close filters",
        selectBrand: "Search brand...",
        selectModel: "Search model...",
        enterPrice: "Enter price",
        enterYear: "Enter year",
    },
};

const INITIAL = {
    brand: "",
    model: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    fuel: "",
};

function optionValue(item) {
    if (typeof item === "string") {
        return [item, item];
    }

    if (Array.isArray(item)) {
        return [item[0], item[1] || item[0]];
    }

    return [
        item.value || item.name || "",
        item.label || item.name || item.value || "",
    ];
}

function FilterIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 7h16" />
            <path d="M7 12h10" />
            <path d="M10 17h4" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export default function Filter() {
    const navigate = useNavigate();
    const { language } = useI18n();

    const w = LABELS[language] || LABELS.hy;

    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState({ ...INITIAL });

    const activeCount = Object.values(filters).filter(Boolean).length;

    function update(key, value) {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
            ...(key === "brand" ? { model: "" } : {}),
        }));
    }

    function resetFilters() {
        setFilters({ ...INITIAL });
    }

    function submit(event) {
        event.preventDefault();

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(filters)) {
            if (value !== "") {
                params.set(key, value);
            }
        }

        setOpen(false);

        const query = params.toString();

        navigate(`/cars${query ? `?${query}` : ""}`);
    }

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const numericFields = [
        {
            key: "priceFrom",
            label: w.priceFrom,
            placeholder: w.enterPrice,
            min: 0,
        },
        {
            key: "priceTo",
            label: w.priceTo,
            placeholder: w.enterPrice,
            min: 0,
        },
        {
            key: "yearFrom",
            label: w.yearFrom,
            placeholder: w.enterYear,
            min: 1950,
            max: new Date().getFullYear() + 1,
        },
        {
            key: "yearTo",
            label: w.yearTo,
            placeholder: w.enterYear,
            min: 1950,
            max: new Date().getFullYear() + 1,
        },
    ];

    const brandOptions = ALL_BRANDS.map(optionValue);

    const modelOptions = filters.brand
        ? getModels(filters.brand).map(optionValue)
        : [];

    const modal = open ? (
        <div
            className="am-filter-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    setOpen(false);
                }
            }}
        >
            <div
                className="am-filter-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="am-filter-title"
            >
                <div className="am-filter-header">
                    <div className="am-filter-header-info">
                        <div className="am-filter-header-icon">
                            <FilterIcon />
                        </div>

                        <div>
                            <span className="am-filter-eyebrow">ARMMOTORS</span>

                            <h2 id="am-filter-title">{w.title}</h2>

                            <p>{w.subtitle}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="am-filter-close"
                        onClick={() => setOpen(false)}
                        aria-label={w.close}
                    >
                        <CloseIcon />
                    </button>
                </div>

                <form onSubmit={submit}>
                    <div className="am-filter-content">
                        <div className="am-filter-section-label">
                            <FilterIcon />
                            <span>{w.filters}</span>
                        </div>

                        <div className="am-filter-grid">
                            <SearchableSelect
                                label={w.brand}
                                value={filters.brand}
                                onChange={(value) => update("brand", value)}
                                options={brandOptions}
                                placeholder={w.selectBrand}
                            />

                            <SearchableSelect
                                key={filters.brand || "no-brand"}
                                label={w.model}
                                value={filters.model}
                                onChange={(value) => update("model", value)}
                                options={modelOptions}
                                placeholder={w.selectModel}
                                disabled={!filters.brand}
                            />

                            {numericFields.map((field) => (
                                <label
                                    key={field.key}
                                    className="am-catalog-field"
                                >
                                    <span>{field.label}</span>

                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={field.min}
                                        max={field.max}
                                        placeholder={field.placeholder}
                                        value={filters[field.key]}
                                        onChange={(event) =>
                                            update(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>
                            ))}

                            <label className="am-catalog-field">
                                <span>{w.fuel}</span>

                                <select
                                    value={filters.fuel}
                                    onChange={(event) =>
                                        update("fuel", event.target.value)
                                    }
                                >
                                    <option value="">{w.any}</option>

                                    {[
                                        "petrol",
                                        "diesel",
                                        "gas",
                                        "hybrid",
                                        "electric",
                                    ].map((value) => (
                                        <option key={value} value={value}>
                                            {w[value]}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="am-filter-footer">
                        <button
                            type="button"
                            className="am-filter-reset"
                            onClick={resetFilters}
                        >
                            {w.clear}
                        </button>

                        <button type="submit" className="am-filter-submit">
                            <SearchIcon />
                            {w.search}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                type="button"
                className="am-filter-trigger"
                onClick={() => setOpen(true)}
                aria-label={w.open}
                title={w.open}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <FilterIcon />

                {activeCount > 0 && (
                    <span className="am-filter-count">{activeCount}</span>
                )}
            </button>

            {modal && createPortal(modal, document.body)}
        </>
    );
}
