import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CarDetailsAd from "../components/CarDetailsAd";
import ProductCard from "../components/ProductCard/ProductCard";
import ReportProduct from "../components/ReportProduct";
import CurrencySelect from "../components/CurrencySelect";
import CarImageGallery from "../components/CarImageGallery/CarImageGallery";
import TranslatedDescription from "../components/TranslatedDescription";
import ContactSellerButton from "../components/messaging/ContactSellerButton";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";
import { localizeListingValue } from "../utils/localizeListing";
import { resolveImageUrl } from "../utils/imageUrl";

import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import useFavorite from "../utils/useFavorite";

import "./CarDetailsPage.css";
import "./SellerContact.css";
import "./CarDetailsExtra.css";

const TEXTS = {
    technical: [
        "Լրացուցիչ տեխնիկական տվյալներ",
        "Дополнительные характеристики",
        "Additional specifications",
    ],
    interior: [
        "Սրահ և հարմարավետություն",
        "Салон и комфорт",
        "Interior and comfort",
    ],
    headlights: ["Լուսարձակներ", "Фары", "Headlights"],
    comfort: [
        "Կոմֆորտ և հնարավորություններ",
        "Комфорт и оснащение",
        "Comfort and features",
    ],
    customsCleared: ["Մաքսազերծված է", "Растаможен", "Customs cleared"],
    paintCondition: ["Ներկի վիճակ", "Состояние краски", "Paint condition"],
    gasEquipment: ["Գազի սարքավորում", "Газовое оборудование", "Gas equipment"],
    gasCylinderReplaced: [
        "Գազի բալոնը փոխված է",
        "Газовый баллон заменён",
        "Gas cylinder replaced",
    ],
    wheelSize: ["Անվահեծերի չափ", "Размер дисков", "Wheel size"],
    interiorMaterial: ["Սրահի նյութ", "Материал салона", "Interior material"],
    sunroof: ["Լյուկ", "Люк", "Sunroof"],
    yes: ["Այո", "Да", "Yes"],
    no: ["Ոչ", "Нет", "No"],
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
    purchaseRequest: [
        "Ուղարկել գնման հայտ",
        "Отправить заявку на покупку",
        "Send purchase request",
    ],
    purchaseSuccess: [
        "Գնման հայտը ուղարկված է։ Հետևեք դրան «Իմ հաշիվը» բաժնում։",
        "Заявка отправлена. Вы можете отслеживать её в своём аккаунте.",
        "Purchase request sent. You can track it in your account.",
    ],
    purchaseError: [
        "Գնման հայտը ուղարկել չհաջողվեց։ Կրկին փորձեք։",
        "Не удалось отправить заявку. Попробуйте ещё раз.",
        "Could not send the purchase request. Please try again.",
    ],
    breadcrumb: ["Էջի ուղի", "Навигация по страницам", "Breadcrumb"],
};

function languageIndex(language) {
    return language === "ru" ? 1 : language === "en" ? 2 : 0;
}

function label(key, language) {
    return TEXTS[key]?.[languageIndex(language)] ?? key;
}

function normalize(value) {
    return String(value)
        .normalize("NFKC")
        .trim()
        .toLocaleLowerCase()
        .replace(/և/g, "եւ")
        .replace(/[‐‑–—]/g, "-")
        .replace(/\s+/g, " ");
}

const EXTRA_LOOKUP = new Map();

for (const [key, translations] of Object.entries(TEXTS)) {
    EXTRA_LOOKUP.set(normalize(key), key);

    for (const translation of translations) {
        if (!EXTRA_LOOKUP.has(normalize(translation))) {
            EXTRA_LOOKUP.set(normalize(translation), key);
        }
    }
}

const EXTRA_ALIASES = {
    "կլիմատ կոնտրոլ": "climateControl",
    "կրուիզ կոնտրոլ": "cruiseControl",
    "տաքացվող նստատեղեր": "heatedSeats",
    "օդափոխվող նստատեղեր": "ventilatedSeats",
    "տաքացվող ղեկ": "heatedSteering",
    "տաքացվող դիմապակի": "heatedWindshield",
    "ադապտիվ կրուիզ": "adaptiveCruise",
    "adaptive cruise": "adaptiveCruise",
    պարկտրոնիկ: "parkingSensors",
    "առանց բանալի մուտք": "keylessEntry",
    "էլեկտրական նստատեղեր": "electricSeats",
    электросиденья: "electricSeats",
    էկոկաշի: "artificial",
    экокожа: "artificial",
    "eco leather": "artificial",
    սովորական: "standard",
    панорамный: "panoramic",
    պանորամային: "panoramic",
    галоген: "halogen",
    ксенон: "xenon",
};

