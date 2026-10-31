import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ProductCard from "../ProductCard/ProductCard";
import Filter from "../filterCar/filter.jsx";
import SmartSearch from "../SmartSearch/SmartSearch";

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
            hy: "Նոր մեքենաներ",
            ru: "Новые автомобили",
            en: "New cars",
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
];

const BRANDS = [
    { id: 1, name: "Mercedes-Benz", logo: "/mercedes.png" },
    { id: 2, name: "Toyota", logo: "/toyota.png" },
    { id: 3, name: "BMW", logo: "/bmw.png" },
    { id: 4, name: "Tesla", logo: "/tesla.png" },
    { id: 5, name: "Nissan", logo: "/nissan.png" },
    { id: 6, name: "Kia", logo: "/kia.png" },
];

const COPY = {
    hy: {
        eyebrow: "ARMMOTORS · ԱՎՏՈՇՈՒԿԱ",
        title: "Գտեք ձեր հաջորդ մեքենան",
        description:
            "Դիտեք ավտոմեքենաների հայտարարություններ, կապվեք վաճառողների հետ։",
        categories: "Ընտրեք կատեգորիան",
        categoriesSub: "Գտեք ձեզ հետաքրքրող ավտոմեքենան",
        latest: "Վերջին հայտարարությունները",
        brands: "Հանրաճանաչ մակնիշներ",
        brandsSub: "Ընտրեք նախընտրած մակնիշը",
        listings: "հայտարարություն",
        all: "Բոլոր մեքենաները",
        clear: "Մաքրել ֆիլտրերը",
        empty: "Հայտարարություններ չեն գտնվել",
        showAll: "Ցուցադրել բոլորը",
        loading: "Բեռնվում է...",
        adTitle: "Ձեր գովազդը՝ ArmMotors-ում",
        adText: "Ներկայացրեք ձեր բիզնեսը մեր հարթակում։",
        adButton: "Կապվել մեզ հետ",
        previous: "Նախորդ մակնիշները",
        next: "Հաջորդ մակնիշները",
    },
    ru: {
        eyebrow: "ARMMOTORS · АВТОРЫНОК",
        title: "Найдите свой следующий автомобиль",
        description:
            "Изучайте объявления, сравнивайте предложения и связывайтесь с продавцами.",
        categories: "Выберите категорию",
        categoriesSub: "Найдите подходящий автомобиль",
        latest: "Последние объявления",
        brands: "Популярные марки",
        brandsSub: "Выберите любимую марку",
        listings: "объявлений",
        all: "Все автомобили",
        clear: "Сбросить фильтры",
        empty: "Объявления не найдены",
        showAll: "Показать все",
        loading: "Загрузка...",
        adTitle: "Ваша реклама на ArmMotors",
        adText: "Расскажите о своем бизнесе на нашей платформе.",
        adButton: "Связаться с нами",
        previous: "Предыдущие марки",
        next: "Следующие марки",
    },
    en: {
        eyebrow: "ARMMOTORS · CAR MARKETPLACE",
        title: "Find your next car",
        description:
            "Explore car listings, compare offers and connect with sellers.",
        categories: "Explore categories",
        categoriesSub: "Find the right vehicle for you",
        latest: "Latest listings",
        brands: "Popular brands",
        brandsSub: "Browse your favorite brands",
        listings: "listings",
        all: "All cars",
        clear: "Clear filters",
        empty: "No listings found",
        showAll: "Show all",
        loading: "Loading...",
        adTitle: "Advertise on ArmMotors",
        adText: "Promote your business on our marketplace.",
        adButton: "Contact us",
        previous: "Previous brands",
        next: "Next brands",
    },
};

function SearchIcon() {
    return (
        <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
    );
}

function getProductId(product) {
    return String(product?._id || product?.id || "");
}

function isNewCar(product) {
    const condition = String(product?.condition || "")
        .trim()
        .toLowerCase();

    return condition === "new" || condition === "նոր" || condition === "новый";
}

