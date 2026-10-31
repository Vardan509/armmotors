import { useState } from "react";
import { Link } from "react-router-dom";

import useRemote from "../utils/useRemote";
import useCurrency from "../utils/useCurrency";
import usePageText from "../utils/pageText";

import { apiRequest } from "../utils/api";

import ListingPromotion from "../components/monetization/ListingPromotion";
import AccountBroadcasts from "../components/notifications/AccountBroadcasts";

import "./Account.css";

const ICONS = {
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
    edit: <path d="m4 16 11-11 4 4-11 11-5 1zM13 7l4 4" />,
    trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />,
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
    document: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7m-7 4h7" />,
};

function Icon({ name, size = 20 }) {
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
            {ICONS[name] || ICONS.document}
        </svg>
    );
}

function asArray(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
}

function ListingImage({ product, noImage }) {
    const image = product.images?.[0] || product.image || "";
    const [failedImage, setFailedImage] = useState("");

    if (!image || failedImage === image) {
        return (
            <div className="account-listing-placeholder">
                <Icon name="car" size={25} />
                <span>{noImage}</span>
            </div>
        );
    }

    return (
        <img
            className="account-listing-image"
            src={image}
            alt={product.title || ""}
            loading="lazy"
            onError={() => setFailedImage(image)}
        />
    );
}

