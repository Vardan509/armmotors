import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";
import SearchableSelect from "../components/filterCar/SearchableSelect";

import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import { useI18n } from "../utils/i18n";
import { localizeListingValue } from "../utils/localizeListing";

import { ALL_BRANDS, getModels } from "../data/vehicleCatalog";

import {
    loadArmeniaLocations,
    getRegions,
    getCommunities,
    getSettlements,
} from "../data/armeniaLocations";

import "./CarsPage.css";
import "../components/filterCar/filter.css";

const PAGE_SIZE = 12;

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

/*
 * Հերթականությունը՝ հայերեն, ռուսերեն, անգլերեն։
 */
const WORDS = {
    all: ["Բոլորը", "Все", "All"],
    passenger: ["Մարդատար", "Легковые", "Passenger cars"],
    truck: ["Բեռնատար", "Грузовые", "Trucks"],
    vehicleType: ["Տրանսպորտի տեսակ", "Тип транспорта", "Vehicle type"],
    brand: ["Մակնիշ", "Марка", "Brand"],
    model: ["Մոդել", "Модель", "Model"],
    region: ["Մարզ", "Область", "Region"],
    community: ["Համայնք", "Община", "Community"],
    settlement: ["Բնակավայր", "Населённый пункт", "Settlement"],
    priceFrom: ["Գին՝ սկսած", "Цена от", "Price from"],
    priceTo: ["Գին՝ մինչև", "Цена до", "Price to"],
    yearFrom: ["Տարեթիվ՝ սկսած", "Год от", "Year from"],
    yearTo: ["Տարեթիվ՝ մինչև", "Год до", "Year to"],
    mileageFrom: ["Վազք՝ սկսած", "Пробег от", "Mileage from"],
    mileageTo: ["Վազք՝ մինչև", "Пробег до", "Mileage to"],
    fuel: ["Վառելիք", "Топливо", "Fuel"],
    steering: ["Ղեկ", "Руль", "Steering"],
    color: ["Գույն", "Цвет", "Color"],
    condition: ["Վիճակ", "Состояние", "Condition"],
    vin: ["VIN-ի առկայություն", "Наличие VIN", "VIN available"],
    customsCleared: ["Մաքսազերծված", "Растаможен", "Customs cleared"],
    paintCondition: ["Ներկի վիճակ", "Состояние краски", "Paint condition"],
    gasEquipment: ["Գազի սարքավորում", "Газовое оборудование", "Gas equipment"],
    gasCylinderReplaced: [
        "Գազի բալոնը փոխված է",
        "Газовый баллон заменён",
        "Gas cylinder replaced",
    ],
    wheelSize: ["Անվահեծի չափ", "Размер дисков", "Wheel size"],
    interiorMaterial: ["Սրահի նյութ", "Материал салона", "Interior material"],
    sunroof: ["Լյուկ", "Люк", "Sunroof"],
    headlights: ["Լուսարձակներ", "Фары", "Headlights"],
    comfort: ["Հարմարություններ", "Комфорт", "Comfort"],
    yes: ["Այո", "Да", "Yes"],
    no: ["Ոչ", "Нет", "No"],
    new: ["Նոր", "Новый", "New"],
    used: ["Օգտագործված", "Б/у", "Used"],
    petrol: ["Բենզին", "Бензин", "Petrol"],
    diesel: ["Դիզել", "Дизель", "Diesel"],
    gas: ["Գազ", "Газ", "Gas"],
    hybrid: ["Հիբրիդ", "Гибрид", "Hybrid"],
    electric: ["Էլեկտրական", "Электрический", "Electric"],
    left: ["Ձախ", "Левый", "Left"],
    right: ["Աջ", "Правый", "Right"],
    apply: ["Ցույց տալ արդյունքները", "Показать результаты", "Show results"],
    clear: ["Մաքրել", "Сбросить", "Clear"],
    found: ["Գտնվել է", "Найдено", "Found"],
    results: ["հայտարարություն", "объявлений", "listings"],
    loading: ["Բեռնվում է…", "Загрузка…", "Loading…"],
    empty: [
        "Այս ֆիլտրերով մեքենա չի գտնվել։",
        "Автомобили не найдены.",
        "No cars match these filters.",
    ],
    any: ["Ցանկացած", "Любой", "Any"],
    select: ["Ընտրել", "Выбрать", "Select"],
    filters: ["Ֆիլտրեր", "Фильтры", "Filters"],
    retry: ["Կրկին փորձել", "Повторить", "Try again"],
    allOptions: ["Բոլոր տարբերակները", "Все варианты", "All options"],
    close: ["Փակել", "Закрыть", "Close"],
    advanced: ["Ընդլայնված ֆիլտրեր", "Расширенные фильтры", "Advanced filters"],
    mainFilters: ["Հիմնական տվյալներ", "Основные данные", "Basic information"],
    priceYear: [
        "Գին, տարեթիվ և վազք",
        "Цена, год и пробег",
        "Price, year and mileage",
    ],
    specifications: ["Տեխնիկական տվյալներ", "Характеристики", "Specifications"],
    sort: ["Դասավորել", "Сортировка", "Sort by"],
    newest: ["Նորերը սկզբում", "Сначала новые", "Newest first"],
    oldest: ["Հները սկզբում", "Сначала старые", "Oldest first"],
    cheap: ["Էժանները սկզբում", "Сначала дешёвые", "Price: low to high"],
    expensive: ["Թանկերը սկզբում", "Сначала дорогие", "Price: high to low"],
    pagination: ["Էջավորում", "Страницы", "Pagination"],
    previous: ["Նախորդ էջ", "Предыдущая страница", "Previous page"],
    next: ["Հաջորդ էջ", "Следующая страница", "Next page"],
    error: [
        "Հայտարարությունները բեռնել չհաջողվեց։",
        "Не удалось загрузить объявления.",
        "Could not load listings.",
    ],
    locationError: [
        "Տեղանունների ցանկը բեռնել չհաջողվեց։",
        "Не удалось загрузить список населённых пунктов.",
        "Could not load the location list.",
    ],
    original: ["Գործարանային ներկ", "Заводская краска", "Original paint"],
    repainted: ["Վերաներկված", "Перекрашен", "Repainted"],
    installed: ["Տեղադրված է", "Установлено", "Installed"],
    notInstalled: ["Տեղադրված չէ", "Не установлено", "Not installed"],
    fabric: ["Կտոր", "Ткань", "Fabric"],
    leather: ["Կաշի", "Кожа", "Leather"],
    artificial: ["Արհեստական կաշի", "Искусственная кожа", "Artificial leather"],
    alcantara: ["Ալկանտարա", "Алькантара", "Alcantara"],
    other: ["Այլ", "Другое", "Other"],
    standard: ["Սովորական լյուկ", "Обычный люк", "Standard sunroof"],
    panoramic: ["Պանորամային լյուկ", "Панорамный люк", "Panoramic sunroof"],
    none: ["Չկա", "Отсутствует", "None"],
    halogen: ["Հալոգեն", "Галогенные", "Halogen"],
    xenon: ["Քսենոն", "Ксеноновые", "Xenon"],
    led: ["LED", "Светодиодные", "LED"],
    black: ["Սև", "Чёрный", "Black"],
    white: ["Սպիտակ", "Белый", "White"],
    silver: ["Արծաթագույն", "Серебристый", "Silver"],
    gray: ["Մոխրագույն", "Серый", "Gray"],
    red: ["Կարմիր", "Красный", "Red"],
    blue: ["Կապույտ", "Синий", "Blue"],
    green: ["Կանաչ", "Зелёный", "Green"],
    yellow: ["Դեղին", "Жёлтый", "Yellow"],
    brown: ["Շագանակագույն", "Коричневый", "Brown"],
    gold: ["Ոսկեգույն", "Золотой", "Gold"],
    beige: ["Բեժ", "Бежевый", "Beige"],
    airConditioning: ["Օդորակիչ", "Кондиционер", "Air conditioning"],
    climateControl: ["Կլիմատ-կոնտրոլ", "Климат-контроль", "Climate control"],
    heatedSeats: ["Նստատեղերի տաքացում", "Подогрев сидений", "Heated seats"],
    ventilatedSeats: [
        "Նստատեղերի օդափոխություն",
        "Вентиляция сидений",
        "Ventilated seats",
    ],
    heatedSteering: ["Ղեկի տաքացում", "Подогрев руля", "Heated steering wheel"],
    heatedWindshield: [
        "Դիմապակու տաքացում",
        "Обогрев лобового стекла",
        "Heated windshield",
    ],
    cruiseControl: ["Կրուիզ-կոնտրոլ", "Круиз-контроль", "Cruise control"],
    adaptiveCruise: [
        "Ադապտիվ կրուիզ-կոնտրոլ",
        "Адаптивный круиз-контроль",
        "Adaptive cruise control",
    ],
    parkingSensors: ["Կայանման սենսորներ", "Парктроники", "Parking sensors"],
    rearCamera: ["Հետևի տեսախցիկ", "Камера заднего вида", "Rear camera"],
    camera360: ["360° տեսախցիկ", "Камера 360°", "360° camera"],
    keylessEntry: [
        "Առանց բանալիի մուտք",
        "Бесключевой доступ",
        "Keyless entry",
    ],
    startStop: [
        "Start/Stop համակարգ",
        "Система Start/Stop",
        "Start/Stop system",
    ],
    electricSeats: [
        "Էլեկտրական նստատեղեր",
        "Электрорегулировка сидений",
        "Power seats",
    ],
    memorySeats: ["Նստատեղերի հիշողություն", "Память сидений", "Memory seats"],
    navigation: ["Նավիգացիա", "Навигация", "Navigation"],
    bluetooth: ["Bluetooth", "Bluetooth", "Bluetooth"],
    appleCarplay: ["Apple CarPlay", "Apple CarPlay", "Apple CarPlay"],
    androidAuto: ["Android Auto", "Android Auto", "Android Auto"],
};

