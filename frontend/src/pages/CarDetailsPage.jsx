import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CarDetailsAd from "../components/CarDetailsAd";
import ProductCard from "../components/ProductCard/ProductCard";
import ReportProduct from "../components/ReportProduct";
import CurrencySelect from "../components/CurrencySelect";
import CarImageGallery from "../components/CarImageGallery/CarImageGallery";
import TranslatedDescription from "../components/TranslatedDescription";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";
import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import useFavorite from "../utils/useFavorite";
import { localizeListingValue } from "../utils/localizeListing";

import "./CarDetailsPage.css";
import "./SellerContact.css";
import "./CarDetailsExtra.css";

/* =========================================
   TRANSLATIONS
========================================= */

const TRANSLATIONS = {
    hy: {
        technical: "Լրացուցիչ տեխնիկական տվյալներ",
        interior: "Սրահ և հարմարավետություն",
        exterior: "Արտաքին տվյալներ",
        comfort: "Կոմֆորտ և հնարավորություններ",
        customsCleared: "Մաքսազերծված է",
        paintCondition: "Ներկի վիճակ",
        gasEquipment: "Գազի սարքավորում",
        gasCylinderReplaced: "Գազի բալոնը փոխված է",
        wheelSize: "Անվահեծերի չափ",
        interiorMaterial: "Սրահի նյութ",
        sunroof: "Լյուկ",
        headlights: "Լուսարձակներ",
        yes: "Այո",
        no: "Ոչ",
        original: "Գործարանային ներկ",
        repainted: "Վերաներկված",
        installed: "Տեղադրված է",
        notInstalled: "Տեղադրված չէ",
        fabric: "Կտոր",
        leather: "Կաշի",
        artificial: "Արհեստական կաշի",
        alcantara: "Ալկանտարա",
        other: "Այլ",
        standard: "Սովորական լյուկ",
        panoramic: "Պանորամային լյուկ",
        none: "Չկա",
        halogen: "Հալոգեն",
        xenon: "Քսենոն",
        led: "LED",
        airConditioning: "Օդորակիչ",
        climateControl: "Կլիմատ-կոնտրոլ",
        heatedSeats: "Նստատեղերի տաքացում",
        ventilatedSeats: "Նստատեղերի օդափոխություն",
        heatedSteering: "Ղեկի տաքացում",
        heatedWindshield: "Դիմապակու տաքացում",
        cruiseControl: "Կրուիզ-կոնտրոլ",
        adaptiveCruise: "Ադապտիվ կրուիզ-կոնտրոլ",
        parkingSensors: "Կայանման սենսորներ",
        rearCamera: "Հետևի տեսախցիկ",
        camera360: "360° տեսախցիկ",
        keylessEntry: "Առանց բանալիի մուտք",
        startStop: "Start/Stop համակարգ",
        electricSeats: "Էլեկտրական նստատեղեր",
        memorySeats: "Նստատեղերի հիշողություն",
        navigation: "Նավիգացիա",
        bluetooth: "Bluetooth",
        appleCarplay: "Apple CarPlay",
        androidAuto: "Android Auto",
        purchaseSuccess: "Հայտն ուղարկված է։ Հետևեք դրան «Իմ հաշիվը» բաժնում։",
        purchaseError: "Հայտը ուղարկել չհաջողվեց։",
    },

    ru: {
        technical: "Дополнительные характеристики",
        interior: "Салон и комфорт",
        exterior: "Внешние характеристики",
        comfort: "Комфорт и оснащение",
        customsCleared: "Растаможен",
        paintCondition: "Состояние краски",
        gasEquipment: "Газовое оборудование",
        gasCylinderReplaced: "Газовый баллон заменён",
        wheelSize: "Размер дисков",
        interiorMaterial: "Материал салона",
        sunroof: "Люк",
        headlights: "Фары",
        yes: "Да",
        no: "Нет",
        original: "Заводская краска",
        repainted: "Перекрашен",
        installed: "Установлено",
        notInstalled: "Не установлено",
        fabric: "Ткань",
        leather: "Кожа",
        artificial: "Искусственная кожа",
        alcantara: "Алькантара",
        other: "Другое",
        standard: "Обычный люк",
        panoramic: "Панорамный люк",
        none: "Нет",
        halogen: "Галогенные",
        xenon: "Ксеноновые",
        led: "Светодиодные",
        airConditioning: "Кондиционер",
        climateControl: "Климат-контроль",
        heatedSeats: "Подогрев сидений",
        ventilatedSeats: "Вентиляция сидений",
        heatedSteering: "Подогрев руля",
        heatedWindshield: "Обогрев лобового стекла",
        cruiseControl: "Круиз-контроль",
        adaptiveCruise: "Адаптивный круиз-контроль",
        parkingSensors: "Парктроники",
        rearCamera: "Камера заднего вида",
        camera360: "Камера 360°",
        keylessEntry: "Бесключевой доступ",
        startStop: "Система Start/Stop",
        electricSeats: "Электрорегулировка сидений",
        memorySeats: "Память сидений",
        navigation: "Навигация",
        bluetooth: "Bluetooth",
        appleCarplay: "Apple CarPlay",
        androidAuto: "Android Auto",
        purchaseSuccess:
            "Заявка отправлена. Вы можете отслеживать её в своём аккаунте.",
        purchaseError: "Не удалось отправить заявку.",
    },

    en: {
        technical: "Additional specifications",
        interior: "Interior and comfort",
        exterior: "Exterior features",
        comfort: "Comfort and features",
        customsCleared: "Customs cleared",
        paintCondition: "Paint condition",
        gasEquipment: "Gas equipment",
        gasCylinderReplaced: "Gas cylinder replaced",
        wheelSize: "Wheel size",
        interiorMaterial: "Interior material",
        sunroof: "Sunroof",
        headlights: "Headlights",
        yes: "Yes",
        no: "No",
        original: "Original paint",
        repainted: "Repainted",
        installed: "Installed",
        notInstalled: "Not installed",
        fabric: "Fabric",
        leather: "Leather",
        artificial: "Artificial leather",
        alcantara: "Alcantara",
        other: "Other",
        standard: "Standard sunroof",
        panoramic: "Panoramic sunroof",
        none: "None",
        halogen: "Halogen",
        xenon: "Xenon",
        led: "LED",
        airConditioning: "Air conditioning",
        climateControl: "Climate control",
        heatedSeats: "Heated seats",
        ventilatedSeats: "Ventilated seats",
        heatedSteering: "Heated steering wheel",
        heatedWindshield: "Heated windshield",
        cruiseControl: "Cruise control",
        adaptiveCruise: "Adaptive cruise",
        parkingSensors: "Parking sensors",
        rearCamera: "Rear camera",
        camera360: "360° camera",
        keylessEntry: "Keyless entry",
        startStop: "Start/Stop system",
        electricSeats: "Electric seats",
        memorySeats: "Memory seats",
        navigation: "Navigation",
        bluetooth: "Bluetooth",
        appleCarplay: "Apple CarPlay",
        androidAuto: "Android Auto",
        purchaseSuccess: "Request sent. You can track it in your account.",
        purchaseError: "Could not send the request.",
    },
};

