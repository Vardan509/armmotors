import { useState } from "react";

import Header from "../components/header/Header";
import GoogleSignIn from "../components/GoogleSignIn";
import ListingPromotion from "../components/monetization/ListingPromotion";

import useRemote from "../utils/useRemote";
import useCurrency from "../utils/useCurrency";
import { apiRequest } from "../utils/api";

import "./Account.css";

const BASE = import.meta.env.BASE_URL;

const LABELS = {
    active: "Ակտիվ",
    draft: "Սևագիր",
    sold: "Վաճառված",
};

export default function AccountPage() {
    const [revision, setRevision] = useState(0);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    const me = useRemote("/auth/me");
    const listings = useRemote("/products/mine", revision);
    const orders = useRemote("/orders", revision);

    const { format } = useCurrency();

    const items = Array.isArray(listings.data) ? listings.data : [];

    const activeCount = items.filter((item) => item.status === "active").length;

    const soldCount = items.filter((item) => item.status === "sold").length;

    const totalViews = items.reduce(
        (sum, item) => sum + Number(item.views || 0),
        0,
    );

    async function changeListing(id, data) {
        setBusy(id);
        setError("");

        try {
            await apiRequest(`/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });

            setRevision((old) => old + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    async function deleteListing(id) {
        const confirmed = window.confirm(
            "Վստա՞հ եք, որ ցանկանում եք ջնջել հայտարարությունը։",
        );

        if (!confirmed) return;

        setBusy(id);
        setError("");

        try {
            await apiRequest(`/products/${id}`, {
                method: "DELETE",
            });

            setRevision((old) => old + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    async function cancelOrder(id) {
        setBusy(id);
        setError("");

        try {
            await apiRequest(`/orders/${id}/cancel`, {
                method: "PATCH",
            });

            setRevision((old) => old + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    return (
        <>
            <Header />

            <main className="account-page">
                <div className="account-heading">
                    <div>
                        <span className="account-eyebrow">
                            ARMMOTORS ACCOUNT
                        </span>

                        <h1>Անձնական էջ</h1>

                        <p>
                            Կառավարեք Ձեր հայտարարությունները, տեսանելիությունը
                            և վճարումները։
                        </p>
                    </div>

                    <div className="account-heading-actions">
                        <a
                            className="account-money-link"
                            href={`${BASE}monetization`}
                        >
                            ★ Փաթեթներ
                        </a>

                        <a
                            className="account-add-link"
                            href={`${BASE}add-product`}
                        >
                            + Տեղադրել հայտարարություն
                        </a>
                    </div>
                </div>

                {me.loading ? (
                    <p className="account-loading">Հաշիվը բեռնվում է...</p>
                ) : me.error || !me.data ? (
                    <div className="account-empty">
                        <h2>Մուտք գործեք Ձեր հաշիվ</h2>

                        <p>
                            {me.error ||
                                "Մուտք գործեք Ձեր հայտարարությունները կառավարելու համար։"}
                        </p>

                        <a href={`${BASE}login?next=/account`}>Մուտք</a>
                    </div>
                ) : (
                    <>
                        {/* PROFILE */}

                        <section className="account-profile">
                            <div className="account-avatar">
                                {me.data.name?.[0]?.toUpperCase() || "U"}
                            </div>

                            <div className="account-profile-info">
                                <h2>
                                    {me.data.name} {me.data.surname}
                                </h2>

                                <p>{me.data.email}</p>

                                <p>
                                    {me.data.phone || "Հեռախոսահամար նշված չէ"}
                                </p>
                            </div>

                            <a href={`${BASE}favorites`}>Իմ ընտրյալները</a>
                        </section>

                        {/* STATS */}

                        <section className="account-statistics">
                            {[
                                ["Ընդհանուր հայտարարություններ", items.length],
                                ["Ակտիվ", activeCount],
                                ["Վաճառված", soldCount],
                                ["Ընդհանուր դիտումներ", totalViews],
                            ].map(([label, value]) => (
                                <article className="account-stat" key={label}>
                                    <span>{label}</span>

                                    <strong>
                                        {Number(value).toLocaleString("en-US")}
                                    </strong>
                                </article>
                            ))}
                        </section>

                        {/* MY LISTINGS */}

                        <section className="account-section">
                            <div className="account-section-head">
                                <div>
                                    <span className="account-eyebrow">
                                        MY LISTINGS
                                    </span>

                                    <h2>Իմ հայտարարությունները</h2>
                                </div>

                                <a href={`${BASE}add-product`}>+ Ավելացնել</a>
                            </div>

                            {error && (
                                <p className="account-error" role="alert">
                                    {error}
                                </p>
                            )}

                            {listings.loading ? (
                                <p className="account-loading">
                                    Հայտարարությունները բեռնվում են...
                                </p>
                            ) : listings.error ? (
                                <p className="account-error">
                                    {listings.error}
                                </p>
                            ) : items.length === 0 ? (
                                <div className="account-empty">
                                    <h3>Դեռ հայտարարություններ չունեք</h3>

                                    <p>Տեղադրեք Ձեր առաջին հայտարարությունը։</p>

                                    <a href={`${BASE}add-product`}>
                                        Տեղադրել հայտարարություն
                                    </a>
                                </div>
                            ) : (
                                <div className="account-listings">
                                    {items.map((product) => {
                                        const id = product._id || product.id;

                                        const topActive =
                                            product.topUntil &&
                                            new Date(
                                                product.topUntil,
                                            ).getTime() > Date.now();

                                        return (
                                            <article
                                                className="account-listing"
                                                key={id}
                                            >
                                                <div className="account-listing-main">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            className="account-listing-image"
                                                            src={
                                                                product
                                                                    .images[0]
                                                            }
                                                            alt={product.title}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="account-listing-placeholder">
                                                            Նկար չկա
                                                        </div>
                                                    )}

                                                    <div className="account-listing-info">
                                                        <h3>{product.title}</h3>

                                                        <p>
                                                            {format(
                                                                product.price,
                                                                product.currency ||
                                                                    "AMD",
                                                            )}
                                                        </p>

                                                        <span
                                                            className={`account-status account-status-${product.status}`}
                                                        >
                                                            {product.paymentPending
                                                                ? "Վճարման սպասող"
                                                                : LABELS[
                                                                      product
                                                                          .status
                                                                  ] ||
                                                                  product.status}
                                                        </span>

                                                        {topActive && (
                                                            <span className="account-top-label">
                                                                ★ TOP
                                                            </span>
                                                        )}

                                                        <small>
                                                            Դիտումներ՝{" "}
                                                            {product.views || 0}
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* ACTION BUTTONS */}

                                                <div className="account-listing-actions">
                                                    {product.status ===
                                                        "active" && (
                                                        <a
                                                            href={`${BASE}cars/${id}`}
                                                        >
                                                            Դիտել
                                                        </a>
                                                    )}

                                                    {!product.paymentPending && (
                                                        <a
                                                            href={`${BASE}add-product?edit=${encodeURIComponent(
                                                                id,
                                                            )}`}
                                                            style={{
                                                                borderColor:
                                                                    "#d9b979",
                                                                background:
                                                                    "#fff8e9",
                                                                color: "#8d6728",
                                                            }}
                                                        >
                                                            Խմբագրել
                                                            ամբողջությամբ
                                                        </a>
                                                    )}

                                                    {product.status !==
                                                        "sold" &&
                                                        !product.paymentPending && (
                                                            <button
                                                                type="button"
                                                                disabled={Boolean(
                                                                    busy,
                                                                )}
                                                                onClick={() =>
                                                                    changeListing(
                                                                        id,
                                                                        {
                                                                            status: "sold",
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                Նշել վաճառված
                                                            </button>
                                                        )}

                                                    <button
                                                        type="button"
                                                        className="account-danger"
                                                        disabled={Boolean(busy)}
                                                        onClick={() =>
                                                            deleteListing(id)
                                                        }
                                                    >
                                                        Ջնջել
                                                    </button>
                                                </div>

                                                {/* PAYMENT NOTICE */}

                                                {product.paymentPending && (
                                                    <p className="money-pending-article">
                                                        Հրապարակման վճար՝ 100 ֏։{" "}
                                                        <a
                                                            href={`${BASE}monetization`}
                                                        >
                                                            Դիտել վճարումը
                                                        </a>
                                                    </p>
                                                )}

                                                {/* TOP / REFRESH */}

                                                <ListingPromotion
                                                    product={product}
                                                />
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* ORDERS */}

                        <section className="account-section">
                            <div className="account-section-head">
                                <h2>Իմ գնման հայտերը</h2>
                            </div>

                            {orders.error && (
                                <p className="account-error">{orders.error}</p>
                            )}

                            <div className="account-orders">
                                {Array.isArray(orders.data) &&
                                    orders.data.map((order) => (
                                        <article
                                            className="account-order"
                                            key={order._id}
                                        >
                                            <div>
                                                <h3>{order.title}</h3>

                                                <p>{format(order.amount)}</p>

                                                <small>
                                                    {order.status === "pending"
                                                        ? "Սպասում է"
                                                        : order.status ===
                                                            "completed"
                                                          ? "Հաստատված"
                                                          : "Չեղարկված"}
                                                </small>
                                            </div>

                                            {order.status === "pending" && (
                                                <button
                                                    type="button"
                                                    disabled={Boolean(busy)}
                                                    onClick={() =>
                                                        cancelOrder(order._id)
                                                    }
                                                >
                                                    Չեղարկել
                                                </button>
                                            )}
                                        </article>
                                    ))}

                                {Array.isArray(orders.data) &&
                                    orders.data.length === 0 && (
                                        <p>Գնման հայտեր դեռ չկան։</p>
                                    )}
                            </div>
                        </section>

                        {/* GOOGLE ACCOUNT */}

                        <section className="account-section">
                            <h2>Google հաշիվ</h2>

                            <p>Կարող եք կապակցել Ձեր Google հաշիվը։</p>

                            <GoogleSignIn link />
                        </section>
                    </>
                )}
            </main>
        </>
    );
}