export default function AccountPage() {
    const { tr, language, locale } = usePageText();
    const { format } = useCurrency();

    const [revision, setRevision] = useState(0);
    const [errorKey, setErrorKey] = useState("");
    const [busy, setBusy] = useState("");
    const [editing, setEditing] = useState(null);

    const me = useRemote("/auth/me");
    const orders = useRemote("/orders", revision);
    const listings = useRemote("/products/mine", revision);

    const user = me.data?.user || me.data;
    const items = asArray(listings.data, "products");
    const orderItems = asArray(orders.data, "orders");

    function listingId(product) {
        return String(product._id || product.id || "");
    }

    function listingTitle(product) {
        return (
            product.translations?.[language]?.title ||
            product.titleTranslations?.[language] ||
            product.title ||
            [product.brand, product.model].filter(Boolean).join(" ")
        );
    }

    async function changeListing(id, data) {
        if (busy) return;

        setBusy(id);
        setErrorKey("");

        try {
            await apiRequest(`/products/${encodeURIComponent(id)}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });

            setEditing(null);
            setRevision((value) => value + 1);
        } catch {
            setErrorKey("actionError");
        } finally {
            setBusy("");
        }
    }

    async function deleteListing(id) {
        if (busy || !window.confirm(tr("deleteConfirm"))) return;

        setBusy(id);
        setErrorKey("");

        try {
            await apiRequest(`/products/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });

            setEditing((current) => (current?._id === id ? null : current));

            setRevision((value) => value + 1);
        } catch {
            setErrorKey("actionError");
        } finally {
            setBusy("");
        }
    }

    async function cancelOrder(id) {
        if (busy) return;

        setBusy(id);
        setErrorKey("");

        try {
            await apiRequest(`/orders/${encodeURIComponent(id)}/cancel`, {
                method: "PATCH",
            });

            setRevision((value) => value + 1);
        } catch {
            setErrorKey("actionError");
        } finally {
            setBusy("");
        }
    }

    const statistics = [
        {
            key: "totalListings",
            value: items.length,
            icon: "car",
            color: "blue",
        },
        {
            key: "activeListings",
            value: items.filter((item) => item.status === "active").length,
            icon: "check",
            color: "green",
        },
        {
            key: "soldListings",
            value: items.filter((item) => item.status === "sold").length,
            icon: "sold",
            color: "purple",
        },
        {
            key: "totalViews",
            value: items.reduce(
                (sum, item) => sum + (Number(item.views) || 0),
                0,
            ),
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
                            ARMMOTORS / {tr("account")}
                        </span>

                        <h1>{tr("account")}</h1>
                        <p>{tr("accountIntro")}</p>
                    </div>

                    <div className="account-heading-actions">
                        <Link className="account-money-link" to="/monetization">
                            <Icon name="star" size={17} />
                            {tr("promotion")}
                        </Link>
                    </div>
                </div>

                {me.loading ? (
                    <div className="account-loading" role="status">
                        {tr("loading")}
                    </div>
                ) : me.error || !user ? (
                    <div className="account-empty account-login-empty">
                        <div className="account-empty-icon">
                            <Icon name="document" size={27} />
                        </div>

                        <h2>{tr("loginTitle")}</h2>
                        <p>{tr("loginDescription")}</p>

                        <Link
                            className="account-add-link"
                            to="/login?next=%2Faccount"
                        >
                            {tr("login")}
                            <Icon name="arrow" size={17} />
                        </Link>
                    </div>
                ) : (
                    <>
                        <section className="account-profile">
                            <div className="account-profile-main">
                                <div className="account-avatar">
                                    {user.name?.[0]?.toUpperCase() || "U"}
                                </div>

                                <div className="account-profile-info">
                                    <span className="account-profile-label">
                                        {tr("profile")}
                                    </span>

                                    <h2>
                                        {user.name} {user.surname}
                                    </h2>

                                    <div className="account-profile-details">
                                        <span>
                                            <Icon name="mail" size={15} />
                                            {user.email}
                                        </span>

                                        <span>
                                            <Icon name="phone" size={15} />
                                            {user.phone || tr("phoneMissing")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="account-profile-actions">
                                <Link
                                    to="/favorites"
                                    className="account-favorites-link"
                                >
                                    <Icon name="heart" size={18} />
                                    {tr("favorites")}
                                    <Icon name="arrow" size={16} />
                                </Link>
                            </div>
                        </section>

                        <section
                            className="account-statistics"
                            aria-label={tr("statistics")}
                        >
                            {statistics.map((stat) => (
                                <article
                                    className="account-stat"
                                    key={stat.key}
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
                                            : stat.value.toLocaleString(locale)}
                                    </strong>

                                    <span className="account-stat-title">
                                        {tr(stat.key)}
                                    </span>
                                </article>
                            ))}
                        </section>

                        {errorKey && (
                            <p className="account-error" role="alert">
                                {tr(errorKey)}
                            </p>
                        )}

                        <section className="account-section">
                            <div className="account-section-head">
                                <div>
                                    <span className="account-section-kicker">
                                        {tr("myListings")}
                                    </span>

                                    <h2>{tr("myListings")}</h2>
                                    <p>{tr("manageListings")}</p>
                                </div>

                                <Link
                                    className="account-section-add"
                                    to="/add-product"
                                >
                                    <Icon name="plus" size={17} />
                                    {tr("add")}
                                </Link>
                            </div>

                            {listings.loading ? (
                                <div className="account-loading" role="status">
                                    {tr("loading")}
                                </div>
                            ) : listings.error ? (
                                <p className="account-error" role="alert">
                                    {tr("loadError")}
                                </p>
                            ) : items.length === 0 ? (
                                <div className="account-empty">
                                    <div className="account-empty-icon">
                                        <Icon name="car" size={28} />
                                    </div>

                                    <h3>{tr("noListings")}</h3>
                                    <p>{tr("firstListing")}</p>

                                    <Link
                                        className="account-add-link"
                                        to="/add-product"
                                    >
                                        <Icon name="plus" size={17} />
                                        {tr("addListing")}
                                    </Link>
                                </div>
                            ) : (
                                <div className="account-listings">
                                    {items.map((product) => {
                                        const id = listingId(product);

                                        return (
                                            <article
                                                className="account-listing"
                                                key={id}
                                            >
                                                <div className="account-listing-main">
                                                    <ListingImage
                                                        product={product}
                                                        noImage={tr("noImage")}
                                                    />

                                                    <div className="account-listing-info">
                                                        <h3>
                                                            {listingTitle(
                                                                product,
                                                            )}
                                                        </h3>

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
                                                                {[
                                                                    "active",
                                                                    "draft",
                                                                    "sold",
                                                                ].includes(
                                                                    product.status,
                                                                )
                                                                    ? tr(
                                                                          product.status,
                                                                      )
                                                                    : "—"}
                                                            </span>

                                                            <small>
                                                                <Icon
                                                                    name="eye"
                                                                    size={14}
                                                                />
                                                                {Number(
                                                                    product.views ||
                                                                        0,
                                                                ).toLocaleString(
                                                                    locale,
                                                                )}{" "}
                                                                {tr("views")}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {editing?._id === id && (
                                                    <form
                                                        className="account-edit-form"
                                                        onSubmit={(event) => {
                                                            event.preventDefault();

                                                            void changeListing(
                                                                id,
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
                                                            {tr("price")}

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                required
                                                                value={
                                                                    editing.price
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditing(
                                                                        (
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            price: event
                                                                                .target
                                                                                .value,
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                        </label>

                                                        <label>
                                                            {tr("status")}

                                                            <select
                                                                value={
                                                                    editing.status
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditing(
                                                                        (
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            status: event
                                                                                .target
                                                                                .value,
                                                                        }),
                                                                    )
                                                                }
                                                            >
                                                                {[
                                                                    "active",
                                                                    "draft",
                                                                    "sold",
                                                                ].map(
                                                                    (
                                                                        status,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                status
                                                                            }
                                                                            value={
                                                                                status
                                                                            }
                                                                        >
                                                                            {tr(
                                                                                status,
                                                                            )}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </label>

                                                        <div className="account-edit-actions">
                                                            <button
                                                                type="submit"
                                                                disabled={Boolean(
                                                                    busy,
                                                                )}
                                                            >
                                                                {tr("save")}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="account-cancel-btn"
                                                                disabled={Boolean(
                                                                    busy,
                                                                )}
                                                                onClick={() =>
                                                                    setEditing(
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                {tr("cancel")}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}

                                                <div className="account-listing-actions">
                                                    {product.status ===
                                                        "active" && (
                                                        <Link
                                                            to={`/cars/${encodeURIComponent(id)}`}
                                                        >
                                                            <Icon
                                                                name="eye"
                                                                size={16}
                                                            />
                                                            {tr("view")}
                                                        </Link>
                                                    )}

                                                    <button
                                                        type="button"
                                                        disabled={Boolean(busy)}
                                                        onClick={() =>
                                                            setEditing({
                                                                _id: id,
                                                                price: product.price,
                                                                status: product.status,
                                                            })
                                                        }
                                                    >
                                                        <Icon
                                                            name="edit"
                                                            size={16}
                                                        />
                                                        {tr("edit")}
                                                    </button>

                                                    {product.status !==
                                                        "sold" && (
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
                                                            <Icon
                                                                name="check"
                                                                size={16}
                                                            />
                                                            {tr("sold")}
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
                                                        <Icon
                                                            name="trash"
                                                            size={16}
                                                        />
                                                        {tr("delete")}
                                                    </button>
                                                </div>

                                                {product.paymentPending && (
                                                    <p className="money-pending-article">
                                                        {tr("paymentPending")}{" "}
                                                        <Link to="/monetization">
                                                            {tr("viewRequest")}
                                                        </Link>
                                                    </p>
                                                )}

                                                <ListingPromotion
                                                    product={product}
                                                />
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="account-section">
                            <div className="account-section-head">
                                <div>
                                    <span className="account-section-kicker">
                                        {tr("myOrders")}
                                    </span>

                                    <h2>{tr("myOrders")}</h2>
                                    <p>{tr("ordersIntro")}</p>
                                </div>
                            </div>

                            {orders.loading ? (
                                <div className="account-loading" role="status">
                                    {tr("loading")}
                                </div>
                            ) : orders.error ? (
                                <p className="account-error" role="alert">
                                    {tr("loadError")}
                                </p>
                            ) : orderItems.length === 0 ? (
                                <div className="account-empty">
                                    <div className="account-empty-icon">
                                        <Icon name="document" size={26} />
                                    </div>

                                    <h3>{tr("noOrders")}</h3>
                                    <p>{tr("ordersEmpty")}</p>
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
                                                        {format(
                                                            order.amount,
                                                            order.currency ||
                                                                "AMD",
                                                        )}
                                                    </p>

                                                    <small>
                                                        <Icon
                                                            name="clock"
                                                            size={14}
                                                        />

                                                        {tr(
                                                            order.status ===
                                                                "pending"
                                                                ? "pending"
                                                                : order.status ===
                                                                    "completed"
                                                                  ? "completed"
                                                                  : "cancelled",
                                                        )}
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
                                                    {tr("cancelOrder")}
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
