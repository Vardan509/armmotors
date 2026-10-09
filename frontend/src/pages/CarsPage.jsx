// ?????


import { useState } from "react";
import Header from "../components/header/Header";
import ProductCard from "../components/ProductCard/ProductCard";
import "./CarsPage.css";
import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";

const INITIAL_FILTERS = {
    priceFrom: "",
    priceTo: "",
    yearFrom: "",
    yearTo: "",
    brand: "",
    model: "",
    region: "",
    vin: "",
    fuel: "",
    steering: "",
    color: "",
};

const REGIONS = [
    "Երևան",
    "Արագածոտն",
    "Արարատ",
    "Արմավիր",
    "Գեղարքունիք",
    "Կոտայք",
    "Լոռի",
    "Շիրակ",
    "Սյունիք",
    "Տավուշ",
    "Վայոց ձոր",
];

function matchesFilters(car, filters, convert, priceCurrency) {
    const price = convert(car.price, priceCurrency, car.currency || "AMD");
    if (
        filters.priceFrom !== "" &&
        price < Number(filters.priceFrom)
    ) return false;

    if (
        filters.priceTo !== "" &&
        price > Number(filters.priceTo)
    ) return false;

    if (
        filters.yearFrom !== "" &&
        car.year < Number(filters.yearFrom)
    ) return false;

    if (
        filters.yearTo !== "" &&
        car.year > Number(filters.yearTo)
    ) return false;

    if (filters.brand && (car.brand || "").trim().toLowerCase() !== filters.brand.trim().toLowerCase()) return false;

    if (
        filters.model.trim() &&
        !(car.model || "").toLowerCase().includes(
            filters.model.trim().toLowerCase()
        )
    ) return false;

    if (filters.region && car.region !== filters.region) return false;
    if (filters.fuel && car.fuel !== filters.fuel) return false;
    if (filters.steering && car.steering !== filters.steering) return false;
    if (filters.color && car.color !== filters.color) return false;

    const hasVin = Boolean(car.vin?.trim());

    if (filters.vin === "yes" && !hasVin) return false;
    if (filters.vin === "no" && hasVin) return false;

    return true;
}

