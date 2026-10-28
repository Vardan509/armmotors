import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";
import SearchableSelect from "../components/filterCar/SearchableSelect";

import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import { useI18n } from "../utils/i18n";

import { ALL_BRANDS, getModels } from "../data/vehicleCatalog";
import {
    loadArmeniaLocations,
    getRegions,
    getCommunities,
    getSettlements,
} from "../data/armeniaLocations";

import "./CarsPage.css";
import "../components/filterCar/filter.css";

const EMPTY = {
    brand: "",
    model: "",
    region: "",
    community: "",
    settlement: "",
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    mileageFrom: "",
    mileageTo: "",
    fuel: "",
    steering: "",
    color: "",
    vin: "",
    customsCleared: "",
    condition: "",
    paintCondition: "",
    gasEquipment: "",
    gasCylinderReplaced: "",
    wheelSize: "",
    interiorMaterial: "",
    sunroof: "",
    headlights: [],
    comfort: [],
};

const MULTIPLE = ["headlights", "comfort"];

const WORDS = {
    hy: {
        title: "Գտեք Ձեր մեքենան",
        subtitle: "Հայաստանի ավտոմեքենաների հայտարարություններ",
        all: "Բոլորը",
        passenger: "Մարդատար",
        truck: "Բեռնատար",
        brand: "Մակնիշ",
        model: "Մոդել",
        region: "Մարզ",
        community: "Համայնք",
        settlement: "Բնակավայր",
        priceFrom: "Գին՝ սկսած",
        priceTo: "Գին՝ մինչև",
        yearFrom: "Տարեթիվ՝ սկսած",
        yearTo: "Տարեթիվ՝ մինչև",
        mileageFrom: "Վազք՝ սկսած",
        mileageTo: "Վազք՝ մինչև",
        fuel: "Վառելիք",
        steering: "Ղեկ",
        color: "Գույն",
        condition: "Վիճակ",
        customsCleared: "Մաքսազերծված",
        paintCondition: "Ներկի վիճակ",
        gasEquipment: "Գազի սարքավորում",
        gasCylinderReplaced: "Գազի բալոնը փոխված է",
        wheelSize: "Անվահեծի չափ",
        interiorMaterial: "Սրահի նյութ",
        sunroof: "Լյուկ",
        headlights: "Լուսարձակներ",
        comfort: "Հարմարություններ",
        yes: "Այո",
        no: "Ոչ",
        new: "Նոր",
        used: "Օգտագործված",
        petrol: "Բենզին",
        diesel: "Դիզել",
        gas: "Գազ",
        hybrid: "Հիբրիդ",
        electric: "Էլեկտրական",
        left: "Ձախ",
        right: "Աջ",
        apply: "Ցույց տալ արդյունքները",
        clear: "Մաքրել",
        found: "Գտնվել է",
        results: "հայտարարություն",
        loading: "Բեռնվում է…",
        empty: "Այս ֆիլտրերով մեքենա չի գտնվել։",
        any: "Ցանկացած",
        select: "Ընտրել",
        filters: "Ֆիլտրեր",
        retry: "Կրկին փորձել",
        allOptions: "Բոլոր տարբերակները",
        close: "Փակել",
        advanced: "Ընդլայնված ֆիլտրեր",
        mainFilters: "Հիմնական տվյալներ",
        priceYear: "Գին, տարեթիվ և վազք",
        specifications: "Տեխնիկական տվյալներ",
        extras: "Լրացուցիչ տվյալներ",
        sort: "Դասավորել",
        newest: "Նորերը սկզբում",
        oldest: "Հները սկզբում",
        cheap: "Էժանները սկզբում",
        expensive: "Թանկերը սկզբում",
        active: "Ակտիվ ֆիլտրեր",
    },
    ru: {
        title: "Найдите свой автомобиль",
        subtitle: "Объявления об автомобилях в Армении",
        all: "Все",
        passenger: "Легковые",
        truck: "Грузовые",
        brand: "Марка",
        model: "Модель",
        region: "Область",
        community: "Община",
        settlement: "Населённый пункт",
        priceFrom: "Цена от",
        priceTo: "Цена до",
        yearFrom: "Год от",
        yearTo: "Год до",
        mileageFrom: "Пробег от",
        mileageTo: "Пробег до",
        fuel: "Топливо",
        steering: "Руль",
        color: "Цвет",
        condition: "Состояние",
        customsCleared: "Растаможен",
        paintCondition: "Состояние краски",
        gasEquipment: "Газовое оборудование",
        gasCylinderReplaced: "Газовый баллон заменён",
        wheelSize: "Размер дисков",
        interiorMaterial: "Материал салона",
        sunroof: "Люк",
        headlights: "Фары",
        comfort: "Комфорт",
        yes: "Да",
        no: "Нет",
        new: "Новый",
        used: "Б/у",
        petrol: "Бензин",
        diesel: "Дизель",
        gas: "Газ",
        hybrid: "Гибрид",
        electric: "Электро",
        left: "Левый",
        right: "Правый",
        apply: "Показать результаты",
        clear: "Сбросить",
        found: "Найдено",
        results: "объявлений",
        loading: "Загрузка…",
        empty: "Автомобили не найдены.",
        any: "Любой",
        select: "Выбрать",
        filters: "Фильтры",
        retry: "Повторить",
        allOptions: "Все варианты",
        close: "Закрыть",
        advanced: "Расширенные фильтры",
        mainFilters: "Основные данные",
        priceYear: "Цена, год и пробег",
        specifications: "Характеристики",
        extras: "Дополнительно",
        sort: "Сортировка",
        newest: "Сначала новые",
        oldest: "Сначала старые",
        cheap: "Сначала дешёвые",
        expensive: "Сначала дорогие",
        active: "Активные фильтры",
    },
    en: {
        title: "Find your next car",
        subtitle: "Car listings across Armenia",
        all: "All",
        passenger: "Passenger",
        truck: "Trucks",
        brand: "Brand",
        model: "Model",
        region: "Region",
        community: "Community",
        settlement: "Settlement",
        priceFrom: "Price from",
        priceTo: "Price to",
        yearFrom: "Year from",
        yearTo: "Year to",
        mileageFrom: "Mileage from",
        mileageTo: "Mileage to",
        fuel: "Fuel",
        steering: "Steering",
        color: "Color",
        condition: "Condition",
        customsCleared: "Customs cleared",
        paintCondition: "Paint condition",
        gasEquipment: "Gas equipment",
        gasCylinderReplaced: "Gas cylinder replaced",
        wheelSize: "Wheel size",
        interiorMaterial: "Interior material",
        sunroof: "Sunroof",
        headlights: "Headlights",
        comfort: "Comfort",
        yes: "Yes",
        no: "No",
        new: "New",
        used: "Used",
        petrol: "Petrol",
        diesel: "Diesel",
        gas: "Gas",
        hybrid: "Hybrid",
        electric: "Electric",
        left: "Left",
        right: "Right",
        apply: "Show results",
        clear: "Clear",
        found: "Found",
        results: "listings",
        loading: "Loading…",
        empty: "No cars match these filters.",
        any: "Any",
        select: "Select",
        filters: "Filters",
        retry: "Try again",
        allOptions: "All options",
        close: "Close",
        advanced: "Advanced filters",
        mainFilters: "Basic information",
        priceYear: "Price, year and mileage",
        specifications: "Specifications",
        extras: "Additional features",
        sort: "Sort by",
        newest: "Newest first",
        oldest: "Oldest first",
        cheap: "Price: low to high",
        expensive: "Price: high to low",
        active: "Active filters",
    },
};

