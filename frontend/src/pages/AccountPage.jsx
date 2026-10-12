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
    const [editing, setEditing] = useState(null);

    const me = useRemote("/auth/me");
    const listings = useRemote("/products/mine", revision);
    const orders = useRemote("/orders", revision);

    const { format } = useCurrency();

    const items = Array.isArray(listings.data) ? listings.data : [];

    const totalViews = items.reduce(
        (sum, item) => sum + Number(item.views || 0),
        0,
    );

    const activeCount = items.filter((item) => item.status === "active").length;

    const soldCount = items.filter((item) => item.status === "sold").length;

    async function changeListing(id, data) {
        setBusy(id);
        setError("");

        try {
            await apiRequest(`/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });

            setEditing(null);
            setRevision((value) => value + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    async function deleteListing(id) {
        if (
            !window.confirm(
                "Վստա՞հ եք, որ ցանկանում եք ջնջել հայտարարությունը։",
            )
        ) {
            return;
        }

        setBusy(id);
        setError("");

        try {
            await apiRequest(`/products/${id}`, {
                method: "DELETE",
            });

            setRevision((value) => value + 1);
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

            setRevision((value) => value + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    function renderEditForm(product) {
        if (editing?._id !== product._id) {
            return null;
        }

        return (
            <form
                className="account-edit-form"
                onSubmit={(event) => {
                    event.preventDefault();

                    void changeListing(product._id, {
                        price: Number(editing.price),
                        status: editing.status,
                    });
                }}
            >
                <label>
                    Գին
                    <input
                        type="number"
                        min="0"
                        required
                        value={editing.price}
                        onChange={(event) =>
                            setEditing({
                                ...editing,
                                price: event.target.value,
                            })
                        }
                    />
                </label>

                <label>
                    Կարգավիճակ
                    <select
                        value={editing.status}
                        onChange={(event) =>
                            setEditing({
                                ...editing,
                                status: event.target.value,
                            })
                        }
                    >
                        <option value="active">Ակտիվ</option>
                        <option value="draft">Սևագիր</option>
                        <option value="sold">Վաճառված</option>
                    </select>
                </label>

                <button
                    type="submit"
                    disabled={
                        Boolean(busy) ||
                        !Number.isFinite(Number(editing.price)) ||
                        Number(editing.price) < 0
                    }
                >
                    Պահպանել
                </button>

                <button
                    type="button"
                    onClick={() => setEditing(null)}
                    disabled={Boolean(busy)}
                >
                    Չեղարկել
                </button>
            </form>
        );
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
                            Կառավարեք հայտարարությունները, վճարումները և
                            դիտումների վիճակագրությունը։
                        </p>
                    </div>

                    <div className="account-heading-actions">
                        <a
                            className="account-money-link"
                            href={`${BASE}monetization`}
                        >
                            ★ ՊՐԵՄԻՈՒՄ
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
                                "Անձնական էջը դիտելու համար անհրաժեշտ է մուտք գործել։"}
                        </p>

                        <a href={`${BASE}login?next=/account`}>Մուտք գործել</a>
                    </div>
                ) : (
                    <>
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

                        <section className="account-statistics">
                            {[
                                ["Ընդհանուր հայտարարություններ", items.length],
                                ["Ակտիվ հայտարարություններ", activeCount],
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
                            ) : !items.length ? (
                                <div className="account-empty">
                                    <h3>Դեռ հայտարարություններ չունեք</h3>

                                    <p>
                                        Տեղադրեք Ձեր առաջին մեքենան կամ
                                        պահեստամասը։
                                    </p>

                                    <a href={`${BASE}add-product`}>
                                        Տեղադրել հայտարարություն
                                    </a>
                                </div>
                            ) : (
                                <div className="account-listings">
                                    {items.map((product) => (
                                        <article
                                            className="account-listing"
                                            key={product._id}
                                        >
                                            <div className="account-listing-main">
                                                {product.images?.[0] ? (
                                                    <img
                                                        className="account-listing-image"
                                                        src={product.images[0]}
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
                                                                  product.status
                                                              ] ||
                                                              product.status}
                                                    </span>

                                                    {product.topUntil &&
                                                        new Date(
                                                            product.topUntil,
                                                        ) > new Date() && (
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

                                            <div className="account-listing-actions">
                                                {product.status ===
                                                    "active" && (
                                                    <a
                                                        href={`${BASE}cars/${product._id}`}
                                                    >
                                                        Դիտել
                                                    </a>
                                                )}

                                                <button
                                                    type="button"
                                                    disabled={Boolean(busy)}
                                                    onClick={() =>
                                                        setEditing({
                                                            _id: product._id,
                                                            price: product.price,
                                                            status: product.status,
                                                        })
                                                    }
                                                >
                                                    Խմբագրել
                                                </button>

                                                {product.status !== "sold" &&
                                                    !product.paymentPending && (
                                                        <button
                                                            type="button"
                                                            disabled={Boolean(
                                                                busy,
                                                            )}
                                                            onClick={() =>
                                                                changeListing(
                                                                    product._id,
                                                                    {
                                                                        status: "sold",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Վաճառված
                                                        </button>
                                                    )}

                                                <button
                                                    type="button"
                                                    className="account-danger"
                                                    disabled={Boolean(busy)}
                                                    onClick={() =>
                                                        deleteListing(
                                                            product._id,
                                                        )
                                                    }
                                                >
                                                    Ջնջել
                                                </button>
                                            </div>

                                            {renderEditForm(product)}

                                            {product.paymentPending && (
                                                <p className="money-pending-article">
                                                    Հրապարակման վճար՝ 100 ֏։{" "}
                                                    <a
                                                        href={`${BASE}monetization`}
                                                    >
                                                        Դիտել հայտը
                                                    </a>
                                                </p>
                                            )}

                                            <ListingPromotion
                                                product={product}
                                            />
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

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
                                                    Չեղարկել հայտը
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
