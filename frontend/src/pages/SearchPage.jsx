import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

import useProducts from "../utils/useProducts";
import { useI18n } from "../utils/i18n";

import "./SearchPage.css";

const STORAGE_KEY = "armmotors-saved-searches";
const PAGE_SIZE = 12;

const TEXTS = {
    hy: {
        section: "ARMMOTORS / ՈՐՈՆՈՒՄ",
        title: "Գտեք Ձեր հաջորդ մեքենան",
        subtitle:
            "Որոնեք մեքենաներ և պահեստամասեր՝ արագ, պարզ և հարմար եղանակով։",
        inputLabel: "Ի՞նչ եք փնտրում",
        placeholder: "Օրինակ՝ Mercedes C-Class",
        clear: "Մաքրել",
        type: "Տեսակ",
        allListings: "Բոլոր հայտարարությունները",
        cars: "Մեքենաներ",
        parts: "Պահեստամասեր",
        brand: "Մակնիշ",
        allBrands: "Բոլոր մակնիշները",
        sort: "Դասավորել",
        newest: "Նորերը սկզբում",
        priceAsc: "Գին՝ էժանից թանկ",
        priceDesc: "Գին՝ թանկից էժան",
        yearDesc: "Տարեթիվ՝ նորից հին",
        yearAsc: "Տարեթիվ՝ հնից նոր",
        clearFilters: "Մաքրել ֆիլտրերը",
        share: "Կիսվել որոնմամբ",
        save: "Պահպանել որոնումը",
        savedTitle: "Պահպանված որոնումներ",
        remove: "Հեռացնել որոնումը",
        results: "Որոնման արդյունքներ",
        loading: "Բեռնվում է...",
        found: (count) => `Գտնվել է ${count} հայտարարություն`,
        allCars: "Բոլոր մեքենաները",
        emptyTitle: "Ոչինչ չի գտնվել",
        emptyDescription:
            "Փորձեք փոխել որոնման բառերը, մակնիշը կամ հայտարարության տեսակը։",
        showAll: "Ցույց տալ բոլորը",
        pagination: "Արդյունքների էջեր",
        previous: "Նախորդ",
        next: "Հաջորդ",
        page: "Էջ",
        alreadySaved: "Այս որոնումն արդեն պահպանված է։",
        saved: "Որոնումը պահպանվեց։",
        saveFailed: "Որոնումը պահպանել չհաջողվեց։",
        removeFailed: "Որոնումը հեռացնել չհաջողվեց։",
        copied: "Որոնման հղումը պատճենվեց։",
        copyFailed: "Հղումը պատճենել չհաջողվեց։",
        loadFailed: "Հայտարարությունները բեռնել չհաջողվեց։ Փորձեք ավելի ուշ։",
    },

    ru: {
        section: "ARMMOTORS / ПОИСК",
        title: "Найдите свой следующий автомобиль",
        subtitle: "Ищите автомобили и запчасти быстро, просто и удобно.",
        inputLabel: "Что вы ищете?",
        placeholder: "Например: Mercedes C-Class",
        clear: "Очистить",
        type: "Тип",
        allListings: "Все объявления",
        cars: "Автомобили",
        parts: "Запчасти",
        brand: "Марка",
        allBrands: "Все марки",
        sort: "Сортировка",
        newest: "Сначала новые объявления",
        priceAsc: "Цена: по возрастанию",
        priceDesc: "Цена: по убыванию",
        yearDesc: "Год: от новых к старым",
        yearAsc: "Год: от старых к новым",
        clearFilters: "Сбросить фильтры",
        share: "Поделиться поиском",
        save: "Сохранить поиск",
        savedTitle: "Сохранённые поиски",
        remove: "Удалить поиск",
        results: "Результаты поиска",
        loading: "Загрузка...",
        found: (count) => `Найдено объявлений: ${count}`,
        allCars: "Все автомобили",
        emptyTitle: "Ничего не найдено",
        emptyDescription:
            "Попробуйте изменить поисковый запрос, марку или тип объявления.",
        showAll: "Показать все",
        pagination: "Страницы результатов",
        previous: "Назад",
        next: "Далее",
        page: "Страница",
        alreadySaved: "Этот поиск уже сохранён.",
        saved: "Поиск сохранён.",
        saveFailed: "Не удалось сохранить поиск.",
        removeFailed: "Не удалось удалить поиск.",
        copied: "Ссылка на поиск скопирована.",
        copyFailed: "Не удалось скопировать ссылку.",
        loadFailed: "Не удалось загрузить объявления. Попробуйте позже.",
    },

    en: {
        section: "ARMMOTORS / SEARCH",
        title: "Find your next car",
        subtitle: "Search for cars and spare parts quickly and easily.",
        inputLabel: "What are you looking for?",
        placeholder: "For example: Mercedes C-Class",
        clear: "Clear",
        type: "Type",
        allListings: "All listings",
        cars: "Cars",
        parts: "Spare parts",
        brand: "Brand",
        allBrands: "All brands",
        sort: "Sort by",
        newest: "Newest listings first",
        priceAsc: "Price: low to high",
        priceDesc: "Price: high to low",
        yearDesc: "Year: newest first",
        yearAsc: "Year: oldest first",
        clearFilters: "Clear filters",
        share: "Share search",
        save: "Save search",
        savedTitle: "Saved searches",
        remove: "Remove search",
        results: "Search results",
        loading: "Loading...",
        found: (count) =>
            `${count} ${count === 1 ? "listing" : "listings"} found`,
        allCars: "All cars",
        emptyTitle: "No results found",
        emptyDescription:
            "Try changing your search terms, brand, or listing type.",
        showAll: "Show all",
        pagination: "Result pages",
        previous: "Previous",
        next: "Next",
        page: "Page",
        alreadySaved: "This search is already saved.",
        saved: "Search saved.",
        saveFailed: "Could not save the search.",
        removeFailed: "Could not remove the search.",
        copied: "Search link copied.",
        copyFailed: "Could not copy the link.",
        loadFailed: "Could not load listings. Please try again later.",
    },
};

