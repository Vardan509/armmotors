import { useRef, useState } from "react";
import "./filter.css";


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

const SELECT_FIELDS = [
    {
        name: "brand",
        label: "Մակնիշ",
        options: [
            ["Mercedes-Benz", "Mercedes-Benz"],
            ["BMW", "BMW"],
            ["Toyota", "Toyota"],
            ["Tesla", "Tesla"],
            ["Hyundai", "Hyundai"],
            ["Nissan", "Nissan"],
            ["Volkswagen", "Volkswagen"],
            ["Audi", "Audi"],
            ["Ford", "Ford"],
            ["Volvo", "Volvo"],
            ["MAN", "MAN"],
            ["Scania", "Scania"],
        ],
    },
    {
        name: "region",
        label: "Տարածաշրջան",
        options: [
            ["Երևան", "Երևան"],
            ["Արագածոտն", "Արագածոտն"],
            ["Արարատ", "Արարատ"],
            ["Արմավիր", "Արմավիր"],
            ["Գեղարքունիք", "Գեղարքունիք"],
            ["Կոտայք", "Կոտայք"],
            ["Լոռի", "Լոռի"],
            ["Շիրակ", "Շիրակ"],
            ["Սյունիք", "Սյունիք"],
            ["Տավուշ", "Տավուշ"],
            ["Վայոց ձոր", "Վայոց ձոր"],
        ],
    },
    {
        name: "vin",
        label: "VIN կոդ",
        options: [
            ["yes", "Նշված է"],
            ["no", "Նշված չէ"],
        ],
    },
    {
        name: "fuel",
        label: "Վառելիք",
        options: [
            ["gas", "Գազ"],
            ["petrol", "Բենզին"],
            ["diesel", "Դիզել"],
            ["electric", "Էլեկտրական"],
            ["hybrid", "Հիբրիդ"],
        ],
    },
    {
        name: "steering",
        label: "Ղեկ",
        options: [
            ["left", "Ձախ"],
            ["right", "Աջ"],
        ],
    },
    {
        name: "color",
        label: "Գույն",
        options: [
            ["Սպիտակ", "Սպիտակ"],
            ["Սև", "Սև"],
            ["Արծաթագույն", "Արծաթագույն"],
            ["Մոխրագույն", "Մոխրագույն"],
            ["Կապույտ", "Կապույտ"],
            ["Կարմիր", "Կարմիր"],
            ["Կանաչ", "Կանաչ"],
            ["Դեղին", "Դեղին"],
            ["Շագանակագույն", "Շագանակագույն"],
            ["Բեժ", "Բեժ"],
            ["Այլ", "Այլ"],
        ],
    },
];

