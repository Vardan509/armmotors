import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ALL_BRANDS, getModels } from "../../data/vehicleCatalog";
import { useI18n } from "../../utils/i18n";
import useCurrency from "../../utils/useCurrency";
import SearchableSelect from "../common/SearchableSelect";

import "./filter.css";
import "./FilterModern.css";

const WORDS = {
    hy: {
        title: "Ֆիլտրեր",
        car: "Մեքենա",
        priceYear: "Գին և տարեթիվ",
        technical: "Տեխնիկական",
        location: "Գույն և մարզ",
        brand: "Մակնիշ",
        model: "Մոդել",
        any: "Բոլորը",
        priceFrom: "Գին՝ սկսած",
        priceTo: "Գին՝ մինչև",
        yearFrom: "Տարեթիվ՝ սկսած",
        yearTo: "Տարեթիվ՝ մինչև",
        mileageFrom: "Վազք՝ սկսած",
        mileageTo: "Վազք՝ մինչև",
        engineFrom: "Շարժիչ՝ սկսած",
        engineTo: "Շարժիչ՝ մինչև",
        fuel: "Վառելիք",
        petrol: "Բենզին",
        diesel: "Դիզել",
        gas: "Գազ",
        hybrid: "Հիբրիդ",
        electric: "Էլեկտրական",
        transmission: "Փոխանցման տուփ",
        automatic: "Ավտոմատ",
        manual: "Մեխանիկական",
        robot: "Ռոբոտ",
        cvt: "Վարիատոր",
        steering: "Ղեկ",
        left: "Ձախ",
        right: "Աջ",
        color: "Գույն",
        region: "Մարզ",
        clear: "Մաքրել",
        search: "Ցույց տալ",
        open: "Բացել ֆիլտրերը",
        close: "Փակել",
        km: "կմ",
        litre: "լ",
        rangeError: "«Սկսած» արժեքը չի կարող մեծ լինել «Մինչև» արժեքից։",
        black: "Սև",
        white: "Սպիտակ",
        silver: "Արծաթագույն",
        gray: "Մոխրագույն",
        blue: "Կապույտ",
        red: "Կարմիր",
        green: "Կանաչ",
        brown: "Շագանակագույն",
        beige: "Բեժ",
    },
    ru: {
        title: "Фильтры",
        car: "Автомобиль",
        priceYear: "Цена и год",
        technical: "Характеристики",
        location: "Цвет и регион",
        brand: "Марка",
        model: "Модель",
        any: "Все",
        priceFrom: "Цена от",
        priceTo: "Цена до",
        yearFrom: "Год от",
        yearTo: "Год до",
        mileageFrom: "Пробег от",
        mileageTo: "Пробег до",
        engineFrom: "Двигатель от",
        engineTo: "Двигатель до",
        fuel: "Топливо",
        petrol: "Бензин",
        diesel: "Дизель",
        gas: "Газ",
        hybrid: "Гибрид",
        electric: "Электро",
        transmission: "Коробка передач",
        automatic: "Автомат",
        manual: "Механика",
        robot: "Робот",
        cvt: "Вариатор",
        steering: "Руль",
        left: "Левый",
        right: "Правый",
        color: "Цвет",
        region: "Регион",
        clear: "Сбросить",
        search: "Показать",
        open: "Открыть фильтры",
        close: "Закрыть",
        km: "км",
        litre: "л",
        rangeError: "Значение «от» не может быть больше значения «до».",
        black: "Чёрный",
        white: "Белый",
        silver: "Серебристый",
        gray: "Серый",
        blue: "Синий",
        red: "Красный",
        green: "Зелёный",
        brown: "Коричневый",
        beige: "Бежевый",
    },
    en: {
        title: "Filters",
        car: "Vehicle",
        priceYear: "Price and year",
        technical: "Specifications",
        location: "Color and region",
        brand: "Brand",
        model: "Model",
        any: "All",
        priceFrom: "Price from",
        priceTo: "Price to",
        yearFrom: "Year from",
        yearTo: "Year to",
        mileageFrom: "Mileage from",
        mileageTo: "Mileage to",
        engineFrom: "Engine from",
        engineTo: "Engine to",
        fuel: "Fuel",
        petrol: "Petrol",
        diesel: "Diesel",
        gas: "Gas",
        hybrid: "Hybrid",
        electric: "Electric",
        transmission: "Transmission",
        automatic: "Automatic",
        manual: "Manual",
        robot: "Automated",
        cvt: "CVT",
        steering: "Steering",
        left: "Left",
        right: "Right",
        color: "Color",
        region: "Region",
        clear: "Clear",
        search: "Show results",
        open: "Open filters",
        close: "Close",
        km: "km",
        litre: "L",
        rangeError: "The minimum cannot exceed the maximum.",
        black: "Black",
        white: "White",
        silver: "Silver",
        gray: "Gray",
        blue: "Blue",
        red: "Red",
        green: "Green",
        brown: "Brown",
        beige: "Beige",
    },
};

