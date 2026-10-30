import { useState } from "react";
import useRemote from "../utils/useRemote";
import useCurrency from "../utils/useCurrency";
import { apiRequest } from "../utils/api";
import ListingPromotion from "../components/monetization/ListingPromotion";
import AccountBroadcasts from "../components/notifications/AccountBroadcasts";
import "./Account.css";

const BASE = import.meta.env.BASE_URL;

const LABELS = {
    active: "Ակտիվ",
    draft: "Սևագիր",
    sold: "Վաճառված",
};

function Icon({ name, size = 20 }) {
    const paths = {
        plus: <path d="M12 5v14M5 12h14" />,
        heart: (
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        ),
        car: (
            <>
                <path d="m5 11 1.5-5h11L19 11" />
                <path d="M4 11h16v8H4zM7 19v2m10-2v2M7 15h2m6 0h2" />
            </>
        ),
        check: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 3 3 5-6" />
            </>
        ),
        sold: (
            <>
                <path d="M4 7h16v13H4zM8 7V4h8v3M4 12h16" />
                <path d="m10 16 2 2 3-4" />
            </>
        ),
        eye: (
            <>
                <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
        edit: (
            <>
                <path d="m4 16 11-11 4 4-11 11-5 1zM13 7l4 4" />
            </>
        ),
        trash: (
            <>
                <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
            </>
        ),
        mail: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 7 9-7" />
            </>
        ),
        phone: (
            <path d="M6 3h4l1 5-2 2a16 16 0 0 0 5 5l2-2 5 1v4c0 2-2 3-4 3C9 21 3 15 3 7c0-2 1-4 3-4Z" />
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        star: (
            <path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1z" />
        ),
        external: (
            <>
                <path d="M13 4h7v7M20 4l-10 10" />
                <path d="M20 14v6H4V4h6" />
            </>
        ),
        document: (
            <>
                <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h7" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name] || paths.document}
        </svg>
    );
}

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

    const items = Array.isArray(listings.data) ? listings.data : [];
    const orderItems = Array.isArray(orders.data) ? orders.data : [];

    const totalViews = items.reduce(
        (sum, product) => sum + (Number(product.views) || 0),
        0,
    );

    const activeCount = items.filter(
        (product) => product.status === "active",
    ).length;

    const soldCount = items.filter(
        (product) => product.status === "sold",
    ).length;

    const statistics = [
        {
            title: "Ընդհանուր հայտարարություններ",
            value: items.length,
            icon: "car",
            color: "blue",
        },
        {
            title: "Ակտիվ հայտարարություններ",
            value: activeCount,
            icon: "check",
            color: "green",
        },
        {
            title: "Վաճառված մեքենաներ",
            value: soldCount,
            icon: "sold",
            color: "purple",
        },
        {
            title: "Ընդհանուր դիտումներ",
            value: totalViews,
            icon: "eye",
            color: "orange",
        },
    ];

    return (
        <main className="account-page">
            <div className="account-container">
                <div className="account-heading">
                    <div className="account-heading-copy">
                        <span className="account-eyebrow">
                            ARMMOTORS / MY ACCOUNT
                        </span>

                        <h1>Անձնական էջ</h1>

                        <p>
                            Կառավարեք ձեր հայտարարությունները, հետևեք
                            վիճակագրությանը և գնման հայտերին։
                        </p>
                    </div>

                    <div className="account-heading-actions">
                        <a
                            className="account-money-link"
                            href={`${BASE}monetization`}
                        >
                            <Icon name="star" size={17} />
                            Առաջխաղացում
                        </a>


                    </div>
                </div>

                {me.loading ? (
                    <div className="account-loading">
                        Բեռնվում է ձեր անձնական էջը...
                    </div>
                ) : me.error || !me.data ? (
                    <div className="account-empty account-login-empty">
                        <div className="account-empty-icon">
                            <Icon name="document" size={27} />
                        </div>

                        <h2>Մուտք գործեք ձեր հաշիվ</h2>

                        <p>
                            {me.error ||
                                "Հայտարարությունները կառավարելու համար մուտք գործեք։"}
                        </p>

                        <a
                            className="account-add-link"
                            href={`${BASE}login?next=/account`}
                        >
                            Մուտք գործել
                            <Icon name="arrow" size={17} />
                        </a>
                    </div>
                ) : (
                    <>
                        <section className="account-profile">
                            <div className="account-profile-main">
                                <div className="account-avatar">
                                    {me.data.name?.[0]?.toUpperCase() || "U"}
                                </div>

                                <div className="account-profile-info">
                                    <span className="account-profile-label">
                                        ԻՄ ՊՐՈՖԻԼԸ
                                    </span>

                                    <h2>
                                        {me.data.name} {me.data.surname}
                                    </h2>

                                    <div className="account-profile-details">
                                        <span>
                                            <Icon name="mail" size={15} />
                                            {me.data.email}
                                        </span>

                                        <span>
                                            <Icon name="phone" size={15} />
                                            {me.data.phone ||
                                                "Հեռախոսահամար նշված չէ"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="account-profile-actions">
                                <a
                                    href={`${BASE}favorites`}
                                    className="account-favorites-link"
                                >
                                    <Icon name="heart" size={18} />
                                    Իմ հավանածները
                                    <Icon name="arrow" size={16} />
                                </a>
                            </div>
                        </section>

                        <section
                            className="account-statistics"
                            aria-label="Հայտարարությունների վիճակագրություն"
                        >
                            {statistics.map((stat) => (
                                <article
                                    className="account-stat"
                                    key={stat.title}
                                >
                                    <div className="account-stat-top">
                                        <span
                                            className={`account-stat-icon account-stat-icon-${stat.color}`}
                                        >
                                            <Icon name={stat.icon} size={21} />
                                        </span>

                                        <span className="account-stat-mark">
                                            ARMMOTORS
                                        </span>
                                    </div>

                                    <strong>
                                        {listings.loading
                                            ? "—"
                                            : stat.value.toLocaleString(
                                                  "hy-AM",
                                              )}
                                    </strong>

                                    <span className="account-stat-title">
                                        {stat.title}
                                    </span>
                                </article>
                            ))}
                        </section>

                        <section className="account-section">
                            <div className="account-section-head">
                                <div>
                                    <span className="account-section-kicker">
                                        MY LISTINGS
                                    </span>

                                    <h2>Իմ հայտարարությունները</h2>

                                    <p>
                                        Կառավարեք ձեր տեղադրած մեքենաներն ու
                                        պահեստամասերը։
                                    </p>
                                </div>

                                <a
                                    className="account-section-add"
                                    href={`${BASE}add-product`}
                                >
                                    <Icon name="plus" size={17} />
                                    Ավելացնել
                                </a>
                            </div>

                            {error && (
                                <p className="account-error" role="alert">
                                    {error}
                                </p>
                            )}

                            {listings.loading ? (
                                <div className="account-loading">
                                    Հայտարարությունները բեռնվում են...
                                </div>
                            ) : listings.error ? (
                                <p className="account-error">
                                    {listings.error}
                                </p>
                            ) : items.length === 0 ? (
                                <div className="account-empty">
                                    <div className="account-empty-icon">
                                        <Icon name="car" size={28} />
                                    </div>

                                    <h3>Դեռ հայտարարություններ չունեք</h3>

                                    <p>
                                        Ավելացրեք ձեր առաջին մեքենան կամ
                                        պահեստամասը։
                                    </p>

                                    <a
                                        className="account-add-link"
                                        href={`${BASE}add-product`}
                                    >
                                        <Icon name="plus" size={17} />
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
                                                        <Icon
                                                            name="car"
                                                            size={25}
                                                        />
                                                        <span>Նկար չկա</span>
                                                    </div>
                                                )}

                                                <div className="account-listing-info">
                                                    <h3>{product.title}</h3>

                                                    <p className="account-listing-price">
                                                        {format(
                                                            product.price,
                                                            product.currency ||
                                                                "AMD",
                                                        )}
                                                    </p>

                                                    <div className="account-listing-meta">
                                                        <span
                                                            className={`account-status account-status-${product.status}`}
                                                        >
                                                            {LABELS[
                                                                product.status
                                                            ] || product.status}
                                                        </span>

                                                        <small>
                                                            <Icon
                                                                name="eye"
                                                                size={14}
                                                            />
                                                            {product.views || 0}{" "}
                                                            դիտում
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            {editing?._id === product._id && (
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

                                                    <div className="account-edit-actions">
                                                        <button
                                                            type="submit"
                                                            disabled={Boolean(
                                                                busy,
                                                            )}
                                                        >
                                                            Պահպանել
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="account-cancel-btn"
                                                            onClick={() =>
                                                                setEditing(null)
                                                            }
                                                        >
                                                            Չեղարկել
                                                        </button>
                                                    </div>
                                                </form>
                                            )}

                                            <div className="account-listing-actions">
                                                {product.status ===
                                                    "active" && (
                                                    <a
                                                        href={`${BASE}cars/${product._id}`}
                                                    >
                                                        <Icon
                                                            name="eye"
                                                            size={16}
                                                        />
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
                                                    <Icon
                                                        name="edit"
                                                        size={16}
                                                    />
                                                    Խմբագրել
                                                </button>

                                                {product.status !== "sold" && (
                                                    <button
                                                        type="button"
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
                                                        <Icon
                                                            name="check"
                                                            size={16}
                                                        />
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
                                                    <Icon
                                                        name="trash"
                                                        size={16}
                                                    />
                                                    Ջնջել
                                                </button>
                                            </div>

                                            {product.paymentPending && (
                                                <p className="money-pending-article">
                                                    Վճարման սպասող
                                                    հայտարարություն՝ 100 ֏։{" "}
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
                                <div>
                                    <span className="account-section-kicker">
                                        MY ORDERS
                                    </span>

                                    <h2>Իմ գնման հայտերը</h2>

                                    <p>
                                        Ձեր կատարած հայտերի ընթացիկ
                                        կարգավիճակները։
                                    </p>
                                </div>
                            </div>

                            {orders.loading ? (
                                <div className="account-loading">
                                    Գնման հայտերը բեռնվում են...
                                </div>
                            ) : orders.error ? (
                                <p className="account-error">{orders.error}</p>
                            ) : orderItems.length === 0 ? (
                                <div className="account-empty">
                                    <div className="account-empty-icon">
                                        <Icon name="document" size={26} />
                                    </div>

                                    <h3>Գնման հայտեր դեռ չկան</h3>
                                    <p>Ձեր գնման հայտերը կհայտնվեն այստեղ։</p>
                                </div>
                            ) : (
                                <div className="account-orders">
                                    {orderItems.map((order) => (
                                        <article
                                            className="account-order"
                                            key={order._id}
                                        >
                                            <div className="account-order-info">
                                                <span className="account-order-icon">
                                                    <Icon
                                                        name="document"
                                                        size={20}
                                                    />
                                                </span>

                                                <div>
                                                    <h3>{order.title}</h3>

                                                    <p>
                                                        {format(order.amount)}
                                                    </p>

                                                    <small>
                                                        <Icon
                                                            name="clock"
                                                            size={14}
                                                        />
                                                        {order.status ===
                                                        "pending"
                                                            ? "Սպասում է"
                                                            : order.status ===
                                                                "completed"
                                                              ? "Հաստատված"
                                                              : "Չեղարկված"}
                                                    </small>
                                                </div>
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
                                </div>
                            )}
                        </section>

                        <AccountBroadcasts />
                    </>
                )}
            </div>
        </main>
    );
}
