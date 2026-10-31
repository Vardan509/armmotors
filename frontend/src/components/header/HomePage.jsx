import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ProductCard from "../ProductCard/ProductCard";
import SmartSearch from "../SmartSearch/SmartSearch";
import Filter from "../filterCar/filter.jsx";

import useProducts from "../../utils/useProducts";
import { useI18n } from "../../utils/i18n";
import { localizeListingValue } from "../../utils/localizeListing";
import { asset } from "../../utils/asset";

import "./HomePage.css";
import "../../styles/ArmMotorsMobile.css";
import "./HomeCategoriesCarousel.css";
import "./CategoryShowroom.css";

const BANNERS = {
    hy: "/data/armmotors-banner.png",
    ru: "/data/armmotors-banner-ru.png",
    en: "/data/armmotors-banner-en.png",
};

const TEXTS = {
    hy: {
        categories: "Կատեգորիաներ",
        previousCategory: "Նախորդ կատեգորիաները",
        nextCategory: "Հաջորդ կատեգորիաները",
        previousBrands: "Նախորդ մակնիշները",
        nextBrands: "Հաջորդ մակնիշները",
        advertisement: "Ձեր գովազդը մեր հարթակում",
        contact: "Կապվել գովազդի և համագործակցության համար",
        suggestions: "Որոնման առաջարկներ",
        error: "Հայտարարությունները բեռնել չհաջողվեց։",
    },
    ru: {
        categories: "Категории",
        previousCategory: "Предыдущие категории",
        nextCategory: "Следующие категории",
        previousBrands: "Предыдущие марки",
        nextBrands: "Следующие марки",
        advertisement: "Ваша реклама на нашей платформе",
        contact: "Связаться по вопросам рекламы и сотрудничества",
        suggestions: "Поисковые подсказки",
        error: "Не удалось загрузить объявления.",
    },
    en: {
        categories: "Categories",
        previousCategory: "Previous categories",
        nextCategory: "Next categories",
        previousBrands: "Previous brands",
        nextBrands: "Next brands",
        advertisement: "Your ad on our platform",
        contact: "Contact us about advertising and collaboration",
        suggestions: "Search suggestions",
        error: "Could not load listings.",
    },
};

const CATEGORIES = [
    {
        id: "electric",
        image: "/categories/electric.png",
        title: {
            hy: "Էլեկտրական",
            ru: "Электромобили",
            en: "Electric",
        },
    },
    {
        id: "hybrid",
        image: "/categories/hybrid.png",
        title: {
            hy: "Հիբրիդ",
            ru: "Гибриды",
            en: "Hybrid",
        },
    },
    {
        id: "new",
        image: "/categories/new_cars.png",
        title: {
            hy: "Նոր",
            ru: "Новые",
            en: "New",
        },
    },
    // {
    //     id: "truck",
    //     image: "/categories/trucks.png",
    //     title: {
    //         hy: "Բեռնատարներ",
    //         ru: "Грузовики",
    //         en: "Trucks",
    //     },
    // },
];

const BRANDS = [
    { name: "Mercedes-Benz", logo: "/mercedes.png" },
    { name: "Toyota", logo: "/toyota.png" },
    { name: "BMW", logo: "/bmw.png" },
    { name: "Changan", logo: "/changan.png" },
    { name: "Nissan", logo: "/nissan.png" },
    { name: "Kia", logo: "/kia.png" },
];

function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase();
}

function getTitle(product, language) {
    return (
        product.translations?.[language]?.title ||
        product.titleTranslations?.[language] ||
        product.title ||
        [product.brand, product.model].filter(Boolean).join(" ")
    );
}

function matchesSearch(product, query, language) {
    return (
        !query ||
        [
            product.title,
            getTitle(product, language),
            product.brand,
            product.model,
            product.year,
        ].some((value) => normalize(value).includes(query))
    );
}

function motionBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
}

/* Shared scrolling controls for categories and brands. */

