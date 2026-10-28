import "./CategoryCards.css";

const BASE = import.meta.env.BASE_URL;

const CATEGORIES = [
    {
        id: 1,
        value: "electric",
        title: {
            hy: "Էլեկտրական",
            ru: "Электромобили",
            en: "Electric",
        },
        image: "categories/electric.png",
        number: "01",
    },
    {
        id: 2,
        value: "hybrid",
        title: {
            hy: "Հիբրիդ",
            ru: "Гибриды",
            en: "Hybrid",
        },
        image: "categories/hybrid.png",
        number: "02",
    },
    {
        id: 3,
        value: "new",
        title: {
            hy: "Նոր մեքենաներ",
            ru: "Новые автомобили",
            en: "New cars",
        },
        image: "categories/new_cars.png",
        number: "03",
    },
    {
        id: 4,
        value: "truck",
        title: {
            hy: "Բեռնատարներ",
            ru: "Грузовики",
            en: "Trucks",
        },
        image: "categories/trucks.png",
        number: "04",
    },
    {
        id: 5,
        value: "part",
        title: {
            hy: "Պահեստամասեր",
            ru: "Запчасти",
            en: "Spare parts",
        },
        image: "categories/spare_parts.png",
        number: "05",
    },
];

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
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    );
}

export default function CategoryCards({
    language = "hy",
    selectedCategory = "",
    onSelect,
}) {
    const labels = {
        hy: {
            title: "Կատեգորիաներ",
            selected: "Ընտրված կատեգորիա",
            open: "Դիտել կատեգորիան",
        },
        ru: {
            title: " категория",
            selected: "Выбранная категория",
            open: "Открыть категорию",
        },
        en: {
            title: " Categories",
            selected: "Selected category",
            open: "Explore category",
        },
    };

    const text = labels[language] || labels.hy;

    return (
        <section
            className="am-categories-section"
            aria-labelledby="am-categories-heading"
        >
            <div className="am-categories-heading">
                <div>
                    <span className="am-categories-eyebrow">
                        <span className="am-eyebrow-line" />
                        {text.eyebrow}
                    </span>

                    <h2 id="am-categories-heading">{text.title}</h2>

                    <p>{text.description}</p>
                </div>
            </div>

            <div className="am-categories-grid">
                {CATEGORIES.map((category) => {
                    const active = selectedCategory === category.value;

                    const title = category.title[language] || category.title.hy;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={`am-category-card ${
                                active ? "is-active" : ""
                            }`}
                            aria-pressed={active}
                            aria-label={`${text.open}: ${title}`}
                            onClick={() => onSelect?.(category.value)}
                        >
                            <span className="am-category-top">
                                <span className="am-category-number">
                                    {category.number}
                                </span>

                                <span
                                    className="am-category-arrow"
                                    aria-hidden="true"
                                >
                                    <ArrowIcon />
                                </span>
                            </span>

                            <span className="am-category-visual">
                                <span className="am-category-glow" />

                                <img
                                    src={`${BASE}${category.image}`}
                                    alt=""
                                    className="am-category-image"
                                    loading="lazy"
                                    draggable={false}
                                />
                            </span>

                            <span className="am-category-bottom">
                                <span className="am-category-title">
                                    {title}
                                </span>

                                <span className="am-category-underline" />
                            </span>

                            {active && (
                                <span className="am-category-active-indicator">
                                    {text.selected}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
