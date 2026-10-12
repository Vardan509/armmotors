import { useState } from "react";

import Header from "../components/header/Header";
import ImageUploader from "../components/uploads/ImageUploader";
import LocationFields from "../components/add-product/LocationFields";
import PublicationNotice from "../components/monetization/PublicationNotice";

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

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    min,
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
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                maxLength={maxLength}
            />
        </label>
    );
}

function Select({
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
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                <option value="">{placeholder}</option>

                {options.map((option) => {
                    const [key, title] = Array.isArray(option)
                        ? option
                        : [option, option];

                    return (
                        <option key={key} value={key}>
                            {title}
                        </option>
                    );
                })}
            </select>
        </label>
    );
}

function SectionHeading({ number, title, description }) {
    return (
        <div className="ap-section-title">
            <span className="ap-section-number">{number}</span>

            <div>
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
        </div>
    );
}

function Summary({ label, value }) {
    return (
        <div className="ap-summary-item">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
}

export default function AddProductPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [location, setLocation] = useState(INITIAL_LOCATION);
    const [images, setImages] = useState([]);

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");
    const isCar = form.type === "car";

    const modelList = form.brand ? CAR_MODELS[form.brand] || [] : [];

    const modelOptions = modelList.map((model) => [model, model]);

    const title = isCar
        ? [form.brand, form.model, form.year].filter(Boolean).join(" ")
        : form.title.trim();

    const locationText = [
        location.region,
        location.community,
        location.settlement,
    ]
        .filter(Boolean)
        .join(", ");

    function update(name, value) {
        setForm((old) => ({
            ...old,
            [name]: value,
        }));

        setError("");
    }

    function changeType(type) {
        setForm({
            ...INITIAL_FORM,
            type,
            price: form.price,
            currency: form.currency,
            phone: form.phone,
        });

        setError("");
    }

    function changeBrand(brand) {
        setForm((old) => ({
            ...old,
            brand,
            model: "",
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

        setImages((old) => {
            const next = [...new Set([...old, ...urls])];

            if (next.length > 12) {
                setError("Կարելի է վերբեռնել առավելագույնը 12 նկար։");

                return old;
            }

            setError("");
            return next;
        });
    }

    function removeImage(url) {
        setImages((old) => old.filter((img) => img !== url));
    }

    function makeMainImage(url) {
        setImages((old) => [url, ...old.filter((img) => img !== url)]);
    }

    function validate(index) {
        if (index === 0) {
            if (!isCar && !title) {
                return "Լրացրեք պահեստամասի անվանումը։";
            }

            if (
                form.price === "" ||
                !Number.isFinite(Number(form.price)) ||
                Number(form.price) < 0
            ) {
                return "Նշեք ճիշտ գին։";
            }

            if (!location.regionId || !location.communityId) {
                return "Ընտրեք մարզը և համայնքը։";
            }
        }

        if (index === 1 && isCar) {
            if (!form.brand || !form.model || !form.year) {
                return "Լրացրեք մակնիշը, մոդելը և տարեթիվը։";
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

        if (index === 2) {
            const phone = form.phone.replace(/[\s()-]/g, "");

            if (!/^\+?[0-9]{8,15}$/.test(phone)) {
                return "Նշեք ճիշտ հեռախոսահամար։";
            }

            if (images.length === 0) {
                return "Ավելացրեք առնվազն մեկ նկար։";
            }
        }

        return "";
    }

    function nextStep() {
        const message = validate(step);

        if (message) {
            setError(message);
            return;
        }

        setError("");
        setStep((old) => Math.min(old + 1, 3));

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function previousStep() {
        setError("");
        setStep((old) => Math.max(old - 1, 0));

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
            return `Պահեստամաս՝ ${title}։ Վիճակ՝ ${form.condition}։ Գտնվելու վայր՝ ${locationText}։`;
        }

        return [
            `Մեքենա՝ ${title}։`,
            `Վազք՝ ${formatNumber(form.mileage)} կմ։`,
            `Վառելիք՝ ${form.fuel}։`,
            `Ղեկ՝ ${form.steering}։`,
            `Գույն՝ ${form.color}։`,
            `Գտնվելու վայր՝ ${locationText}։`,
        ].join(" ");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading || step !== 3) return;

        for (let i = 0; i < 3; i++) {
            const message = validate(i);

            if (message) {
                setError(message);
                setStep(i);
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

            // Առաջին 5 հայտարարությունը հրապարակվում է անվճար։
            // Դրանից հետո backend-ը վերադարձնում է
            // requiresPayment և 100 դրամ վճարման հայտ։
            if (result?.requiresPayment) {
                window.location.assign(`${BASE}monetization`);

                return;
            }

            setSuccess("Հայտարարությունը հաջողությամբ հրապարակվեց։");

            const id =
                result?.product?._id ||
                result?.product?.id ||
                result?._id ||
                result?.id;

            if (id) {
                window.location.assign(`${BASE}cars/${encodeURIComponent(id)}`);

                return;
            }

            setForm(INITIAL_FORM);
            setLocation(INITIAL_LOCATION);
            setImages([]);
            setStep(0);
        } catch (err) {
            if (err.status === 401) {
                window.location.assign(`${BASE}login?next=/add-product`);

                return;
            }

            setError(err.message || "Հայտարարությունը հրապարակել չհաջողվեց։");
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
                                className="ap-primary-link"
                                href={`${BASE}login?next=/add-product`}
                            >
                                Մուտք
                            </a>

                            <a
                                className="ap-secondary-link"
                                href={`${BASE}registration?next=/add-product`}
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
                            <span className="ap-eyebrow">ARMMOTORS</span>

                            <h1>Տեղադրել հայտարարություն</h1>

                            <p>
                                Լրացրեք տվյալները, ավելացրեք լուսանկարներ և
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
                                <SectionHeading
                                    number="01"
                                    title="Հիմնական տվյալներ"
                                    description="Նշեք հայտարարության տեսակը, գինը և գտնվելու վայրը։"
                                />

                                <div className="ap-grid">
                                    <Select
                                        label="Բաժին"
                                        value={form.type}
                                        onChange={changeType}
                                        options={[
                                            ["car", "Մեքենա"],
                                            ["part", "Պահեստամաս"],
                                        ]}
                                    />

                                    <Select
                                        label="Վիճակ"
                                        value={form.condition}
                                        onChange={(value) =>
                                            update("condition", value)
                                        }
                                        options={["Նոր", "Օգտագործված"]}
                                    />

                                    {!isCar && (
                                        <div className="ap-full">
                                            <Field
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

                                    <Field
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

                                    <Select
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
                                <SectionHeading
                                    number="02"
                                    title={
                                        isCar
                                            ? "Մեքենայի տվյալներ"
                                            : "Պահեստամասի տվյալներ"
                                    }
                                    description={
                                        isCar
                                            ? "Ընտրեք մակնիշը, մոդելը և տեխնիկական տվյալները։"
                                            : "Կարող եք ավելացնել լրացուցիչ նկարագրություն հաջորդ քայլում։"
                                    }
                                />

                                {isCar ? (
                                    <div className="ap-grid">
                                        <Select
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

                                        <Select
                                            label="Մակնիշ"
                                            value={form.brand}
                                            onChange={changeBrand}
                                            options={CAR_BRANDS}
                                            required
                                        />

                                        <Select
                                            label="Մոդել"
                                            value={form.model}
                                            onChange={(value) =>
                                                update("model", value)
                                            }
                                            options={modelOptions}
                                            disabled={!form.brand}
                                            placeholder={
                                                form.brand
                                                    ? "Ընտրել մոդելը"
                                                    : "Նախ ընտրեք մակնիշը"
                                            }
                                            required
                                        />

                                        <Select
                                            label="Տարեթիվ"
                                            value={form.year}
                                            onChange={(value) =>
                                                update("year", value)
                                            }
                                            options={CAR_YEARS.map((year) => [
                                                String(year),
                                                String(year),
                                            ])}
                                            required
                                        />

                                        <Field
                                            label="Վազք (կմ)"
                                            type="number"
                                            value={form.mileage}
                                            onChange={(value) =>
                                                update("mileage", value)
                                            }
                                            min="0"
                                            required
                                        />

                                        <Select
                                            label="Վառելիք"
                                            value={form.fuel}
                                            onChange={(value) =>
                                                update("fuel", value)
                                            }
                                            options={FUEL_OPTIONS}
                                        />

                                        <Select
                                            label="Ղեկ"
                                            value={form.steering}
                                            onChange={(value) =>
                                                update("steering", value)
                                            }
                                            options={STEERING_OPTIONS}
                                        />

                                        <Select
                                            label="Գույն"
                                            value={form.color}
                                            onChange={(value) =>
                                                update("color", value)
                                            }
                                            options={CAR_COLORS}
                                            required
                                        />

                                        <Field
                                            label="VIN (ըստ ցանկության)"
                                            value={form.vin}
                                            onChange={(value) =>
                                                update(
                                                    "vin",
                                                    value.toUpperCase(),
                                                )
                                            }
                                            maxLength={17}
                                        />
                                    </div>
                                ) : (
                                    <div className="ap-info-box">
                                        Պահեստամասի հիմնական տվյալները լրացված
                                        են։ Շարունակեք նկարների և կապի տվյալների
                                        քայլին։
                                    </div>
                                )}
                            </section>
                        )}

                        {step === 2 && (
                            <section className="ap-section">
                                <SectionHeading
                                    number="03"
                                    title="Նկարներ և կապ"
                                    description="Ավելացրեք նկարները, հեռախոսահամարը և նկարագրությունը։"
                                />

                                <div className="ap-grid">
                                    <Field
                                        label="Հեռախոսահամար"
                                        value={form.phone}
                                        onChange={(value) =>
                                            update("phone", value)
                                        }
                                        placeholder="+374XXXXXXXX"
                                        required
                                    />

                                    <label className="ap-field ap-full">
                                        <span className="ap-field-label">
                                            Նկարագրություն
                                        </span>

                                        <textarea
                                            value={form.description}
                                            onChange={(e) =>
                                                update(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Նկարագրեք մեքենան կամ պահեստամասը..."
                                            maxLength={7000}
                                        />
                                    </label>
                                </div>

                                <div className="ap-upload-section">
                                    <div className="ap-upload-heading">
                                        <div>
                                            <h3>Լուսանկարներ</h3>

                                            <p>
                                                Առավելագույնը 12 նկար։ Առաջինը
                                                կլինի գլխավոր։
                                            </p>
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
                                                    key={url}
                                                    className="ap-image-card"
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
                            <>
                                <PublicationNotice />

                                <section className="ap-section">
                                    <SectionHeading
                                        number="04"
                                        title="Հայտարարության ամփոփում"
                                        description="Ստուգեք տվյալները հրապարակելուց առաջ։"
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
                                            {formatNumber(form.price)}{" "}
                                            {form.currency}
                                        </strong>
                                    </div>

                                    <div className="ap-summary-grid">
                                        <Summary
                                            label="Տեսակ"
                                            value={
                                                isCar ? "Մեքենա" : "Պահեստամաս"
                                            }
                                        />

                                        <Summary
                                            label="Վիճակ"
                                            value={form.condition}
                                        />

                                        <Summary
                                            label="Գտնվելու վայր"
                                            value={locationText}
                                        />

                                        <Summary
                                            label="Հեռախոսահամար"
                                            value={form.phone}
                                        />

                                        {isCar && (
                                            <>
                                                <Summary
                                                    label="Մակնիշ"
                                                    value={form.brand}
                                                />

                                                <Summary
                                                    label="Մոդել"
                                                    value={form.model}
                                                />

                                                <Summary
                                                    label="Տարեթիվ"
                                                    value={form.year}
                                                />

                                                <Summary
                                                    label="Վազք"
                                                    value={`${formatNumber(
                                                        form.mileage,
                                                    )} կմ`}
                                                />

                                                <Summary
                                                    label="Վառելիք"
                                                    value={form.fuel}
                                                />

                                                <Summary
                                                    label="Գույն"
                                                    value={form.color}
                                                />
                                            </>
                                        )}

                                        <Summary
                                            label="Նկարներ"
                                            value={`${images.length} հատ`}
                                        />
                                    </div>

                                    <div className="ap-review-description">
                                        <h3>Նկարագրություն</h3>
                                        <p>{createDescription()}</p>
                                    </div>

                                    <div className="ap-info-box">
                                        Առաջին 5 հայտարարությունն անվճար է։
                                        Հաջորդ յուրաքանչյուր հրապարակման արժեքը՝
                                        100 դրամ։ Եթե անվճար տեղերը սպառված են,
                                        կստեղծվի վճարման հայտ, և
                                        հայտարարությունը կհրապարակվի վճարումը
                                        հաստատվելուց հետո։
                                    </div>
                                </section>
                            </>
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