/* =========================================
   HELPERS
========================================= */

function getProductId(product) {
    return String(product?._id || product?.id || "");
}

function getSellerId(car) {
    const owner = car?.owner || car?.seller;

    if (!owner) return "";

    return typeof owner === "string"
        ? owner
        : String(owner._id || owner.id || "");
}

function normalizePhone(value) {
    if (typeof value !== "string" && typeof value !== "number") {
        return "";
    }

    const digits = String(value).replace(/\D/g, "");

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

function getContactLinks(phone) {
    const number = normalizePhone(phone);

    if (!number) return null;

    return {
        call: `tel:+${number}`,
        whatsapp: `https://wa.me/${number}`,
        viber: `viber://chat?number=%2B${number}`,
    };
}

function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
}

/* =========================================
   CONTACT ICONS
========================================= */

function ContactIcon({ type }) {
    const paths = {
        phone: (
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.79a2 2 0 0 1-.45 2.11L8.07 8.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.71A2 2 0 0 1 22 16.92Z" />
        ),

        whatsapp: (
            <>
                <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Z" />
                <path d="M8.5 8.5c.6 3 3 5.4 6 6" />
                <path d="m9 8 1.5 2-1 1m5 2 1.5 1-1 2" />
            </>
        ),

        viber: (
            <>
                <path d="M7 3.5h10a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-5l-4.5 3v-3H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z" />
                <path d="M9 8.5c.4 2.8 2.7 5.1 5.5 5.5" />
                <path d="M13 8a3 3 0 0 1 3 3" />
            </>
        ),
    };

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
            {paths[type]}
        </svg>
    );
}

