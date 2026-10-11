import { useSyncExternalStore } from "react";

import Header from "../components/header/Header";

import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";

import {
    getCompareIds,
    removeCompare,
    clearCompare,
    subscribeCompare,
} from "../utils/compare";

import "./ComparePage.css";

const BASE = import.meta.env.BASE_URL;

const FUELS = {
    petrol: "Բենզին",
    diesel: "Դիզել",
    gas: "Գազ",
    electric: "Էլեկտրական",
    hybrid: "Հիբրիդ",
};

const TRANSMISSIONS = {
    automatic: "Ավտոմատ",
    manual: "Մեխանիկական",
    cvt: "Վարիատոր",
    robot: "Ռոբոտացված",
};

function display(value) {
    if (value === undefined || value === null || value === "") {
        return "—";
    }

    return String(value);
}

export default function ComparePage() {
    const { products, loading, error } = useProducts();
    const { format } = useCurrency();

    const snapshot = useSyncExternalStore(
        subscribeCompare,
        () => JSON.stringify(getCompareIds()),
        () => "[]",
    );

    const ids = JSON.parse(snapshot);

    const cars = ids
        .map((id) =>
            products.find(
                (product) =>
                    String(product._id || product.id) === id &&
                    product.type === "car",
            ),
        )
        .filter(Boolean);

    const fields = [
        {
            label: "Մակնիշ",
            render: (car) => display(car.brand),
        },
        {
            label: "Մոդել",
            render: (car) => display(car.model),
        },
        {
            label: "Տարեթիվ",
            render: (car) => display(car.year),
        },
        {
            label: "Վազք",
            render: (car) =>
                car.mileage == null
                    ? "—"
                    : `${Number(car.mileage).toLocaleString("en-US")} կմ`,
        },
        {
            label: "Վառելիք",
            render: (car) => display(FUELS[car.fuel] || car.fuel),
        },
        {
            label: "Փոխանցման տուփ",
            render: (car) =>
                display(
                    TRANSMISSIONS[car.transmission] ||
                        car.transmission ||
                        car.gearbox,
                ),
        },
        {
            label: "Շարժիչ",
            render: (car) => display(car.engine || car.engineSize),
        },
        {
            label: "Ղեկ",
            render: (car) =>
                car.steering === "left"
                    ? "Ձախ"
                    : car.steering === "right"
                      ? "Աջ"
                      : display(car.steering),
        },
        {
            label: "Գույն",
            render: (car) => display(car.color),
        },
        {
            label: "Վիճակ",
            render: (car) => display(car.condition),
        },
        {
            label: "Տարածաշրջան",
            render: (car) => display(car.region),
        },
        {
            label: "VIN",
            render: (car) => display(car.vin),
        },
    ];

    return (
        <>
            <Header />

            <main className="compare-page">
                <div className="compare-container">
                    <div className="compare-top">
                        <div>
                            <span className="compare-eyebrow">ARMMOTORS</span>

                            <h1>Մեքենաների համեմատություն</h1>

                            <p>
                                Համեմատեք մինչև 3 մեքենա՝ ճիշտ ընտրություն
                                կատարելու համար։
                            </p>
                        </div>

                        <a className="compare-back" href={`${BASE}cars`}>
                            ← Բոլոր մեքենաները
                        </a>
                    </div>

                    <div className="compare-toolbar">
                        <span>Ընտրված է {ids.length} / 3 մեքենա</span>

                        {ids.length > 0 && (
                            <button type="button" onClick={clearCompare}>
                                Մաքրել բոլորը
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="compare-empty">Բեռնվում է...</div>
                    ) : error ? (
                        <div className="compare-empty" role="alert">
                            <h2>Տվյալները չբեռնվեցին</h2>
                            <p>{error}</p>
                            <p>Ստուգեք backend-ի միացումը։</p>
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="compare-empty">
                            <div className="compare-empty-icon">⇄</div>

                            <h2>Մեքենաներ դեռ ընտրված չեն</h2>

                            <p>
                                Բացեք հայտարարությունները և ընտրեք համեմատության
                                համար հետաքրքիր մեքենաները։
                            </p>

                            <a href={`${BASE}cars`}>Դիտել մեքենաները</a>
                        </div>
                    ) : (
                        <div className="compare-scroll">
                            <div
                                className="compare-table"
                                style={{
                                    "--compare-columns": cars.length,
                                }}
                            >
                                <div className="compare-row compare-main-row">
                                    <div className="compare-label compare-main-label">
                                        Մեքենա
                                    </div>

                                    {cars.map((car) => {
                                        const id = String(car._id || car.id);

                                        const image =
                                            car.image || car.images?.[0];

                                        const title =
                                            car.title ||
                                            [car.brand, car.model]
                                                .filter(Boolean)
                                                .join(" ");

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
                                                    aria-label={`${title} հեռացնել`}
                                                >
                                                    ×
                                                </button>

                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={title}
                                                        className="compare-car-image"
                                                    />
                                                ) : (
                                                    <div className="compare-no-image">
                                                        Նկար չկա
                                                    </div>
                                                )}

                                                <h2>{title}</h2>

                                                <strong className="compare-price">
                                                    {format(
                                                        car.price,
                                                        car.currency || "AMD",
                                                    )}
                                                </strong>

                                                <a
                                                    className="compare-details"
                                                    href={`${BASE}cars/${encodeURIComponent(id)}`}
                                                >
                                                    Մանրամասներ →
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>

                                {fields.map((field) => (
                                    <div
                                        className="compare-row"
                                        key={field.label}
                                    >
                                        <div className="compare-label">
                                            {field.label}
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
                    )}
                </div>
            </main>
        </>
    );
}
