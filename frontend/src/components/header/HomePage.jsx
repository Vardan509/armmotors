import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ProductCard from "../ProductCard/ProductCard";
import Filter from "../filterCar/filter.jsx";
import useProducts from "../../utils/useProducts";
import { useI18n } from "../../utils/i18n";
import { asset } from "../../utils/asset";

import "./HomePage.css";
import "../../styles/ArmMotorsMobile.css";

const CATEGORIES = [
    {
        id: 1,
        title: {
            hy: "Էլեկտրական",
            ru: "Электромобили",
            en: "Electric",
        },
        value: "electric",
        image: "/categories/electric.png",
    },
    {
        id: 2,
        title: {
            hy: "Հիբրիդ",
            ru: "Гибриды",
            en: "Hybrid",
        },
        value: "hybrid",
        image: "/categories/hybrid.png",
    },
    {
        id: 3,
        title: {
            hy: "Նոր",
            ru: "Новые",
            en: "New",
        },
        value: "new",
        image: "/categories/new_cars.png",
    },
    {
        id: 4,
        title: {
            hy: "Բեռնատարներ",
            ru: "Грузовики",
            en: "Trucks",
        },
        value: "truck",
        image: "/categories/trucks.png",
    },
    {
        id: 5,
        title: {
            hy: "Պահեստամասեր",
            ru: "Запчасти",
            en: "Spare parts",
        },
        value: "part",
        image: "/categories/spare_parts.png",
    },
];

const BRANDS = [
    { id: 1, name: "Mercedes-Benz", logo: "/mercedes.png" },
    { id: 2, name: "Toyota", logo: "/toyota.png" },
    { id: 3, name: "BMW", logo: "/bmw.png" },
    { id: 4, name: "Tesla", logo: "/tesla.png" },
    { id: 6, name: "Nissan", logo: "/nissan.png" },
    { id: 7, name: "Kia", logo: "/kia.png" },
];

function getSearchValues(product) {
    return [product.title, product.brand, product.model, product.year]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).toLowerCase());
}