export default function CarsPage() {
    const {
        products,
        loading,
        error: loadError
    } = useProducts();

    const CARS = products.filter(product => product.type === "car");

    const { currency, convert } = useCurrency();

    const params = new URLSearchParams(window.location.search);

    const initialFilters = Object.fromEntries(
        Object.keys(INITIAL_FILTERS).map(key => [
            key,
            params.get(key) || ""
        ])
    );

    const [vehicleType, setVehicleType] = useState(
        params.get("vehicleType") === "truck"
            ? "truck"
            : params.get("vehicleType") === "passenger" ? "passenger" : "all"
    );

    const [filters, setFilters] = useState(initialFilters);

    const [appliedFilters, setAppliedFilters] = useState({
        ...initialFilters
    });

    const [sort, setSort] = useState("newest");
    const [priceCurrency, setPriceCurrency] = useState(params.get("priceCurrency") || currency);
    const [inputCurrency, setInputCurrency] = useState(params.get("priceCurrency") || currency);
    const [error, setError] = useState("");
    const typeCars = vehicleType === "all" ? CARS : CARS.filter(car => (car.vehicleType || "passenger") === vehicleType);

    const brands = [...new Set(typeCars.map((car) => car.brand))];
    const colors = [...new Set(typeCars.map((car) => car.color))];

    const visibleCars = typeCars
        .filter((car) => matchesFilters(car, appliedFilters, convert, priceCurrency))
        .sort((a, b) => {
            const difference = convert(a.price, "AMD", a.currency || "AMD") - convert(b.price, "AMD", b.currency || "AMD");
            if (sort === "priceAsc") return difference;
            if (sort === "priceDesc") return -difference;
            if (sort === "yearDesc") return b.year - a.year;

            return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
        });

    function changeFilter(e) {
        const { name, value } = e.target;
        if (name === "priceFrom" || name === "priceTo") {
            setFilters(prev => ({ ...prev,
                priceFrom: prev.priceFrom === "" ? "" : String(Math.round(convert(prev.priceFrom, currency, inputCurrency))),
                priceTo: prev.priceTo === "" ? "" : String(Math.round(convert(prev.priceTo, currency, inputCurrency))),
                [name]: value
            }));
            setInputCurrency(currency);
            setError("");
            return;
        }

        setFilters(prev => ({
            ...prev,

            [name]: value,

            ...(name === "brand"
                ? { model: "" }
                : {})
        }));

        setError("");
    }

    function resetFilters() {
        setFilters({ ...INITIAL_FILTERS });
        setAppliedFilters({ ...INITIAL_FILTERS });
        setError("");
        const url = new URL(window.location.href);
        Object.keys(INITIAL_FILTERS).forEach(key => url.searchParams.delete(key));
        window.history.replaceState(null, "", url);
    }

    function selectType(type) {
        setVehicleType(type);
        resetFilters();
        const url = new URL(window.location.href);
        url.searchParams.set("vehicleType", type);
        window.history.replaceState(null, "", url);
    }

    function applyFilters(e) {
        e.preventDefault();

        if (
            filters.priceFrom !== "" &&
            filters.priceTo !== "" &&
            Number(filters.priceFrom) > Number(filters.priceTo)
        ) {
            setError("Սկզբնական գինը վերջնականից մեծ է։");
            return;
        }

        if (
            filters.yearFrom !== "" &&
            filters.yearTo !== "" &&
            Number(filters.yearFrom) > Number(filters.yearTo)
        ) {
            setError("Սկզբնական տարեթիվը վերջնականից մեծ է։");
            return;
        }

        const nextFilters = { ...filters,
            priceFrom: filters.priceFrom === "" ? "" : String(convert(filters.priceFrom, currency, inputCurrency)),
            priceTo: filters.priceTo === "" ? "" : String(convert(filters.priceTo, currency, inputCurrency))
        };
        setAppliedFilters(nextFilters);
        setPriceCurrency(currency);
        setError("");
        const url = new URL(window.location.href);
        Object.entries(nextFilters).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
        url.searchParams.set("vehicleType", vehicleType);
        url.searchParams.set("priceCurrency", currency);
        window.history.replaceState(null, "", url);
    }

    return (
        <>
            <Header />

            <main className="cars-page">
                <a href="/" className="cars-back">
                    ← Գլխավոր էջ
                </a>

                {!vehicleType ? (
                    <section className="car-type-section">
                        <h1>Ընտրեք մեքենայի տեսակը</h1>

                        <div className="car-type-options">
                            <button type="button" onClick={() => selectType("all")}>Բոլոր մեքենաները →</button>
                            <button
                                type="button"
                                onClick={() => selectType("passenger")}
                            >
                                Մարդատար →
                            </button>

                            <button
                                type="button"
                                onClick={() => selectType("truck")}
                            >
                                Բեռնատար →
                            </button>
                        </div>
                    </section>
                ) : (
                    <>
                        <div className="cars-page-heading">
                            <h1>
                                {vehicleType === "passenger"
                                    ? "Մարդատար մեքենաներ"
                                    : vehicleType === "truck" ? "Բեռնատար մեքենաներ" : appliedFilters.brand ? `${appliedFilters.brand} մեքենաներ` : "Բոլոր մեքենաները"}
                            </h1>

                            <button
                                type="button"
                                className="cars-secondary-btn"
                                onClick={() => setVehicleType("")}
                            >
                                Փոխել տեսակը
                            </button>
                        </div>

                        <div className="cars-layout">
                            <aside className="cars-filter-panel">
                                <h2>Ֆիլտրեր</h2>

                                <form onSubmit={applyFilters}>
                                    <fieldset className="cars-range-field">
                                        <legend>Գին՝ {currency}</legend>

                                        <div className="cars-range">
                                            <input
                                                type="number"
                                                name="priceFrom"
                                                min="0"
                                                placeholder="Սկսած"
                                                aria-label="Նվազագույն գին"
                                                value={filters.priceFrom === "" ? "" : Math.round(convert(filters.priceFrom, currency, inputCurrency))}
                                                onChange={changeFilter}
                                            />

                                            <input
                                                type="number"
                                                name="priceTo"
                                                min="0"
                                                placeholder="Մինչև"
                                                aria-label="Առավելագույն գին"
                                                value={filters.priceTo === "" ? "" : Math.round(convert(filters.priceTo, currency, inputCurrency))}
                                                onChange={changeFilter}
                                            />
                                        </div>
                                    </fieldset>

                                    <fieldset className="cars-range-field">
                                        <legend>Տարեթիվ</legend>

                                        <div className="cars-range">
                                            <input
                                                type="number"
                                                name="yearFrom"
                                                min="1886"
                                                max={new Date().getFullYear() + 1}
                                                placeholder="Սկսած"
                                                aria-label="Նվազագույն տարեթիվ"
                                                value={filters.yearFrom}
                                                onChange={changeFilter}
                                            />

                                            <input
                                                type="number"
                                                name="yearTo"
                                                min="1886"
                                                max={new Date().getFullYear() + 1}
                                                placeholder="Մինչև"
                                                aria-label="Առավելագույն տարեթիվ"
                                                value={filters.yearTo}
                                                onChange={changeFilter}
                                            />
                                        </div>
                                    </fieldset>

                                    <label className="cars-field">
                                        <span>Մակնիշ</span>
                                        <select
                                            name="brand"
                                            value={filters.brand}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>

                                            {brands.map(brand => (
                                                <option key={brand} value={brand}>
                                                    {brand} (
                                                    {typeCars.filter(car => car.brand === brand).length}
                                                    )
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="cars-field">
                                        <span>Մոդել</span>

                                        <select
                                            name="model"
                                            value={filters.model}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>

                                            {[
                                                ...new Set(
                                                    typeCars
                                                        .filter(car =>
                                                            !filters.brand ||
                                                            car.brand === filters.brand
                                                        )
                                                        .map(car => car.model)
                                                )
                                            ]
                                                .sort()
                                                .map(model => (
                                                    <option key={model} value={model}>
                                                        {model} (
                                                        {typeCars.filter(car =>
                                                            car.model === model &&
                                                            (!filters.brand || car.brand === filters.brand)
                                                        ).length}
                                                        )
                                                    </option>
                                                ))}
                                        </select>
                                    </label>

                                    <label className="cars-field">
                                        <span>Տարածաշրջան</span>
                                        <select
                                            name="region"
                                            value={filters.region}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>

                                            {REGIONS.map((region) => (
                                                <option key={region} value={region}>
                                                    {region}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="cars-field">
                                        <span>VIN կոդ</span>
                                        <select
                                            name="vin"
                                            value={filters.vin}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>
                                            <option value="yes">Նշված է</option>
                                            <option value="no">Նշված չէ</option>
                                        </select>
                                    </label>

                                    <label className="cars-field">
                                        <span>Վառելիք</span>
                                        <select
                                            name="fuel"
                                            value={filters.fuel}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>
                                            <option value="gas">Գազ</option>
                                            <option value="petrol">Բենզին</option>
                                            <option value="diesel">Դիզել</option>
                                            <option value="electric">Էլեկտրական</option>
                                            <option value="hybrid">Հիբրիդ</option>
                                        </select>
                                    </label>

                                    <label className="cars-field">
                                        <span>Ղեկ</span>
                                        <select
                                            name="steering"
                                            value={filters.steering}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>
                                            <option value="left">Ձախ</option>
                                            <option value="right">Աջ</option>
                                        </select>
                                    </label>

                                    <label className="cars-field">
                                        <span>Գույն</span>
                                        <select
                                            name="color"
                                            value={filters.color}
                                            onChange={changeFilter}
                                        >
                                            <option value="">Բոլորը</option>

                                            {colors.map((color) => (
                                                <option key={color} value={color}>
                                                    {color}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    {error && (
                                        <p className="cars-error" role="alert">
                                            {error}
                                        </p>
                                    )}

                                    <div className="cars-filter-actions">
                                        <button
                                            type="button"
                                            className="cars-secondary-btn"
                                            onClick={resetFilters}
                                        >
                                            Մաքրել
                                        </button>

                                        <button
                                            type="submit"
                                            className="cars-primary-btn"
                                        >
                                            Որոնել
                                        </button>
                                    </div>
                                </form>
                            </aside>

                            <section className="cars-results">
                                <div className="cars-results-heading">
                                    <span aria-live="polite">
                                        {visibleCars.length} հայտարարություն
                                    </span>

                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        aria-label="Դասավորել հայտարարությունները"
                                    >
                                        <option value="newest">
                                            Վերջին ավելացվածները
                                        </option>
                                        <option value="yearDesc">
                                            Տարեթիվ՝ նորից հին
                                        </option>
                                        <option value="priceAsc">
                                            Գին՝ ցածրից բարձր
                                        </option>
                                        <option value="priceDesc">
                                            Գին՝ բարձրից ցածր
                                        </option>
                                    </select>
                                </div>

                                {loadError && (
                                    <p className="catalog-notice" role="status">
                                        {loadError}
                                    </p>
                                )}

                                {loading ? (
                                    <p role="status">Բեռնվում է…</p>
                                ) : visibleCars.length > 0 ? (
                                    <div className="cars-results-grid">
                                        {visibleCars.map(car => (
                                            <ProductCard
                                                key={car.id}
                                                item={car}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="cars-empty">
                                        <p>Այս պայմաններով մեքենա չի գտնվել։</p>

                                        <button
                                            type="button"
                                            className="cars-secondary-btn"
                                            onClick={resetFilters}
                                        >
                                            Մաքրել ֆիլտրերը
                                        </button>
                                    </div>
                                )}
                            </section>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