for (const [alias, key] of Object.entries(EXTRA_ALIASES)) {
    EXTRA_LOOKUP.set(normalize(alias), key);
}

function extraValue(value, language) {
    if (value === true || value === "true") return label("yes", language);
    if (value === false || value === "false") return label("no", language);

    const key = EXTRA_LOOKUP.get(normalize(value));

    return key ? label(key, language) : localizeListingValue(value, language);
}

function getId(product) {
    return String(product?._id || product?.id || "");
}

function getSellerId(car) {
    const seller = car?.owner || car?.seller;
    if (!seller) return "";

    return typeof seller === "string"
        ? seller
        : String(seller._id || seller.id || "");
}

function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
}

function normalizePhone(value) {
    const digits = String(value ?? "").replace(/\D/g, "");
    if (!digits) return "";

    let number = digits;

    if (/^0\d{8}$/.test(digits)) {
        number = `374${digits.slice(1)}`;
    } else if (/^\d{8}$/.test(digits)) {
        number = `374${digits}`;
    } else if (digits.startsWith("00")) {
        number = digits.slice(2);
    }

    if (number.length < 8 || number.length > 15 || number.startsWith("0")) {
        return "";
    }

    return number;
}

function ContactIcon({ type }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {type === "phone" ? (
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.79a2 2 0 0 1-.45 2.11L8.07 8.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.71A2 2 0 0 1 22 16.92Z" />
            ) : type === "whatsapp" ? (
                <>
                    <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Z" />
                    <path d="M8.5 8.5c.6 3 3 5.4 6 6" />
                    <path d="m9 8 1.5 2-1 1m5 2 1.5 1-1 2" />
                </>
            ) : (
                <>
                    <path d="M7 3.5h10a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-5l-4.5 3v-3H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z" />
                    <path d="M9 8.5c.4 2.8 2.7 5.1 5.5 5.5" />
                    <path d="M13 8a3 3 0 0 1 3 3" />
                </>
            )}
        </svg>
    );
}

