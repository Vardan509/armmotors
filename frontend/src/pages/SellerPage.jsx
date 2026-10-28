import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";
import { apiRequest } from "../utils/api";

import "./SellerPage.css";

export default function SellerPage({ id }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        const controller = new AbortController();

        async function loadSeller() {
            setLoading(true);
            setError("");
            setData(null);

            try {
                const result = await apiRequest(
                    `/sellers/${encodeURIComponent(id)}`,
                    { signal: controller.signal },
                );

                if (!controller.signal.aborted) {
                    setData(result);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err.message || "Վաճառողի տվյալները բեռնել չհաջողվեց։",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        if (id) {
            void loadSeller();
        } else {
            setLoading(false);
            setError("Վաճառողի ID-ն նշված չէ։");
        }

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!data?.seller) return;

        const oldTitle = document.title;

        document.title = `${
            data.seller.name || "Վաճառող"
        } ${data.seller.surname || ""} — ArmMotors`;

        return () => {
            document.title = oldTitle;
        };
    }, [data]);

    const products = useMemo(() => {
        if (!Array.isArray(data?.products)) {
            return [];
        }

        const filtered = data.products.filter(
            (product) => filter === "all" || product.type === filter,
        );

        return [...filtered].sort((a, b) => {
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
                (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)
            );
        });
    }, [data, filter, sort]);

    const seller = data?.seller;
    const statistics = data?.statistics;

    const fullName = seller
        ? `${seller.name || ""} ${seller.surname || ""}`.trim()
        : "";

    const joinedYear = seller?.joinedAt
        ? new Date(seller.joinedAt).getFullYear()
        : null;

    return (
        <main className="seller-page">
            <nav className="seller-breadcrumb" aria-label="Էջի ուղի">
                <Link to="/">Գլխավոր</Link>
                <span>/</span>
                <Link to="/cars">Հայտարարություններ</Link>
                <span>/</span>
                <span>Վաճառող</span>
            </nav>

            {loading && (
                <div className="seller-loading" role="status">
                    Վաճառողի տվյալները բեռնվում են...
                </div>
            )}

            {!loading && error && (
                <section className="seller-error">
                    <h1>Վաճառողը հասանելի չէ</h1>
                    <p role="alert">{error}</p>
                    <Link to="/cars">Վերադառնալ հայտարարություններին</Link>
                </section>
            )}

            {!loading && !error && seller && (
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
                                    ARMMOTORS / ՎԱՃԱՌՈՂ
                                </span>

                                <h1>{fullName}</h1>

                                <p>
                                    {joinedYear
                                        ? `ArmMotors-ում՝ ${joinedYear} թվականից`
                                        : "ArmMotors-ի վաճառող"}
                                </p>
                            </div>
                        </div>

                        <div className="seller-stats">
                            <div>
                                <strong>{statistics?.total || 0}</strong>
                                <span>Ակտիվ հայտարարություններ</span>
                            </div>

                            <div>
                                <strong>{statistics?.cars || 0}</strong>
                                <span>Մեքենաներ</span>
                            </div>

                            <div>
                                <strong>{statistics?.parts || 0}</strong>
                                <span>Պահեստամասեր</span>
                            </div>
                        </div>
                    </section>

                    <section className="seller-listings">
                        <div className="seller-listings-header">
                            <div>
                                <span className="seller-eyebrow">
                                    ՀԱՅՏԱՐԱՐՈՒԹՅՈՒՆՆԵՐ
                                </span>

                                <h2>{fullName}-ի հայտարարությունները</h2>

                                <p>
                                    Գտնվել է {products.length} հայտարարություն
                                </p>
                            </div>
                        </div>

                        <div className="seller-toolbar">
                            <div
                                className="seller-filter-buttons"
                                role="group"
                                aria-label="Հայտարարության տեսակ"
                            >
                                <button
                                    type="button"
                                    className={filter === "all" ? "active" : ""}
                                    onClick={() => setFilter("all")}
                                >
                                    Բոլորը
                                </button>

                                <button
                                    type="button"
                                    className={filter === "car" ? "active" : ""}
                                    onClick={() => setFilter("car")}
                                >
                                    Մեքենաներ
                                </button>

                                <button
                                    type="button"
                                    className={
                                        filter === "part" ? "active" : ""
                                    }
                                    onClick={() => setFilter("part")}
                                >
                                    Պահեստամասեր
                                </button>
                            </div>

                            <select
                                aria-label="Տեսակավորել"
                                value={sort}
                                onChange={(event) =>
                                    setSort(event.target.value)
                                }
                            >
                                <option value="newest">Նորերը սկզբում</option>
                                <option value="priceAsc">
                                    Գին՝ աճման կարգով
                                </option>
                                <option value="priceDesc">
                                    Գին՝ նվազման կարգով
                                </option>
                                <option value="views">Ամենադիտվածները</option>
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
                                <h3>Հայտարարություններ չկան</h3>

                                <p>
                                    Այս բաժնում ակտիվ հայտարարություններ դեռ
                                    չկան։
                                </p>

                                {filter !== "all" && (
                                    <button
                                        type="button"
                                        onClick={() => setFilter("all")}
                                    >
                                        Ցույց տալ բոլորը
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
