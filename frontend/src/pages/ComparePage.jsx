import { useState, useSyncExternalStore } from "react";

import { Link } from "react-router-dom";

import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import { useI18n } from "../utils/i18n";

import { localizeListingValue } from "../utils/localizeListing";

import {
    getCompareIds,
    removeCompare,
    clearCompare,
    subscribeCompare,
} from "../utils/compare";

import "./ComparePage.css";

const TEXTS = {
    hy: {
        title: "Մեքենաների համեմատություն",
        description:
            "Համեմատեք մինչև 3 մեքենա՝ ճիշտ ընտրություն կատարելու համար։",
        allCars: "Բոլոր մեքենաները",
        selected: (count) => `Ընտրված է ${count} / 3 մեքենա`,
        clearAll: "Մաքրել բոլորը",
        loading: "Բեռնվում է...",
        errorTitle: "Տվյալները չբեռնվեցին",
        errorDescription:
            "Չհաջողվեց բեռնել մեքենաների տվյալները։ Կրկին փորձեք։",
        retry: "Կրկին փորձել",
        emptyTitle: "Մեքենաներ դեռ ընտրված չեն",
        emptyDescription:
            "Բացեք հայտարարությունները և ընտրեք համեմատության համար Ձեզ հետաքրքրող մեքենաները։",
        browse: "Դիտել մեքենաները",
        car: "Մեքենա",
        noImage: "Նկար չկա",
        details: "Մանրամասներ",
        remove: "Հեռացնել համեմատությունից",
        brand: "Մակնիշ",
        model: "Մոդել",
        year: "Տարեթիվ",
        mileage: "Վազք",
        mileageUnit: "կմ",
        fuel: "Վառելիք",
        transmission: "Փոխանցման տուփ",
        engine: "Շարժիչ",
        steering: "Ղեկ",
        color: "Գույն",
        condition: "Վիճակ",
        region: "Տարածաշրջան",
        vin: "VIN",
        unavailable: "Որոշ ընտրված մեքենաների տվյալները հասանելի չեն։",
    },

    ru: {
        title: "Сравнение автомобилей",
        description:
            "Сравните до 3 автомобилей, чтобы сделать правильный выбор.",
        allCars: "Все автомобили",
        selected: (count) => `Выбрано автомобилей: ${count} / 3`,
        clearAll: "Очистить всё",
        loading: "Загрузка...",
        errorTitle: "Данные не загружены",
        errorDescription:
            "Не удалось загрузить данные автомобилей. Попробуйте ещё раз.",
        retry: "Повторить",
        emptyTitle: "Автомобили ещё не выбраны",
        emptyDescription:
            "Откройте объявления и выберите интересующие автомобили для сравнения.",
        browse: "Посмотреть автомобили",
        car: "Автомобиль",
        noImage: "Нет фото",
        details: "Подробнее",
        remove: "Убрать из сравнения",
        brand: "Марка",
        model: "Модель",
        year: "Год выпуска",
        mileage: "Пробег",
        mileageUnit: "км",
        fuel: "Топливо",
        transmission: "Коробка передач",
        engine: "Двигатель",
        steering: "Руль",
        color: "Цвет",
        condition: "Состояние",
        region: "Регион",
        vin: "VIN",
        unavailable: "Данные некоторых выбранных автомобилей недоступны.",
    },

    en: {
        title: "Compare cars",
        description: "Compare up to 3 cars to make the right choice.",
        allCars: "All cars",
        selected: (count) => `Selected cars: ${count} / 3`,
        clearAll: "Clear all",
        loading: "Loading...",
        errorTitle: "Could not load data",
        errorDescription: "Could not load the car details. Please try again.",
        retry: "Try again",
        emptyTitle: "No cars selected yet",
        emptyDescription:
            "Browse listings and select the cars you would like to compare.",
        browse: "Browse cars",
        car: "Car",
        noImage: "No image",
        details: "View details",
        remove: "Remove from comparison",
        brand: "Brand",
        model: "Model",
        year: "Year",
        mileage: "Mileage",
        mileageUnit: "km",
        fuel: "Fuel",
        transmission: "Transmission",
        engine: "Engine",
        steering: "Steering",
        color: "Color",
        condition: "Condition",
        region: "Region",
        vin: "VIN",
        unavailable: "Details for some selected cars are unavailable.",
    },
};

function getSnapshot() {
    return JSON.stringify(getCompareIds());
}

function getServerSnapshot() {
    return "[]";
}

function display(value) {
    if (value === undefined || value === null || value === "") {
        return "—";
    }

    return String(value);
}

function CompareImage({ image, title, noImage }) {
    const [failedImage, setFailedImage] = useState("");

    if (!image || failedImage === image) {
        return <div className="compare-no-image">{noImage}</div>;
    }

    return (
        <img
            src={image}
            alt={title}
            className="compare-car-image"
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(image)}
        />
    );
}

