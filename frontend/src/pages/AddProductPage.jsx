import { useEffect, useRef, useState } from "react";

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
import "./AddProductSuccess.css";

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
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
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
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                disabled={disabled}
            >
                {!value && <option value="">{placeholder}</option>}

                {options.map((option) => {
                    const [key, title] = Array.isArray(option)
                        ? option
                        : [option, option];

                    return (
                        <option key={String(key)} value={key}>
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

function SuccessIcon() {
    return (
        <svg
            width="37"
            height="37"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m7.5 12 3 3 6-6" />
        </svg>
    );
}

function PublicationSuccess({ productId, editing, onClose }) {
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        function handleEscape(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;

            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div
            className="ap-success-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="ap-success-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ap-success-title"
                aria-describedby="ap-success-description"
            >
                <button
                    ref={closeRef}
                    className="ap-success-close"
                    type="button"
                    aria-label="Փակել պատուհանը"
                    onClick={onClose}
                >
                    ×
                </button>

                <div className="ap-success-icon">
                    <SuccessIcon />
                </div>

                <span className="ap-success-eyebrow">ARMMOTORS</span>

                <h2 id="ap-success-title">
                    {editing
                        ? "Փոփոխությունները պահպանված են"
                        : "Հայտարարությունը հրապարակված է"}
                </h2>

                <p
                    id="ap-success-description"
                    className="ap-success-description"
                >
                    {editing
                        ? "Ձեր հայտարարության տվյալները հաջողությամբ թարմացվել են։"
                        : "Շնորհավորում ենք։ Ձեր հայտարարությունը հաջողությամբ ավելացվել է ArmMotors կայքում։"}
                </p>

                <div className="ap-success-tip">
                    <div className="ap-success-tip-heading">
                        <span className="ap-success-tip-star">★</span>

                        <strong>Ավելի շատ տեսանելիություն</strong>
                    </div>

                    <p>
                        Յուրաքանչյուր 4 օրը մեկ կարող եք անվճար թարմացնել
                        հայտարարությունը։ Իսկ TOP և ավտոթարմացման փաթեթները
                        կօգնեն այն ավելի տեսանելի դարձնել հայտարարությունների
                        ցուցակում։
                    </p>
                </div>

                {productId && (
                    <a
                        className="ap-success-primary"
                        href={`${BASE}cars/${encodeURIComponent(productId)}`}
                    >
                        Դիտել հայտարարությունը
                        <span aria-hidden="true">→</span>
                    </a>
                )}

                <div className="ap-success-actions">
                    {productId && (
                        <a
                            href={`${BASE}add-product?edit=${encodeURIComponent(
                                productId,
                            )}`}
                        >
                            Խմբագրել
                        </a>
                    )}

                    <a href={`${BASE}account`}>Իմ հայտարարությունները</a>
                </div>

                <a className="ap-success-plans" href={`${BASE}monetization`}>
                    Դիտել TOP փաթեթները ↗
                </a>
            </section>
        </div>
    );
}

export default function AddProductPage() {
    const params = new URLSearchParams(window.location.search);

    const editId = params.get("edit") || "";
    const isEditing = Boolean(editId);

    const [form, setForm] = useState(INITIAL_FORM);

    const [location, setLocation] = useState(INITIAL_LOCATION);

    const [savedRegion, setSavedRegion] = useState("");

    const [images, setImages] = useState([]);

    const [step, setStep] = useState(0);

    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(isEditing);

    const [error, setError] = useState("");

    const [successProductId, setSuccessProductId] = useState("");

    const [successEditing, setSuccessEditing] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

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

    const effectiveRegion = location.region || savedRegion;

    // ==========================================
    // LOGIN REDIRECT
    // ==========================================

    useEffect(() => {
        if (!token) {
            const next = isEditing
                ? `/add-product?edit=${editId}`
                : "/add-product";

            window.location.replace(
                `${BASE}login?next=${encodeURIComponent(next)}`,
            );
        }
    }, [token, isEditing, editId]);

    // ==========================================
    // LOAD EXISTING PRODUCT FOR EDITING
    // ==========================================

    useEffect(() => {
        if (!isEditing || !token) {
            return;
        }

        let cancelled = false;

        async function loadProduct() {
            setLoadingProduct(true);
            setError("");

            try {
                // Վերցնում ենք միայն տվյալ օգտատիրոջ
                // սեփական հայտարարությունները։
                const result = await apiRequest("/products/mine");

                const products = Array.isArray(result)
                    ? result
                    : Array.isArray(result?.items)
                      ? result.items
                      : [];

                const product = products.find(
                    (item) => String(item._id || item.id) === String(editId),
                );

                if (!product) {
                    throw new Error("Հայտարարությունը չի գտնվել Ձեր հաշվում։");
                }

                if (product.paymentPending) {
                    throw new Error(
                        "Վճարման սպասող հայտարարությունը դեռ չի խմբագրվում։",
                    );
                }

                if (cancelled) return;

                setForm({
                    type: product.type || "car",
                    title: product.title || "",
                    price:
                        product.price !== undefined
                            ? String(product.price)
                            : "",
                    currency: product.currency || "AMD",
                    condition: product.condition || "Օգտագործված",
                    vehicleType: product.vehicleType || "passenger",
                    brand: product.brand || "",
                    model: product.model || "",
                    year:
                        product.year !== undefined ? String(product.year) : "",
                    mileage:
                        product.mileage !== undefined
                            ? String(product.mileage)
                            : "",
                    fuel: product.fuel || "petrol",
                    steering: product.steering || "left",
                    color: product.color || "",
                    vin: product.vin || "",
                    description: product.description || "",
                    phone: product.phone || "",
                });

                setImages(Array.isArray(product.images) ? product.images : []);

                // Հին տվյալներում պահված է region-ը,
                // բայց ոչ պարտադիր regionId-ն։
                // Պահպանում ենք նախկին region-ը,
                // մինչև օգտատերը նոր վայր ընտրի։
                setSavedRegion(product.region || "");

                setStep(0);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || "Հայտարարությունը բեռնել չհաջողվեց։",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingProduct(false);
                }
            }
        }

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [editId, isEditing, token]);

    // ==========================================
    // FORM UPDATE
    // ==========================================

    function update(name, value) {
        setForm((old) => ({
            ...old,
            [name]: value,
        }));

        setError("");
    }

    function changeType(type) {
        setForm((old) => ({
            ...INITIAL_FORM,
            type,
            price: old.price,
            currency: old.currency,
            phone: old.phone,
        }));

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

    // ==========================================
    // IMAGES
    // ==========================================

    function handleUploaded(result) {
        const raw = Array.isArray(result)
            ? result
            : result?.urls || result?.images || [];

        const urls = raw
            .map((item) =>
                typeof item === "string" ? item : item?.url || item?.secure_url,
            )
            .filter(
                (url) => typeof url === "string" && /^https?:\/\//i.test(url),
            );

        setImages((old) => {
            const next = [...new Set([...old, ...urls])];

            if (next.length > 12) {
                setError("Առավելագույնը 12 նկար կարող եք ավելացնել։");

                return old;
            }

            setError("");
            return next;
        });
    }

    function removeImage(url) {
        setImages((old) => old.filter((image) => image !== url));
    }

    function makeMainImage(url) {
        setImages((old) => [url, ...old.filter((image) => image !== url)]);
    }

    // ==========================================
    // VALIDATION
    // ==========================================

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

            if (
                !effectiveRegion ||
                (!isEditing && (!location.regionId || !location.communityId))
            ) {
                return "Ընտրեք գտնվելու վայրը։";
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

    // ==========================================
    // DESCRIPTION
    // ==========================================

    function createDescription() {
        if (form.description.trim()) {
            return form.description.trim();
        }

        if (!isCar) {
            return [
                `Պահեստամաս՝ ${title}։`,
                `Վիճակ՝ ${form.condition}։`,
                `Գտնվելու վայր՝ ${effectiveRegion}։`,
            ].join(" ");
        }

        return [
            `Մեքենա՝ ${title}։`,
            `Վազք՝ ${formatNumber(form.mileage)} կմ։`,
            `Վառելիք՝ ${form.fuel}։`,
            `Ղեկ՝ ${form.steering}։`,
            `Գույն՝ ${form.color}։`,
            `Գտնվելու վայր՝ ${effectiveRegion}։`,
        ].join(" ");
    }

    // ==========================================
    // CREATE / UPDATE
    // ==========================================

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading || step !== 3) {
            return;
        }

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

        try {
            const payload = {
                type: form.type,
                title,
                price: Number(form.price),
                currency: form.currency,
                condition: form.condition,
                region: effectiveRegion,
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
            } else if (isEditing) {
                // Եթե մեքենան փոխել են պահեստամասի,
                // նախկին մեքենայի տվյալները մաքրում ենք։
                Object.assign(payload, {
                    vehicleType: null,
                    brand: "",
                    model: "",
                    year: null,
                    mileage: null,
                    fuel: null,
                    steering: null,
                    color: "",
                    vin: "",
                });
            }

            let result;

            if (isEditing) {
                result = await apiRequest(
                    `/products/${encodeURIComponent(editId)}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    },
                );
            } else {
                result = await apiRequest("/products", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    timeoutMs: 30000,
                });
            }

            if (!isEditing && result?.requiresPayment) {
                window.location.assign(`${BASE}monetization`);

                return;
            }

            const productId =
                result?.product?._id ||
                result?.product?.id ||
                result?._id ||
                result?.id ||
                editId;

            setSuccessProductId(String(productId || ""));

            setSuccessEditing(isEditing);
            setShowSuccess(true);
        } catch (err) {
            if (err.status === 401) {
                window.location.assign(
                    `${BASE}login?next=${encodeURIComponent(
                        isEditing
                            ? `/add-product?edit=${editId}`
                            : "/add-product",
                    )}`,
                );

                return;
            }

            setError(err.message || "Տվյալները պահպանել չհաջողվեց։");
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // AUTH / LOADING
    // ==========================================

    if (!token) {
        return null;
    }

    if (loadingProduct) {
        return (
            <>
                <Header />

                <main className="ap-page">
                    <div className="ap-container">
                        <p>Հայտարարության տվյալները բեռնվում են...</p>
                    </div>
                </main>
            </>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <>
            <Header />

            <main className="ap-page">
                <div className="ap-container">
                    <a
                        href={isEditing ? `${BASE}account` : BASE}
                        className="ap-back-link"
                    >
                        ← {isEditing ? "Իմ հայտարարությունները" : "Գլխավոր էջ"}
                    </a>

                    <div className="ap-heading">
                        <div>
                            <span className="ap-eyebrow">ARMMOTORS</span>

                            <h1>
                                {isEditing
                                    ? "Խմբագրել հայտարարությունը"
                                    : "Տեղադրել հայտարարություն"}
                            </h1>

                            <p>
                                {isEditing
                                    ? "Կարող եք փոփոխել հայտարարության բոլոր տվյալներն ու լուսանկարները։"
                                    : "Լրացրեք տվյալները, ավելացրեք լուսանկարներ և հրապարակեք։"}
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
                        {/* STEP 1 */}

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
                                                required
                                                placeholder="Օրինակ՝ Mercedes W212 լուսարձակ"
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
                                        min="0"
                                        required
                                        placeholder="Գինը"
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

                                        {isEditing && savedRegion && (
                                            <p className="ap-existing-location">
                                                Ընթացիկ վայր՝{" "}
                                                <strong>{savedRegion}</strong>։
                                                Կարող եք թողնել անփոփոխ կամ
                                                ընտրել նորը։
                                            </p>
                                        )}
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

                        {/* STEP 2 */}

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
                                            ? "Փոփոխեք մեքենայի տեխնիկական տվյալները։"
                                            : "Շարունակեք նկարների և կապի տվյալների բաժին։"
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
                                            label="VIN"
                                            value={form.vin}
                                            onChange={(value) =>
                                                update(
                                                    "vin",
                                                    value.toUpperCase(),
                                                )
                                            }
                                            maxLength={17}
                                            placeholder="Ըստ ցանկության"
                                        />
                                    </div>
                                ) : (
                                    <div className="ap-info-box">
                                        Շարունակեք հաջորդ քայլ։
                                    </div>
                                )}
                            </section>
                        )}

                        {/* STEP 3 */}

                        {step === 2 && (
                            <section className="ap-section">
                                <SectionHeading
                                    number="03"
                                    title="Նկարներ և կապ"
                                    description="Փոփոխեք հեռախոսահամարը, նկարագրությունը և լուսանկարները։"
                                />

                                <div className="ap-grid">
                                    <Field
                                        label="Հեռախոսահամար"
                                        value={form.phone}
                                        onChange={(value) =>
                                            update("phone", value)
                                        }
                                        required
                                        placeholder="+374XXXXXXXX"
                                    />

                                    <label className="ap-field ap-full">
                                        <span className="ap-field-label">
                                            Նկարագրություն
                                        </span>

                                        <textarea
                                            value={form.description}
                                            onChange={(event) =>
                                                update(
                                                    "description",
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={7000}
                                            placeholder="Նկարագրեք մեքենան կամ պահեստամասը..."
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
                                                        alt={`Նկար ${
                                                            index + 1
                                                        }`}
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

                        {/* STEP 4 */}

                        {step === 3 && (
                            <>
                                {!isEditing && <PublicationNotice />}

                                <section className="ap-section">
                                    <SectionHeading
                                        number="04"
                                        title="Ստուգեք տվյալները"
                                        description="Համոզվեք, որ ամեն ինչ ճիշտ է՝ մինչև պահպանելը։"
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
                                            value={locationText || savedRegion}
                                        />

                                        <Summary
                                            label="Հեռախոս"
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
                                        {isEditing
                                            ? "Տվյալները փոխելու համար նոր հրապարակման վճար չի պահանջվում։ Խմբագրումը ինքնաբերաբար չի բարձրացնում հայտարարությունը ցուցակում։"
                                            : "Առաջին 5 հայտարարությունն անվճար է, իսկ յուրաքանչյուր հաջորդ հրապարակումը՝ 100 դրամ։"}
                                    </div>
                                </section>
                            </>
                        )}

                        {error && (
                            <div className="ap-error" role="alert">
                                {error}
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
                                        ? "Պահպանվում է..."
                                        : isEditing
                                          ? "Պահպանել փոփոխությունները"
                                          : "Հրապարակել հայտարարությունը"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>

            {showSuccess && (
                <PublicationSuccess
                    productId={successProductId}
                    editing={successEditing}
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </>
    );
}
