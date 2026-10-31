import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

import { useFavorites } from "../utils/useFavorite";
import { useI18n } from "../utils/i18n";
import useRemote from "../utils/useRemote";

import "./Account.css";
import "./FavoritesPagePremium.css";

const TEXTS = {
    hy: {
        title: "Հավանած հայտարարություններ",
        loginNote:
            "Մուտք գործեք, որպեսզի Ձեր նախընտրելիները պահպանվեն նաև Ձեր հաշվում։",
        login: "Մուտք գործել",
        emptyTitle: "Ձեր ընտրությունը դեռ դատարկ է",
        emptyDescription:
            "Պահպանեք Ձեզ հետաքրքրող հայտարարությունները՝ սեղմելով քարտի սրտիկի նշանը։",
        browse: "Դիտել հայտարարությունները",
        error: "Չհաջողվեց բեռնել նախընտրելի հայտարարությունները։ Փորձեք ավելի ուշ։",
        loading: "Հայտարարությունները բեռնվում են...",
    },

    ru: {
        title: "Избранные объявления",
        loginNote:
            "Войдите, чтобы избранные объявления сохранялись также в вашем аккаунте.",
        login: "Войти",
        emptyTitle: "В избранном пока ничего нет",
        emptyDescription:
            "Сохраняйте интересующие объявления, нажимая на значок сердца на карточке.",
        browse: "Посмотреть объявления",
        error: "Не удалось загрузить избранные объявления. Попробуйте позже.",
        loading: "Загрузка объявлений...",
    },

    en: {
        title: "Favorite listings",
        loginNote: "Sign in to save your favorite listings to your account.",
        login: "Sign in",
        emptyTitle: "No favorites yet",
        emptyDescription:
            "Save listings you like by clicking the heart icon on a card.",
        browse: "Browse listings",
        error: "Could not load your favorite listings. Please try again later.",
        loading: "Loading listings...",
    },
};

export default function FavoritesPage() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const favorites = useFavorites();

    const authenticated = Boolean(localStorage.getItem("token"));

    const favoriteIds = Array.isArray(favorites.ids) ? favorites.ids : [];

    const state = useRemote(
        authenticated ? "/favorites" : "/products",
        favoriteIds.join(","),
    );

    const products = Array.isArray(state.data?.products)
        ? state.data.products
        : Array.isArray(state.data)
          ? state.data
          : [];

    const favoriteIdSet = new Set(favoriteIds.map(String));

    const items = products.filter((product) =>
        favoriteIdSet.has(String(product._id || product.id)),
    );

    const loading = state.loading || favorites.loading;
    const error = state.error || favorites.error;

    return (
        <main className="account-page">
            <div className="account-heading">
                <div>
                    <h1>{text.title}</h1>
                </div>
            </div>

            {!authenticated && (
                <section
                    style={{
                        padding: 20,
                        marginBottom: 25,
                        border: "1px solid #dce5ef",
                        borderRadius: 12,
                        background: "#f5f8fc",
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 12px",
                            color: "#526176",
                            fontSize: 13,
                            lineHeight: 1.7,
                        }}
                    >
                        {text.loginNote}
                    </p>

                    <Link
                        to="/login?next=/favorites"
                        style={{
                            color: "#244b77",
                            fontWeight: 700,
                            textDecoration: "none",
                        }}
                    >
                        {text.login} →
                    </Link>
                </section>
            )}

            {error && (
                <p role="alert" className="form-error">
                    {text.error}
                </p>
            )}

            {loading ? (
                <div role="status" aria-label={text.loading} aria-busy="true">
                    <ProductSkeleton count={4} />
                </div>
            ) : items.length > 0 ? (
                <div className="products-grid">
                    {items.map((item) => (
                        <ProductCard key={item._id || item.id} item={item} />
                    ))}
                </div>
            ) : (
                !error && (
                    <section className="account-empty">
                        <span
                            aria-hidden="true"
                            style={{
                                fontSize: 44,
                                color: "#244b77",
                            }}
                        >
                            ♡
                        </span>

                        <h2>{text.emptyTitle}</h2>

                        <p>{text.emptyDescription}</p>

                        <Link
                            to="/cars"
                            style={{
                                display: "inline-block",
                                marginTop: 15,
                                padding: "13px 20px",
                                borderRadius: 9,
                                background: "#244b77",
                                color: "#ffffff",
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: "none",
                            }}
                        >
                            {text.browse} →
                        </Link>
                    </section>
                )
            )}
        </main>
    );
}
