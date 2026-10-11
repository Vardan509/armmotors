import { useState } from "react";

import Header from "../components/header/Header";
import ImageUploader from "../components/uploads/ImageUploader";
import LocationFields from "../components/add-product/LocationFields";

import {
    CAR_BRANDS,
    CAR_MODELS,
    CAR_COLORS,
    CAR_YEARS,
} from "../components/add-product/vehicleData";

import { apiRequest } from "../utils/api";

import "./AddProductPage.css";

const BASE = import.meta.env.BASE_URL;

const INITIAL_FORM = {
    type: "car",
    title: "",
    price: "",
    currency: "AMD",
    condition: "Օգտագործված",
    vehicleType: "passenger",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "petrol",
    steering: "left",
    color: "",
    vin: "",
    description: "",
    phone: "",
};

const INITIAL_LOCATION = {
    regionId: "",
    communityId: "",
    settlementId: "",
    region: "",
    community: "",
    settlement: "",
};

const STEPS = [
    "Հիմնական տվյալներ",
    "Մեքենայի տվյալներ",
    "Նկարներ և կապ",
    "Հրապարակում",
];

const FUEL_OPTIONS = [
    ["petrol", "Բենզին"],
    ["diesel", "Դիզել"],
    ["gas", "Գազ"],
    ["hybrid", "Հիբրիդ"],
    ["electric", "Էլեկտրական"],
];

const STEERING_OPTIONS = [
    ["left", "Ձախ"],
    ["right", "Աջ"],
];

function InputField({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    min,
    max,
    maxLength,
}) {
    return (
        <label className="ap-field">
            <span className="ap-field-label">
                {label}
                {required && <em>*</em>}
            </span>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                maxLength={maxLength}
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder = "Ընտրել",
    required = false,
    disabled = false,
}) {
    return (
        <label className="ap-field">
            <span className="ap-field-label">
                {label}
                {required && <em>*</em>}
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
            >
                <option value="">{placeholder}</option>

                {options.map((option) => {
                    const [optionValue, optionLabel] = Array.isArray(option)
                        ? option
                        : [String(option), String(option)];

                    return (
                        <option key={optionValue} value={optionValue}>
                            {optionLabel}
                        </option>
                    );
                })}
            </select>
        </label>
    );
}