const COMFORT = [
    "airConditioning",
    "climateControl",
    "heatedSeats",
    "ventilatedSeats",
    "heatedSteering",
    "heatedWindshield",
    "cruiseControl",
    "adaptiveCruise",
    "parkingSensors",
    "rearCamera",
    "camera360",
    "keylessEntry",
    "startStop",
    "electricSeats",
    "memorySeats",
    "navigation",
    "bluetooth",
    "appleCarplay",
    "androidAuto",
];

const REGION_NAMES = {
    Երևան: ["Երևան", "Ереван", "Yerevan"],
    Արագածոտն: ["Արագածոտն", "Арагацотн", "Aragatsotn"],
    Արարատ: ["Արարատ", "Арарат", "Ararat"],
    Արմավիր: ["Արմավիր", "Армавир", "Armavir"],
    Գեղարքունիք: ["Գեղարքունիք", "Гегаркуник", "Gegharkunik"],
    Կոտայք: ["Կոտայք", "Котайк", "Kotayk"],
    Լոռի: ["Լոռի", "Лори", "Lori"],
    Շիրակ: ["Շիրակ", "Ширак", "Shirak"],
    Սյունիք: ["Սյունիք", "Сюник", "Syunik"],
    Տավուշ: ["Տավուշ", "Тавуш", "Tavush"],
    "Վայոց ձոր": ["Վայոց ձոր", "Вайоц Дзор", "Vayots Dzor"],
};

