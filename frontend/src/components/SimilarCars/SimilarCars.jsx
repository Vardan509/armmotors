import { useMemo } from "react";
import { Link } from "react-router-dom";

import useProducts from "../../utils/useProducts";
import useCurrency from "../../utils/useCurrency";
import { useI18n } from "../../utils/i18n";

import "./SimilarCars.css";

const TRANSLATIONS = {
    hy: {
        label: "ARMMOTORS • ՁԵԶ ՀԱՄԱՐ",
        title: "Նմանատիպ մեքենաներ",
        subtitle: "Բացահայտեք ձեր ընտրությանը համապատասխան այլ մեքենաներ",
        match: "համապատասխանություն",
        brand: "Նույն մակնիշը",
        model: "Նույն մոդելը",
        year: "Մոտ տարեթիվ",
        price: "Մոտ գին",
        fuel: "Նույն վառելիքը",
        type: "Նույն տեսակը",
        noImage: "Նկար չկա",
        details: "Դիտել մեքենան",
        all: "Բոլոր հայտարարությունները",
        mileage: "կմ",
    },
    ru: {
        label: "ARMMOTORS • ДЛЯ ВАС",
        title: "Похожие автомобили",
        subtitle: "Другие автомобили, подходящие под ваш выбор",
        match: "совпадение",
        brand: "Та же марка",
        model: "Та же модель",
        year: "Близкий год",
        price: "Близкая цена",
        fuel: "То же топливо",
        type: "Тот же тип",
        noImage: "Нет фото",
        details: "Посмотреть",
        all: "Все объявления",
        mileage: "км",
    },
    en: {
        label: "ARMMOTORS • FOR YOU",
        title: "Similar cars",
        subtitle: "Discover more cars matching your preferences",
        match: "match",
        brand: "Same brand",
        model: "Same model",
        year: "Similar year",
        price: "Similar price",
        fuel: "Same fuel",
        type: "Same type",
        noImage: "No image",
        details: "View car",
        all: "All listings",
        mileage: "km",
    },
};

function getId(car) {
    return String(car?._id || car?.id || "");
}

function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function getImage(car) {
    const image = car?.images?.[0] || car?.image;

    if (typeof image === "string") {
        return image;
    }

    if (image && typeof image === "object") {
        return image.url || image.secure_url || image.src || "";
    }

    return "";
}

function calculateSimilarity(item, currentCar, labels) {
    let score = 0;
    const reasons = [];

    const sameBrand =
        Boolean(normalize(item.brand)) &&
        normalize(item.brand) === normalize(currentCar.brand);

    const sameModel =
        sameBrand &&
        Boolean(normalize(item.model)) &&
        normalize(item.model) === normalize(currentCar.model);

    if (sameBrand) {
        score += 25;
        reasons.push(labels.brand);
    }

    if (sameModel) {
        score += 30;
        reasons.push(labels.model);
    }

    const itemYear = Number(item.year);
    const currentYear = Number(currentCar.year);

    if (itemYear > 1900 && currentYear > 1900) {
        const difference = Math.abs(itemYear - currentYear);

        if (difference <= 2) {
            score += 15;
            reasons.push(labels.year);
        } else if (difference <= 5) {
            score += 8;
            reasons.push(labels.year);
        }
    }

    const itemPrice = Number(item.price);
    const currentPrice = Number(currentCar.price);

    const itemCurrency = item.currency || "AMD";
    const currentCurrency = currentCar.currency || "AMD";

    if (itemPrice > 0 && currentPrice > 0 && itemCurrency === currentCurrency) {
        const difference = Math.abs(itemPrice - currentPrice) / currentPrice;

        if (difference <= 0.15) {
            score += 15;
            reasons.push(labels.price);
        } else if (difference <= 0.3) {
            score += 8;
            reasons.push(labels.price);
        }
    }

    if (
        Boolean(normalize(item.fuel)) &&
        normalize(item.fuel) === normalize(currentCar.fuel)
    ) {
        score += 10;
        reasons.push(labels.fuel);
    }

    if (
        Boolean(normalize(item.vehicleType)) &&
        normalize(item.vehicleType) === normalize(currentCar.vehicleType)
    ) {
        score += 5;
        reasons.push(labels.type);
    }

    return {
        score: Math.min(score, 100),
        reasons,
    };
}

export default function SimilarCars({ currentCar, limit = 4 }) {
    const { products = [] } = useProducts();
    const { format } = useCurrency();
    const { language } = useI18n();

    const labels = TRANSLATIONS[language] || TRANSLATIONS.hy;

    const similarCars = useMemo(() => {
        if (!currentCar || !Array.isArray(products)) {
            return [];
        }

        return products
            .filter((item) => {
                const id = getId(item);

                return (
                    id &&
                    id !== getId(currentCar) &&
                    item.type !== "part" &&
                    item.status !== "sold" &&
                    item.status !== "draft"
                );
            })
            .map((item) => ({
                item,
                ...calculateSimilarity(item, currentCar, labels),
            }))
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }

                return Number(b.item.year || 0) - Number(a.item.year || 0);
            })
            .slice(0, limit);
    }, [products, currentCar, limit, labels]);

    if (!currentCar || similarCars.length === 0) {
        return null;
    }

    return (
        <section className="am-similar">
            <div className="am-similar-header">
                <div className="am-similar-header-content">
                    <span className="am-similar-label">{labels.label}</span>

                    <h2>{labels.title}</h2>

                    <p>{labels.subtitle}</p>
                </div>

                <Link to="/cars" className="am-similar-all">
                    {labels.all} →
                </Link>
            </div>

            <div className="am-similar-grid">
                {similarCars.map(({ item, score, reasons }) => {
                    const id = getId(item);
                    const image = getImage(item);

                    const title =
                        item.title ||
                        [item.brand, item.model].filter(Boolean).join(" ") ||
                        "Car";

                    return (
                        <article className="am-similar-card" key={id}>
                            <Link
                                to={`/cars/${encodeURIComponent(id)}`}
                                className="am-similar-card-link"
                            >
                                <div className="am-similar-image">
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={title}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="am-similar-no-image">
                                            {labels.noImage}
                                        </div>
                                    )}

                                    <span className="am-similar-match">
                                        {score}% {labels.match}
                                    </span>
                                </div>

                                <div className="am-similar-body">
                                    <h3>{title}</h3>

                                    <strong className="am-similar-price">
                                        {format(
                                            item.price,
                                            item.currency || "AMD",
                                        )}
                                    </strong>

                                    <div className="am-similar-specs">
                                        {item.year && <span>{item.year}</span>}

                                        {item.mileage != null &&
                                            item.mileage !== "" && (
                                                <span>
                                                    {Number(
                                                        item.mileage,
                                                    ).toLocaleString()}{" "}
                                                    {labels.mileage}
                                                </span>
                                            )}
                                    </div>

                                    {reasons.length > 0 && (
                                        <div className="am-similar-reasons">
                                            {reasons
                                                .slice(0, 3)
                                                .map((reason) => (
                                                    <span key={reason}>
                                                        ✓ {reason}
                                                    </span>
                                                ))}
                                        </div>
                                    )}

                                    <span className="am-similar-view">
                                        {labels.details} →
                                    </span>
                                </div>
                            </Link>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
