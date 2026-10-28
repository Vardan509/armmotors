import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import "./style.css";

const API_URL = "http://localhost:3001/api/products";

export default function Body() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadProducts() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(API_URL, {
                    signal: controller.signal,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Հայտարարությունները բեռնել չհաջողվեց։",
                    );
                }

                if (!Array.isArray(data)) {
                    throw new Error(
                        "Սերվերից ստացվել է սխալ տվյալների ձևաչափ։",
                    );
                }

                const normalizedProducts = data.map((product) => ({
                    ...product,
                    id: product._id || product.id,
                    image: product.images?.[0] || product.image || "",
                }));

                if (!controller.signal.aborted) {
                    setProducts(normalizedProducts);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(
                        error instanceof TypeError
                            ? "Backend-ին միանալ չհաջողվեց։ Ստուգեք՝ սերվերը գործարկված է։"
                            : error.message,
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadProducts();

        return () => controller.abort();
    }, [retry]);

    return (
        <div className="body-container">
            <div className="section-header">
                <h2>Թոփ  հայտարարությունները</h2>
            </div>

            {loading ? (
                <p role="status">Հայտարարությունները բեռնվում են…</p>
            ) : error ? (
                <div className="empty-results">
                    <p role="alert">{error}</p>

                    <button
                        type="button"
                        onClick={() => setRetry((previous) => previous + 1)}
                    >
                        Կրկին փորձել
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-results">
                    <p>Դեռ հայտարարություններ չկան։</p>
                    <a href="/add-product">Տեղադրել հայտարարություն</a>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} item={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
