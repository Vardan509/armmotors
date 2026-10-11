import { useState } from "react";
import Header from "../components/header/Header";
import GoogleSignIn from "../components/GoogleSignIn";
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
    const [error, setError] = useState("");
    const [busy, setBusy] = useState("");
    const [editing, setEditing] = useState(null);

    const me = useRemote("/auth/me");
    const orders = useRemote("/orders", revision);
    const listings = useRemote("/products/mine", revision);

    const { format } = useCurrency();

    async function changeListing(id, data) {
        setBusy(id);
        setError("");

        try {
            await apiRequest(`/products/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });

            setEditing(null);
            setRevision((n) => n + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    async function deleteListing(id) {
        if (
            !window.confirm("Վստա՞հ եք, որ ուզում եք ջնջել հայտարարությունը։")
        ) {
            return;
        }

        setBusy(id);
        setError("");

        try {
            await apiRequest(`/products/${id}`, {
                method: "DELETE",
            });

            setRevision((n) => n + 1);
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

            setRevision((n) => n + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    const items = listings.data || [];

    const totalViews = items.reduce(
        (sum, product) => sum + (product.views || 0),
        0,
    );

    return (
        <>
            <Header />

            <main className="account-page">
                <div className="account-heading">
                    <div>
                        <span className="account-eyebrow">ARMMOTORS</span>

                        <h1>Անձնական Էջ</h1>

                        <p>
                            Կառավարեք ձեր հայտարարությունները և հետևեք դրանց
                            վիճակագրությանը։
                        </p>
                    </div>

                    <a className="account-add-link" href={`${BASE}add-product`}>
                        + Տեղադրել հայտարարություն
                    </a>
                </div>

                {me.loading ? (
                    <p>Բեռնվում է...</p>
                ) : me.error ? (
                    <div className="account-empty">
                        <p>{me.error}</p>

                        <a href={`${BASE}login?next=/account`}>Մուտք գործել</a>
                    </div>
                ) : (
                    <>
                        <section className="account-profile">
                            <div className="account-avatar">
                                {me.data.name?.[0]?.toUpperCase() || "U"}
                            </div>

                            <div>
                                <h2>
                                    {me.data.name} {me.data.surname}
                                </h2>

                                <p>{me.data.email}</p>

                                <p>
                                    {me.data.phone || "Հեռախոսահամար նշված չէ"}
                                </p>
                            </div>

                            <a href={`${BASE}favorites`}>Իմ Հավանածները</a>
                        </section>

                        <section className="account-statistics">
                            <div className="account-stat">
                                <span>Ընդհանուր հայտարարություններ</span>
                                <strong>{items.length}</strong>
                            </div>

                            <div className="account-stat">
                                <span>Ակտիվ հայտարարություններ</span>
                                <strong>
                                    {
                                        items.filter(
                                            (p) => p.status === "active",
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="account-stat">
                                <span>Վաճառված մեքենաներ</span>
                                <strong>
                                    {
                                        items.filter((p) => p.status === "sold")
                                            .length
                                    }
                                </strong>
                            </div>

                            <div className="account-stat">
                                <span>Ընդհանուր դիտումներ</span>
                                <strong>{totalViews}</strong>
                            </div>
                        </section>

                        <section className="account-section">
                            <div className="account-section-head">
                                <h2>Իմ հայտարարությունները</h2>

                                <a href={`${BASE}add-product`}>+ Ավելացնել</a>
                            </div>

                            {error && (
                                <p className="account-error" role="alert">
                                    {error}
                                </p>
                            )}

                            {listings.loading ? (
                                <p>Հայտարարությունները բեռնվում են...</p>
                            ) : listings.error ? (
                                <p className="account-error">
                                    {listings.error}
                                </p>
                            ) : items.length === 0 ? (
                                <div className="account-empty">
                                    <h3>Դեռ հայտարարություններ չունեք</h3>

                                    <p>
                                        Ավելացրեք ձեր առաջին մեքենան կամ
                                        պահեստամասը։
                                    </p>

                                    <a href={`${BASE}add-product`}>
                                        Ավելացնել հայտարարություն
                                    </a>
                                </div>
                            ) : (
                                <div className="account-listings">
                                    {items.map((product) => (
                                        <article
                                            className="account-listing"
                                            key={product._id}
                                        >
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.title}
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
                                                    {LABELS[product.status] ||
                                                        product.status}
                                                </span>

                                                <small>
                                                    Դիտումներ՝{" "}
                                                    {product.views || 0}
                                                </small>

                                                {editing?._id ===
                                                    product._id && (
                                                    <form
                                                        className="account-edit-form"
                                                        onSubmit={(e) => {
                                                            e.preventDefault();

                                                            changeListing(
                                                                product._id,
                                                                {
                                                                    price: Number(
                                                                        editing.price,
                                                                    ),
                                                                    status: editing.status,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        <label>
                                                            Գին
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                required
                                                                value={
                                                                    editing.price
                                                                }
                                                                onChange={(e) =>
                                                                    setEditing({
                                                                        ...editing,
                                                                        price: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                }
                                                            />
                                                        </label>

                                                        <label>
                                                            Կարգավիճակ
                                                            <select
                                                                value={
                                                                    editing.status
                                                                }
                                                                onChange={(e) =>
                                                                    setEditing({
                                                                        ...editing,
                                                                        status: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                }
                                                            >
                                                                <option value="active">
                                                                    Ակտիվ
                                                                </option>
                                                                <option value="draft">
                                                                    Սևագիր
                                                                </option>
                                                                <option value="sold">
                                                                    Վաճառված
                                                                </option>
                                                            </select>
                                                        </label>

                                                        <button
                                                            disabled={Boolean(
                                                                busy,
                                                            )}
                                                        >
                                                            Պահպանել
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditing(null)
                                                            }
                                                        >
                                                            Չեղարկել
                                                        </button>
                                                    </form>
                                                )}
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

                                                {product.status !== "sold" && (
                                                    <button
                                                        disabled={Boolean(busy)}
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
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="account-section">
                            <h2>Իմ գնման հայտերը</h2>

                            {orders.error && (
                                <p className="account-error">{orders.error}</p>
                            )}

                            <div className="account-orders">
                                {orders.data?.map((order) => (
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

                                {orders.data?.length === 0 && (
                                    <p>Գնման հայտեր դեռ չկան։</p>
                                )}
                            </div>
                        </section>

                        <section className="account-section">
                            <h2>Google հաշիվ</h2>
                            <p>Կարող եք կապակցել ձեր Google հաշիվը։</p>
                            <GoogleSignIn link />
                        </section>
                    </>
                )}
            </main>
        </>
    );
}
