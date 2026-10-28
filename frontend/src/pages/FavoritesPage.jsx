import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

import { useFavorites } from "../utils/useFavorite";
import useRemote from "../utils/useRemote";

import "./Account.css";
import "./FavoritesPagePremium.css";

export default function FavoritesPage() {
    const favorites = useFavorites();

    const authenticated = Boolean(localStorage.getItem("token"));

    const state = useRemote(
        authenticated ? "/favorites" : "/products",
        favorites.ids.join(","),
    );

    const products = authenticated
        ? state.data?.products || []
        : Array.isArray(state.data)
          ? state.data
          : [];

    const favoriteIds = new Set(favorites.ids.map(String));

    const items = products.filter((product) =>
        favoriteIds.has(String(product._id || product.id)),
    );

    const loading = state.loading || favorites.loading;

    const error = state.error || favorites.error;

    return (
        <main className="account-page">
            <div className="account-heading">
                <div>
                    <h1>Հավանած հայտարարություններ</h1>
                </div>
            </div>

            {!authenticated && (
                <section
                    style={{
                        padding: 20,
                        marginBottom: 25,
                        border: "1px solid #e8dfc9",
                        borderRadius: 12,
                        background: "#fcfaf5",
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 12px",
                            color: "#555",
                            fontSize: 13,
                            lineHeight: 1.7,
                        }}
                    >
                        Մուտք գործեք, որպեսզի Ձեր նախընտրելիները պահպանվեն նաև
                        Ձեր հաշվում։
                    </p>

                    <Link
                        to="/login?next=/favorites"
                        style={{
                            color: "#987320",
                            fontWeight: 700,
                            textDecoration: "none",
                        }}
                    >
                        Մուտք գործել →
                    </Link>
                </section>
            )}

            {error && (
                <p role="alert" className="form-error">
                    {error}
                </p>
            )}

            {loading ? (
                <ProductSkeleton count={4} />
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
                            style={{
                                fontSize: 44,
                                color: "#b99547",
                            }}
                        >
                            ♡
                        </span>

                        <h2>Ձեր ընտրությունը դեռ դատարկ է</h2>

                        <p>
                            Պահպանեք Ձեզ հետաքրքրող հայտարարությունները՝
                            սեղմելով քարտի սրտիկի նշանը։
                        </p>

                        <Link
                            to="/cars"
                            style={{
                                display: "inline-block",
                                marginTop: 15,
                                padding: "13px 20px",
                                borderRadius: 9,
                                background: "#b99547",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: "none",
                            }}
                        >
                            Դիտել հայտարարությունները →
                        </Link>
                    </section>
                )
            )}
        </main>
    );
}
