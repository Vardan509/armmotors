import { useState, useSyncExternalStore } from "react";

import { Link, useNavigate } from "react-router-dom";

import useCurrency from "../../utils/useCurrency";
import useFavorite from "../../utils/useFavorite";
import { useI18n } from "../../utils/i18n";

import {
    getCompareIds,
    toggleCompare,
    subscribeCompare,
} from "../../utils/compare";

import "./ProductCard.css";
import "../../styles/ArmMotorsMobile.css";

// ==========================================
// LOCAL TRANSLATIONS
// ==========================================

const CARD_TEXT = {
    hy: {
        listing: "Հայտարարություն",
        car: "Ավտոմեքենա",
        part: "Պահեստամաս",
        noImage: "Նկար չկա",
        noRegion: "Տարածքը նշված չէ",
        compare: "Համեմատել",
        removeCompare: "Հեռացնել համեմատությունից",
        view: "Դիտել",
        viewDetails: "Դիտել մանրամասները",
        compareError: "Համեմատությունը չհաջողվեց։",
        yearSuffix: "թ.",
    },

    ru: {
        listing: "Объявление",
        car: "Автомобиль",
        part: "Запчасть",
        noImage: "Нет фото",
        noRegion: "Регион не указан",
        compare: "Сравнить",
        removeCompare: "Убрать из сравнения",
        view: "Посмотреть",
        viewDetails: "Посмотреть детали",
        compareError: "Не удалось выполнить сравнение.",
        yearSuffix: "г.",
    },

    en: {
        listing: "Listing",
        car: "Car",
        part: "Spare part",
        noImage: "No image",
        noRegion: "Region not specified",
        compare: "Compare",
        removeCompare: "Remove from comparison",
        view: "View",
        viewDetails: "View details",
        compareError: "Could not update comparison.",
        yearSuffix: "",
    },
};

function Icon({ name, size = 17 }) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    switch (name) {
        case "heart":
            return (
                <svg {...common}>
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
            );

        case "calendar":
            return (
                <svg {...common}>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M7 3v4M17 3v4M3 10h18" />
                </svg>
            );

        case "speed":
            return (
                <svg {...common}>
                    <path d="M5 18a9 9 0 1 1 14 0" />
                    <path d="m12 14 4-5" />
                    <circle cx="12" cy="14" r="1.5" />
                    <path d="M8 20h8" />
                </svg>
            );

        case "fuel":
            return (
                <svg {...common}>
                    <rect x="4" y="4" width="11" height="17" rx="2" />
                    <path d="M7 8h5M15 9h2l3 3v6a2 2 0 0 1-4 0v-4" />
                </svg>
            );

        case "pin":
            return (
                <svg {...common}>
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                </svg>
            );

        case "compare":
            return (
                <svg {...common}>
                    <path d="M4 7h16M16 3l4 4-4 4M20 17H4M8 13l-4 4 4 4" />
                </svg>
            );

        case "arrow":
            return (
                <svg {...common}>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            );

        case "car":
            return (
                <svg {...common}>
                    <path d="m5 11 2-5h10l2 5" />
                    <rect x="3" y="11" width="18" height="7" rx="2" />
                    <path d="M6 18v2M18 18v2M7 14h1M16 14h1" />
                </svg>
            );

        default:
            return null;
    }
}

// ==========================================
// PRODUCT CARD
// ==========================================