export default function HomePage() {
    const { language, t } = useI18n();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const { products = [], loading, error } = useProducts();

    const brandsTrackRef = useRef(null);

    const [search, setSearch] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    const [brandScroll, setBrandScroll] = useState({
        left: false,
        right: false,
    });

    const requestedCategory = searchParams.get("category") || "";

    const category = CATEGORIES.some((item) => item.value === requestedCategory)
        ? requestedCategory
        : "";

    const PRODUCTS = Array.isArray(products) ? products : [];

    const normalizedSearch = search.trim().toLowerCase();

    const searchSuggestions = normalizedSearch
        ? PRODUCTS.filter((product) =>
              getSearchValues(product).some((value) =>
                  value.includes(normalizedSearch),
              ),
          ).slice(0, 6)
        : [];

    // =========================================
    // FILTER PRODUCTS
    // =========================================

    const filteredProducts = PRODUCTS.filter((product) => {
        const matchesSearch =
            !normalizedSearch ||
            getSearchValues(product).some((value) =>
                value.includes(normalizedSearch),
            );

        if (!matchesSearch) return false;

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

    // Առաջին 8 հայտարարությունները՝ մակնիշներից առաջ

    const firstProducts = filteredProducts.slice(0, 8);
    const restProducts = filteredProducts.slice(8);

    const selectedCategory = CATEGORIES.find((item) => item.value === category);

    // =========================================
    // CATEGORY FILTER
    // =========================================

    function updateCategory(value) {
        const nextParams = new URLSearchParams(searchParams);

        if (value) {
            nextParams.set("category", value);
        } else {
            nextParams.delete("category");
        }

        setSearchParams(nextParams, {
            replace: true,
            preventScrollReset: true,
        });
    }

    function selectCategory(value) {
        updateCategory(category === value ? "" : value);

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        document.getElementById("products")?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
        });
    }

    function resetFilters() {
        setSearch("");
        setSearchFocused(false);
        updateCategory("");
    }

    // =========================================
    // BUSINESS PROPOSAL
    // =========================================

    function openBusinessProposal() {
        window.dispatchEvent(
            new CustomEvent("open-support", {
                detail: {
                    type: "business",
                    source: "homepage-banner",
                },
            }),
        );
    }

    // =========================================
    // CAROUSEL
    // =========================================

    function updateBrandArrows() {
        const track = brandsTrackRef.current;

        if (!track) return;

        const maxScroll = track.scrollWidth - track.clientWidth;

        setBrandScroll({
            left: track.scrollLeft > 2,
            right: track.scrollLeft < maxScroll - 2,
        });
    }

    function scrollBrands(direction) {
        const track = brandsTrackRef.current;

        if (!track) return;

        const card = track.querySelector(".brand-card");

        if (!card) return;

        const gap = parseFloat(window.getComputedStyle(track).gap) || 0;

        const cardWidth = card.getBoundingClientRect().width;
        const distance = (cardWidth + gap) * 2;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        track.scrollBy({
            left: direction * distance,
            behavior: reducedMotion ? "auto" : "smooth",
        });
    }

    useEffect(() => {
        const track = brandsTrackRef.current;

        if (!track) return;

        const update = () => {
            const maxScroll = track.scrollWidth - track.clientWidth;

            setBrandScroll({
                left: track.scrollLeft > 2,
                right: track.scrollLeft < maxScroll - 2,
            });
        };

        update();

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(update)
                : null;

        observer?.observe(track);

        const cards = track.querySelectorAll(".brand-card");

        cards.forEach((card) => observer?.observe(card));

        window.addEventListener("resize", update);

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", update);
        };
    }, [loading]);

    // =========================================
    // BRANDS AND ADVERTISEMENT
    // =========================================

    function renderBrandsAndAd() {
        return (
            <section className="brands-ad-wrapper brands-ad-middle" id="brands">
                <div className="brands-section">
                    <div className="section-header brands-carousel-header">
                        <span className="section-label">
                            {t("popularBrands")}
                        </span>

                        <div className="brands-carousel-controls">
                            <button
                                type="button"
                                className="brands-carousel-arrow"
                                onClick={() => scrollBrands(-1)}
                                disabled={!brandScroll.left}
                                aria-label="Նախորդ մակնիշները"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                className="brands-carousel-arrow"
                                onClick={() => scrollBrands(1)}
                                disabled={!brandScroll.right}
                                aria-label="Հաջորդ մակնիշները"
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    <div
                        className="brands-grid"
                        ref={brandsTrackRef}
                        onScroll={updateBrandArrows}
                    >
                        {BRANDS.map((brand) => {
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
                                    onClick={() =>
                                        navigate(
                                            `/cars?brand=${encodeURIComponent(
                                                brand.name,
                                            )}`,
                                        )
                                    }
                                >
                                    <img
                                        src={asset(brand.logo)}
                                        alt={brand.name}
                                        className="brand-logo"
                                        loading="lazy"
                                        draggable={false}
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

                <button
                    type="button"
                    className="ad-banner"
                    onClick={openBusinessProposal}
                    aria-label="Կապվել ադմինի հետ գովազդի կամ բիզնես առաջարկի համար"
                    title="Գրել ադմինին՝ գովազդի վերաբերյալ"
                    style={{
                        display: "block",
                        width: "100%",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        font: "inherit",
                    }}
                >
                    <img
                        src={asset("/data/armmotors-banner.png")}
                        alt="Ձեր գովազդը մեր հարթակում․ կապվեք մեզ հետ"
                        className="ad-image"
                        loading="lazy"
                        style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </button>
            </section>
        );
    }

    // =========================================
    // MAIN PAGE
    // =========================================

    return (
        <div className="home-wrapper">
            <main className="main-content">
                {/* SEARCH */}

                <section className="intro-section">
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

                            {/* SEARCH SUGGESTIONS */}

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

                        <Filter />
                    </div>
                </section>

                {/* CATEGORIES */}

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
                                        src={asset(cat.image)}
                                        alt=""
                                        draggable={false}
                                        loading="lazy"
                                    />
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* PRODUCTS */}

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

            {/* FOOTER */}

            <footer className="home-footer">
                <div className="footer-container">
                    <strong>ArmMotors</strong>
                    <span>{t("headerMarket")}</span>
                </div>
            </footer>
        </div>
    );
}
