import { useState } from "react";
import useCurrency from "../../utils/useCurrency";
import useFavorite from "../../utils/useFavorite";
import "./ProductCard.css";

const FUELS = {
    petrol: "Բենզին",
    diesel: "Դիզել",
    gas: "Գազ",
    electric: "Էլեկտրական",
    hybrid: "Հիբրիդ",
};

export default function ProductCard({ item }) {
    const [failedImage, setFailedImage] = useState(null);

    const { format } = useCurrency();

    const id = item._id || item.id;

    const [favorite, toggleFavorite] = useFavorite(id);

    // Չգրանցված օգտատիրոջը տեղափոխում ենք Login էջ
    function handleFavoriteClick() {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.assign(
                `/login?next=${encodeURIComponent("/favorites")}`,
            );
            return;
        }

        toggleFavorite();
    }

    const isCar = item.type === "car";

    const image = item.image || item.images?.[0];

    const title =
        item.title ||
        [item.brand, item.model].filter(Boolean).join(" ") ||
        "Հայտարարություն";

    const details = isCar
        ? [
              item.year && `${item.year} թ.`,
              item.mileage != null &&
                  `${Number(item.mileage).toLocaleString("en-US")} կմ`,
              FUELS[item.fuel],
          ].filter(Boolean)
        : [item.condition].filter(Boolean);

    return (
        <article className="listing-card">
            {/* Հայտարարության քարտ */}
            <a
                className="product-card"
                href={`/cars/${encodeURIComponent(id)}`}
                aria-label={`${title}՝ մանրամասներ`}
            >
                <div className="product-image-wrapper">
                    {!image || failedImage === image ? (
                        <div className="product-image-fallback">
                            <span aria-hidden="true">▧</span>
                            <span>Նկար չկա</span>
                        </div>
                    ) : (
                        <img
                            src={image}
                            alt={title}
                            className="product-image"
                            loading="lazy"
                            decoding="async"
                            onError={() => setFailedImage(image)}
                        />
                    )}

                    {item.isDemo && (
                        <span className="listing-demo">Ցուցադրական</span>
                    )}

                    <span className="product-type">
                        {isCar ? "Ավտոմեքենա" : "Պահեստամաս"}
                    </span>
                </div>

                <div className="product-info">
                    <p className="product-price">
                        {format(item.price, item.currency || "AMD")}
                    </p>

                    <h3 className="product-title">{title}</h3>

                    {details.length > 0 && (
                        <div className="product-details">
                            {details.map((detail, index) => (
                                <span
                                    className="detail-item"
                                    key={`${detail}-${index}`}
                                >
                                    {detail}
                                </span>
                            ))}
                        </div>
                    )}

                    {item.region && (
                        <p className="product-region">{item.region}</p>
                    )}
                </div>
            </a>

            {/* Սրտիկի կոճակ */}
            <button
                type="button"
                className="favorite-button"
                aria-pressed={Boolean(favorite)}
                aria-label={
                    favorite
                        ? "Հեռացնել ընտրյալներից"
                        : "Ավելացնել ընտրյալներում"
                }
                onClick={handleFavoriteClick}
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={favorite ? "#e54865" : "none"}
                    stroke={favorite ? "#e54865" : "#222222"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
            </button>
        </article>
    );
}