const INITIAL = {
    brand: "",
    model: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    mileageFrom: "",
    mileageTo: "",
    engineFrom: "",
    engineTo: "",
    fuel: "",
    transmission: "",
    steering: "",
    color: "",
    region: "",
};

const COLORS = [
    ["black", "Սև", "#20242b"],
    ["white", "Սպիտակ", "#ffffff"],
    ["silver", "Արծաթագույն", "#d2d8df"],
    ["gray", "Մոխրագույն", "#8b929d"],
    ["blue", "Կապույտ", "#3464c3"],
    ["red", "Կարմիր", "#c84051"],
    ["green", "Կանաչ", "#477969"],
    ["brown", "Շագանակագույն", "#836450"],
    ["beige", "Բեժ", "#d8c8ad"],
];

const REGIONS = [
    ["Երևան", "Ереван", "Yerevan"],
    ["Արագածոտն", "Арагацотн", "Aragatsotn"],
    ["Արարատ", "Арарат", "Ararat"],
    ["Արմավիր", "Армавир", "Armavir"],
    ["Գեղարքունիք", "Гегаркуник", "Gegharkunik"],
    ["Լոռի", "Лори", "Lori"],
    ["Կոտայք", "Котайк", "Kotayk"],
    ["Շիրակ", "Ширак", "Shirak"],
    ["Սյունիք", "Сюник", "Syunik"],
    ["Վայոց ձոր", "Вайоц Дзор", "Vayots Dzor"],
    ["Տավուշ", "Тавуш", "Tavush"],
];

function optionValue(item) {
    if (typeof item === "string") return [item, item];

    if (Array.isArray(item)) {
        return [item[0], item[1] || item[0]];
    }

    return [
        item.value || item.name || "",
        item.label || item.name || item.value || "",
    ];
}

function Icon({ name, size = 21 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {name === "close" ? (
                <path d="m6 6 12 12M18 6 6 18" />
            ) : name === "search" ? (
                <>
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m16 16 4.5 4.5" />
                </>
            ) : (
                <>
                    <path d="M3 6h4m4 0h10M3 12h10m4 0h4M3 18h3m4 0h11" />
                    <circle cx="9" cy="6" r="2" />
                    <circle cx="15" cy="12" r="2" />
                    <circle cx="8" cy="18" r="2" />
                </>
            )}
        </svg>
    );
}

function Section({ title, children }) {
    return (
        <details className="fm-section" open>
            <summary>{title}</summary>
            <div className="fm-section-body">{children}</div>
        </details>
    );
}

