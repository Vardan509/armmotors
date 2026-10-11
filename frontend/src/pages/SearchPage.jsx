import { useEffect, useMemo, useState } from "react";

import Header from "../components/header/Header";
import ProductCard from "../components/ProductCard/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

import useProducts from "../utils/useProducts";
import { pageUrl } from "../utils/navigation";

import "./SearchPage.css";

const STORAGE_KEY = "armmotors-saved-searches";
const PAGE_SIZE = 12;

const normalize = (value) =>
    String(value ?? "")
        .trim()
        .toLocaleLowerCase();

const readParams = () => {
    const params = new URLSearchParams(window.location.search);

    return {
        query: params.get("q") || "",
        type: params.get("type") || "all",
        sort: params.get("sort") || "newest",
        brand: params.get("brand") || "all",
    };
};

function readSavedSearches() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function getPrice(product) {
    const price = Number(product.price);
    return Number.isFinite(price) ? price : 0;
}

export default function SearchPage() {
    const initial = readParams();

    const [query, setQuery] = useState(initial.query);
    const [type, setType] = useState(initial.type);
    const [sort, setSort] = useState(initial.sort);
    const [brand, setBrand] = useState(initial.brand);
    const [page, setPage] = useState(1);

    const [savedSearches, setSavedSearches] = useState(readSavedSearches);

    const [notice, setNotice] = useState("");

    const { products = [], loading, error } = useProducts();

    const brands = useMemo(() => {
        return [
            ...new Set(
                products.map((product) => product.brand).filter(Boolean),
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [products]);

    const results = useMemo(() => {
        const term = normalize(query);

        return products
            .filter((product) => {
                if (product.status === "draft" || product.status === "sold") {
                    return false;
                }

                if (type !== "all" && product.type !== type) {
                    return false;
                }

                if (
                    brand !== "all" &&
                    normalize(product.brand) !== normalize(brand)
                ) {
                    return false;
                }

                if (!term) return true;

                const searchable = [
                    product.title,
                    product.brand,
                    product.model,
                    product.year,
                    product.region,
                    product.vin,
                    product.description,
                ]
                    .map(normalize)
                    .join(" ");

                return searchable.includes(term);
            })
            .sort((a, b) => {
                switch (sort) {
                    case "priceAsc":
                        return getPrice(a) - getPrice(b);

                    case "priceDesc":
                        return getPrice(b) - getPrice(a);

                    case "yearDesc":
                        return Number(b.year || 0) - Number(a.year || 0);

                    case "yearAsc":
                        return Number(a.year || 0) - Number(b.year || 0);

                    default:
                        return (
                            (Date.parse(b.createdAt) || 0) -
                            (Date.parse(a.createdAt) || 0)
                        );
                }
            });
    }, [products, query, type, brand, sort]);

    const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

    const currentPage = Math.min(page, totalPages);

    const visibleProducts = results.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    useEffect(() => {
        const params = new URLSearchParams();

        if (query.trim()) params.set("q", query.trim());
        if (type !== "all") params.set("type", type);
        if (brand !== "all") params.set("brand", brand);
        if (sort !== "newest") params.set("sort", sort);

        const url =
            window.location.pathname + (params.toString() ? `?${params}` : "");

        window.history.replaceState(null, "", url);
    }, [query, type, brand, sort]);

    function updateQuery(value) {
        setQuery(value);
        setPage(1);
        setNotice("");
    }

    function updateType(value) {
        setType(value);
        setPage(1);
    }

    function updateBrand(value) {
        setBrand(value);
        setPage(1);
    }

    function updateSort(value) {
        setSort(value);
        setPage(1);
    }

    function clearFilters() {
        setQuery("");
        setType("all");
        setBrand("all");
        setSort("newest");
        setPage(1);
        setNotice("");
    }

    function saveSearch() {
        const item = {
            query: query.trim(),
            type,
            brand,
            sort,
        };

        const key = JSON.stringify(item);

        if (savedSearches.some((saved) => JSON.stringify(saved) === key)) {
            setNotice("Այս որոնումն արդեն պահպանված է։");
            return;
        }

        const updated = [item, ...savedSearches].slice(0, 8);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            setSavedSearches(updated);
            setNotice("Որոնումը պահպանվեց։");
        } catch {
            setNotice("Որոնումը պահպանել չհաջողվեց։");
        }
    }

    function applySavedSearch(item) {
        setQuery(item.query);
        setType(item.type);
        setBrand(item.brand);
        setSort(item.sort);
        setPage(1);
        setNotice("");
    }

    function removeSavedSearch(index) {
        const updated = savedSearches.filter(
            (_, currentIndex) => currentIndex !== index,
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setSavedSearches(updated);
    }

    async function shareSearch() {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setNotice("Որոնման հղումը պատճենվեց։");
        } catch {
            setNotice("Հղումը պատճենել չհաջողվեց։");
        }
    }

    function changePage(nextPage) {
        setPage(nextPage);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <>
            <Header />

            <main className="search-page">
                <div className="search-heading">
                    <span>ARMMOTORS / SEARCH</span>

                    <h1>Գտեք Ձեր հաջորդ մեքենան</h1>

                    <p>
                        Որոնեք մեքենաներ և պահեստամասեր՝ արագ, պարզ և հարմար
                        եղանակով։
                    </p>
                </div>

                <section className="search-panel">
                    <div className="search-main-input">
                        <label htmlFor="armmotors-search">
                            Ի՞նչ եք փնտրում
                        </label>

                        <div className="search-input-wrapper">
                            <input
                                id="armmotors-search"
                                type="search"
                                placeholder="Օրինակ՝ Mercedes C-Class"
                                value={query}
                                onChange={(event) =>
                                    updateQuery(event.target.value)
                                }
                            />

                            {query && (
                                <button
                                    type="button"
                                    onClick={() => updateQuery("")}
                                >
                                    Մաքրել
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="search-controls">
                        <label>
                            Տեսակ
                            <select
                                value={type}
                                onChange={(event) =>
                                    updateType(event.target.value)
                                }
                            >
                                <option value="all">
                                    Բոլոր հայտարարությունները
                                </option>
                                <option value="car">Մեքենաներ</option>
                                <option value="part">Պահեստամասեր</option>
                            </select>
                        </label>

                        <label>
                            Մակնիշ
                            <select
                                value={brand}
                                onChange={(event) =>
                                    updateBrand(event.target.value)
                                }
                            >
                                <option value="all">Բոլոր մակնիշները</option>

                                {brands.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Դասավորել
                            <select
                                value={sort}
                                onChange={(event) =>
                                    updateSort(event.target.value)
                                }
                            >
                                <option value="newest">Նորերը սկզբում</option>
                                <option value="priceAsc">
                                    Գին՝ էժանից թանկ
                                </option>
                                <option value="priceDesc">
                                    Գին՝ թանկից էժան
                                </option>
                                <option value="yearDesc">
                                    Տարի՝ նորից հին
                                </option>
                                <option value="yearAsc">Տարի՝ հնից նոր</option>
                            </select>
                        </label>
                    </div>

                    <div className="search-actions">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="search-action-light"
                        >
                            Մաքրել ֆիլտրերը
                        </button>

                        <button
                            type="button"
                            onClick={shareSearch}
                            className="search-action-light"
                        >
                            Կիսվել որոնմամբ
                        </button>

                        <button
                            type="button"
                            onClick={saveSearch}
                            className="search-action-primary"
                        >
                            Պահպանել որոնումը
                        </button>
                    </div>

                    {notice && (
                        <p className="search-notice" role="status">
                            {notice}
                        </p>
                    )}
                </section>

                {savedSearches.length > 0 && (
                    <section className="saved-searches">
                        <div className="saved-searches-heading">
                            <h2>Պահպանված որոնումներ</h2>
                            <span>{savedSearches.length} / 8</span>
                        </div>

                        <div className="saved-search-list">
                            {savedSearches.map((item, index) => (
                                <div className="saved-search-item" key={index}>
                                    <button
                                        type="button"
                                        onClick={() => applySavedSearch(item)}
                                    >
                                        {item.query || item.brand !== "all"
                                            ? [
                                                  item.query,
                                                  item.brand !== "all"
                                                      ? item.brand
                                                      : "",
                                              ]
                                                  .filter(Boolean)
                                                  .join(" · ")
                                            : "Բոլոր հայտարարությունները"}
                                    </button>

                                    <button
                                        type="button"
                                        className="saved-search-remove"
                                        aria-label="Հեռացնել որոնումը"
                                        onClick={() => removeSavedSearch(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="search-results-heading">
                    <div>
                        <h2>Որոնման արդյունքներ</h2>
                        <p>
                            {loading
                                ? "Բեռնվում է..."
                                : `Գտնվել է ${results.length} հայտարարություն`}
                        </p>
                    </div>

                    <a href={pageUrl("/cars")}>Բոլոր մեքենաները →</a>
                </div>

                {error && (
                    <div className="search-error" role="alert">
                        {error}
                    </div>
                )}

                {loading && <ProductSkeleton count={8} />}

                {!loading && !error && results.length === 0 && (
                    <div className="search-empty">
                        <h3>Ոչինչ չի գտնվել</h3>

                        <p>
                            Փորձեք փոխել որոնման բառերը, մակնիշը կամ
                            հայտարարության տեսակը։
                        </p>

                        <button type="button" onClick={clearFilters}>
                            Ցույց տալ բոլորը
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="search-results-grid">
                        {visibleProducts.map((item) => (
                            <ProductCard
                                key={item._id || item.id}
                                item={item}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <nav
                        className="search-pagination"
                        aria-label="Արդյունքների էջեր"
                    >
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => changePage(currentPage - 1)}
                        >
                            ← Նախորդ
                        </button>

                        <span>
                            Էջ {currentPage} / {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => changePage(currentPage + 1)}
                        >
                            Հաջորդ →
                        </button>
                    </nav>
                )}
            </main>
        </>
    );
}