export default function HomePage() {
    const navigate = useNavigate();
    const { language } = useI18n();

    const text = COPY[language] || COPY.hy;

    const [searchParams, setSearchParams] = useSearchParams();
    const { products = [], loading, error } = useProducts();

    const brandsTrackRef = useRef(null);

    const [brandScroll, setBrandScroll] = useState({
        left: false,
        right: false,
    });

    const allProducts = Array.isArray(products) ? products : [];

    const requestedCategory = searchParams.get("category") || "";

    const category = CATEGORIES.some((item) => item.value === requestedCategory)
        ? requestedCategory
        : "";

    const filteredProducts = useMemo(() => {
        const list = Array.isArray(products) ? products : [];

        return list.filter((product) => {
            if (category === "electric") {
                return product.type === "car" && product.fuel === "electric";
            }

            if (category === "hybrid") {
                return product.type === "car" && product.fuel === "hybrid";
            }

            if (category === "new") {
                return product.type === "car" && isNewCar(product);
            }

            if (category === "truck") {
                return (
                    product.type === "car" && product.vehicleType === "truck"
                );
            }

            return true;
        });
    }, [products, category]);

    const firstProducts = filteredProducts.slice(0, 8);
    const restProducts = filteredProducts.slice(8);

    const selectedCategory = CATEGORIES.find((item) => item.value === category);

    const brandCounts = useMemo(() => {
        const counts = new Map();
        const list = Array.isArray(products) ? products : [];

        for (const product of list) {
            if (product.type !== "car") continue;

            const name = String(product.brand || "")
                .trim()
                .toLowerCase();

            if (!name) continue;

            counts.set(name, (counts.get(name) || 0) + 1);
        }

        return counts;
    }, [products]);

    function updateCategory(value) {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set("category", value);
        } else {
            params.delete("category");
        }

        setSearchParams(params, {
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
            block: "start",
        });
    }

    function resetFilters() {
        updateCategory("");
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

    function updateBrandArrows() {
        const track = brandsTrackRef.current;

        if (!track) return;

        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);

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

        const distance = (card.getBoundingClientRect().width + gap) * 2;

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

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateBrandArrows)
                : null;

        observer?.observe(track);

        track.querySelectorAll(".brand-card").forEach((card) => {
            observer?.observe(card);
        });

        updateBrandArrows();

        window.addEventListener("resize", updateBrandArrows);

        return () => {
            observer?.disconnect();

            window.removeEventListener("resize", updateBrandArrows);
        };
    }, [loading]);

    function renderBrandsAndAd() {
        return (
            <section className="brands-ad-wrapper brands-ad-middle" id="brands">
                <div className="brands-section">
                    <div className="section-header brands-carousel-header">
                        <div>
                            <span className="section-label">ARMMOTORS</span>

                            <h2>{text.brands}</h2>
                            <p>{text.brandsSub}</p>
                        </div>

                        <div className="brands-carousel-controls">
                            <button
                                type="button"
                                className="brands-carousel-arrow"
                                onClick={() => scrollBrands(-1)}
                                disabled={!brandScroll.left}
                                aria-label={text.previous}
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                className="brands-carousel-arrow"
                                onClick={() => scrollBrands(1)}
                                disabled={!brandScroll.right}
                                aria-label={text.next}
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
                            const count =
                                brandCounts.get(brand.name.toLowerCase()) || 0;

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
                                    <span className="brand-logo-wrap">
                                        <img
                                            src={asset(brand.logo)}
                                            alt={brand.name}
                                            className="brand-logo"
                                            loading="lazy"
                                            draggable={false}
                                        />
                                    </span>

                                    <span className="brand-name">
                                        {brand.name}
                                    </span>

                                    <small>
                                        {count} {text.listings}
                                    </small>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="home-ad-section">
                    <button
                        type="button"
                        className="ad-banner"
                        onClick={openBusinessProposal}
                        aria-label={text.adTitle}
                    >
                        <img
                            src={asset("/data/armmotors-banner.png")}
                            alt={text.adTitle}
                            className="ad-image"
                            loading="lazy"
                        />
                    </button>

                    <div className="home-ad-bottom">
                        <div>
                            <strong>{text.adTitle}</strong>
                            <span>{text.adText}</span>
                        </div>

                        <button
                            type="button"
                            onClick={openBusinessProposal}
                            className="home-ad-contact"
                        >
                            {text.adButton}
                            <ArrowIcon />
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="home-wrapper">
            <main className="main-content">
                {/* HERO + SMART SEARCH */}

                <section className="intro-section">
                    <div className="home-hero-heading">
                        <span className="home-hero-eyebrow">
                            <span className="home-hero-dot" />
                            {text.eyebrow}
                        </span>

                        <h1>{text.title}</h1>

                        <p>{text.description}</p>
                    </div>

                    <div className="home-search-controls">
                        <div className="search-area">
                            <SmartSearch />
                        </div>

                        <Filter />
                    </div>
                </section>

                {/* CATEGORIES */}

                <section className="categories-section">
                    <div className="section-header">
                        <div>
                            <span className="section-label">EXPLORE</span>

                            <h2>{text.categories}</h2>
                            <p>{text.categoriesSub}</p>
                        </div>
                    </div>

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
                                        loading="lazy"
                                        draggable={false}
                                    />
                                </span>

                                <span className="category-card-arrow">↗</span>
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
                        <div>
                            <span className="section-label">ARMMOTORS</span>

                            <h2>
                                {selectedCategory
                                    ? selectedCategory.title[language] ||
                                      selectedCategory.title.hy
                                    : text.latest}
                            </h2>
                        </div>

                        <button
                            type="button"
                            className="home-all-cars"
                            onClick={() => navigate("/cars")}
                        >
                            {text.all}
                            <ArrowIcon />
                        </button>
                    </div>

                    {category && (
                        <div className="home-filter-status">
                            <span>
                                {filteredProducts.length} {text.listings}
                            </span>

                            <button
                                type="button"
                                className="clear-filter-button"
                                onClick={resetFilters}
                            >
                                {text.clear}
                            </button>
                        </div>
                    )}

                    {error && (
                        <p className="catalog-notice" role="alert">
                            {String(error)}
                        </p>
                    )}

                    {loading ? (
                        <div className="home-loading" role="status">
                            <span className="home-loading-spinner" />
                            {text.loading}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <div className="products-grid products-grid-leading">
                                {firstProducts.map((product) => (
                                    <ProductCard
                                        key={getProductId(product)}
                                        item={product}
                                    />
                                ))}
                            </div>

                            {renderBrandsAndAd()}

                            {restProducts.length > 0 && (
                                <div className="products-grid products-grid-trailing">
                                    {restProducts.map((product) => (
                                        <ProductCard
                                            key={getProductId(product)}
                                            item={product}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="empty-results">
                                <div className="empty-results-icon">
                                    <SearchIcon />
                                </div>

                                <h3>{text.empty}</h3>

                                <button type="button" onClick={resetFilters}>
                                    {text.showAll}
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

                    <span>
                        © {new Date().getFullYear()} · {text.eyebrow}
                    </span>
                </div>
            </footer>
        </div>
    );
}