export default function Filter() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const { language } = useI18n();
    const { currency } = useCurrency();

    const w = WORDS[language] || WORDS.hy;
    const languageIndex = language === "ru" ? 1 : language === "en" ? 2 : 0;

    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({ ...INITIAL });

    const dialogRef = useRef(null);
    const triggerRef = useRef(null);
    const closeRef = useRef(null);

    const activeCount = Object.keys(INITIAL).filter((key) =>
        Boolean(params.get(key)),
    ).length;

    function showFilters() {
        const next = { ...INITIAL };

        for (const key of Object.keys(INITIAL)) {
            next[key] = params.get(key) || "";
        }

        setFilters(next);
        setError("");
        setOpen(true);
    }

    function update(key, value) {
        setError("");

        setFilters((previous) => ({
            ...previous,
            [key]: value,
            ...(key === "brand" ? { model: "" } : {}),
            ...(key === "fuel" && value === "electric"
                ? { engineFrom: "", engineTo: "" }
                : {}),
        }));
    }

    function submit(event) {
        event.preventDefault();

        for (const key of ["price", "year", "mileage", "engine"]) {
            const from = filters[`${key}From`];
            const to = filters[`${key}To`];

            if (from !== "" && to !== "" && Number(from) > Number(to)) {
                setError(w.rangeError);
                return;
            }
        }

        // Պահպանում ենք նաև էջի մյուս գործող ֆիլտրերը։
        const next = new URLSearchParams(params);

        next.delete("page");

        for (const key of Object.keys(INITIAL)) {
            next.delete(key);

            if (filters[key] !== "") {
                next.set(key, filters[key]);
            }
        }

        setOpen(false);

        const query = next.toString();

        navigate(`/cars${query ? `?${query}` : ""}`);
    }

    function reset() {
        setFilters({ ...INITIAL });
        setError("");
    }

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        closeRef.current?.focus();

        function handleKeyDown(event) {
            if (event.defaultPrevented) return;

            if (event.key === "Escape") {
                setOpen(false);
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = [
                ...dialogRef.current.querySelectorAll(
                    'button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, [tabindex="0"]',
                ),
            ].filter((element) => element.getClientRects().length);

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            triggerRef.current?.focus();
        };
    }, [open]);

    function numberField(key, suffix = "", options = {}) {
        return (
            <label className="fm-field">
                <span>{w[key]}</span>

                <div className="fm-input-wrap">
                    <input
                        type="number"
                        inputMode={
                            key.startsWith("engine") ? "decimal" : "numeric"
                        }
                        min={options.min ?? 0}
                        max={options.max}
                        step={key.startsWith("engine") ? "any" : "1"}
                        value={filters[key]}
                        onChange={(event) => update(key, event.target.value)}
                        placeholder="—"
                    />

                    {suffix && <span className="fm-unit">{suffix}</span>}
                </div>
            </label>
        );
    }

    function selectField(key, options) {
        return (
            <label className="fm-field">
                <span>{w[key]}</span>

                <select
                    value={filters[key]}
                    onChange={(event) => update(key, event.target.value)}
                >
                    <option value="">{w.any}</option>

                    {options.map(([value, text]) => (
                        <option key={value} value={value}>
                            {text}
                        </option>
                    ))}
                </select>
            </label>
        );
    }

    const brandOptions = ALL_BRANDS.map(optionValue);
    const modelOptions = filters.brand
        ? getModels(filters.brand).map(optionValue)
        : [];

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                className="am-filter-trigger"
                onClick={showFilters}
                aria-label={w.open}
                title={w.open}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <Icon name="filter" />

                {activeCount > 0 && (
                    <span className="am-filter-count">{activeCount}</span>
                )}
            </button>

            {open &&
                createPortal(
                    <div
                        className="fm-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setOpen(false);
                            }
                        }}
                    >
                        <section
                            ref={dialogRef}
                            className="fm-dialog"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="fm-title"
                        >
                            <header className="fm-header">
                                <span className="fm-header-icon">
                                    <Icon name="filter" />
                                </span>

                                <h2 id="fm-title">{w.title}</h2>

                                <button
                                    ref={closeRef}
                                    type="button"
                                    className="fm-close"
                                    onClick={() => setOpen(false)}
                                    aria-label={w.close}
                                >
                                    <Icon name="close" />
                                </button>
                            </header>

                            <form onSubmit={submit} className="fm-form">
                                <div className="fm-content">
                                    <Section title={w.car}>
                                        <div className="fm-grid">
                                            <SearchableSelect
                                                label={w.brand}
                                                value={filters.brand}
                                                onChange={(value) =>
                                                    update("brand", value)
                                                }
                                                options={[
                                                    ["", w.any],
                                                    ...brandOptions,
                                                ]}
                                                placeholder={w.any}
                                            />

                                            <SearchableSelect
                                                key={filters.brand || "empty"}
                                                label={w.model}
                                                value={filters.model}
                                                onChange={(value) =>
                                                    update("model", value)
                                                }
                                                options={[
                                                    ["", w.any],
                                                    ...modelOptions,
                                                ]}
                                                placeholder={w.any}
                                                disabled={!filters.brand}
                                            />
                                        </div>
                                    </Section>

                                    <Section title={w.priceYear}>
                                        <div className="fm-grid">
                                            {numberField("priceFrom", currency)}
                                            {numberField("priceTo", currency)}
                                            {numberField("yearFrom", "", {
                                                min: 1886,
                                                max:
                                                    new Date().getFullYear() +
                                                    1,
                                            })}
                                            {numberField("yearTo", "", {
                                                min: 1886,
                                                max:
                                                    new Date().getFullYear() +
                                                    1,
                                            })}
                                        </div>
                                    </Section>

                                    <Section title={w.technical}>
                                        <span className="fm-label">
                                            {w.fuel}
                                        </span>

                                        <div
                                            className="fm-pills"
                                            role="group"
                                            aria-label={w.fuel}
                                        >
                                            {[
                                                "",
                                                "petrol",
                                                "diesel",
                                                "gas",
                                                "hybrid",
                                                "electric",
                                            ].map((value) => (
                                                <button
                                                    key={value || "all"}
                                                    type="button"
                                                    aria-pressed={
                                                        filters.fuel === value
                                                    }
                                                    onClick={() =>
                                                        update("fuel", value)
                                                    }
                                                >
                                                    {value ? w[value] : w.any}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="fm-grid">
                                            {numberField("mileageFrom", w.km)}
                                            {numberField("mileageTo", w.km)}

                                            {filters.fuel !== "electric" && (
                                                <>
                                                    {numberField(
                                                        "engineFrom",
                                                        w.litre,
                                                        { min: 0.1, max: 30 },
                                                    )}
                                                    {numberField(
                                                        "engineTo",
                                                        w.litre,
                                                        { min: 0.1, max: 30 },
                                                    )}
                                                </>
                                            )}

                                            {selectField("transmission", [
                                                ["automatic", w.automatic],
                                                ["manual", w.manual],
                                                ["robot", w.robot],
                                                ["cvt", w.cvt],
                                            ])}

                                            {selectField("steering", [
                                                ["left", w.left],
                                                ["right", w.right],
                                            ])}
                                        </div>
                                    </Section>

                                    <Section title={w.location}>
                                        <span className="fm-label">
                                            {w.color}
                                        </span>

                                        <div
                                            className="fm-colors"
                                            role="group"
                                            aria-label={w.color}
                                        >
                                            {COLORS.map(([key, value, hex]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    className="fm-color"
                                                    aria-pressed={
                                                        filters.color === value
                                                    }
                                                    onClick={() =>
                                                        update(
                                                            "color",
                                                            filters.color ===
                                                                value
                                                                ? ""
                                                                : value,
                                                        )
                                                    }
                                                >
                                                    <span
                                                        className="fm-swatch"
                                                        style={{
                                                            backgroundColor:
                                                                hex,
                                                        }}
                                                        aria-hidden="true"
                                                    />
                                                    <span>{w[key]}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {selectField(
                                            "region",
                                            REGIONS.map((region) => [
                                                region[0],
                                                region[languageIndex],
                                            ]),
                                        )}
                                    </Section>
                                </div>

                                {error && (
                                    <p className="fm-error" role="alert">
                                        {error}
                                    </p>
                                )}

                                <footer className="fm-footer">
                                    <button
                                        type="button"
                                        className="fm-reset"
                                        onClick={reset}
                                    >
                                        {w.clear}
                                    </button>

                                    <button type="submit" className="fm-submit">
                                        <Icon name="search" size={18} />
                                        {w.search}
                                    </button>
                                </footer>
                            </form>
                        </section>
                    </div>,
                    document.body,
                )}
        </>
    );
}
