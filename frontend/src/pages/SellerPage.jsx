import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";

import { apiRequest } from "../utils/api";
import usePageText from "../utils/pageText";

import "./SellerPage.css";

export default function SellerPage({ id }) {
    const { tr, locale } = usePageText();

    const [state, setState] = useState({
        id: "",
        data: null,
        loading: true,
        failed: false,
    });

    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        const controller = new AbortController();

        setFilter("all");

        setState({
            id: String(id || ""),
            data: null,
            loading: true,
            failed: false,
        });

        async function loadSeller() {
            if (!id) {
                setState({
                    id: "",
                    data: null,
                    loading: false,
                    failed: true,
                });

                return;
            }

            try {
                const result = await apiRequest(
                    `/sellers/${encodeURIComponent(id)}`,
                    { signal: controller.signal },
                );

                if (controller.signal.aborted) return;

                setState({
                    id: String(id),
                    data: result,
                    loading: false,
                    failed: !result?.seller,
                });
            } catch {
                if (controller.signal.aborted) return;

                setState({
                    id: String(id),
                    data: null,
                    loading: false,
                    failed: true,
                });
            }
        }

        void loadSeller();

        return () => controller.abort();
    }, [id]);

    const current = state.id === String(id || "");
    const loading = !current || state.loading;
    const data = current ? state.data : null;

    const seller = data?.seller;
    const statistics = data?.statistics;

    const fullName =
        [seller?.name, seller?.surname].filter(Boolean).join(" ") ||
        tr("seller");

    useEffect(() => {
        if (!seller) return;

        const previousTitle = document.title;

        document.title = `${fullName} — ArmMotors`;

        return () => {
            document.title = previousTitle;
        };
    }, [seller, fullName]);

    const products = useMemo(() => {
        const list = Array.isArray(data?.products) ? data.products : [];

        return list
            .filter((product) => filter === "all" || product.type === filter)
            .sort((a, b) => {
                if (sort === "priceAsc") {
                    return Number(a.price) - Number(b.price);
                }

                if (sort === "priceDesc") {
                    return Number(b.price) - Number(a.price);
                }

                if (sort === "views") {
                    return Number(b.views || 0) - Number(a.views || 0);
                }

                return (
                    (Date.parse(b.createdAt) || 0) -
                    (Date.parse(a.createdAt) || 0)
                );
            });
    }, [data, filter, sort]);

    const joinedDate = seller?.joinedAt ? new Date(seller.joinedAt) : null;

    const joinedYear =
        joinedDate && Number.isFinite(joinedDate.getTime())
            ? joinedDate.getFullYear()
            : null;

    function count(value) {
        return Number(value || 0).toLocaleString(locale);
    }

    return (
        <main className="seller-page">
            <nav className="seller-breadcrumb" aria-label={tr("breadcrumb")}>
                <Link to="/">{tr("home")}</Link>
                <span>/</span>
                <Link to="/cars">{tr("listings")}</Link>
                <span>/</span>
                <span>{tr("seller")}</span>
            </nav>

            {loading ? (
                <div className="seller-loading" role="status">
                    {tr("loading")}
                </div>
            ) : state.failed || !seller ? (
                <section className="seller-error">
                    <h1>{tr("sellerUnavailable")}</h1>

                    <p role="alert">{tr("loadError")}</p>

                    <Link to="/cars">{tr("backListings")}</Link>
                </section>
            ) : (
                <>
                    <section className="seller-hero">
                        <div className="seller-profile">
                            <div
                                className="seller-avatar-large"
                                aria-hidden="true"
                            >
                                {seller.name?.[0]?.toUpperCase() || "U"}
                            </div>

                            <div className="seller-profile-info">
                                <span className="seller-eyebrow">
                                    ARMMOTORS / {tr("seller")}
                                </span>

                                <h1>{fullName}</h1>

                                <p>
                                    {joinedYear
                                        ? tr("joined", { year: joinedYear })
                                        : tr("sellerIntro")}
                                </p>
                            </div>
                        </div>

                        <div className="seller-stats">
                            <div>
                                <strong>{count(statistics?.total)}</strong>
                                <span>{tr("activeListings")}</span>
                            </div>

                            <div>
                                <strong>{count(statistics?.cars)}</strong>
                                <span>{tr("cars")}</span>
                            </div>

                            <div>
                                <strong>{count(statistics?.parts)}</strong>
                                <span>{tr("parts")}</span>
                            </div>
                        </div>
                    </section>

                    <section className="seller-listings">
                        <div className="seller-listings-header">
                            <div>
                                <span className="seller-eyebrow">
                                    {tr("listings")}
                                </span>

                                <h2>
                                    {tr("sellerListings", {
                                        name: fullName,
                                    })}
                                </h2>

                                <p>
                                    {tr("found", {
                                        count: products.length.toLocaleString(
                                            locale,
                                        ),
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="seller-toolbar">
                            <div
                                className="seller-filter-buttons"
                                role="group"
                                aria-label={tr("listingType")}
                            >
                                {[
                                    ["all", "all"],
                                    ["car", "cars"],
                                    ["part", "parts"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={
                                            filter === value ? "active" : ""
                                        }
                                        aria-pressed={filter === value}
                                        onClick={() => setFilter(value)}
                                    >
                                        {tr(label)}
                                    </button>
                                ))}
                            </div>

                            <select
                                aria-label={tr("sort")}
                                value={sort}
                                onChange={(event) =>
                                    setSort(event.target.value)
                                }
                            >
                                <option value="newest">{tr("newest")}</option>

                                <option value="priceAsc">
                                    {tr("priceAsc")}
                                </option>

                                <option value="priceDesc">
                                    {tr("priceDesc")}
                                </option>

                                <option value="views">
                                    {tr("mostViewed")}
                                </option>
                            </select>
                        </div>

                        {products.length > 0 ? (
                            <div className="seller-products-grid">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id || product.id}
                                        item={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="seller-empty">
                                <h3>{tr("emptyListings")}</h3>
                                <p>{tr("emptySection")}</p>

                                {filter !== "all" && (
                                    <button
                                        type="button"
                                        onClick={() => setFilter("all")}
                                    >
                                        {tr("showAll")}
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