const COMFORT_LABELS = {
    airConditioning: ["Օդորակիչ", "Кондиционер", "Air conditioning"],
    climateControl: ["Կլիմատ կոնտրոլ", "Климат-контроль", "Climate control"],
    heatedSeats: ["Տաքացվող նստատեղեր", "Подогрев сидений", "Heated seats"],
    ventilatedSeats: [
        "Օդափոխվող նստատեղեր",
        "Вентиляция сидений",
        "Ventilated seats",
    ],
    heatedSteering: ["Տաքացվող ղեկ", "Подогрев руля", "Heated steering"],
    heatedWindshield: [
        "Տաքացվող դիմապակի",
        "Обогрев стекла",
        "Heated windshield",
    ],
    cruiseControl: ["Կրուիզ կոնտրոլ", "Круиз-контроль", "Cruise control"],
    adaptiveCruise: ["Ադապտիվ կրուիզ", "Адаптивный круиз", "Adaptive cruise"],
    parkingSensors: ["Պարկտրոնիկ", "Парктроники", "Parking sensors"],
    rearCamera: ["Հետևի տեսախցիկ", "Камера заднего вида", "Rear camera"],
    camera360: ["360° տեսախցիկ", "Камера 360°", "360° camera"],
    keylessEntry: ["Առանց բանալի մուտք", "Бесключевой доступ", "Keyless entry"],
    startStop: ["Start / Stop", "Start / Stop", "Start / Stop"],
    electricSeats: ["Էլեկտրական նստատեղեր", "Электросиденья", "Power seats"],
    memorySeats: ["Նստատեղերի հիշողություն", "Память сидений", "Memory seats"],
    navigation: ["Նավիգացիա", "Навигация", "Navigation"],
    bluetooth: ["Bluetooth", "Bluetooth", "Bluetooth"],
    appleCarplay: ["Apple CarPlay", "Apple CarPlay", "Apple CarPlay"],
    androidAuto: ["Android Auto", "Android Auto", "Android Auto"],
};