function emptyFilters() {
    return { ...EMPTY, headlights: [], comfort: [] };
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

function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase()
        .replace(/և/g, "եւ");
}

function canonical(value) {
    const normalized = normalize(value);

    for (const [key, labels] of Object.entries(WORDS)) {
        if (
            normalize(key) === normalized ||
            labels.some((label) => normalize(label) === normalized)
        ) {
            return key;
        }
    }

    return normalized;
}

function inRange(value, from, to) {
    if (from === "" && to === "") return true;

    if (value === null || value === undefined || value === "") {
        return false;
    }

    const number = Number(value);

    return (
        Number.isFinite(number) &&
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
    if (!inRange(car.mileage, filters.mileageFrom, filters.mileageTo)) {
        return false;
    }

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
        "condition",
        "paintCondition",
        "gasEquipment",
        "gasCylinderReplaced",
        "wheelSize",
        "interiorMaterial",
        "sunroof",
    ];

    const translatedFields = new Set([
        "fuel",
        "steering",
        "color",
        "customsCleared",
        "condition",
        "paintCondition",
        "gasEquipment",
        "gasCylinderReplaced",
        "interiorMaterial",
        "sunroof",
    ]);

    for (const key of exact) {
        if (!filters[key]) continue;

        let actual = car[key];

        if (actual === true) actual = "yes";
        if (actual === false) actual = "no";

        const normalizeField = translatedFields.has(key)
            ? canonical
            : normalize;

        if (normalizeField(actual) !== normalizeField(filters[key])) {
            return false;
        }
    }

    if (filters.vin) {
        const hasVin = Boolean(String(car.vin || "").trim());

        if (filters.vin === "yes" && !hasVin) return false;
        if (filters.vin === "no" && hasVin) return false;
    }

    for (const key of MULTIPLE) {
        const values =
            key === "comfort"
                ? [
                      ...(Array.isArray(car.comfort) ? car.comfort : []),
                      ...(Array.isArray(car.comfortOptions)
                          ? car.comfortOptions
                          : []),
                  ]
                : Array.isArray(car[key])
                  ? car[key]
                  : [];

        const available = new Set(values.map(canonical));

        if (!filters[key].every((value) => available.has(canonical(value)))) {
            return false;
        }
    }

    return true;
}

