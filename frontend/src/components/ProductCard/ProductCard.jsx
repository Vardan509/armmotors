import { useState, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";

import useCurrency from "../../utils/useCurrency";
import useFavorite from "../../utils/useFavorite";
import { useI18n } from "../../utils/i18n";
import { localizeListingValue } from "../../utils/localizeListing";
import { resolveImageUrl } from "../../utils/imageUrl";

import {
    getCompareIds,
    toggleCompare,
    subscribeCompare,
} from "../../utils/compare";

import "./ProductCard.css";
import "../../styles/ArmMotorsMobile.css";

const CARD_TEXT = {
    hy: {
        listing: "Հայտարարություն",
        car: "Ավտոմեքենա",
        part: "Պահեստամաս",
        noImage: "Նկար չկա",
        noRegion: "Տարածքը նշված չէ",
        compare: "Համեմատել",
        removeCompare: "Հեռացնել համեմատությունից",
        view: "Դիտել համեմատությունը",
        viewDetails: "Դիտել մանրամասները",
        compareError: "Համեմատությունը թարմացնել չհաջողվեց։",
        yearSuffix: "թ.",
        notSpecified: "Չնշված",
        transmission: "Փոխանցման տուփ",
    },
    ru: {
        listing: "Объявление",
        car: "Автомобиль",
        part: "Запчасть",
        noImage: "Нет фото",
        noRegion: "Регион не указан",
        compare: "Сравнить",
        removeCompare: "Убрать из сравнения",
        view: "Посмотреть сравнение",
        viewDetails: "Посмотреть детали",
        compareError: "Не удалось обновить сравнение.",
        yearSuffix: "г.",
        notSpecified: "Не указано",
        transmission: "Коробка передач",
    },
    en: {
        listing: "Listing",
        car: "Car",
        part: "Spare part",
        noImage: "No image",
        noRegion: "Region not specified",
        compare: "Compare",
        removeCompare: "Remove from comparison",
        view: "View comparison",
        viewDetails: "View details",
        compareError: "Could not update comparison.",
        yearSuffix: "",
        notSpecified: "Not specified",
        transmission: "Transmission",
    },
};

const ICON_PATHS = {
    heart: (
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M7 3v4M17 3v4M3 10h18" />
        </>
    ),
    speed: (
        <>
            <path d="M5 18a9 9 0 1 1 14 0" />
            <path d="m12 14 4-5" />
            <circle cx="12" cy="14" r="1.5" />
            <path d="M8 20h8" />
        </>
    ),
    fuel: (
        <>
            <rect x="4" y="4" width="11" height="17" rx="2" />
            <path d="M7 8h5M15 9h2l3 3v6a2 2 0 0 1-4 0v-4" />
        </>
    ),
    gearbox: (
        <>
            <circle cx="6" cy="5" r="2" />
            <circle cx="18" cy="5" r="2" />
            <circle cx="6" cy="19" r="2" />
            <circle cx="18" cy="19" r="2" />
            <path d="M6 7v10M18 7v10M6 12h12M12 12V5" />
        </>
    ),
    pin: (
        <>
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </>
    ),
    compare: <path d="M4 7h16M16 3l4 4-4 4M20 17H4M8 13l-4 4 4 4" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    car: (
        <>
            <path d="m5 11 2-5h10l2 5" />
            <rect x="3" y="11" width="18" height="7" rx="2" />
            <path d="M6 18v2M18 18v2M7 14h1M16 14h1" />
        </>
    ),
};

function Icon({ name, size = 17 }) {
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
            {ICON_PATHS[name]}
        </svg>
    );
}

function getCompareSnapshot() {
    return JSON.stringify(getCompareIds());
}

function getServerCompareSnapshot() {
    return "[]";
}

function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
}

