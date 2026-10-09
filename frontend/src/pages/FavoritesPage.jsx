import Header from "../components/header/Header";
import ProductCard from "../components/ProductCard/ProductCard";
import { useFavorites } from "../utils/useFavorite";
import useRemote from "../utils/useRemote";
import "./Account.css";
export default function FavoritesPage() {
    const favorites = useFavorites();
    const authenticated = Boolean(localStorage.getItem("token"));
    const state = useRemote(
        authenticated ? "/favorites" : "/products",
        favorites.ids.join(","),
    );
    const products = (authenticated ? state.data?.products : state.data) || [];
    const items = products.filter((product) =>
        favorites.ids.includes(product._id || product.id),
    );
    return (
        <>
            <Header />
            <main className="account-page">
                <div className="account-heading">
                    <div>
                        <span className="section-label">ՁԵՐ ԸՆՏՐՈՒԹՅՈՒՆԸ</span>
                        <h1>Նախընտրելի հայտարարություններ</h1>
                    </div>
                    <span>{items.length} հայտարարություն</span>
                </div>
                {!authenticated && (
                    <p>
                        Մուտք գործեք՝ նախընտրելիները Ձեր հաշվում պահպանելու
                        համար։ <a href="/login?next=/favorites">Մուտք →</a>
                    </p>
                )}
                {(state.error || favorites.error) && (
                    <p role="alert" className="form-error">
                        {state.error || favorites.error}
                    </p>
                )}
                {state.loading || favorites.loading ? (
                    <p role="status">Բեռնվում է…</p>
                ) : items.length ? (
                    <div className="products-grid">
                        {items.map((item) => (
                            <ProductCard
                                key={item._id || item.id}
                                item={item}
                            />
                        ))}
                    </div>
                ) : (
                    <section className="account-empty">
                        <span>♡</span>
                        <h2>Ձեր ընտրությունը դեռ դատարկ է</h2>
                        <p>
                            Սեղմեք հայտարարության սրտիկին՝ այն այստեղ պահելու
                            համար։
                        </p>
                        <a href="/cars">Դիտել հայտարարությունները →</a>
                    </section>
                )}
            </main>
        </>
    );
}
