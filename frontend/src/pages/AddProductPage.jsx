import { useState } from "react";
import { apiRequest } from "../utils/api";
import Header from "../components/header/Header";
import useCurrency from "../utils/useCurrency";
import "./Forms.css";

const INITIAL_FORM = {
    type: "car",
    title: "",
    price: "",
    vehicleType: "passenger",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "petrol",
    steering: "left",
    color: "",
    region: "",
    vin: "",
    condition: "Օգտագործված",
    description: "",
    phone: "",
    images: "",
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

const FUELS = [
    ["petrol", "Բենզին"],
    ["gas", "Գազ"],
    ["diesel", "Դիզել"],
    ["electric", "Էլեկտրական"],
    ["hybrid", "Հիբրիդ"],
];

export default function AddProductPage() {
    const { currency } = useCurrency();

    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    function changeField(event) {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const body = {
                type: form.type,
                title: form.title.trim(),
                price: Number(form.price),
                currency,
                region: form.region.trim(),
                condition: form.condition,
                description: form.description.trim(),
                phone: form.phone.replace(/[\s()-]/g, ""),
                images: form.images
                    .split(/\r?\n/)
                    .map((image) => image.trim())
                    .filter(Boolean),
            };

            if (body.title.length < 2 || !body.region || !body.description) {
                throw new Error(
                    "Լրացրեք վերնագիրը, տարածաշրջանը և նկարագրությունը։",
                );
            }

            if (
                form.price.trim() === "" ||
                !Number.isFinite(body.price) ||
                body.price < 0
            ) {
                throw new Error("Մուտքագրեք ճիշտ գին։");
            }

            if (!/^\+?[0-9]{8,15}$/.test(body.phone)) {
                throw new Error("Հեռախոսահամարը սխալ է։");
            }

            if (body.images.length === 0 || body.images.length > 12) {
                throw new Error("Ավելացրեք 1–12 նկարի հղում։");
            }

            for (const image of body.images) {
                let url;

                try {
                    url = new URL(image);
                } catch {
                    throw new Error(
                        "Նկարների հղումները պետք է լինեն ճիշտ HTTP/HTTPS հասցեներ։",
                    );
                }

                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error(
                        "Նկարների հղումները պետք է սկսվեն http:// կամ https://։",
                    );
                }
            }

            if (form.type === "car") {
                Object.assign(body, {
                    vehicleType: form.vehicleType,
                    brand: form.brand.trim(),
                    model: form.model.trim(),
                    year: Number(form.year),
                    mileage: Number(form.mileage),
                    fuel: form.fuel,
                    steering: form.steering,
                    color: form.color.trim(),
                    vin: form.vin.trim(),
                });

                if (!body.brand || !body.model || !body.color) {
                    throw new Error(
                        "Լրացրեք մեքենայի մակնիշը, մոդելը և գույնը։",
                    );
                }

                if (
                    form.year.trim() === "" ||
                    !Number.isInteger(body.year) ||
                    body.year < 1886 ||
                    body.year > new Date().getFullYear() + 1
                ) {
                    throw new Error("Մուտքագրեք ճիշտ տարեթիվ։");
                }

                if (
                    form.mileage.trim() === "" ||
                    !Number.isFinite(body.mileage) ||
                    body.mileage < 0
                ) {
                    throw new Error("Մուտքագրեք ճիշտ վազք։");
                }
            }

            await apiRequest("/products", {
                method: "POST",
                body: JSON.stringify(body),
            });

            setSuccess("Հայտարարությունը հաջողությամբ պահպանվեց։");

            setForm({ ...INITIAL_FORM });
        } catch (err) {
            if (err.status === 401) {
                window.location.assign("/login?next=/add-product");
                return;
            }

            setError(err.message || "Տեղի ունեցավ սխալ։");
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <>
                <Header />

                <main className="auth-required-page">
                    <a href="/" className="auth-required-back">
                        ← Գլխավոր էջ
                    </a>

                    <section className="auth-required-card">
                        {/* <div className="auth-required-icon">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <rect
                                    x="4"
                                    y="10"
                                    width="16"
                                    height="11"
                                    rx="3"
                                />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            </svg>
                        </div> */}

                        <h2>
                            Մուտք գործեք կամ ստեղծեք հաշիվ՝ Ձեր մեքենան կամ
                            պահեստամասը վաճառքի տեղադրելու համար։
                        </h2>

                        {/* <p className="auth-required-description">
                          
                        </p> */}

                        <div className="auth-required-actions">
                            <a
                                href="/login?next=/add-product"
                                className="auth-required-login"
                            >
                                Մուտք գործել →
                            </a>

                            <a
                                href="/registration?next=/add-product"
                                className="auth-required-register"
                            >
                                Ստեղծել հաշիվ
                            </a>
                        </div>

                        <div className="auth-required-footer">
                            Հայտարարություն տեղադրելու համար անհրաժեշտ է հաշիվ և
                            կապի հեռախոսահամար։
                        </div>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="form-page">
                <a href="/">← Գլխավոր էջ</a>

                <form className="site-form" onSubmit={handleSubmit}>
                    <h1>Տեղադրել հայտարարություն</h1>

                    <label>
                        Բաժին
                        <select
                            name="type"
                            value={form.type}
                            onChange={changeField}
                            disabled={loading}
                        >
                            <option value="car">Մեքենա</option>
                            <option value="part">Ավտոպահեստամաս</option>
                        </select>
                    </label>

                    <label>
                        Վերնագիր
                        <input
                            type="text"
                            name="title"
                            placeholder="Օրինակ՝ Toyota Camry 2019"
                            value={form.title}
                            onChange={changeField}
                            minLength={2}
                            maxLength={120}
                            disabled={loading}
                            required
                        />
                    </label>

                    <label>
                        Գին՝ {currency}
                        <input
                            type="number"
                            name="price"
                            min="0"
                            step="any"
                            placeholder="Օրինակ՝ 22800"
                            value={form.price}
                            onChange={changeField}
                            disabled={loading}
                            required
                        />
                    </label>

                    {form.type === "car" && (
                        <>
                            <label>
                                Մեքենայի տեսակ
                                <select
                                    name="vehicleType"
                                    value={form.vehicleType}
                                    onChange={changeField}
                                    disabled={loading}
                                >
                                    <option value="passenger">Մարդատար</option>
                                    <option value="truck">Բեռնատար</option>
                                </select>
                            </label>

                            {[
                                ["brand", "Մակնիշ", "Օրինակ՝ Toyota"],
                                ["model", "Մոդել", "Օրինակ՝ Camry"],
                                ["color", "Գույն", "Օրինակ՝ Սպիտակ"],
                            ].map(([name, label, placeholder]) => (
                                <label key={name}>
                                    {label}
                                    <input
                                        type="text"
                                        name={name}
                                        placeholder={placeholder}
                                        value={form[name]}
                                        onChange={changeField}
                                        maxLength={name === "color" ? 40 : 60}
                                        disabled={loading}
                                        required
                                    />
                                </label>
                            ))}

                            <label>
                                Տարեթիվ
                                <input
                                    type="number"
                                    name="year"
                                    min="1886"
                                    max={new Date().getFullYear() + 1}
                                    step="1"
                                    placeholder="Օրինակ՝ 2020"
                                    value={form.year}
                                    onChange={changeField}
                                    disabled={loading}
                                    required
                                />
                            </label>

                            <label>
                                Վազք՝ կմ
                                <input
                                    type="number"
                                    name="mileage"
                                    min="0"
                                    placeholder="Օրինակ՝ 70000"
                                    value={form.mileage}
                                    onChange={changeField}
                                    disabled={loading}
                                    required
                                />
                            </label>

                            <label>
                                Վառելիք
                                <select
                                    name="fuel"
                                    value={form.fuel}
                                    onChange={changeField}
                                    disabled={loading}
                                >
                                    {FUELS.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Ղեկ
                                <select
                                    name="steering"
                                    value={form.steering}
                                    onChange={changeField}
                                    disabled={loading}
                                >
                                    <option value="left">Ձախ</option>
                                    <option value="right">Աջ</option>
                                </select>
                            </label>

                            <label>
                                VIN՝ ոչ պարտադիր
                                <input
                                    type="text"
                                    name="vin"
                                    value={form.vin}
                                    onChange={changeField}
                                    maxLength={17}
                                    disabled={loading}
                                />
                            </label>
                        </>
                    )}

                    <label>
                        Տարածաշրջան
                        <select
                            name="region"
                            value={form.region}
                            onChange={changeField}
                            disabled={loading}
                            required
                        >
                            <option value="">Ընտրեք տարածաշրջանը</option>

                            {REGIONS.map((region) => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Վիճակ
                        <select
                            name="condition"
                            value={form.condition}
                            onChange={changeField}
                            disabled={loading}
                        >
                            <option value="Օգտագործված">Օգտագործված</option>
                            <option value="Նոր">Նոր</option>
                        </select>
                    </label>

                    <label>
                        Կապի հեռախոսահամար
                        <input
                            type="tel"
                            name="phone"
                            placeholder="+374..."
                            autoComplete="tel"
                            value={form.phone}
                            onChange={changeField}
                            disabled={loading}
                            required
                        />
                    </label>

                    <label>
                        Նկարների հղումներ՝ յուրաքանչյուրն առանձին տողով
                        <textarea
                            name="images"
                            placeholder="https://..."
                            value={form.images}
                            onChange={changeField}
                            rows={4}
                            disabled={loading}
                            required
                        />
                    </label>

                    <label>
                        Նկարագրություն
                        <textarea
                            name="description"
                            placeholder="Նկարագրեք մեքենան կամ պահեստամասը..."
                            value={form.description}
                            onChange={changeField}
                            maxLength={5000}
                            rows={5}
                            disabled={loading}
                            required
                        />
                    </label>

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="form-success" role="status">
                            {success}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Պահպանվում է..." : "Տեղադրել"}
                    </button>
                </form>
            </main>
        </>
    );
}