/* =========================================
   SELLER CONTACT
========================================= */

function SellerContact({ car }) {
    const { t } = useI18n();

    const links = getContactLinks(car?.phone);

    if (!links || car?.isDemo) {
        return (
            <p className="seller-contact-empty">{t("contactUnavailable")}</p>
        );
    }

    return (
        <div className="seller-contact">
            <div className="seller-contact-label">{t("contactSeller")}</div>

            <a
                href={links.call}
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
                    href={links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="seller-contact-whatsapp"
                    aria-label="WhatsApp"
                >
                    <ContactIcon type="whatsapp" />
                    <span>WhatsApp</span>
                </a>

                <a
                    href={links.viber}
                    className="seller-contact-viber"
                    aria-label="Viber"
                >
                    <ContactIcon type="viber" />
                    <span>Viber</span>
                </a>
            </div>

            <p className="seller-contact-note">{t("contactAppNote")}</p>
        </div>
    );
}

/* =========================================
   EXTRA SPECIFICATIONS
========================================= */

function ExtraSpecs({ car, language }) {
    const labels = TRANSLATIONS[language] || TRANSLATIONS.hy;

    function translate(value) {
        return labels[value] || value;
    }

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

    const headlights = Array.isArray(car.headlights) ? car.headlights : [];

    const comfort = Array.isArray(car.comfort) ? car.comfort : [];

    const hasExtra =
        technical.length > 0 ||
        interior.length > 0 ||
        headlights.length > 0 ||
        comfort.length > 0;

    if (!hasExtra || car.type === "part") {
        return null;
    }

    function renderRows(items) {
        return (
            <dl className="ap-detail-extra-grid">
                {items.map(([key, value]) => (
                    <div key={key} className="ap-detail-extra-row">
                        <dt>{translate(key)}</dt>
                        <dd>{translate(value)}</dd>
                    </div>
                ))}
            </dl>
        );
    }

    return (
        <section className="detail-panel ap-detail-extras">
            <div className="ap-detail-extra-title">
                <span className="ap-detail-extra-title-icon">
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
                        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
                        <path d="m3 12 9 4.5 9-4.5" />
                        <path d="m3 16.5 9 4.5 9-4.5" />
                    </svg>
                </span>

                <h2>{labels.technical}</h2>
            </div>

            {technical.length > 0 && (
                <div className="ap-detail-extra-section">
                    {renderRows(technical)}
                </div>
            )}

            {interior.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{labels.interior}</h3>
                    {renderRows(interior)}
                </div>
            )}

            {headlights.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{labels.exterior}</h3>

                    <div className="ap-detail-feature-list">
                        {headlights.map((item) => (
                            <span key={item} className="ap-detail-feature">
                                <span aria-hidden="true">✓</span>
                                {translate(item)}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {comfort.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{labels.comfort}</h3>

                    <div className="ap-detail-feature-list">
                        {comfort.map((item) => (
                            <span key={item} className="ap-detail-feature">
                                <span aria-hidden="true">✓</span>
                                {translate(item)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

/* =========================================
   CAR DETAILS PAGE
========================================= */

export default function CarDetailsPage({ id }) {
    const navigate = useNavigate();

    const { t, language } = useI18n();

    const labels = TRANSLATIONS[language] || TRANSLATIONS.hy;

    const [state, setState] = useState({
        car: null,
        loading: true,
        error: "",
    });

    const [copied, setCopied] = useState(false);

    const [purchase, setPurchase] = useState({
        busy: false,
        message: "",
        error: "",
    });

    const { products = [] } = useProducts();
    const { format } = useCurrency();

    const [favorite, toggleFavorite] = useFavorite(id);

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    function translateValue(value) {
        return localizeListingValue(value, language);
    }

    /* =====================================
       LOAD PRODUCT
    ===================================== */

    useEffect(() => {
        const controller = new AbortController();

        async function loadProduct() {
            setState({
                car: null,
                loading: true,
                error: "",
            });

            setCopied(false);

            setPurchase({
                busy: false,
                message: "",
                error: "",
            });

            try {
                const result = await apiRequest(
                    `/products/${encodeURIComponent(id)}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (controller.signal.aborted) return;

                setState({
                    car: result?.product || result,
                    loading: false,
                    error: "",
                });
            } catch (err) {
                if (controller.signal.aborted) return;

                setState({
                    car: null,
                    loading: false,
                    error: err.message || "LOAD_ERROR",
                });
            }
        }

        if (id) {
            void loadProduct();
        } else {
            setState({
                car: null,
                loading: false,
                error: "INVALID_ID",
            });
        }

        return () => controller.abort();
    }, [id]);

    /* =====================================
       SEO
    ===================================== */

    useEffect(() => {
        if (!state.car) return;

        const oldTitle = document.title;

        document.title = `${state.car.title || "ArmMotors"} — ArmMotors`;

        const description = String(
            state.car.description ||
                `${state.car.brand || ""} ${state.car.model || ""} ${
                    state.car.year || ""
                } — ArmMotors`,
        )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160);

        let meta = document.querySelector('meta[name="description"]');

        const createdMeta = !meta;

        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }

        const previousDescription = meta.getAttribute("content");

        meta.setAttribute("content", description);

        return () => {
            document.title = oldTitle;

            if (createdMeta) {
                meta.remove();
            } else if (previousDescription === null) {
                meta.removeAttribute("content");
            } else {
                meta.setAttribute("content", previousDescription);
            }
        };
    }, [state.car]);

    /* =====================================
       ACTIONS
    ===================================== */

    async function share() {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    function openSupport() {
        window.dispatchEvent(
            new CustomEvent("open-support", {
                detail: {
                    listingId: id,
                    title: state.car?.title || "",
                },
            }),
        );
    }

    function handleFavorite() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate(`/login?next=${encodeURIComponent(`/cars/${id}`)}`);

            return;
        }

        void toggleFavorite();
    }

    async function sendPurchaseRequest() {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate(`/login?next=${encodeURIComponent(`/cars/${id}`)}`);

            return;
        }

        setPurchase({
            busy: true,
            message: "",
            error: "",
        });

        try {
            await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify({
                    productId: id,
                }),
            });

            setPurchase({
                busy: false,
                message: "SUCCESS",
                error: "",
            });
        } catch (err) {
            setPurchase({
                busy: false,
                message: "",
                error: err.message || "REQUEST_ERROR",
            });
        }
    }

    /* =====================================
       DATA
    ===================================== */

    const { car, loading, error } = state;

    const images =
        Array.isArray(car?.images) && car.images.length > 0
            ? car.images
            : car?.image
              ? [car.image]
              : [];

    const sellerId = getSellerId(car);

    const specs = car
        ? [
              [t("make"), car.brand],
              [t("model"), car.model],
              [t("year"), car.year],
              [
                  t("mileage"),
                  car.mileage != null
                      ? `${Number(car.mileage).toLocaleString(locale)} ${t(
                            "mileageUnit",
                        )}`
                      : null,
              ],
              [t("fuel"), translateValue(car.fuel)],
              [t("steering"), translateValue(car.steering)],
              [t("color"), translateValue(car.color)],
              [t("region"), translateValue(car.region)],
              [t("condition"), translateValue(car.condition)],
              ["VIN", car.vin || "—"],
          ]
        : [];

    const relatedCars = car
        ? (Array.isArray(products) ? products : [])
              .filter(
                  (item) =>
                      getProductId(item) !== getProductId(car) &&
                      item.type === "car" &&
                      item.brand === car.brand &&
                      item.status !== "sold" &&
                      item.status !== "draft",
              )
              .slice(0, 4)
        : [];

    /* =====================================
       RENDER
    ===================================== */

    return (
        <main className="details-page">
            {/* BREADCRUMB */}

            <nav className="detail-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">{t("home")}</Link>

                <span>/</span>

                <Link to="/cars">{t("listings")}</Link>
            </nav>

            {loading ? (
                <p role="status">{t("loading")}</p>
            ) : error ? (
                <section className="detail-panel">
                    <h1>{t("listingUnavailable")}</h1>

                    <p role="alert">
                        {error === "INVALID_ID" || error === "LOAD_ERROR"
                            ? t("error")
                            : error}
                    </p>

                    <Link to="/cars">{t("listings")} →</Link>
                </section>
            ) : car ? (
                <>
                    {/* SHARE */}

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

                    {copied && <p role="status">{t("linkCopied")}</p>}

                    <div className="detail-layout">
                        <div>
                            {/* IMAGE GALLERY */}

                            <CarImageGallery
                                key={id}
                                images={images}
                                title={car.title}
                            />

                            {/* BASIC SPECS */}

                            <section className="detail-panel">
                                <h2>{t("details")}</h2>

                                <dl className="spec-grid">
                                    {specs
                                        .filter(([, value]) => hasValue(value))
                                        .map(([label, value]) => (
                                            <div key={label}>
                                                <dt>{label}</dt>

                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                </dl>
                            </section>

                            {/* EXTRA SPECS */}

                            <ExtraSpecs car={car} language={language} />

                            {/* DESCRIPTION */}

                            <section className="detail-panel">
                                <h2>{t("description")}</h2>

                                <TranslatedDescription
                                    productId={getProductId(car)}
                                    description={car.description || ""}
                                />
                            </section>
                        </div>

                        {/* SELLER PANEL */}

                        <aside className="seller-panel">
                            <div className="listing-heading">
                                <h1>
                                    {car.title}

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

                            {/* PRICE */}

                            <strong className="detail-price">
                                {format(car.price, car.currency || "AMD")}
                            </strong>

                            <CurrencySelect />

                            {car.region && <p>{translateValue(car.region)}</p>}

                            {car.status === "sold" && (
                                <p className="detail-sold-label">{t("sold")}</p>
                            )}

                            <hr />

                            {/* SELLER IDENTITY */}

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
                                            to={`/sellers/${encodeURIComponent(
                                                sellerId,
                                            )}`}
                                            className="seller-profile-link"
                                        >
                                            {t("sellerPage")} →
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* CONTACT BUTTONS */}

                            <SellerContact car={car} />

                            {/* PURCHASE REQUEST */}

                            <button
                                type="button"
                                className="detail-primary"
                                disabled={
                                    purchase.busy ||
                                    Boolean(purchase.message) ||
                                    car.status === "sold"
                                }
                                onClick={sendPurchaseRequest}
                            >
                                {car.status === "sold"
                                    ? t("sold")
                                    : purchase.busy
                                      ? t("processing")
                                      : t("writeSeller")}
                            </button>

                            {purchase.message && (
                                <p role="status">{labels.purchaseSuccess}</p>
                            )}

                            {purchase.error && (
                                <p role="alert" className="form-error">
                                    {purchase.error === "REQUEST_ERROR"
                                        ? labels.purchaseError
                                        : purchase.error}
                                </p>
                            )}

                            {/* SUPPORT */}

                            <button
                                type="button"
                                className="detail-secondary"
                                onClick={openSupport}
                            >
                                {t("contactSupport")}
                            </button>

                            {/* REPORT */}

                            <ReportProduct productId={getProductId(car)} />
                        </aside>
                    </div>

                    {/* ADVERTISEMENT */}

                    <CarDetailsAd />

                    {/* RELATED CARS */}

                    {relatedCars.length > 0 && (
                        <section className="related-cars">
                            <h2>{t("relatedCars")}</h2>

                            <div className="products-grid">
                                {relatedCars.map((item) => (
                                    <ProductCard
                                        key={getProductId(item)}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            ) : (
                <section className="detail-panel">
                    <h1>{t("listingUnavailable")}</h1>

                    <Link to="/cars">{t("listings")}</Link>
                </section>
            )}
        </main>
    );
}