const COMFORT = Object.keys(COMFORT_LABELS);

function emptyFilters() {
    return {
        ...EMPTY,
        headlights: [],
        comfort: [],
    };
}

function fromQuery(params) {
    const result = emptyFilters();

    for (const key of Object.keys(EMPTY)) {
        result[key] = MULTIPLE.includes(key)
            ? (params.get(key) || "").split(",").filter(Boolean)
            : params.get(key) || "";
    }

    return result;
}

function same(a, b) {
    return (
        String(a ?? "")
            .trim()
            .toLowerCase() ===
        String(b ?? "")
            .trim()
            .toLowerCase()
    );
}

function inRange(value, from, to) {
    if (from === "" && to === "") return true;

    if (value === null || value === undefined || value === "") {
        return false;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) return false;

    return (
        (from === "" || number >= Number(from)) &&
        (to === "" || number <= Number(to))
    );
}

function matches(car, filters, convert, currency) {
    const price = convert(
        Number(car.price || 0),
        currency,
        car.currency || "AMD",
    );

    if (!inRange(price, filters.priceFrom, filters.priceTo)) return false;
    if (!inRange(car.year, filters.yearFrom, filters.yearTo)) return false;
    if (!inRange(car.mileage, filters.mileageFrom, filters.mileageTo))
        return false;

    const exact = [
        "brand",
        "model",
        "region",
        "community",
        "settlement",
        "fuel",
        "steering",
        "color",
        "customsCleared",
        "paintCondition",
        "gasEquipment",
        "gasCylinderReplaced",
        "wheelSize",
        "interiorMaterial",
        "sunroof",
        "condition",
    ];

    for (const key of exact) {
        if (filters[key] && !same(car[key], filters[key])) {
            return false;
        }
    }

    if (filters.vin) {
        const hasVin = Boolean(String(car.vin || "").trim());

        if (filters.vin === "yes" && !hasVin) return false;
        if (filters.vin === "no" && hasVin) return false;
    }

    for (const key of MULTIPLE) {
        const available = Array.isArray(car[key]) ? car[key] : [];

        if (!filters[key].every((value) => available.includes(value))) {
            return false;
        }
    }

    return true;
}

function Field({ label, children }) {
    return (
        <label className="am-catalog-field">
            <span>{label}</span>
            {children}
        </label>
    );
}