function Field({ label, children }) {
    return (
        <div className="am-catalog-field">
            <span>{label}</span>
            {children}
        </div>
    );
}

function Pills({ label, value, options, onChange, multiple = false }) {
    return (
        <div className="am-pill-field">
            <span className="am-pill-label">{label}</span>

            <div className="am-pill-list">
                {options.map(([key, text]) => {
                    const active = multiple
                        ? value.includes(key)
                        : value === key;

                    return (
                        <button
                            key={key}
                            type="button"
                            className={`am-pill ${active ? "active" : ""}`}
                            aria-pressed={active}
                            onClick={() => {
                                onChange(
                                    multiple
                                        ? active
                                            ? value.filter(
                                                  (item) => item !== key,
                                              )
                                            : [...value, key]
                                        : active
                                          ? ""
                                          : key,
                                );
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
    const languageIndex = language === "ru" ? 1 : language === "en" ? 2 : 0;
    const word = (key) => WORDS[key]?.[languageIndex] || key;

    const [params, setParams] = useSearchParams();

    const [filters, setFilters] = useState(() => fromQuery(params));

    const [vehicleType, setVehicleType] = useState(
        params.get("vehicleType") || "all",
    );

    const [locations, setLocations] = useState(null);
    const [locationError, setLocationError] = useState(false);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    const { products = [], loading, error, retry } = useProducts();
    const { convert, currency } = useCurrency();

    useEffect(() => {
        setFilters(fromQuery(params));
        setVehicleType(params.get("vehicleType") || "all");
    }, [params]);

    useEffect(() => {
        let cancelled = false;

        async function loadLocations() {
            try {
                const data = await loadArmeniaLocations();

                if (!cancelled) {
                    setLocations(data);
                    setLocationError(false);
                }
            } catch {
                if (!cancelled) setLocationError(true);
            }
        }

        void loadLocations();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function onEscape(event) {
            if (event.key === "Escape") setMobileOpen(false);
        }

        document.addEventListener("keydown", onEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onEscape);
        };
    }, [mobileOpen]);

    useEffect(() => {
        setPage(1);
    }, [filters, vehicleType, sort]);

    const filtered = useMemo(
        () =>
            products.filter((product) => {
                if (product.type !== "car") return false;
                if (product.status === "draft") return false;

                if (
                    vehicleType &&
                    vehicleType !== "all" &&
                    product.vehicleType !== vehicleType
                ) {
                    return false;
                }

                return matches(product, filters, convert, currency);
            }),
        [products, filters, vehicleType, convert, currency],
    );

    const sorted = useMemo(() => {
        const list = [...filtered];

        const price = (item) => {
            const value = Number(
                convert(
                    Number(item.price || 0),
                    currency,
                    item.currency || "AMD",
                ),
            );

            return Number.isFinite(value) ? value : 0;
        };

        const date = (item) => new Date(item.createdAt || 0).getTime() || 0;

        if (sort === "oldest") {
            return list.sort((a, b) => date(a) - date(b));
        }

        if (sort === "cheap") {
            return list.sort((a, b) => price(a) - price(b));
        }

        if (sort === "expensive") {
            return list.sort((a, b) => price(b) - price(a));
        }

        return list.sort((a, b) => date(b) - date(a));
    }, [filtered, sort, convert, currency]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const paginated = sorted.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const activeCount =
        Object.values(filters).filter((value) =>
            Array.isArray(value) ? value.length > 0 : value !== "",
        ).length + (vehicleType !== "all" && vehicleType ? 1 : 0);

    function change(key, value) {
        setFilters((previous) => {
            const next = { ...previous, [key]: value };

            if (key === "brand") next.model = "";

            if (key === "region") {
                next.community = "";
                next.settlement = "";
            }

            if (key === "community") next.settlement = "";

            return next;
        });
    }

    function apply(event) {
        event.preventDefault();

        const next = new URLSearchParams();

        if (vehicleType && vehicleType !== "all") {
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
        setPage(1);
        setParams(new URLSearchParams());
    }

    function numberField(key) {
        return (
            <Field key={key} label={word(key)}>
                <input
                    type="number"
                    min="0"
                    aria-label={word(key)}
                    placeholder={word("any")}
                    value={filters[key]}
                    onChange={(event) => change(key, event.target.value)}
                />
            </Field>
        );
    }

    function selectField(key, options, disabled = false) {
        return (
            <Field key={key} label={word(key)}>
                <select
                    aria-label={word(key)}
                    value={filters[key]}
                    disabled={disabled}
                    onChange={(event) => change(key, event.target.value)}
                >
                    <option value="">{word("allOptions")}</option>

                    {options.map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </Field>
        );
    }

    function optionList(keys) {
        return keys.map((key) => [key, word(key)]);
    }

    function locationOptions(options, rawItems = []) {
        return options.map((option) => {
            const value = option.value;
            const raw = rawItems.find(
                (item) =>
                    (option.id && item.id === option.id) ||
                    (item.name?.local || item.name?.en) === value,
            );

            const regional = REGION_NAMES[value]?.[languageIndex];

            const translated =
                language === "hy" ? raw?.name?.local : raw?.name?.[language];

            return [
                value,
                translated ||
                    regional ||
                    localizeListingValue(option.label || value, language),
            ];
        });
    }

    const regions = locationOptions(getRegions(locations), locations?.regions);

    const communities = locationOptions(
        getCommunities(locations, filters.region),
        locations?.communities,
    );

    const settlements = locationOptions(
        getSettlements(locations, filters.region, filters.community),
        locations?.settlements,
    );

    const booleanOptions = optionList(["yes", "no"]);

    function sortSelect(className) {
        return (
            <select
                aria-label={word("sort")}
                className={className}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
            >
                {["newest", "oldest", "cheap", "expensive"].map((key) => (
                    <option key={key} value={key}>
                        {word(key)}
                    </option>
                ))}
            </select>
        );
    }

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
                    <span className="cars-filter-symbol" aria-hidden="true">
                        ☷
                    </span>

                    {word("filters")}

                    {activeCount > 0 && (
                        <span className="cars-filter-count">{activeCount}</span>
                    )}
                </button>

                {sortSelect("cars-mobile-sort")}
            </div>

            {mobileOpen && (
                <button
                    type="button"
                    className="cars-filter-backdrop"
                    aria-label={word("close")}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div className="cars-page-layout">
                <aside
                    id="cars-filter-panel"
                    className={`cars-filters ${mobileOpen ? "is-open" : ""}`}
                    aria-label={word("filters")}
                >
                    <div className="cars-filter-top">
                        <div>
                            <h2>{word("filters")}</h2>
                        </div>

                        <button
                            type="button"
                            className="cars-filter-close"
                            onClick={() => setMobileOpen(false)}
                            aria-label={word("close")}
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={apply}>
                        <div className="cars-filter-scroll">
                            <div className="cars-filter-section">
                                <h3>{word("mainFilters")}</h3>

                                <Pills
                                    label={word("vehicleType")}
                                    value={vehicleType}
                                    options={optionList([
                                        "all",
                                        "passenger",
                                        "truck",
                                    ])}
                                    onChange={(value) =>
                                        setVehicleType(value || "all")
                                    }
                                />

                                <Field label={word("brand")}>
                                    <SearchableSelect
                                        label={word("brand")}
                                        value={filters.brand}
                                        options={ALL_BRANDS}
                                        onChange={(value) =>
                                            change("brand", value)
                                        }
                                        placeholder={word("select")}
                                    />
                                </Field>

                                <Field label={word("model")}>
                                    <SearchableSelect
                                        label={word("model")}
                                        value={filters.model}
                                        options={
                                            filters.brand
                                                ? getModels(filters.brand)
                                                : []
                                        }
                                        disabled={!filters.brand}
                                        onChange={(value) =>
                                            change("model", value)
                                        }
                                        placeholder={word("select")}
                                    />
                                </Field>

                                {locationError && (
                                    <p role="status">{word("locationError")}</p>
                                )}

                                {selectField("region", regions, !locations)}

                                {selectField(
                                    "community",
                                    communities,
                                    !filters.region || !locations,
                                )}

                                {selectField(
                                    "settlement",
                                    settlements,
                                    !filters.community || !locations,
                                )}
                            </div>

                            <div className="cars-filter-section">
                                <h3>{word("priceYear")}</h3>

                                <div className="am-filter-grid">
                                    {[
                                        "priceFrom",
                                        "priceTo",
                                        "yearFrom",
                                        "yearTo",
                                        "mileageFrom",
                                        "mileageTo",
                                    ].map(numberField)}
                                </div>
                            </div>

                            <div className="cars-filter-section">
                                <h3>{word("specifications")}</h3>

                                {selectField(
                                    "fuel",
                                    optionList([
                                        "petrol",
                                        "diesel",
                                        "gas",
                                        "hybrid",
                                        "electric",
                                    ]),
                                )}

                                {selectField(
                                    "steering",
                                    optionList(["left", "right"]),
                                )}

                                {selectField(
                                    "condition",
                                    optionList(["new", "used"]),
                                )}
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
                                    <span>{word("advanced")}</span>
                                    <span aria-hidden="true">
                                        {advancedOpen ? "−" : "+"}
                                    </span>
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
                                            optionList([
                                                "installed",
                                                "notInstalled",
                                            ]),
                                        )}

                                        {selectField(
                                            "gasCylinderReplaced",
                                            booleanOptions,
                                        )}

                                        {selectField(
                                            "sunroof",
                                            optionList([
                                                "standard",
                                                "panoramic",
                                                "none",
                                            ]),
                                        )}

                                        {selectField(
                                            "paintCondition",
                                            optionList([
                                                "original",
                                                "repainted",
                                            ]),
                                        )}

                                        {selectField(
                                            "interiorMaterial",
                                            optionList([
                                                "fabric",
                                                "leather",
                                                "artificial",
                                                "alcantara",
                                                "other",
                                            ]),
                                        )}

                                        {selectField(
                                            "color",
                                            optionList([
                                                "black",
                                                "white",
                                                "silver",
                                                "gray",
                                                "red",
                                                "blue",
                                                "green",
                                                "yellow",
                                                "brown",
                                                "gold",
                                                "beige",
                                            ]),
                                        )}

                                        {selectField(
                                            "wheelSize",
                                            Array.from(
                                                { length: 12 },
                                                (_, index) => {
                                                    const size = `R${index + 13}`;
                                                    return [size, size];
                                                },
                                            ),
                                        )}

                                        <Pills
                                            label={word("headlights")}
                                            value={filters.headlights}
                                            multiple
                                            options={optionList([
                                                "halogen",
                                                "xenon",
                                                "led",
                                            ])}
                                            onChange={(value) =>
                                                change("headlights", value)
                                            }
                                        />

                                        <Pills
                                            label={word("comfort")}
                                            value={filters.comfort}
                                            multiple
                                            options={optionList(COMFORT)}
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
                                {word("clear")}
                            </button>

                            <button type="submit" className="am-filter-submit">
                                {word("apply")}
                            </button>
                        </div>
                    </form>
                </aside>

                <section className="cars-results">
                    <div className="cars-results-heading">
                        <div>
                            <h2>
                                {word("found")}: {filtered.length}{" "}
                                {word("results")}
                            </h2>
                        </div>

                        {sortSelect("cars-desktop-sort")}
                    </div>

                    {loading ? (
                        <div className="cars-status" role="status">
                            {word("loading")}
                        </div>
                    ) : error ? (
                        <div className="cars-status" role="alert">
                            <p>{word("error")}</p>

                            <button type="button" onClick={retry}>
                                {word("retry")}
                            </button>
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className="cars-status cars-empty">
                            <h3>{word("empty")}</h3>

                            <button type="button" onClick={clear}>
                                {word("clear")}
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
                        <nav
                            className="am-pagination"
                            aria-label={word("pagination")}
                        >
                            <button
                                type="button"
                                aria-label={word("previous")}
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
                                aria-label={word("next")}
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