export default function Filter() {
    const popupRef = useRef(null);

    const [step, setStep] = useState("categories");
    const [vehicleType, setVehicleType] = useState("");
    const [filters, setFilters] = useState({ ...INITIAL_FILTERS });
    const [error, setError] = useState("");

    function openPopup() {
        setStep("categories");
        setError("");

        if (popupRef.current && !popupRef.current.open) {
            popupRef.current.showModal();
        }
    }

    function changeFilter(e) {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    }

    function selectVehicle(type) {
        setVehicleType(type);
        setStep("filters");
    }

    function goBack() {
        setError("");

        if (step === "filters") {
            setStep("vehicleTypes");
        } else {
            setStep("categories");
        }
    }

    function resetFilters() {
        setFilters({ ...INITIAL_FILTERS });
        setError("");
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (
            filters.priceFrom !== "" &&
            filters.priceTo !== "" &&
            Number(filters.priceFrom) > Number(filters.priceTo)
        ) {
            setError(
                "Սկզբնական գինը չի կարող վերջնական գնից մեծ լինել։"
            );
            return;
        }

        if (
            filters.yearFrom !== "" &&
            filters.yearTo !== "" &&
            Number(filters.yearFrom) > Number(filters.yearTo)
        ) {
            setError(
                "Սկզբնական տարեթիվը չի կարող վերջնականից մեծ լինել։"
            );
            return;
        }

        const params = new URLSearchParams();

        params.set("vehicleType", vehicleType);
        params.set("priceCurrency", "AMD");

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "") {
                params.set(key, value);
            }
        });

        window.location.assign(`/cars?${params.toString()}`);
    }

    let title = "Ընտրեք բաժինը";

    if (step === "vehicleTypes") {
        title = "Ընտրեք մեքենայի տեսակը";
    } else if (step === "parts") {
        title = "Ավտոպահեստամասեր";
    } else if (step === "filters") {
        title =
            vehicleType === "passenger"
                ? "Մարդատար մեքենաներ"
                : "Բեռնատար մեքենաներ";
    }

    return (
        <>
            <button
                type="button"
                className="popup-open-btn"
                onClick={openPopup}
                aria-label="Բացել ֆիլտրերը"
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/2976/2976215.png"
                    alt="Filter"
                    width={15}
                    height={15}
                />
            </button>

            <dialog
                ref={popupRef}
                className="popup-window"
                aria-labelledby="popup-title"
            >
                <div className="popup-header">
                    <div className="popup-heading">

                        {step !== "categories" && (
                            <button
                                type="button"
                                className="popup-back-btn"
                                onClick={goBack}
                                aria-label="Վերադառնալ"
                            >
                                ←
                            </button>
                        )}

                        <h2 id="popup-title">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="popup-close-btn"
                        onClick={() => popupRef.current?.close()}
                        aria-label="Փակել պատուհանը"
                    >
                        ×
                    </button>
                </div>

                <div className="popup-content">

                    {step === "categories" && (
                        <div className="popup-options">

                            <button
                                type="button"
                                className="popup-option"
                                onClick={() => setStep("vehicleTypes")}
                            >
                                <span>Մեքենաներ</span>
                                <span aria-hidden="true">
                                    ›
                                </span>
                            </button>

                            <button
                                type="button"
                                className="popup-option"
                                onClick={() => setStep("parts")}
                            >
                                <span>
                                    Ավտոպահեստամասեր
                                </span>

                                <span aria-hidden="true">
                                    ›
                                </span>
                            </button>

                        </div>
                    )}

                    {step === "vehicleTypes" && (
                        <div className="popup-options">

                            <button
                                type="button"
                                className="popup-option"
                                onClick={() =>
                                    selectVehicle("passenger")
                                }
                            >
                                <span>Մարդատար</span>

                                <span aria-hidden="true">
                                    ›
                                </span>
                            </button>

                            <button
                                type="button"
                                className="popup-option"
                                onClick={() =>
                                    selectVehicle("truck")
                                }
                            >
                                <span>Բեռնատար</span>

                                <span aria-hidden="true">
                                    ›
                                </span>
                            </button>

                        </div>
                    )}

                    {step === "parts" && (
                        <p className="popup-note">
                            Այստեղ կավելացնենք
                            ավտոպահեստամասերի ֆիլտրերը։
                        </p>
                    )}

                    {step === "filters" && (
                        <form onSubmit={handleSubmit}>

                            <div className="filters-grid">

                                <fieldset className="filter-group filter-full">
                                    <legend>
                                        Գին՝ ֏
                                    </legend>

                                    <div className="filter-range">

                                        <input
                                            type="number"
                                            name="priceFrom"
                                            min="0"
                                            step="any"
                                            placeholder="Սկսած"
                                            aria-label="Նվազագույն գին"
                                            value={filters.priceFrom}
                                            onChange={changeFilter}
                                        />

                                        <span aria-hidden="true">
                                            —
                                        </span>

                                        <input
                                            type="number"
                                            name="priceTo"
                                            min="0"
                                            step="any"
                                            placeholder="Մինչև"
                                            aria-label="Առավելագույն գին"
                                            value={filters.priceTo}
                                            onChange={changeFilter}
                                        />

                                    </div>
                                </fieldset>

                                <fieldset className="filter-group filter-full">

                                    <legend>
                                        Տարեթիվ
                                    </legend>

                                    <div className="filter-range">

                                        <input
                                            type="number"
                                            name="yearFrom"
                                            min="1886"
                                            max={
                                                new Date().getFullYear() + 1
                                            }
                                            placeholder="Սկսած"
                                            aria-label="Նվազագույն տարեթիվ"
                                            value={filters.yearFrom}
                                            onChange={changeFilter}
                                        />

                                        <span aria-hidden="true">
                                            —
                                        </span>

                                        <input
                                            type="number"
                                            name="yearTo"
                                            min="1886"
                                            max={
                                                new Date().getFullYear() + 1
                                            }
                                            placeholder="Մինչև"
                                            aria-label="Առավելագույն տարեթիվ"
                                            value={filters.yearTo}
                                            onChange={changeFilter}
                                        />

                                    </div>
                                </fieldset>

                                {SELECT_FIELDS.map((field) => (
                                    <label
                                        className="filter-field"
                                        key={field.name}
                                    >
                                        <span>
                                            {field.label}
                                        </span>

                                        <select
                                            name={field.name}
                                            value={
                                                filters[field.name]
                                            }
                                            onChange={changeFilter}
                                        >
                                            <option value="">
                                                Բոլորը
                                            </option>

                                            {field.options.map(
                                                ([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                )
                                            )}

                                        </select>
                                    </label>
                                ))}

                                <label className="filter-field">

                                    <span>
                                        Մոդել
                                    </span>

                                    <input
                                        type="text"
                                        name="model"
                                        placeholder="Օրինակ՝ Camry"
                                        value={filters.model}
                                        onChange={changeFilter}
                                    />

                                </label>

                            </div>

                            {error && (
                                <p
                                    className="filter-error"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            <div className="filter-actions">

                                <button
                                    type="button"
                                    className="filter-reset"
                                    onClick={resetFilters}
                                >
                                    Մաքրել
                                </button>

                                <button
                                    type="submit"
                                    className="filter-submit"
                                >
                                    Կիրառել ֆիլտրերը
                                </button>

                            </div>

                        </form>
                    )}

                </div>
            </dialog>
        </>
    );
}