function Pills({ label, value, options, onChange, multiple = false }) {
    const selected = multiple ? value || [] : value;

    return (
        <div className="am-pill-field">
            <span className="am-pill-label">{label}</span>

            <div className="am-pill-list">
                {options.map(([key, text]) => {
                    const active = multiple
                        ? selected.includes(key)
                        : selected === key;

                    return (
                        <button
                            key={key}
                            type="button"
                            className={`am-pill ${active ? "active" : ""}`}
                            aria-pressed={active}
                            onClick={() => {
                                if (multiple) {
                                    onChange(
                                        active
                                            ? selected.filter(
                                                  (item) => item !== key,
                                              )
                                            : [...selected, key],
                                    );
                                } else {
                                    onChange(active ? "" : key);
                                }
                            }}
                        >
                            {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function CarsPage() {
    const { language } = useI18n();
    const w = WORDS[language] || WORDS.hy;

    const [params, setParams] = useSearchParams();
    const [filters, setFilters] = useState(() => fromQuery(params));
    const [vehicleType, setVehicleType] = useState(
        params.get("vehicleType") || "all",
    );

    const [locationsReady, setLocationsReady] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

    const { products = [], loading, error, retry } = useProducts();
    const { convert, currency } = useCurrency();

    useEffect(() => {
        setFilters(fromQuery(params));
        setVehicleType(params.get("vehicleType") || "all");
    }, [params]);

    useEffect(() => {
        let active = true;

        Promise.resolve()
            .then(() => loadArmeniaLocations())
            .catch(() => null)
            .finally(() => {
                if (active) setLocationsReady(true);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function onEscape(event) {
            if (event.key === "Escape") {
                setMobileOpen(false);
            }
        }

        document.addEventListener("keydown", onEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onEscape);
        };
    }, [mobileOpen]);

    const regions = locationsReady ? getRegions() : [];

    const communities =
        locationsReady && filters.region ? getCommunities(filters.region) : [];

    const settlements =
        locationsReady && filters.region && filters.community
            ? getSettlements(filters.region, filters.community)
            : [];

    const filtered = useMemo(() => {
        return products.filter((product) => {
            if (product.type !== "car") return false;
            if (product.status === "draft") return false;

            if (vehicleType !== "all" && product.vehicleType !== vehicleType) {
                return false;
            }

            return matches(product, filters, convert, currency);
        });
    }, [products, filters, vehicleType, convert, currency]);

    const sorted = useMemo(() => {
        const list = [...filtered];

        const price = (item) => {
            const converted = Number(
                convert(
                    Number(item.price || 0),
                    currency,
                    item.currency || "AMD",
                ),
            );

            return Number.isFinite(converted) ? converted : 0;
        };

        const date = (item) => new Date(item.createdAt || 0).getTime() || 0;

        switch (sort) {
            case "oldest":
                return list.sort((a, b) => date(a) - date(b));

            case "cheap":
                return list.sort((a, b) => price(a) - price(b));

            case "expensive":
                return list.sort((a, b) => price(b) - price(a));

            default:
                return list.sort((a, b) => date(b) - date(a));
        }
    }, [filtered, sort, convert, currency]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = sorted.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    useEffect(() => {
        setPage(1);
    }, [filters, vehicleType, sort]);

    const activeCount =
        Object.values(filters).filter((value) =>
            Array.isArray(value) ? value.length > 0 : value !== "",
        ).length + (vehicleType !== "all" ? 1 : 0);

    function change(key, value) {
        setFilters((previous) => {
            const next = { ...previous, [key]: value };

            if (key === "brand") next.model = "";

            if (key === "region") {
                next.community = "";
                next.settlement = "";
            }

            if (key === "community") {
                next.settlement = "";
            }

            return next;
        });
    }

    function apply(event) {
        event.preventDefault();

        const next = new URLSearchParams();

        if (vehicleType !== "all") {
            next.set("vehicleType", vehicleType);
        }

        for (const [key, value] of Object.entries(filters)) {
            if (Array.isArray(value)) {
                if (value.length) next.set(key, value.join(","));
            } else if (value !== "") {
                next.set(key, value);
            }
        }

        setParams(next);
        setMobileOpen(false);
    }

    function clear() {
        setFilters(emptyFilters());
        setVehicleType("all");
        setParams(new URLSearchParams());
    }

    function numberField(key) {
        return (
            <Field key={key} label={w[key]}>
                <input
                    type="number"
                    min="0"
                    placeholder={w.any}
                    value={filters[key]}
                    onChange={(event) => change(key, event.target.value)}
                />
            </Field>
        );
    }

    function selectField(key, options) {
        return (
            <Field key={key} label={w[key]}>
                <select
                    value={filters[key]}
                    onChange={(event) => change(key, event.target.value)}
                >
                    <option value="">{w.allOptions}</option>

                    {options.map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </Field>
        );
    }

    function locationOptions(items) {
        return items.map((item) => [
            typeof item === "string" ? item : item.value || item.name,
            typeof item === "string" ? item : item.label || item.name,
        ]);
    }

    const booleanOptions = [
        ["yes", w.yes],
        ["no", w.no],
    ];

    const localeIndex = language === "ru" ? 1 : language === "en" ? 2 : 0;

    return (
        <main className="cars-page">
            <div className="cars-mobile-toolbar">
                <button
                    type="button"
                    className="cars-mobile-filter-button"
                    onClick={() => setMobileOpen(true)}
                    aria-expanded={mobileOpen}
                    aria-controls="cars-filter-panel"
                >
                    <span className="cars-filter-symbol">☷</span>
                    {w.filters}

                    {activeCount > 0 && (
                        <span className="cars-filter-count">{activeCount}</span>
                    )}
                </button>

                <select
                    aria-label={w.sort}
                    className="cars-mobile-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                >
                    <option value="newest">{w.newest}</option>
                    <option value="oldest">{w.oldest}</option>
                    <option value="cheap">{w.cheap}</option>
                    <option value="expensive">{w.expensive}</option>
                </select>
            </div>

            {mobileOpen && (
                <button
                    type="button"
                    className="cars-filter-backdrop"
                    aria-label={w.close}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div className="cars-page-layout">
                <aside
                    id="cars-filter-panel"
                    className={`cars-filters ${mobileOpen ? "is-open" : ""}`}
                    aria-label={w.filters}
                >
                    <div className="cars-filter-top">
                        <div>
                            <h2>{w.filters}</h2>
                        </div>

                        <button
                            type="button"
                            className="cars-filter-close"
                            onClick={() => setMobileOpen(false)}
                            aria-label={w.close}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={apply}>
                        <div className="cars-filter-scroll">
                            <div className="cars-filter-section">
                                <h3>{w.mainFilters}</h3>

                                <Pills
                                    label={w.all}
                                    value={vehicleType}
                                    options={[
                                        ["all", w.all],
                                        ["passenger", w.passenger],
                                        ["truck", w.truck],
                                    ]}
                                    onChange={setVehicleType}
                                />

                                <Field label={w.brand}>
                                    <SearchableSelect
                                        value={filters.brand}
                                        options={ALL_BRANDS}
                                        onChange={(value) =>
                                            change("brand", value)
                                        }
                                        placeholder={w.select}
                                    />
                                </Field>

                                <Field label={w.model}>
                                    <SearchableSelect
                                        value={filters.model}
                                        options={
                                            filters.brand
                                                ? getModels(filters.brand)
                                                : []
                                        }
                                        onChange={(value) =>
                                            change("model", value)
                                        }
                                        placeholder={w.select}
                                    />
                                </Field>

                                {selectField(
                                    "region",
                                    locationOptions(regions),
                                )}

                                {selectField(
                                    "community",
                                    locationOptions(communities),
                                )}

                                {selectField(
                                    "settlement",
                                    locationOptions(settlements),
                                )}
                            </div>

                            <div className="cars-filter-section">
                                <h3>{w.priceYear}</h3>

                                <div className="am-filter-grid">
                                    {numberField("priceFrom")}
                                    {numberField("priceTo")}
                                    {numberField("yearFrom")}
                                    {numberField("yearTo")}
                                    {numberField("mileageFrom")}
                                    {numberField("mileageTo")}
                                </div>
                            </div>

                            <div className="cars-filter-section">
                                <h3>{w.specifications}</h3>

                                {selectField("fuel", [
                                    ["petrol", w.petrol],
                                    ["diesel", w.diesel],
                                    ["gas", w.gas],
                                    ["hybrid", w.hybrid],
                                    ["electric", w.electric],
                                ])}

                                {selectField("steering", [
                                    ["left", w.left],
                                    ["right", w.right],
                                ])}

                                {selectField("condition", [
                                    ["new", w.new],
                                    ["used", w.used],
                                ])}
                            </div>

                            <div className="cars-filter-section">
                                <button
                                    type="button"
                                    className="cars-advanced-toggle"
                                    onClick={() =>
                                        setAdvancedOpen((value) => !value)
                                    }
                                    aria-expanded={advancedOpen}
                                >
                                    <span>{w.advanced}</span>
                                    <span>{advancedOpen ? "−" : "+"}</span>
                                </button>

                                {advancedOpen && (
                                    <div className="cars-advanced-content">
                                        {selectField("vin", booleanOptions)}
                                        {selectField(
                                            "customsCleared",
                                            booleanOptions,
                                        )}
                                        {selectField(
                                            "gasEquipment",
                                            booleanOptions,
                                        )}
                                        {selectField(
                                            "gasCylinderReplaced",
                                            booleanOptions,
                                        )}
                                        {selectField("sunroof", booleanOptions)}

                                        {[
                                            "color",
                                            "paintCondition",
                                            "wheelSize",
                                            "interiorMaterial",
                                        ].map((key) => (
                                            <Field key={key} label={w[key]}>
                                                <input
                                                    type="text"
                                                    value={filters[key]}
                                                    placeholder={w.any}
                                                    onChange={(event) =>
                                                        change(
                                                            key,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                        ))}

                                        <Pills
                                            label={w.headlights}
                                            value={filters.headlights}
                                            multiple
                                            options={[
                                                ["halogen", "Halogen"],
                                                ["xenon", "Xenon"],
                                                ["led", "LED"],
                                            ]}
                                            onChange={(value) =>
                                                change("headlights", value)
                                            }
                                        />

                                        <Pills
                                            label={w.comfort}
                                            value={filters.comfort}
                                            multiple
                                            options={COMFORT.map((key) => [
                                                key,
                                                COMFORT_LABELS[key][
                                                    localeIndex
                                                ],
                                            ])}
                                            onChange={(value) =>
                                                change("comfort", value)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="am-filter-actions">
                            <button
                                type="button"
                                className="am-filter-reset"
                                onClick={clear}
                            >
                                {w.clear}
                            </button>

                            <button type="submit" className="am-filter-submit">
                                {w.apply}
                            </button>
                        </div>
                    </form>
                </aside>

                <section className="cars-results">
                    <div className="cars-results-heading">
                        <div>
                            <h2>
                                {w.found}: {filtered.length} {w.results}
                            </h2>
                        </div>

                        <select
                            aria-label={w.sort}
                            className="cars-desktop-sort"
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                        >
                            <option value="newest">{w.newest}</option>
                            <option value="oldest">{w.oldest}</option>
                            <option value="cheap">{w.cheap}</option>
                            <option value="expensive">{w.expensive}</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="cars-status" role="status">
                            {w.loading}
                        </div>
                    ) : error ? (
                        <div className="cars-status" role="alert">
                            <p>{error}</p>

                            <button type="button" onClick={retry}>
                                {w.retry}
                            </button>
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className="cars-status cars-empty">
                            <h3>{w.empty}</h3>

                            <button type="button" onClick={clear}>
                                {w.clear}
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid armmotors-cars-grid">
                            {paginated.map((item) => (
                                <ProductCard
                                    key={item._id || item.id}
                                    item={item}
                                />
                            ))}
                        </div>
                    )}
                    {!loading && !error && totalPages > 1 && (
                        <nav className="am-pagination" aria-label="Էջավորում">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                ‹
                            </button>
                            <span>
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                ›
                            </button>
                        </nav>
                    )}
                </section>
            </div>
        </main>
    );
}