const normalize = (value) =>
    String(value ?? "")
        .trim()
        .toLocaleLowerCase();

function readParams(params) {
    return {
        query: params.get("q") || "",
        type: params.get("type") || "all",
        sort: params.get("sort") || "newest",
        brand: params.get("brand") || "all",
    };
}

function normalizeSavedSearch(item) {
    return {
        query: typeof item?.query === "string" ? item.query.trim() : "",
        type: ["car", "part"].includes(item?.type) ? item.type : "all",
        brand:
            typeof item?.brand === "string" && item.brand ? item.brand : "all",
        sort: [
            "newest",
            "priceAsc",
            "priceDesc",
            "yearDesc",
            "yearAsc",
        ].includes(item?.sort)
            ? item.sort
            : "newest",
    };
}

function readSavedSearches() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        if (!Array.isArray(saved)) return [];

        return saved
            .filter(
                (item) =>
                    item && typeof item === "object" && !Array.isArray(item),
            )
            .slice(0, 8)
            .map(normalizeSavedSearch);
    } catch {
        return [];
    }
}

function getPrice(product) {
    const price = Number(product.price);
    return Number.isFinite(price) ? price : 0;
}

export default function SearchPage() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const [searchParams, setSearchParams] = useSearchParams();

    const { query, type, sort, brand } = readParams(searchParams);

    const [page, setPage] = useState(1);
    const [savedSearches, setSavedSearches] = useState(readSavedSearches);

    /*
     * Պահում ենք հաղորդագրության բանալին,
     * որպեսզի բացված հաղորդագրությունն էլ լեզուն փոխի։
     */
    const [notice, setNotice] = useState("");

    const { products = [], loading, error } = useProducts();

    const brands = useMemo(
        () =>
            [
                ...new Set(
                    products.map((product) => product.brand).filter(Boolean),
                ),
            ].sort((a, b) => a.localeCompare(b)),
        [products],
    );

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

    function updateParams(changes) {
        const next = new URLSearchParams(searchParams);

        for (const [key, value] of Object.entries(changes)) {
            if (
                !value ||
                value === "all" ||
                (key === "sort" && value === "newest")
            ) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
        }

        setSearchParams(next, {
            replace: true,
            preventScrollReset: true,
        });

        setPage(1);
        setNotice("");
    }

    function clearFilters() {
        setSearchParams(
            {},
            {
                replace: true,
                preventScrollReset: true,
            },
        );

        setPage(1);
        setNotice("");
    }

    function saveSearch() {
        const item = normalizeSavedSearch({
            query,
            type,
            brand,
            sort,
        });

        const key = JSON.stringify(item);

        if (savedSearches.some((saved) => JSON.stringify(saved) === key)) {
            setNotice("alreadySaved");
            return;
        }

        const updated = [item, ...savedSearches].slice(0, 8);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            setSavedSearches(updated);
            setNotice("saved");
        } catch {
            setNotice("saveFailed");
        }
    }

    function applySavedSearch(item) {
        const next = new URLSearchParams();

        if (item.query) {
            next.set("q", item.query);
        }

        if (item.type !== "all") {
            next.set("type", item.type);
        }

        if (item.brand !== "all") {
            next.set("brand", item.brand);
        }

        if (item.sort !== "newest") {
            next.set("sort", item.sort);
        }

        setSearchParams(next, {
            replace: true,
            preventScrollReset: true,
        });

        setPage(1);
        setNotice("");
    }

    function removeSavedSearch(index) {
        const updated = savedSearches.filter(
            (_, currentIndex) => currentIndex !== index,
        );

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            setSavedSearches(updated);
            setNotice("");
        } catch {
            setNotice("removeFailed");
        }
    }

    async function shareSearch() {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setNotice("copied");
        } catch {
            setNotice("copyFailed");
        }
    }

    function changePage(nextPage) {
        setPage(Math.max(1, Math.min(nextPage, totalPages)));

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function savedSearchLabel(item) {
        const label = [item.query, item.brand !== "all" ? item.brand : ""]
            .filter(Boolean)
            .join(" · ");

        if (label) return label;
        if (item.type === "car") return text.cars;
        if (item.type === "part") return text.parts;

        return text.allListings;
    }

    return (
        <main className="search-page">
            <div className="search-heading">
                <span>{text.section}</span>
                <h1>{text.title}</h1>
                <p>{text.subtitle}</p>
            </div>

            <section className="search-panel">
                <div className="search-main-input">
                    <label htmlFor="armmotors-search">{text.inputLabel}</label>

                    <div className="search-input-wrapper">
                        <input
                            id="armmotors-search"
                            type="search"
                            placeholder={text.placeholder}
                            value={query}
                            onChange={(event) =>
                                updateParams({
                                    q: event.target.value,
                                })
                            }
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={() => updateParams({ q: "" })}
                            >
                                {text.clear}
                            </button>
                        )}
                    </div>
                </div>

                <div className="search-controls">
                    <label>
                        {text.type}

                        <select
                            value={type}
                            onChange={(event) =>
                                updateParams({
                                    type: event.target.value,
                                })
                            }
                        >
                            <option value="all">{text.allListings}</option>

                            <option value="car">{text.cars}</option>

                            <option value="part">{text.parts}</option>
                        </select>
                    </label>

                    <label>
                        {text.brand}

                        <select
                            value={brand}
                            onChange={(event) =>
                                updateParams({
                                    brand: event.target.value,
                                })
                            }
                        >
                            <option value="all">{text.allBrands}</option>

                            {brands.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        {text.sort}

                        <select
                            value={sort}
                            onChange={(event) =>
                                updateParams({
                                    sort: event.target.value,
                                })
                            }
                        >
                            <option value="newest">{text.newest}</option>

                            <option value="priceAsc">{text.priceAsc}</option>

                            <option value="priceDesc">{text.priceDesc}</option>

                            <option value="yearDesc">{text.yearDesc}</option>

                            <option value="yearAsc">{text.yearAsc}</option>
                        </select>
                    </label>
                </div>

                <div className="search-actions">
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="search-action-light"
                    >
                        {text.clearFilters}
                    </button>

                    <button
                        type="button"
                        onClick={shareSearch}
                        className="search-action-light"
                    >
                        {text.share}
                    </button>

                    <button
                        type="button"
                        onClick={saveSearch}
                        className="search-action-primary"
                    >
                        {text.save}
                    </button>
                </div>

                {notice && (
                    <p className="search-notice" role="status">
                        {text[notice]}
                    </p>
                )}
            </section>

            {savedSearches.length > 0 && (
                <section className="saved-searches">
                    <div className="saved-searches-heading">
                        <h2>{text.savedTitle}</h2>
                        <span>{savedSearches.length} / 8</span>
                    </div>

                    <div className="saved-search-list">
                        {savedSearches.map((item, index) => (
                            <div
                                className="saved-search-item"
                                key={`${JSON.stringify(item)}-${index}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => applySavedSearch(item)}
                                >
                                    {savedSearchLabel(item)}
                                </button>

                                <button
                                    type="button"
                                    className="saved-search-remove"
                                    aria-label={`${text.remove}: ${savedSearchLabel(
                                        item,
                                    )}`}
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
                    <h2>{text.results}</h2>

                    <p>
                        {loading
                            ? text.loading
                            : error
                              ? text.loadFailed
                              : text.found(results.length)}
                    </p>
                </div>

                <Link to="/cars">{text.allCars} →</Link>
            </div>

            {error && (
                <div className="search-error" role="alert">
                    {text.loadFailed}
                </div>
            )}

            {loading && (
                <div role="status" aria-label={text.loading} aria-busy="true">
                    <ProductSkeleton count={8} />
                </div>
            )}

            {!loading && !error && results.length === 0 && (
                <div className="search-empty">
                    <h3>{text.emptyTitle}</h3>
                    <p>{text.emptyDescription}</p>

                    <button type="button" onClick={clearFilters}>
                        {text.showAll}
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="search-results-grid">
                    {visibleProducts.map((item) => (
                        <ProductCard key={item._id || item.id} item={item} />
                    ))}
                </div>
            )}

            {!loading && !error && totalPages > 1 && (
                <nav className="search-pagination" aria-label={text.pagination}>
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => changePage(currentPage - 1)}
                    >
                        ← {text.previous}
                    </button>

                    <span>
                        {text.page} {currentPage} / {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => changePage(currentPage + 1)}
                    >
                        {text.next} →
                    </button>
                </nav>
            )}
        </main>
    );
}