function SellerContact({ car }) {
    const { t } = useI18n();
    const number = normalizePhone(car.phone);

    if (!number || car.isDemo) {
        return (
            <p className="seller-contact-empty">{t("contactUnavailable")}</p>
        );
    }

    return (
        <div className="seller-contact">
            <a
                href={`tel:+${number}`}
                className="seller-contact-call"
                aria-label={`${t("callSeller")}: ${car.phone}`}
            >
                <ContactIcon type="phone" />
                <span>
                    <strong>{t("callSeller")}</strong>
                    <small>{car.phone}</small>
                </span>
                <span className="seller-contact-arrow" aria-hidden="true">
                    ↗
                </span>
            </a>

            <div className="seller-contact-messengers">
                <a
                    href={`https://wa.me/${number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="seller-contact-whatsapp"
                    aria-label="WhatsApp"
                >
                    <ContactIcon type="whatsapp" />
                    <span>WhatsApp</span>
                </a>

                <a
                    href={`viber://chat?number=%2B${number}`}
                    className="seller-contact-viber"
                    aria-label="Viber"
                >
                    <ContactIcon type="viber" />
                    <span>Viber</span>
                </a>
            </div>
        </div>
    );
}

function ExtraSpecs({ car, language }) {
    const technical = [
        ["customsCleared", car.customsCleared],
        ["paintCondition", car.paintCondition],
        ["gasEquipment", car.gasEquipment],
        ["gasCylinderReplaced", car.gasCylinderReplaced],
        ["wheelSize", car.wheelSize],
    ].filter(([, value]) => hasValue(value));

    const interior = [
        ["interiorMaterial", car.interiorMaterial],
        ["sunroof", car.sunroof],
    ].filter(([, value]) => hasValue(value));

    const headlights = Array.isArray(car.headlights)
        ? car.headlights.filter(hasValue)
        : hasValue(car.headlights)
          ? [car.headlights]
          : [];

    const comfortMap = new Map();

    for (const value of [
        ...(Array.isArray(car.comfort) ? car.comfort : []),
        ...(Array.isArray(car.comfortOptions) ? car.comfortOptions : []),
    ]) {
        if (!hasValue(value)) continue;

        const key = EXTRA_LOOKUP.get(normalize(value)) || normalize(value);
        comfortMap.set(key, value);
    }

    const comfort = [...comfortMap.values()];

    if (
        car.type === "part" ||
        !(
            technical.length ||
            interior.length ||
            headlights.length ||
            comfort.length
        )
    ) {
        return null;
    }

    function renderRows(items) {
        return (
            <dl className="ap-detail-extra-grid">
                {items.map(([key, value]) => (
                    <div key={key} className="ap-detail-extra-row">
                        <dt>{label(key, language)}</dt>
                        <dd>{extraValue(value, language)}</dd>
                    </div>
                ))}
            </dl>
        );
    }

    function renderFeatures(items) {
        return (
            <div className="ap-detail-features">
                {items.map((value, index) => (
                    <span
                        key={`${value}-${index}`}
                        className="ap-detail-feature"
                    >
                        <span aria-hidden="true">✓</span>
                        {extraValue(value, language)}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <section className="detail-panel ap-detail-extras">
            <div className="ap-detail-extra-title">
                <span className="ap-detail-extra-title-icon" aria-hidden="true">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
                        <path d="m3 12 9 4.5 9-4.5" />
                        <path d="m3 16.5 9 4.5 9-4.5" />
                    </svg>
                </span>
                <h2>{label("technical", language)}</h2>
            </div>

            {technical.length > 0 && (
                <div className="ap-detail-extra-section">
                    {renderRows(technical)}
                </div>
            )}

            {interior.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{label("interior", language)}</h3>
                    {renderRows(interior)}
                </div>
            )}

            {headlights.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{label("headlights", language)}</h3>
                    {renderFeatures(headlights)}
                </div>
            )}

            {comfort.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{label("comfort", language)}</h3>
                    {renderFeatures(comfort)}
                </div>
            )}
        </section>
    );
}

function similarityScore(item, car) {
    let score = 0;

    if (item.brand === car.brand) {
        score += 50;
        if (item.model === car.model) score += 40;
    }

    const yearDifference = Math.abs(Number(item.year) - Number(car.year));

    if (item.year && car.year && Number.isFinite(yearDifference)) {
        if (yearDifference <= 2) score += 20;
        else if (yearDifference <= 5) score += 10;
    }

    const itemPrice = Number(item.price);
    const carPrice = Number(car.price);

    if (
        itemPrice > 0 &&
        carPrice > 0 &&
        (item.currency || "AMD") === (car.currency || "AMD")
    ) {
        const difference = Math.abs(itemPrice - carPrice) / carPrice;

        if (difference <= 0.15) score += 20;
        else if (difference <= 0.3) score += 10;
    }

    if (item.vehicleType && item.vehicleType === car.vehicleType) {
        score += 10;
    }

    return score;
}

export default function CarDetailsPage({ id }) {
    const navigate = useNavigate();
    const { t, language } = useI18n();

    const [state, setState] = useState({
        id: "",
        car: null,
        loading: true,
        failed: false,
    });

    const [copiedId, setCopiedId] = useState("");
    const [purchase, setPurchase] = useState({ id: "", status: "idle" });

    const { products = [] } = useProducts();
    const { format } = useCurrency();
    const [favorite, toggleFavorite] = useFavorite(id);

    const requestedId = String(id || "");
    const current = state.id === requestedId;
    const car = current ? state.car : null;
    const loading = !current || state.loading;
    const failed = current && state.failed;

    const purchaseStatus =
        purchase.id === requestedId ? purchase.status : "idle";

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    useEffect(() => {
        const controller = new AbortController();

        setCopiedId("");
        setPurchase({ id: requestedId, status: "idle" });
        setState({
            id: requestedId,
            car: null,
            loading: true,
            failed: false,
        });

        async function loadProduct() {
            if (!requestedId) {
                setState({
                    id: requestedId,
                    car: null,
                    loading: false,
                    failed: true,
                });
                return;
            }

            try {
                const result = await apiRequest(
                    `/products/${encodeURIComponent(requestedId)}`,
                    { signal: controller.signal },
                );

                if (controller.signal.aborted) return;

                const product = result?.product || result;

                setState({
                    id: requestedId,
                    car: product,
                    loading: false,
                    failed: !product,
                });
            } catch {
                if (controller.signal.aborted) return;

                setState({
                    id: requestedId,
                    car: null,
                    loading: false,
                    failed: true,
                });
            }
        }

        void loadProduct();
        return () => controller.abort();
    }, [requestedId]);

    const translatedTitle =
        car?.translations?.[language]?.title ||
        car?.titleTranslations?.[language];

    const title =
        (typeof translatedTitle === "string" && translatedTitle.trim()) ||
        car?.title ||
        [car?.brand, car?.model].filter(Boolean).join(" ") ||
        "ArmMotors";

    useEffect(() => {
        if (!car) return;

        const previousTitle = document.title;
        document.title = `${title} — ArmMotors`;

        let meta = document.querySelector('meta[name="description"]');
        const createdMeta = !meta;

        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }

        const previousDescription = meta.getAttribute("content");
        const localizedDescription = car.translations?.[language]?.description;

        const description = String(
            (typeof localizedDescription === "string" &&
                localizedDescription) ||
                car.description ||
                title,
        )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160);

        meta.setAttribute("content", description);

        return () => {
            document.title = previousTitle;

            if (createdMeta) meta.remove();
            else if (previousDescription === null)
                meta.removeAttribute("content");
            else meta.setAttribute("content", previousDescription);
        };
    }, [car, title, language]);

    async function share() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopiedId(requestedId);
        } catch {
            setCopiedId("");
        }
    }

    function requireLogin() {
        if (localStorage.getItem("token")) return false;

        navigate(`/login?next=${encodeURIComponent(`/cars/${requestedId}`)}`);
        return true;
    }

    function handleFavorite() {
        if (requireLogin()) return;
        void toggleFavorite();
    }

    async function sendPurchaseRequest() {
        if (
            !car ||
            car.status === "sold" ||
            purchaseStatus === "loading" ||
            purchaseStatus === "success"
        ) {
            return;
        }

        if (requireLogin()) return;

        const productId = requestedId;
        setPurchase({ id: productId, status: "loading" });

        try {
            await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify({ productId }),
            });

            setPurchase({ id: productId, status: "success" });
        } catch {
            setPurchase({ id: productId, status: "error" });
        }
    }

    function valueText(value, field) {
        return localizeListingValue(value, language, field);
    }

    const rawImages =
        Array.isArray(car?.images) && car.images.length > 0
            ? car.images
            : car?.image
              ? [car.image]
              : [];

    const images = rawImages.map(resolveImageUrl).filter(Boolean);

    const sellerId = getSellerId(car);
    const productId = getId(car) || requestedId;

    const specs = car
        ? [
              [t("make"), car.brand],
              [t("model"), car.model],
              [t("year"), car.year],
              [
                  t("mileage"),
                  hasValue(car.mileage) && Number.isFinite(Number(car.mileage))
                      ? `${Number(car.mileage).toLocaleString(locale)} ${t("mileageUnit")}`
                      : null,
              ],
              [t("fuel"), valueText(car.fuel, "fuel")],
              [t("steering"), valueText(car.steering, "steering")],
              [t("color"), valueText(car.color, "color")],
              [t("region"), valueText(car.region, "region")],
              [t("condition"), valueText(car.condition, "condition")],
              ["VIN", car.vin || "—"],
          ]
        : [];

    const relatedCars =
        car && car.type !== "part"
            ? (Array.isArray(products) ? products : [])
                  .filter(
                      (item) =>
                          getId(item) !== getId(car) &&
                          item.type === "car" &&
                          item.status !== "sold" &&
                          item.status !== "draft",
                  )
                  .map((item) => ({ item, score: similarityScore(item, car) }))
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 4)
                  .map(({ item }) => item)
            : [];

    return (
        <main className="details-page">
            <nav
                className="detail-breadcrumb"
                aria-label={label("breadcrumb", language)}
            >
                <Link to="/">{t("home")}</Link>
                <span>/</span>
                <Link to="/cars">{t("listings")}</Link>
            </nav>

            {loading ? (
                <p role="status">{t("loading")}</p>
            ) : failed || !car ? (
                <section className="detail-panel">
                    <h1>{t("listingUnavailable")}</h1>
                    {failed && <p role="alert">{t("error")}</p>}
                    <Link to="/cars">{t("listings")} →</Link>
                </section>
            ) : (
                <>
                    <div className="detail-heading">
                        <div />
                        <button
                            type="button"
                            className="detail-secondary"
                            onClick={share}
                        >
                            {t("copyLink")} ↗
                        </button>
                    </div>

                    {copiedId === requestedId && (
                        <p role="status">{t("linkCopied")}</p>
                    )}

                    <div className="detail-layout">
                        <div>
                            <CarImageGallery
                                key={productId}
                                images={images}
                                title={title}
                            />

                            <section className="detail-panel">
                                <h2>{t("details")}</h2>
                                <dl className="spec-grid">
                                    {specs
                                        .filter(([, value]) => hasValue(value))
                                        .map(([name, value]) => (
                                            <div key={name}>
                                                <dt>{name}</dt>
                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                </dl>
                            </section>

                            <ExtraSpecs car={car} language={language} />

                            <section className="detail-panel">
                                <h2>{t("description")}</h2>
                                <TranslatedDescription
                                    productId={productId}
                                    description={car.description || ""}
                                />
                            </section>
                        </div>

                        <aside className="seller-panel">
                            <div className="listing-heading">
                                <h1>
                                    {title}
                                    {car.year ? `, ${car.year}` : ""}
                                </h1>

                                <button
                                    type="button"
                                    className="detail-favorite"
                                    onClick={handleFavorite}
                                    aria-pressed={Boolean(favorite)}
                                    aria-label={
                                        favorite
                                            ? t("removeFavorite")
                                            : t("addFavorite")
                                    }
                                >
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill={favorite ? "#e84967" : "none"}
                                        stroke={
                                            favorite
                                                ? "#e84967"
                                                : "currentColor"
                                        }
                                        strokeWidth="1.6"
                                        aria-hidden="true"
                                    >
                                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                                    </svg>
                                </button>
                            </div>

                            <strong className="detail-price">
                                {format(car.price, car.currency || "AMD")}
                            </strong>

                            <CurrencySelect />

                            {car.region && (
                                <p>{valueText(car.region, "region")}</p>
                            )}

                            {car.status === "sold" && (
                                <p className="detail-sold-label">{t("sold")}</p>
                            )}

                            <hr />

                            <div className="seller-identity">
                                <span
                                    className="seller-avatar"
                                    aria-hidden="true"
                                >
                                    {(car.brand || "A")
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </span>

                                <div>
                                    <h2>{t("contactSeller")}</h2>
                                    {sellerId && (
                                        <Link
                                            to={`/sellers/${encodeURIComponent(sellerId)}`}
                                            className="seller-profile-link"
                                        >
                                            {t("sellerPage")} →
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <SellerContact car={car} />

                            {!car.isDemo && (
                                <div style={{ marginTop: 14 }}>
                                    <ContactSellerButton
                                        key={productId}
                                        productId={productId}
                                    />
                                </div>
                            )}

                            {!car.isDemo && (
                                <button
                                    type="button"
                                    className="detail-primary"
                                    style={{ marginTop: 12 }}
                                    disabled={
                                        car.status === "sold" ||
                                        purchaseStatus === "loading" ||
                                        purchaseStatus === "success"
                                    }
                                    onClick={sendPurchaseRequest}
                                >
                                    {car.status === "sold"
                                        ? t("sold")
                                        : purchaseStatus === "loading"
                                          ? t("processing")
                                          : label("purchaseRequest", language)}
                                </button>
                            )}

                            {purchaseStatus === "success" && (
                                <p role="status">
                                    {label("purchaseSuccess", language)}
                                </p>
                            )}

                            {purchaseStatus === "error" && (
                                <p role="alert" className="form-error">
                                    {label("purchaseError", language)}
                                </p>
                            )}

                            <ReportProduct
                                key={productId}
                                productId={productId}
                            />
                        </aside>
                    </div>

                    <CarDetailsAd />

                    {relatedCars.length > 0 && (
                        <section className="related-cars">
                            <h2>{t("relatedCars")}</h2>
                            <div className="products-grid">
                                {relatedCars.map((item) => (
                                    <ProductCard
                                        key={getId(item)}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