export default function ComparePage() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const { products = [], loading, error, retry } = useProducts();

    const { format } = useCurrency();

    const snapshot = useSyncExternalStore(
        subscribeCompare,
        getSnapshot,
        getServerSnapshot,
    );

    const ids = JSON.parse(snapshot).map(String);

    const productList = Array.isArray(products) ? products : [];

    const cars = ids
        .map((id) =>
            productList.find(
                (product) =>
                    String(product._id || product.id) === id &&
                    product.type === "car",
            ),
        )
        .filter(Boolean);

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    function localized(value, field) {
        return display(localizeListingValue(value, language, field));
    }

    function getTitle(car) {
        const translatedTitle =
            car.translations?.[language]?.title ||
            car.titleTranslations?.[language];

        return (
            (typeof translatedTitle === "string" && translatedTitle.trim()) ||
            car.title ||
            [car.brand, car.model].filter(Boolean).join(" ") ||
            text.car
        );
    }

    function getMileage(car) {
        if (
            car.mileage === undefined ||
            car.mileage === null ||
            car.mileage === ""
        ) {
            return "—";
        }

        const mileage = Number(car.mileage);

        if (!Number.isFinite(mileage)) {
            return "—";
        }

        return `${mileage.toLocaleString(locale)} ${text.mileageUnit}`;
    }

    const fields = [
        {
            key: "brand",
            render: (car) => display(car.brand),
        },
        {
            key: "model",
            render: (car) => display(car.model),
        },
        {
            key: "year",
            render: (car) => display(car.year),
        },
        {
            key: "mileage",
            render: getMileage,
        },
        {
            key: "fuel",
            render: (car) => localized(car.fuel, "fuel"),
        },
        {
            key: "transmission",
            render: (car) =>
                localized(
                    car.transmission || car.gearbox || car.gearboxType,
                    "transmission",
                ),
        },
        {
            key: "engine",
            render: (car) => display(car.engine ?? car.engineSize),
        },
        {
            key: "steering",
            render: (car) => localized(car.steering, "steering"),
        },
        {
            key: "color",
            render: (car) => localized(car.color, "color"),
        },
        {
            key: "condition",
            render: (car) => localized(car.condition, "condition"),
        },
        {
            key: "region",
            render: (car) => localized(car.region, "region"),
        },
        {
            key: "vin",
            render: (car) => display(car.vin),
        },
    ];

    return (
        <main className="compare-page">
            <div className="compare-container">
                <div className="compare-top">
                    <div>
                        <span className="compare-eyebrow">ARMMOTORS</span>

                        <h1>{text.title}</h1>
                        <p>{text.description}</p>
                    </div>

                    <Link className="compare-back" to="/cars">
                        ← {text.allCars}
                    </Link>
                </div>

                <div className="compare-toolbar">
                    <span>{text.selected(ids.length)}</span>

                    {ids.length > 0 && (
                        <button type="button" onClick={clearCompare}>
                            {text.clearAll}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="compare-empty" role="status">
                        {text.loading}
                    </div>
                ) : error ? (
                    <div className="compare-empty" role="alert">
                        <h2>{text.errorTitle}</h2>
                        <p>{text.errorDescription}</p>

                        {typeof retry === "function" && (
                            <button type="button" onClick={retry}>
                                {text.retry}
                            </button>
                        )}
                    </div>
                ) : cars.length === 0 ? (
                    <div className="compare-empty">
                        <div className="compare-empty-icon" aria-hidden="true">
                            ⇄
                        </div>

                        <h2>{text.emptyTitle}</h2>

                        <p>
                            {ids.length > 0
                                ? text.unavailable
                                : text.emptyDescription}
                        </p>

                        <Link to="/cars">{text.browse}</Link>
                    </div>
                ) : (
                    <>
                        {cars.length < ids.length && (
                            <p role="status">{text.unavailable}</p>
                        )}

                        <div className="compare-scroll">
                            <div
                                className="compare-table"
                                style={{
                                    "--compare-columns": cars.length,
                                }}
                            >
                                <div className="compare-row compare-main-row">
                                    <div className="compare-label compare-main-label">
                                        {text.car}
                                    </div>

                                    {cars.map((car) => {
                                        const id = String(car._id || car.id);

                                        const image =
                                            car.image || car.images?.[0] || "";

                                        const title = getTitle(car);

                                        return (
                                            <div
                                                className="compare-car"
                                                key={id}
                                            >
                                                <button
                                                    type="button"
                                                    className="compare-remove"
                                                    onClick={() =>
                                                        removeCompare(id)
                                                    }
                                                    aria-label={`${text.remove}: ${title}`}
                                                >
                                                    ×
                                                </button>

                                                <CompareImage
                                                    image={image}
                                                    title={title}
                                                    noImage={text.noImage}
                                                />

                                                <h2>{title}</h2>

                                                <strong className="compare-price">
                                                    {format(
                                                        car.price,
                                                        car.currency || "AMD",
                                                    )}
                                                </strong>

                                                <Link
                                                    className="compare-details"
                                                    to={`/cars/${encodeURIComponent(
                                                        id,
                                                    )}`}
                                                >
                                                    {text.details} →
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>

                                {fields.map((field) => (
                                    <div
                                        className="compare-row"
                                        key={field.key}
                                    >
                                        <div className="compare-label">
                                            {text[field.key]}
                                        </div>

                                        {cars.map((car) => (
                                            <div
                                                className="compare-value"
                                                key={String(car._id || car.id)}
                                            >
                                                {field.render(car)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
