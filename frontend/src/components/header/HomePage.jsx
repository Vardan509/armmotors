    import { useState } from "react";

    import Header from "./Header";
    import ProductCard from "../ProductCard/ProductCard";
    import Filter from "../filterCar/filter.jsx";

    import "./HomePage.css";

    import useProducts from "../../utils/useProducts";
    import { useI18n } from "../../utils/i18n";

    // Կատեգորիաներ
    const CATEGORIES = [
        {
            id: 1,
            title: {
                hy: "Էլեկտրական",
                ru: "Электромобили",
                en: "Electric",
            },
            value: "electric",
            image: "/byd.png",
        },
        {
            id: 2,
            title: {
                hy: "Հիբրիդ",
                ru: "Гибриды",
                en: "Hybrid",
            },
            value: "hybrid",
            image: "/lixiang.png",
        },
        {
            id: 3,
            title: {
                hy: "Նոր",
                ru: "Новые",
                en: "New",
            },
            value: "new",
            image: "/new-car.png",
        },
        {
            id: 4,
            title: {
                hy: "Բեռնատարներ",
                ru: "Грузовики",
                en: "Trucks",
            },
            value: "truck",
            image: "/volvo.png",
        },
        {
            id: 5,
            title: {
                hy: "Պահեստամասեր",
                ru: "Запчасти",
                en: "Spare parts",
            },
            value: "part",
            image: "/spare-parts.png",
        },
    ];

    // Մակնիշներ
    const BRANDS = [
        {
            id: 1,
            name: "Mercedes-Benz",
            logo: "/mrc.png",
        },
        {
            id: 2,
            name: "Toyota",
            logo: "/toyota.png",
        },
        {
            id: 3,
            name: "BMW",
            logo: "/bmw.png",
        },
        {
            id: 4,
            name: "Tesla",
            logo: "/tesla.png",
        },
        {
            id: 6,
            name: "Nissan",
            logo: "/nissan.png",
        },
        {
            id: 7,
            name: "Kia",
            logo: "/kia.png",
        },
    ];

    export default function HomePage() {
        const { language, t } = useI18n();

        const { products = [], loading, error } = useProducts();

        const [search, setSearch] = useState("");
        const [searchFocused, setSearchFocused] = useState(false);

        const [category, setCategory] = useState(() => {
            const params = new URLSearchParams(window.location.search);

            const value = params.get("category") || "";

            return CATEGORIES.some((item) => item.value === value) ? value : "";
        });

        const PRODUCTS = Array.isArray(products) ? products : [];

        const normalizedSearch = search.trim().toLowerCase();

        // Որոնման համար մեքենայի տվյալները
        function getSearchValues(product) {
            return [product.title, product.brand, product.model, product.year]
                .filter((value) => value !== undefined && value !== null)
                .map((value) => String(value).toLowerCase());
        }

        // Որոնման առաջարկներ
        const searchSuggestions = normalizedSearch
            ? PRODUCTS.filter((product) =>
                getSearchValues(product).some((value) =>
                    value.includes(normalizedSearch),
                ),
            ).slice(0, 6)
            : [];

        // Կատեգորիայի և որոնման ֆիլտրում
        const filteredProducts = PRODUCTS.filter((product) => {
            const matchesSearch =
                !normalizedSearch ||
                getSearchValues(product).some((value) =>
                    value.includes(normalizedSearch),
                );

            if (!matchesSearch) {
                return false;
            }

            if (category === "electric") {
                return product.type === "car" && product.fuel === "electric";
            }

            if (category === "hybrid") {
                return product.type === "car" && product.fuel === "hybrid";
            }

            if (category === "new") {
                return (
                    product.type === "car" &&
                    (product.condition === "Նոր" || product.condition === "new")
                );
            }

            if (category === "truck") {
                return product.type === "car" && product.vehicleType === "truck";
            }

            if (category === "part") {
                return product.type === "part";
            }

            return true;
        });

        const firstProducts = filteredProducts.slice(0, 6);
        const restProducts = filteredProducts.slice(6);

        const selectedCategory = CATEGORIES.find((item) => item.value === category);

        function updateCategory(value) {
            setCategory(value);

            const url = new URL(window.location.href);

            if (value) {
                url.searchParams.set("category", value);
            } else {
                url.searchParams.delete("category");
            }

            window.history.replaceState(null, "", url);
        }

        function selectCategory(value) {
            updateCategory(category === value ? "" : value);

            document.getElementById("products")?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "auto"
                    : "smooth",
            });
        }

        function resetFilters() {
            setSearch("");
            setSearchFocused(false);
            updateCategory("");
        }

        // Մակնիշներ և գովազդ
        function renderBrandsAndAd() {
            return (
                <section className="brands-ad-wrapper brands-ad-middle" id="brands">
                    <div className="brands-section">
                        <div className="section-header">
                            <span className="section-label">
                                {t("popularBrands")}
                            </span>
                        </div>

                        <div className="brands-grid">
                            {BRANDS.map((brand) => {
                                // ՍԽԱԼԸ ՈՒՂՂՎԱԾ Է
                                // filter-ը վերադարձնում է զանգված,
                                // .length-ը՝ մեքենաների քանակը
                                const count = PRODUCTS.filter(
                                    (product) =>
                                        product.type === "car" &&
                                        String(product.brand || "")
                                            .trim()
                                            .toLowerCase() ===
                                            brand.name.toLowerCase(),
                                ).length;

                                return (
                                    <button
                                        type="button"
                                        key={brand.id}
                                        className="brand-card"
                                        onClick={() => {
                                            window.location.assign(
                                                `/cars?brand=${encodeURIComponent(
                                                    brand.name,
                                                )}`,
                                            );
                                        }}
                                    >
                                        <img
                                            src={brand.logo}
                                            alt={brand.name}
                                            className="brand-logo"
                                            loading="lazy"
                                        />

                                        <span className="brand-name">
                                            {brand.name}
                                        </span>

                                        <small>
                                            {count} {t("listingCount")}
                                        </small>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ad-banner">
                        <img
                            src="/image.png"
                            alt="Գովազդային տարածք"
                            className="ad-image"
                            loading="lazy"
                        />
                    </div>
                </section>
            );
        }

        return (
            <div className="home-wrapper">
                <Header />

                <main className="main-content">
                    {/* Գլխավոր հատված */}
                    <section className="intro-section">
                        {/* <div className="intro-copy">
                            <span className="section-label">
                                {t("marketLabel")}
                            </span>

                            <h1>{t("heroTitle")}</h1>

                            <p>{t("heroText")}</p>
                        </div> */}

                        {/* Որոնում + ֆիլտր */}
                        <div
                            className="home-search-controls"
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                width: "100%",
                                minWidth: 0,
                            }}
                        >
                            <div
                                className="search-area"
                                style={{
                                    flex: "1 1 0",
                                    minWidth: 0,
                                }}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={(event) => {
                                    if (
                                        !event.currentTarget.contains(
                                            event.relatedTarget,
                                        )
                                    ) {
                                        setSearchFocused(false);
                                    }
                                }}
                            >
                                <div className="search-box">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        aria-hidden="true"
                                    >
                                        <circle cx="10.5" cy="10.5" r="6.5" />

                                        <path d="m16 16 5 5" />
                                    </svg>

                                    <input
                                        type="search"
                                        value={search}
                                        placeholder={t("searchPlaceholder")}
                                        aria-label={t("searchPlaceholder")}
                                        autoComplete="off"
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Escape") {
                                                setSearchFocused(false);
                                            }
                                        }}
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            className="search-clear"
                                            aria-label={t("clearFilters")}
                                            onClick={() => setSearch("")}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* Որոնման առաջարկներ */}
                                {searchFocused && normalizedSearch && (
                                    <div className="search-suggestions">
                                        {searchSuggestions.length > 0 ? (
                                            searchSuggestions.map((product) => (
                                                <button
                                                    type="button"
                                                    className="search-suggestion"
                                                    key={product.id || product._id}
                                                    onMouseDown={(event) =>
                                                        event.preventDefault()
                                                    }
                                                    onClick={() => {
                                                        const value =
                                                            product.title ||
                                                            [
                                                                product.brand,
                                                                product.model,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" ");

                                                        setSearch(value);
                                                        setSearchFocused(false);
                                                    }}
                                                >
                                                    <span className="search-suggestion-main">
                                                        <strong>
                                                            {product.title ||
                                                                [
                                                                    product.brand,
                                                                    product.model,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(" ")}
                                                        </strong>

                                                        <small>
                                                            {[
                                                                product.brand,
                                                                product.model,
                                                                product.year,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" · ")}
                                                        </small>
                                                    </span>

                                                    <span aria-hidden="true">
                                                        ↗
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="search-suggestion-empty">
                                                {t("noResults")}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Ֆիլտրի կոճակ */}
                            <Filter />
                        </div>
                    </section>

                    {/* Կատեգորիաներ */}
                    <section className="categories-section" aria-label="Categories">
                        <div className="categories-grid">
                            {CATEGORIES.map((cat) => (
                                <button
                                    type="button"
                                    key={cat.id}
                                    className={`category-card category-card-${cat.value}`}
                                    aria-pressed={category === cat.value}
                                    onClick={() => selectCategory(cat.value)}
                                >
                                    <span className="category-title">
                                        {cat.title[language] || cat.title.hy}
                                    </span>

                                    <span className="category-image-wrapper">
                                        <img
                                            className="category-image"
                                            src={cat.image}
                                            alt=""
                                            draggable={false}
                                            loading="lazy"
                                        />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Հայտարարություններ */}
                    <section
                        className="products-section"
                        id="products"
                        aria-busy={loading}
                    >
                        <div className="section-header products-heading">
                            <h2>
                                {search.trim()
                                    ? t("searchResults")
                                    : selectedCategory
                                    ? selectedCategory.title[language] ||
                                        selectedCategory.title.hy
                                    : t("latestListings")}
                            </h2>

                            <span className="products-count">
                                {loading
                                    ? t("loading")
                                    : `${filteredProducts.length} ${t(
                                        "listingCount",
                                    )}`}
                            </span>
                        </div>

                        {(search.trim() || category) && (
                            <button
                                type="button"
                                className="clear-filter-button"
                                onClick={resetFilters}
                            >
                                {t("clearFilters")}
                            </button>
                        )}

                        {error && (
                            <p className="catalog-notice" role="alert">
                                {error}
                            </p>
                        )}

                        {loading ? (
                            <p role="status">{t("loading")}</p>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="products-grid products-grid-leading">
                                    {firstProducts.map((product) => (
                                        <ProductCard
                                            key={product.id || product._id}
                                            item={product}
                                        />
                                    ))}
                                </div>

                                {renderBrandsAndAd()}

                                {restProducts.length > 0 && (
                                    <div className="products-grid products-grid-trailing">
                                        {restProducts.map((product) => (
                                            <ProductCard
                                                key={product.id || product._id}
                                                item={product}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="empty-results">
                                    <p>{t("noResults")}</p>

                                    <button type="button" onClick={resetFilters}>
                                        {t("showAll")}
                                    </button>
                                </div>

                                {renderBrandsAndAd()}
                            </>
                        )}
                    </section>
                </main>

                {/* Footer */}
                <footer className="home-footer">
                    <div className="footer-container">
                        <strong>ArmMotors</strong>
                        <span>{t("headerMarket")}</span>
                    </div>
                </footer>
            </div>
        );
    }
