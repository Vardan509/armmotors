import { useState } from "react";
import { apiRequest } from "../../utils/api";
import "./ListingPromotion.css";

const BASE = import.meta.env.BASE_URL;

const PLANS = {
    top7: {
        title: "TOP՝ 7 օր",
        price: 200,
        benefits: [
            "Ոսկեգույն TOP նշան մեքենայի նկարին",
            "Հայտարարությունը սովորականներից վերև",
            "Ավելի նկատելի քարտ՝ 7 օր",
        ],
    },
    top30: {
        title: "TOP՝ 30 օր",
        price: 600,
        benefits: [
            "Ոսկեգույն TOP նշան",
            "Ցուցակի առաջին հատվածում առաջնահերթություն",
            "Առավելություններ՝ 30 ամբողջ օր",
        ],
    },
    auto7: {
        title: "Ավտոթարմացում՝ 7 օր",
        price: 100,
        benefits: [
            "Ամեն օր նորացված հայտարարություն",
            "Բարձրացում նորացվածների ցուցակում",
            "7 օրվա գործողություն",
        ],
    },
};

export default function ListingPromotion({ product }) {
    const [busy, setBusy] = useState("");
    const [selected, setSelected] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!product?._id || product.status !== "active") {
        return null;
    }

    const topActive =
        product.topUntil && new Date(product.topUntil).getTime() > Date.now();

    const plan = PLANS[selected];

    async function send(kind) {
        try {
            setBusy(kind);
            setMessage("");
            setError("");

            if (kind === "refresh") {
                await apiRequest(
                    `/monetization/products/${product._id}/refresh`,
                    { method: "POST" },
                );

                setMessage("Հայտարարությունը թարմացվեց։");
            } else {
                await apiRequest(
                    `/monetization/products/${product._id}/upgrade`,
                    {
                        method: "POST",
                        body: JSON.stringify({ kind }),
                    },
                );

                setMessage(
                    "Վճարման հայտը ստեղծվեց։ Այն կակտիվանա ադմինի հաստատումից հետո։",
                );

                setSelected("");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    return (
        <section
            className="listing-promotion"
            aria-label="Հայտարարության խթանում"
        >
            <div className="listing-promotion-heading">
                <b>
                    {topActive
                        ? "★ TOP ակտիվ"
                        : "Թարմացրեք Հայտարարությունը"}
                </b>

                <a href={`${BASE}monetization`}>Բոլոր պայմանները ↗</a>
            </div>

            <div className="listing-promotion-buttons">
                <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => send("refresh")}
                >
                    ↻ Թարմացնել (4 օրը մեկ)
                </button>

                <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => setSelected("top7")}
                >
                    ★ TOP՝ 7 օր · 200 ֏
                </button>

                <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => setSelected("top30")}
                >
                    ★ TOP՝ 30 օր · 600 ֏
                </button>

                <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => setSelected("auto7")}
                >
                    ↻ Ամեն օր՝ 7 օր · 100 ֏
                </button>
            </div>

            {message && <p className="listing-promotion-message">{message}</p>}

            {error && (
                <p className="listing-promotion-error" role="alert">
                    {error}
                </p>
            )}

            {plan && (
                <div
                    className="promotion-modal-overlay"
                    onClick={() => setSelected("")}
                >
                    <div
                        className="promotion-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={plan.title}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="promotion-close"
                            type="button"
                            onClick={() => setSelected("")}
                            aria-label="Փակել"
                        >
                            ×
                        </button>

                        <span className="promotion-eyebrow">
                            ARMMOTORS PREMIUM
                        </span>

                        <h3>{plan.title}</h3>

                        <strong className="promotion-price">
                            {plan.price} ֏
                        </strong>

                        <ul>
                            {plan.benefits.map((benefit) => (
                                <li key={benefit}>{benefit}</li>
                            ))}
                        </ul>

                        <p>
                            Ստեղծվելու է վճարման հայտ։ Գումարի ավտոմատ գանձում
                            դեռ միացված չէ։ Ակտիվացումը կատարում է ադմինը՝
                            վճարումը ստուգելուց հետո։
                        </p>

                        <div className="promotion-modal-actions">
                            <button
                                type="button"
                                onClick={() => setSelected("")}
                            >
                                Չեղարկել
                            </button>

                            <button
                                type="button"
                                disabled={Boolean(busy)}
                                onClick={() => send(selected)}
                            >
                                Ստեղծել հայտ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