function useScrollTrack(ref, revision) {
    const [arrows, setArrows] = useState({
        left: false,
        right: false,
    });

    function update() {
        const track = ref.current;

        if (!track) return;

        const maximum = track.scrollWidth - track.clientWidth;

        setArrows({
            left: track.scrollLeft > 2,
            right: track.scrollLeft < maximum - 2,
        });
    }

    useEffect(() => {
        const track = ref.current;

        if (!track) return;

        function measure() {
            const maximum = track.scrollWidth - track.clientWidth;

            setArrows({
                left: track.scrollLeft > 2,
                right: track.scrollLeft < maximum - 2,
            });
        }

        measure();

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(measure)
                : null;

        observer?.observe(track);

        Array.from(track.children).forEach((child) => {
            observer?.observe(child);
        });

        window.addEventListener("resize", measure);

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [ref, revision]);

    function scroll(direction) {
        const track = ref.current;

        if (!track) return;

        const firstCard = track.firstElementChild;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap) || 0;

        const distance = firstCard
            ? firstCard.getBoundingClientRect().width + gap
            : track.clientWidth;

        track.scrollBy({
            left: direction * distance,
            behavior: motionBehavior(),
        });
    }

    return { arrows, update, scroll };
}

function Advertisement({ language, text, onClick }) {
    const source = BANNERS[language] || BANNERS.hy;

    return (
        <button
            type="button"
            className="ad-banner"
            onClick={onClick}
            aria-label={text.contact}
            title={text.contact}
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
                key={source}
                src={asset(source)}
                alt={text.advertisement}
                className="ad-image"
                loading="lazy"
                onError={(event) => {
                    const image = event.currentTarget;

                    if (image.dataset.fallback === "true") return;

                    image.dataset.fallback = "true";
                    image.src = asset(BANNERS.hy);
                }}
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
        </button>
    );
}