function SectionTitle({ number, title, description }) {
    return (
        <div className="ap-section-title">
            <span className="ap-section-number">{number}</span>

            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="ap-summary-item">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function getLabel(options, value) {
    return options.find((item) => item[0] === value)?.[1] || value;
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-US");
}

export default function AddProductPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [location, setLocation] = useState(INITIAL_LOCATION);
    const [images, setImages] = useState([]);
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");
    const isCar = form.type === "car";

    const modelOptions = form.brand
        ? [
              ...CAR_MODELS[form.brand].map((model) => [model, model]),
              ...(CAR_MODELS[form.brand].includes("Այլ մոդել")
                  ? []
                  : [["Այլ մոդել", "Այլ մոդել"]]),
          ]
        : [];

    const generatedTitle = [form.brand, form.model, form.year]
        .filter(Boolean)
        .join(" ");

    const title = isCar ? generatedTitle : form.title.trim();

    const locationText = [
        location.region,
        location.community,
        location.settlement,
    ]
        .filter(Boolean)
        .join(", ");

    function update(name, value) {
        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        setError("");
    }

    function changeBrand(brand) {
        setForm((current) => ({
            ...current,
            brand,
            model: "",
        }));

        setError("");
    }

    function changeType(type) {
        setForm((current) => ({
            ...current,
            type,
            title: "",
            brand: "",
            model: "",
            year: "",
            mileage: "",
            color: "",
            vin: "",
        }));

        setError("");
    }

    function handleUploaded(result) {
        const raw = Array.isArray(result)
            ? result
            : result?.urls || result?.images || [];

        const urls = raw
            .map((item) =>
                typeof item === "string" ? item : item?.url || item?.secure_url,
            )
            .filter(
                (url) => typeof url === "string" && url.startsWith("https://"),
            );

        setImages((current) => {
            const next = [...new Set([...current, ...urls])];

            if (next.length > 12) {
                setError("Կարող եք ավելացնել առավելագույնը 12 նկար։");

                return current;
            }

            setError("");
            return next;
        });
    }

    function removeImage(url) {
        setImages((current) => current.filter((item) => item !== url));
    }

    function makeMainImage(url) {
        setImages((current) => [
            url,
            ...current.filter((item) => item !== url),
        ]);
    }

    function validate(currentStep) {
        if (currentStep === 0) {
            if (!title) {
                return isCar
                    ? "Լրացրեք մեքենայի տվյալները։"
                    : "Լրացրեք պահեստամասի անվանումը։";
            }

            if (
                form.price === "" ||
                !Number.isFinite(Number(form.price)) ||
                Number(form.price) < 0
            ) {
                return "Նշեք ճիշտ գին։";
            }

            if (!location.regionId) {
                return "Ընտրեք մարզը։";
            }

            if (!location.communityId) {
                return "Ընտրեք համայնքը։";
            }
        }

        if (currentStep === 1 && isCar) {
            if (!form.brand) {
                return "Ընտրեք մակնիշը։";
            }

            if (!form.model) {
                return "Ընտրեք մոդելը։";
            }

            if (!form.year) {
                return "Ընտրեք տարեթիվը։";
            }

            if (
                form.mileage === "" ||
                !Number.isFinite(Number(form.mileage)) ||
                Number(form.mileage) < 0
            ) {
                return "Նշեք ճիշտ վազքը։";
            }

            if (!form.color) {
                return "Ընտրեք մեքենայի գույնը։";
            }

            if (
                form.vin.trim() &&
                !/^[A-HJ-NPR-Z0-9]{17}$/i.test(form.vin.trim())
            ) {
                return "VIN-ը պետք է պարունակի 17 ճիշտ նիշ։";
            }
        }

        if (currentStep === 2) {
            const phone = form.phone.replace(/[\s()-]/g, "");

            if (!/^\+?[0-9]{8,15}$/.test(phone)) {
                return "Նշեք ճիշտ հեռախոսահամար։";
            }

            if (!images.length) {
                return "Վերբեռնեք առնվազն մեկ լուսանկար։";
            }
        }

        return "";
    }

    function nextStep() {
        // Մեքենայի վերնագիրը լրացվում է երկրորդ քայլում։
        if (step === 0 && isCar) {
            if (
                form.price === "" ||
                !Number.isFinite(Number(form.price)) ||
                Number(form.price) < 0
            ) {
                setError("Նշեք ճիշտ գին։");
                return;
            }

            if (!location.regionId || !location.communityId) {
                setError("Ընտրեք մարզը և համայնքը։");
                return;
            }
        } else {
            const message = validate(step);

            if (message) {
                setError(message);
                return;
            }
        }

        setError("");
        setStep((current) => Math.min(3, current + 1));

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function previousStep() {
        setError("");
        setStep((current) => Math.max(0, current - 1));

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function createDescription() {
        if (form.description.trim()) {
            return form.description.trim();
        }

        if (!isCar) {
            return `Պահեստամաս՝ ${title}. Վիճակ՝ ${form.condition}. Գտնվելու վայր՝ ${locationText}.`;
        }

        return [
            `Մեքենա՝ ${title}.`,
            `Վազք՝ ${formatPrice(form.mileage)} կմ.`,
            `Վառելիք՝ ${getLabel(FUEL_OPTIONS, form.fuel)}.`,
            `Ղեկ՝ ${getLabel(STEERING_OPTIONS, form.steering)}.`,
            `Գույն՝ ${form.color}.`,
            `Վիճակ՝ ${form.condition}.`,
            `Գտնվելու վայր՝ ${locationText}.`,
        ].join(" ");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading || step !== 3) return;

        for (let index = 0; index < 3; index++) {
            const message = validate(index);

            if (message) {
                setError(message);
                setStep(index);
                return;
            }
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                type: form.type,
                title,
                price: Number(form.price),
                currency: form.currency,
                condition: form.condition,
                region: location.region,
                description: createDescription(),
                phone: form.phone.replace(/[\s()-]/g, ""),
                images,
            };

            if (isCar) {
                Object.assign(payload, {
                    vehicleType: form.vehicleType,
                    brand: form.brand,
                    model: form.model,
                    year: Number(form.year),
                    mileage: Number(form.mileage),
                    fuel: form.fuel,
                    steering: form.steering,
                    color: form.color,
                    vin: form.vin.trim().toUpperCase(),
                });
            }

            const result = await apiRequest("/products", {
                method: "POST",
                body: JSON.stringify(payload),
                timeoutMs: 30000,
            });

            setSuccess("Հայտարարությունը հաջողությամբ հրապարակվեց։");

            const productId =
                result?.product?._id ||
                result?.product?.id ||
                result?._id ||
                result?.id;

            if (productId) {
                window.location.assign(
                    `${BASE}cars/${encodeURIComponent(productId)}`,
                );
            } else {
                setForm(INITIAL_FORM);
                setLocation(INITIAL_LOCATION);
                setImages([]);
                setStep(0);
            }
        } catch (err) {
            if (err.status === 401) {
                window.location.assign(`${BASE}login?next=/add-product`);
                return;
            }

            setError(err.message || "Հայտարարությունը չհրապարակվեց։");
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <>
                <Header />

                <main className="ap-auth-page">
                    <div className="ap-auth-card">
                        <div className="ap-auth-symbol">+</div>

                        <span className="ap-eyebrow">ARMMOTORS</span>

                        <h1>Տեղադրել հայտարարություն</h1>

                        <p>
                            Հայտարարություն հրապարակելու համար մուտք գործեք կամ
                            գրանցվեք։
                        </p>

                        <div className="ap-auth-actions">
                            <a
                                href={`${BASE}login?next=/add-product`}
                                className="ap-primary-link"
                            >
                                Մուտք
                            </a>

                            <a
                                href={`${BASE}registration?next=/add-product`}
                                className="ap-secondary-link"
                            >
                                Գրանցվել
                            </a>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="ap-page">
                <div className="ap-container">
                    <a href={BASE} className="ap-back-link">
                        ← Գլխավոր էջ
                    </a>

                    <div className="ap-heading">
                        <div>
                            <span className="ap-eyebrow">
                                ARMMOTORS / ՀԱՅՏԱՐԱՐՈՒԹՅՈՒՆ
                            </span>

                            <h1>Տեղադրել հայտարարություն</h1>

                            <p>
                                Ընտրեք տվյալները, ավելացրեք լուսանկարներ և
                                հրապարակեք։
                            </p>
                        </div>

                        <span className="ap-heading-badge">
                            Քայլ {step + 1} / 4
                        </span>
                    </div>

                    <div className="ap-progress">
                        {STEPS.map((name, index) => (
                            <div
                                key={name}
                                className={[
                                    "ap-progress-step",
                                    index === step ? "is-active" : "",
                                    index < step ? "is-completed" : "",
                                ].join(" ")}
                            >
                                <span className="ap-progress-line" />
                                <span className="ap-progress-label">
                                    {name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <form
                        className="ap-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {step === 0 && (
                            <section className="ap-section">
                                <SectionTitle
                                    number="01"
                                    title="Հիմնական տվյալներ"
                                    description="Ընտրեք հայտարարության տեսակը, գինը և գտնվելու վայրը։"
                                />

                                <div className="ap-grid">
                                    <SelectField
                                        label="Բաժին"
                                        value={form.type}
                                        onChange={changeType}
                                        options={[
                                            ["car", "Մեքենա"],
                                            ["part", "Պահեստամաս"],
                                        ]}
                                    />

                                    <SelectField
                                        label="Վիճակ"
                                        value={form.condition}
                                        onChange={(value) =>
                                            update("condition", value)
                                        }
                                        options={["Նոր", "Օգտագործված"]}
                                    />

                                    {!isCar && (
                                        <div className="ap-full">
                                            <InputField
                                                label="Պահեստամասի անվանում"
                                                value={form.title}
                                                onChange={(value) =>
                                                    update("title", value)
                                                }
                                                placeholder="Օրինակ՝ Mercedes W212 լուսարձակ"
                                                required
                                            />
                                        </div>
                                    )}

                                    <InputField
                                        label="Գին"
                                        type="number"
                                        value={form.price}
                                        onChange={(value) =>
                                            update("price", value)
                                        }
                                        placeholder="Օրինակ՝ 8500000"
                                        min="0"
                                        required
                                    />

                                    <SelectField
                                        label="Արժույթ"
                                        value={form.currency}
                                        onChange={(value) =>
                                            update("currency", value)
                                        }
                                        options={[
                                            ["AMD", "AMD — Դրամ"],
                                            ["USD", "USD — Դոլար"],
                                            ["RUB", "RUB — Ռուբլի"],
                                        ]}
                                    />

                                    <div className="ap-full">
                                        <h3 className="ap-location-heading">
                                            Գտնվելու վայր
                                        </h3>
                                    </div>

                                    <LocationFields
                                        value={location}
                                        onChange={(value) => {
                                            setLocation(value);
                                            setError("");
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {step === 1 && (
                            <section className="ap-section">
                                <SectionTitle
                                    number="02"
                                    title={
                                        isCar
                                            ? "Մեքենայի տվյալներ"
                                            : "Պահեստամասի տվյալներ"
                                    }
                                    description={
                                        isCar
                                            ? "Մակնիշն ընտրելուց հետո հասանելի կլինեն համապատասխան մոդելները։"
                                            : "Պահեստամասի հիմնական տվյալներն արդեն լրացված են։"
                                    }
                                />

                                {isCar ? (
                                    <div className="ap-grid">
                                        <SelectField
                                            label="Մեքենայի տեսակ"
                                            value={form.vehicleType}
                                            onChange={(value) =>
                                                update("vehicleType", value)
                                            }
                                            options={[
                                                ["passenger", "Մարդատար"],
                                                ["truck", "Բեռնատար"],
                                            ]}
                                        />

                                        <SelectField
                                            label="Մակնիշ"
                                            value={form.brand}
                                            onChange={changeBrand}
                                            options={CAR_BRANDS}
                                            placeholder="Ընտրեք մակնիշը"
                                            required
                                        />

                                        <SelectField
                                            label="Մոդել"
                                            value={form.model}
                                            onChange={(value) =>
                                                update("model", value)
                                            }
                                            options={modelOptions}
                                            placeholder={
                                                form.brand
                                                    ? "Ընտրեք մոդելը"
                                                    : "Նախ ընտրեք մակնիշը"
                                            }
                                            disabled={!form.brand}
                                            required
                                        />

                                        <SelectField
                                            label="Տարեթիվ"
                                            value={form.year}
                                            onChange={(value) =>
                                                update("year", value)
                                            }
                                            options={CAR_YEARS.map((year) => [
                                                String(year),
                                                String(year),
                                            ])}
                                            placeholder="Ընտրեք տարեթիվը"
                                            required
                                        />

                                        <InputField
                                            label="Վազք (կմ)"
                                            type="number"
                                            value={form.mileage}
                                            onChange={(value) =>
                                                update("mileage", value)
                                            }
                                            placeholder="Օրինակ՝ 85000"
                                            min="0"
                                            required
                                        />

                                        <SelectField
                                            label="Վառելիք"
                                            value={form.fuel}
                                            onChange={(value) =>
                                                update("fuel", value)
                                            }
                                            options={FUEL_OPTIONS}
                                        />

                                        <SelectField
                                            label="Ղեկ"
                                            value={form.steering}
                                            onChange={(value) =>
                                                update("steering", value)
                                            }
                                            options={STEERING_OPTIONS}
                                        />

                                        <SelectField
                                            label="Գույն"
                                            value={form.color}
                                            onChange={(value) =>
                                                update("color", value)
                                            }
                                            options={CAR_COLORS}
                                            placeholder="Ընտրեք գույնը"
                                            required
                                        />

                                        <div className="ap-full">
                                            <InputField
                                                label="VIN (ըստ ցանկության)"
                                                value={form.vin}
                                                onChange={(value) =>
                                                    update("vin", value)
                                                }
                                                placeholder="17 նիշ"
                                                maxLength={17}
                                            />
                                        </div>

                                        {generatedTitle && (
                                            <div className="ap-full">
                                                <div className="ap-info-box">
                                                    Վերնագիրը կստեղծվի ավտոմատ՝{" "}
                                                    <strong>
                                                        {generatedTitle}
                                                    </strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="ap-info-box">
                                        Կարող եք անցնել հաջորդ քայլին։
                                    </div>
                                )}
                            </section>
                        )}

                        {step === 2 && (
                            <section className="ap-section">
                                <SectionTitle
                                    number="03"
                                    title="Նկարներ և կապ"
                                    description="Ավելացրեք նկարները և հեռախոսահամարը։"
                                />

                                <div className="ap-grid">
                                    <div className="ap-full">
                                        <InputField
                                            label="Հեռախոսահամար"
                                            type="tel"
                                            value={form.phone}
                                            onChange={(value) =>
                                                update("phone", value)
                                            }
                                            placeholder="+374XXXXXXXX"
                                            required
                                        />
                                    </div>

                                    <div className="ap-full">
                                        <label className="ap-field">
                                            <span className="ap-field-label">
                                                Նկարագրություն (ըստ ցանկության)
                                            </span>

                                            <textarea
                                                value={form.description}
                                                onChange={(event) =>
                                                    update(
                                                        "description",
                                                        event.target.value,
                                                    )
                                                }
                                                rows={5}
                                                maxLength={7000}
                                                placeholder="Կարող եք գրել լրացուցիչ տեղեկություններ։ Եթե թողնեք դատարկ, հիմնական տվյալներից նկարագրությունը կստեղծվի ավտոմատ։"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="ap-upload-section">
                                    <div className="ap-upload-heading">
                                        <div>
                                            <h3>Լուսանկարներ</h3>
                                            <p>Առավելագույնը 12 նկար։</p>
                                        </div>

                                        <span className="ap-image-count">
                                            {images.length} / 12
                                        </span>
                                    </div>

                                    {images.length < 12 && (
                                        <div className="ap-uploader">
                                            <ImageUploader
                                                onUploaded={handleUploaded}
                                                disabled={loading}
                                            />
                                        </div>
                                    )}

                                    {images.length > 0 && (
                                        <div className="ap-images-grid">
                                            {images.map((url, index) => (
                                                <div
                                                    className="ap-image-card"
                                                    key={url}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Նկար ${index + 1}`}
                                                    />

                                                    {index === 0 && (
                                                        <span className="ap-main-image-badge">
                                                            Գլխավոր
                                                        </span>
                                                    )}

                                                    <div className="ap-image-actions">
                                                        {index !== 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    makeMainImage(
                                                                        url,
                                                                    )
                                                                }
                                                            >
                                                                Գլխավոր
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="ap-remove-image"
                                                            onClick={() =>
                                                                removeImage(url)
                                                            }
                                                        >
                                                            Հեռացնել
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {step === 3 && (
                            <section className="ap-section">
                                <SectionTitle
                                    number="04"
                                    title="Հայտարարության ամփոփում"
                                    description="Ստուգեք տվյալները նախքան հրապարակելը։"
                                />

                                {images[0] && (
                                    <div className="ap-review-cover">
                                        <img
                                            src={images[0]}
                                            alt="Գլխավոր նկար"
                                        />
                                    </div>
                                )}

                                <div className="ap-review-title">
                                    <h2>{title}</h2>
                                    <strong>
                                        {formatPrice(form.price)}{" "}
                                        {form.currency}
                                    </strong>
                                </div>

                                <div className="ap-summary-grid">
                                    <SummaryItem
                                        label="Բաժին"
                                        value={isCar ? "Մեքենա" : "Պահեստամաս"}
                                    />

                                    <SummaryItem
                                        label="Վիճակ"
                                        value={form.condition}
                                    />

                                    <SummaryItem
                                        label="Գտնվելու վայր"
                                        value={locationText}
                                    />

                                    <SummaryItem
                                        label="Հեռախոս"
                                        value={form.phone}
                                    />

                                    {isCar && (
                                        <>
                                            <SummaryItem
                                                label="Մակնիշ"
                                                value={form.brand}
                                            />

                                            <SummaryItem
                                                label="Մոդել"
                                                value={form.model}
                                            />

                                            <SummaryItem
                                                label="Տարեթիվ"
                                                value={form.year}
                                            />

                                            <SummaryItem
                                                label="Վազք"
                                                value={`${formatPrice(
                                                    form.mileage,
                                                )} կմ`}
                                            />

                                            <SummaryItem
                                                label="Գույն"
                                                value={form.color}
                                            />

                                            <SummaryItem
                                                label="Վառելիք"
                                                value={getLabel(
                                                    FUEL_OPTIONS,
                                                    form.fuel,
                                                )}
                                            />
                                        </>
                                    )}

                                    <SummaryItem
                                        label="Լուսանկարներ"
                                        value={`${images.length} հատ`}
                                    />
                                </div>

                                <div className="ap-review-description">
                                    <h3>Նկարագրություն</h3>
                                    <p>{createDescription()}</p>
                                </div>
                            </section>
                        )}

                        {error && (
                            <div className="ap-error" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="ap-success" role="status">
                                {success}
                            </div>
                        )}

                        <div className="ap-form-footer">
                            <div className="ap-footer-left">
                                {step > 0 && (
                                    <button
                                        type="button"
                                        className="ap-back-button"
                                        onClick={previousStep}
                                        disabled={loading}
                                    >
                                        ← Նախորդ քայլ
                                    </button>
                                )}
                            </div>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    className="ap-next-button"
                                    onClick={nextStep}
                                >
                                    Շարունակել →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="ap-next-button"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Հրապարակվում է..."
                                        : "Հրապարակել →"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
