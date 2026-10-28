
import { useMemo, useState } from "react";

import Header from "../../header/Header";
import useRemote from "../../../utils/useRemote";
import useCurrency from "../../../utils/useCurrency";

import "./SellerDashboard.css";

const BASE = import.meta.env.BASE_URL;

const STATUS_LABELS = {
    active: "Ակտիվ",
    draft: "Սևագիր",
    sold: "Վաճառված",
};

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
}

function StatCard({ label, value, description }) {
    return (
        <article className="seller-stat-card">
            <span>{label}</span>
            <strong>{formatNumber(value)}</strong>
            <small>{description}</small>
        </article>
    );
}

export default function SellerDashboard() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("views");

    const { format } = useCurrency();

    const me = useRemote("/auth/me");
    const listings = useRemote("/products/mine");

    const products = useMemo(() => {
        return Array.isArray(listings.data)
            ? listings.data
            : [];
    }, [listings.data]);

    const stats = useMemo(() => {
        const active = products.filter(
            (item) => item.status === "active"
        ).length;

        const sold = products.filter(
            (item) => item.status === "sold"
        ).length;

        const draft = products.filter(
            (item) => item.status === "draft"
        ).length;

        const views = products.reduce(
            (sum, item) => sum + Number(item.views || 0),
            0
        );

        const averageViews = products.length
            ? Math.round(views / products.length)
            : 0;

        return {
            total: products.length,
            active,
            sold,
            draft,
            views,
            averageViews,
        };
    }, [products]);

    const filtered = useMemo(() => {
        const search = query.trim().toLocaleLowerCase();

        return products
            .filter((item) => {
                if (
                    status !== "all" &&
                    item.status !== status
                ) {
                    return false;
                }

                if (!search) return true;

                return [
                    item.title,
                    item.brand,
                    item.model,
                    item.region,
                    item.vin,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase()
                    .includes(search);
            })
            .sort((a, b) => {
                if (sort === "views") {
                    return (
                        Number(b.views || 0) -
                        Number(a.views || 0)
                    );
                }

                if (sort === "oldest") {
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    );
                }

                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            });
    }, [products, query, status, sort]);

    const loading = me.loading || listings.loading;
    const error = me.error || listings.error;

    return (
        <>
            <Header />

            <main className="seller-dashboard">
                <div className="seller-dashboard-container">
                    <div className="seller-dashboard-heading">
                        <div>
                            <span className="seller-eyebrow">
                                ARMMOTORS SELLER
                            </span>

                            <h1>Վաճառողի վիճակագրություն</h1>

                            <p>
                                Հետևեք ձեր հայտարարությունների
                                դիտումներին և ակտիվությանը։
                            </p>
                        </div>

                        <a
                            className="seller-add-button"
                            href={`${BASE}add-product`}
                        >
                            + Նոր հայտարարություն
                        </a>
                    </div>

                    {loading ? (
                        <div className="seller-loading">
                            Տվյալները բեռնվում են...
                        </div>
                    ) : error ? (
                        <div className="seller-error">
                            <h2>Տվյալները հասանելի չեն</h2>

                            <p>{error}</p>

                            {me.error && (
                                <a href={`${BASE}login?next=/seller/dashboard`}>
                                    Մուտք գործել
                                </a>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="seller-welcome">
                                <div className="seller-avatar">
                                    {me.data?.name?.[0]?.toUpperCase() ||
                                        "U"}
                                </div>

                                <div>
                                    <span>Բարի վերադարձ</span>

                                    <h2>
                                        {me.data?.name || "Վաճառող"}{" "}
                                        {me.data?.surname || ""}
                                    </h2>

                                    <p>
                                        {me.data?.email || ""}
                                    </p>
                                </div>
                            </div>

                            <section className="seller-stats-grid">
                                <StatCard
                                    label="Բոլոր հայտարարությունները"
                                    value={stats.total}
                                    description="Ընդհանուր քանակ"
                                />

                                <StatCard
                                    label="Ակտիվ հայտարարություններ"
                                    value={stats.active}
                                    description="Հրապարակված"
                                />

                                <StatCard
                                    label="Ընդհանուր դիտումներ"
                                    value={stats.views}
                                    description="Բոլոր հայտարարություններից"
                                />

                                <StatCard
                                    label="Վաճառված"
                                    value={stats.sold}
                                    description="Վաճառված նշված"
                                />

                                <StatCard
                                    label="Սևագրեր"
                                    value={stats.draft}
                                    description="Չհրապարակված"
                                />

                                <StatCard
                                    label="Միջին դիտումներ"
                                    value={stats.averageViews}
                                    description="Մեկ հայտարարության հաշվով"
                                />
                            </section>

                            <section className="seller-analytics">
                                <div className="seller-section-title">
                                    <div>
                                        <h2>Հայտարարությունների վիճակներ</h2>

                                        <p>
                                            Ձեր հայտարարությունների
                                            ընդհանուր բաշխումը
                                        </p>
                                    </div>
                                </div>

                                <div className="seller-progress-list">
                                    {[
                                        {
                                            label: "Ակտիվ",
                                            value: stats.active,
                                            color: "active",
                                        },
                                        {
                                            label: "Վաճառված",
                                            value: stats.sold,
                                            color: "sold",
                                        },
                                        {
                                            label: "Սևագիր",
                                            value: stats.draft,
                                            color: "draft",
                                        },
                                    ].map((item) => {
                                        const percent = stats.total
                                            ? (item.value / stats.total) * 100
                                            : 0;

                                        return (
                                            <div
                                                className="seller-progress-item"
                                                key={item.color}
                                            >
                                                <div className="seller-progress-label">
                                                    <span>{item.label}</span>

                                                    <strong>
                                                        {item.value}
                                                        {" · "}
                                                        {Math.round(percent)}%
                                                    </strong>
                                                </div>

                                                <div className="seller-progress-track">
                                                    <div
                                                        className={`seller-progress-fill ${item.color}`}
                                                        style={{
                                                            width: `${percent}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="seller-listings">
                                <div className="seller-section-title">
                                    <div>
                                        <h2>Իմ հայտարարությունները</h2>

                                        <p>
                                            Որոնեք և դիտեք ձեր
                                            հայտարարությունների արդյունքները։
                                        </p>
                                    </div>

                                    <a href={`${BASE}account`}>
                                        Կառավարել հայտարարությունները →
                                    </a>
                                </div>

                                <div className="seller-filters">
                                    <input
                                        type="search"
                                        placeholder="Որոնել վերնագրով, մակնիշով..."
                                        aria-label="Որոնել հայտարարություններ"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                    />

                                    <select
                                        value={status}
                                        aria-label="Ֆիլտրել ըստ կարգավիճակի"
                                        onChange={(event) =>
                                            setStatus(event.target.value)
                                        }
                                    >
                                        <option value="all">Բոլորը</option>
                                        <option value="active">Ակտիվ</option>
                                        <option value="sold">Վաճառված</option>
                                        <option value="draft">Սևագիր</option>
                                    </select>

                                    <select
                                        value={sort}
                                        aria-label="Դասավորել հայտարարությունները"
                                        onChange={(event) =>
                                            setSort(event.target.value)
                                        }
                                    >
                                        <option value="views">
                                            Ամենաշատ դիտված
                                        </option>
                                        <option value="newest">
                                            Նորերը սկզբում
                                        </option>
                                        <option value="oldest">
                                            Հները սկզբում
                                        </option>
                                    </select>
                                </div>

                                <div className="seller-listings-count">
                                    Գտնվել է {filtered.length} հայտարարություն
                                </div>

                                {filtered.length === 0 ? (
                                    <div className="seller-empty">
                                        <h3>Հայտարարություններ չկան</h3>

                                        <p>
                                            Փոխեք որոնման պայմանները կամ
                                            տեղադրեք նոր հայտարարություն։
                                        </p>
                                    </div>
                                ) : (
                                    <div className="seller-products">
                                        {filtered.map((item) => {
                                            const id = item._id || item.id;
                                            const image =
                                                item.images?.[0] ||
                                                item.image;

                                            return (
                                                <article
                                                    className="seller-product"
                                                    key={id}
                                                >
                                                    <div className="seller-product-image">
                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt={item.title}
                                                                loading="lazy"
                                                                onError={(event) => {
                                                                    event.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>
                                                                Նկար չկա
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="seller-product-content">
                                                        <span
                                                            className={`seller-status ${item.status || "draft"}`}
                                                        >
                                                            {STATUS_LABELS[
                                                                item.status
                                                            ] || "Սևագիր"}
                                                        </span>

                                                        <h3>
                                                            {item.title ||
                                                                "Հայտարարություն"}
                                                        </h3>

                                                        <p className="seller-product-price">
                                                            {format(
                                                                item.price,
                                                                item.currency || "AMD"
                                                            )}
                                                        </p>

                                                        <div className="seller-product-meta">
                                                            <span>
                                                                {formatNumber(
                                                                    item.views
                                                                )}{" "}
                                                                դիտում
                                                            </span>

                                                            {item.createdAt && (
                                                                <span>
                                                                    {new Date(
                                                                        item.createdAt
                                                                    ).toLocaleDateString(
                                                                        "hy-AM"
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="seller-product-actions">
                                                        <a
                                                            href={`${BASE}cars/${encodeURIComponent(id)}`}
                                                        >
                                                            Դիտել
                                                        </a>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