export default function HomePage() {
    const { language, t } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { products = [], loading, error } = useProducts();

    const categoryTrackRef = useRef(null);
    const brandsTrackRef = useRef(null);

    const categoryCarousel = useScrollTrack(categoryTrackRef, language);
    const brandsCarousel = useScrollTrack(brandsTrackRef, loading);

    const [search, setSearch] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    const productList = Array.isArray(products) ? products : [];
    const query = normalize(search);

    const requestedCategory = searchParams.get("category") || "";

    const category = CATEGORIES.some((item) => item.id === requestedCategory)
        ? requestedCategory
        : "";

    const selectedCategory = CATEGORIES.find((item) => item.id === category);

    const searchSuggestions = query
        ? productList
              .filter((product) => matchesSearch(product, query, language))
              .slice(0, 6)
        : [];

    const filteredProducts = productList.filter((product) => {
        if (!matchesSearch(product, query, language)) return false;

        if (category === "electric" || category === "hybrid") {
            const fuel = localizeListingValue(product.fuel, "en", "fuel");

            return product.type === "car" && normalize(fuel) === category;
        }

        if (category === "new") {
            return (
                product.type === "car" &&
                localizeListingValue(product.condition, "en", "condition") ===
                    "New"
            );
        }

        if (category === "truck") {
            return product.type === "car" && product.vehicleType === "truck";
        }

        return true;
    });

    function updateCategory(value) {
        const next = new URLSearchParams(searchParams);

        if (value) {
            next.set("category", value);
        } else {
            next.delete("category");
        }

        setSearchParams(next, {
            replace: true,
            preventScrollReset: true,
        });
    }

    function selectCategory(value) {
        updateCategory(category === value ? "" : value);

        document.getElementById("products")?.scrollIntoView({
            behavior: motionBehavior(),
        });
    }

    function resetFilters() {
        setSearch("");
        setSearchFocused(false);
        updateCategory("");
    }

    function submitSearch(value) {
        setSearchFocused(false);

        const params = new URLSearchParams();

        if (value) params.set("q", value);

        navigate(params.size ? `/search?${params.toString()}` : "/search");
    }

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
                                disabled={!brandsCarousel.arrows.left}
                                onClick={() => brandsCarousel.scroll(-1)}
                                aria-label={text.previousBrands}
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                className="brands-carousel-arrow"
                                disabled={!brandsCarousel.arrows.right}
                                onClick={() => brandsCarousel.scroll(1)}
                                aria-label={text.nextBrands}
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    <div
                        className="brands-grid"
                        ref={brandsTrackRef}
                        onScroll={brandsCarousel.update}
                    >
                        {BRANDS.map((brand) => {
                            const count = productList.filter(
                                (product) =>
                                    product.type === "car" &&
                                    normalize(product.brand) ===
                                        normalize(brand.name),
                            ).length;

                            return (
                                <button
                                    type="button"
                                    key={brand.name}
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

                <Advertisement
                    language={language}
                    text={text}
                    onClick={openBusinessProposal}
                />
            </section>
        );
    }

    function renderProducts(items, className) {
        return (
            <div className={`products-grid ${className}`}>
                {items.map((product) => (
                    <ProductCard
                        key={product._id || product.id}
                        item={product}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="home-wrapper">
            <main className="main-content">
                <section className="intro-section">
                    <div
                        className="home-search-controls"
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            width: "100%",
                            minWidth: 0,
                        }}
                    >
                        <div
                            className="search-area"
                            style={{
                                position: "relative",
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
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    setSearchFocused(false);
                                }
                            }}
                        >
                            <SmartSearch
                                value={search}
                                onChange={(value) => {
                                    setSearch(value);
                                    setSearchFocused(true);
                                }}
                                onSearch={submitSearch}
                            />

                            {searchFocused && query && (
                                <div
                                    className="search-suggestions"
                                    role="group"
                                    aria-label={text.suggestions}
                                >
                                    {searchSuggestions.length ? (
                                        searchSuggestions.map((product) => {
                                            const title = getTitle(
                                                product,
                                                language,
                                            );

                                            return (
                                                <button
                                                    type="button"
                                                    className="search-suggestion"
                                                    key={
                                                        product._id ||
                                                        product.id
                                                    }
                                                    onMouseDown={(event) =>
                                                        event.preventDefault()
                                                    }
                                                    onClick={() => {
                                                        setSearch(title);
                                                        setSearchFocused(false);
                                                    }}
                                                >
                                                    <span className="search-suggestion-main">
                                                        <strong>{title}</strong>

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
                                            );
                                        })
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

                <section
                    className="categories-section am-category-carousel"
                    aria-label={text.categories}
                >
                    <button
                        type="button"
                        className="am-category-arrow am-category-arrow-prev"
                        disabled={!categoryCarousel.arrows.left}
                        onClick={() => categoryCarousel.scroll(-1)}
                        aria-label={text.previousCategory}
                        aria-controls="home-category-track"
                    >
                        ‹
                    </button>

                    <div
                        id="home-category-track"
                        className="categories-grid"
                        ref={categoryTrackRef}
                        onScroll={categoryCarousel.update}
                    >
                        {CATEGORIES.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                className={`category-card category-card-${item.id}`}
                                aria-pressed={category === item.id}
                                onClick={() => selectCategory(item.id)}
                            >
                                <span className="category-title">
                                    {item.title[language] || item.title.hy}
                                </span>

                                <span className="category-image-wrapper">
                                    <img
                                        className="category-image"
                                        src={asset(item.image)}
                                        alt=""
                                        draggable={false}
                                        loading="lazy"
                                    />
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="am-category-arrow am-category-arrow-next"
                        disabled={!categoryCarousel.arrows.right}
                        onClick={() => categoryCarousel.scroll(1)}
                        aria-label={text.nextCategory}
                        aria-controls="home-category-track"
                    >
                        ›
                    </button>
                </section>

                <section
                    className="products-section"
                    id="products"
                    aria-busy={loading}
                >
                    <div className="section-header products-heading">
                        <h2>
                            {query
                                ? t("searchResults")
                                : selectedCategory
                                  ? selectedCategory.title[language] ||
                                    selectedCategory.title.hy
                                  : t("latestListings")}
                        </h2>
                    </div>

                    {(query || category) && (
                        <button
                            type="button"
                            className="clear-filter-button"
                            onClick={resetFilters}
                        >
                            {t("clearFilters")}
                        </button>
                    )}

                    {loading ? (
                        <p role="status">{t("loading")}</p>
                    ) : error ? (
                        <p className="catalog-notice" role="alert">
                            {text.error}
                        </p>
                    ) : filteredProducts.length ? (
                        <>
                            {renderProducts(
                                filteredProducts.slice(0, 8),
                                "products-grid-leading",
                            )}

                            {renderBrandsAndAd()}

                            {filteredProducts.length > 8 &&
                                renderProducts(
                                    filteredProducts.slice(8),
                                    "products-grid-trailing",
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

            <footer className="home-footer">
                <div className="footer-container">
                    <strong>ArmMotors</strong>
                    <span>{t("headerMarket")}</span>
                </div>
            </footer>
        </div>
    );
}