export default function ProductCard({ item }) {
    const navigate = useNavigate();
    const { language, t } = useI18n();
    const text = CARD_TEXT[language] || CARD_TEXT.hy;

    const [failedImage, setFailedImage] = useState("");
    const [loadedImage, setLoadedImage] = useState("");
    const [compareFailed, setCompareFailed] = useState(false);

    const { format } = useCurrency();
    const id = String(item?._id || item?.id || "");
    const [favorite, toggleFavorite] = useFavorite(id);

    const compareSnapshot = useSyncExternalStore(
        subscribeCompare,
        getCompareSnapshot,
        getServerCompareSnapshot,
    );

    const compareIds = JSON.parse(compareSnapshot);
    const isCompared = compareIds.some((compareId) => String(compareId) === id);

    function localized(value, field) {
        return localizeListingValue(value, language, field);
    }

    const translatedTitle =
        item?.translations?.[language]?.title ||
        item?.titleTranslations?.[language];

    const title =
        (typeof translatedTitle === "string" && translatedTitle.trim()) ||
        item?.title ||
        [item?.brand, item?.model].filter(Boolean).join(" ") ||
        text.listing;

    const image = resolveImageUrl(item?.image || item?.images?.[0] || "");

    const isCar = item?.type === "car";
    const isNew = localized(item?.condition, "condition") === t("new");

    const isTop = Boolean(
        item?.topUntil && new Date(item.topUntil).getTime() > Date.now(),
    );

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    const mileage =
        hasValue(item?.mileage) && Number.isFinite(Number(item.mileage))
            ? `${Number(item.mileage).toLocaleString(locale)} ${t("mileageUnit")}`
            : text.notSpecified;

    const rawTransmission =
        item?.transmission || item?.gearbox || item?.gearboxType;

    const transmission = hasValue(rawTransmission)
        ? localized(rawTransmission, "transmission")
        : text.notSpecified;

    const details = isCar
        ? [
              {
                  icon: "calendar",
                  text: item?.year
                      ? `${item.year}${text.yearSuffix ? ` ${text.yearSuffix}` : ""}`
                      : text.notSpecified,
              },
              { icon: "speed", text: mileage },
              {
                  icon: "fuel",
                  text: hasValue(item?.fuel)
                      ? localized(item.fuel, "fuel")
                      : text.notSpecified,
              },
              {
                  icon: "gearbox",
                  text: transmission,
                  title: text.transmission,
              },
          ]
        : [
              {
                  icon: "car",
                  text: hasValue(item?.condition)
                      ? localized(item.condition, "condition")
                      : text.notSpecified,
              },
          ];

    function handleFavoriteClick() {
        if (!id) return;

        if (!localStorage.getItem("token")) {
            navigate("/login?next=%2Ffavorites");
            return;
        }

        void toggleFavorite();
    }

    function handleCompareClick() {
        if (!id) return;

        try {
            const result = toggleCompare(id);
            setCompareFailed(!result?.success);
        } catch {
            setCompareFailed(true);
        }
    }

    return (
        <article className={`listing-card ${isTop ? "listing-card-top" : ""}`}>
            <Link
                className="product-card"
                to={`/cars/${encodeURIComponent(id)}`}
                aria-label={`${title} — ${text.viewDetails}`}
                onClick={(event) => {
                    if (!id) event.preventDefault();
                }}
            >
                <div className="product-image-wrapper">
                    {!image || failedImage === image ? (
                        <div className="product-image-fallback">
                            <Icon name="car" size={42} />
                            <span>{text.noImage}</span>
                        </div>
                    ) : (
                        <>
                            {loadedImage !== image && (
                                <span
                                    className="am-card-skeleton"
                                    aria-hidden="true"
                                />
                            )}

                            <img
                                src={image}
                                alt={title}
                                className="product-image"
                                loading="lazy"
                                decoding="async"
                                onLoad={() => setLoadedImage(image)}
                                onError={() => setFailedImage(image)}
                            />
                        </>
                    )}

                    <div className="product-image-overlay" aria-hidden="true" />

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

                <div className="product-info">
                    <div className="product-main">
                        <p className="product-price">
                            {format(item?.price, item?.currency || "AMD")}
                        </p>

                        <h3 className="product-title">{title}</h3>
                    </div>

                    <div className="product-details">
                        {details.map((detail, index) => (
                            <span
                                className="detail-item"
                                key={`${detail.icon}-${index}`}
                                title={detail.title || detail.text}
                            >
                                <Icon name={detail.icon} size={14} />
                                <span>{detail.text}</span>
                            </span>
                        ))}
                    </div>

                    <div className="product-bottom">
                        <span className="product-region">
                            <Icon name="pin" size={15} />
                            <span>
                                {item?.region
                                    ? localized(item.region, "region")
                                    : text.noRegion}
                            </span>
                        </span>

                        <span className="product-view-arrow" aria-hidden="true">
                            <Icon name="arrow" size={17} />
                        </span>
                    </div>
                </div>
            </Link>

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

            {isCar && Boolean(id) && (
                <div className="compare-card-actions">
                    <button
                        type="button"
                        className={`compare-card-button ${isCompared ? "is-selected" : ""}`}
                        aria-pressed={isCompared}
                        onClick={handleCompareClick}
                    >
                        <Icon name="compare" size={15} />
                        {isCompared ? text.removeCompare : text.compare}
                    </button>

                    {isCompared && compareIds.length >= 2 && (
                        <Link className="compare-card-link" to="/compare">
                            {text.view}
                            <Icon name="arrow" size={13} />
                        </Link>
                    )}

                    {compareFailed && (
                        <p className="compare-card-error" role="alert">
                            {text.compareError}
                        </p>
                    )}
                </div>
            )}
        </article>
    );
}