export default function ProductCard({ item }) {
    const navigate = useNavigate();

    const { language, t } = useI18n();

    const text = CARD_TEXT[language] || CARD_TEXT.hy;

    const [failedImage, setFailedImage] = useState("");

    const [message, setMessage] = useState("");

    const { format } = useCurrency();

    const id = String(item?._id || item?.id || "");

    const [favorite, toggleFavorite] = useFavorite(id);

    // ==========================================
    // COMPARE STORE
    // ==========================================

    const compareSnapshot = useSyncExternalStore(
        subscribeCompare,
        () => JSON.stringify(getCompareIds()),
        () => "[]",
    );

    const compareIds = JSON.parse(compareSnapshot);

    const isCompared = compareIds.includes(id);

    // ==========================================
    // PRODUCT DATA
    // ==========================================

    const title =
        item?.title ||
        [item?.brand, item?.model].filter(Boolean).join(" ") ||
        text.listing;

    const image = item?.image || item?.images?.[0] || "";

    const isCar = item?.type === "car";

    const isNew = item?.condition === "new" || item?.condition === "Նոր";

    const isTop = Boolean(
        item?.topUntil && new Date(item.topUntil).getTime() > Date.now(),
    );

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    const mileage =
        item?.mileage !== null &&
        item?.mileage !== undefined &&
        Number.isFinite(Number(item.mileage))
            ? `${Number(item.mileage).toLocaleString(
                  locale,
              )} ${t("mileageUnit")}`
            : null;

    const details = isCar
        ? [
              item?.year
                  ? {
                        icon: "calendar",
                        text: `${item.year}${
                            text.yearSuffix ? ` ${text.yearSuffix}` : ""
                        }`,
                    }
                  : null,

              mileage
                  ? {
                        icon: "speed",
                        text: mileage,
                    }
                  : null,

              item?.fuel
                  ? {
                        icon: "fuel",
                        text:
                            item.fuel === "benzin" ? t("petrol") : t(item.fuel),
                    }
                  : null,
          ].filter(Boolean)
        : [
              item?.condition
                  ? {
                        icon: "car",
                        text: isNew
                            ? t("new")
                            : item.condition === "used"
                              ? t("used")
                              : item.condition,
                    }
                  : null,
          ].filter(Boolean);

    // ==========================================
    // FAVORITES
    // ==========================================

    function handleFavoriteClick() {
        if (!id) return;

        if (!localStorage.getItem("token")) {
            navigate("/login?next=%2Ffavorites");

            return;
        }

        void toggleFavorite();
    }

    // ==========================================
    // COMPARE
    // ==========================================

    function handleCompareClick() {
        if (!id) return;

        const result = toggleCompare(id);

        if (!result.success) {
            setMessage(text.compareError);

            return;
        }

        setMessage("");
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <article className={`listing-card ${isTop ? "listing-card-top" : ""}`}>
            <Link
                className="product-card"
                to={`/cars/${encodeURIComponent(id)}`}
                aria-label={`${title} — ${text.viewDetails}`}
                onClick={(event) => {
                    if (!id) {
                        event.preventDefault();
                    }
                }}
            >
                {/* IMAGE */}

                <div className="product-image-wrapper">
                    {!image || failedImage === image ? (
                        <div className="product-image-fallback">
                            <Icon name="car" size={42} />

                            <span>{text.noImage}</span>
                        </div>
                    ) : (
                        <img
                            src={image}
                            alt={title}
                            className="product-image"
                            loading="lazy"
                            decoding="async"
                            onError={() => setFailedImage(image)}
                        />
                    )}

                    <div className="product-image-overlay" />

                    {/* BADGES */}

                    <div className="product-image-badges">
                        {isTop && (
                            <span className="product-top-badge">★ TOP</span>
                        )}

                        {item?.isDemo && (
                            <span className="listing-demo">{t("demo")}</span>
                        )}

                        {isNew && (
                            <span className="product-new-badge">
                                {t("new")}
                            </span>
                        )}
                    </div>

                    <span className="product-type">
                        {isCar ? text.car : text.part}
                    </span>
                </div>

                {/* CONTENT */}

                <div className="product-info">
                    <div className="product-main">
                        <p className="product-price">
                            {format(item?.price, item?.currency || "AMD")}
                        </p>

                        <h3 className="product-title">{title}</h3>
                    </div>

                    {/* DETAILS */}

                    {details.length > 0 && (
                        <div className="product-details">
                            {details.map((detail, index) => (
                                <span
                                    className="detail-item"
                                    key={`${detail.icon}-${index}`}
                                >
                                    <Icon name={detail.icon} size={14} />

                                    <span>{detail.text}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* REGION */}

                    <div className="product-bottom">
                        <span className="product-region">
                            <Icon name="pin" size={15} />

                            <span>{item?.region || text.noRegion}</span>
                        </span>

                        <span className="product-view-arrow">
                            <Icon name="arrow" size={17} />
                        </span>
                    </div>
                </div>
            </Link>

            {/* FAVORITE */}

            <button
                className={`favorite-button ${favorite ? "is-favorite" : ""}`}
                type="button"
                onClick={handleFavoriteClick}
                disabled={!id}
                aria-pressed={Boolean(favorite)}
                aria-label={favorite ? t("removeFavorite") : t("addFavorite")}
            >
                <Icon name="heart" size={19} />
            </button>

            {/* COMPARE */}

            {isCar && Boolean(id) && (
                <div className="compare-card-actions">
                    <button
                        type="button"
                        className={`compare-card-button ${
                            isCompared ? "is-selected" : ""
                        }`}
                        aria-pressed={isCompared}
                        onClick={handleCompareClick}
                    >
                        <Icon name="compare" size={15} />

                        {isCompared ? text.removeCompare : text.compare}
                    </button>

                    {isCompared && (
                        <Link className="compare-card-link" to="/compare">
                            {text.view}

                            <Icon name="arrow" size={13} />
                        </Link>
                    )}

                    {message && (
                        <p className="compare-card-error" role="alert">
                            {message}
                        </p>
                    )}
                </div>
            )}
        </article>
    );
}
