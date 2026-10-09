import { useEffect, useState } from "react";

import Header from "../components/header/Header";
import ProductCard from "../components/ProductCard/ProductCard";

import { apiRequest } from "../utils/api";
import useProducts from "../utils/useProducts";

import "./CarDetailsPage.css";
import useCurrency from "../utils/useCurrency";
import useFavorite from "../utils/useFavorite";
import CurrencySelect from "../components/CurrencySelect";

const FUELS = {
    petrol: "Բենզին",
    diesel: "Դիզել",
    electric: "Էլեկտրական",
    hybrid: "Հիբրիդ",
    gas: "Գազ",
};

function Gallery({ images, title }) {
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState({});

    const src = images[index];

    function imageFailed(image) {
        setFailed((prev) => ({
            ...prev,
            [image]: true,
        }));
    }

    return (
        <section className="car-gallery" aria-label="Հայտարարության նկարներ">
            <div className="gallery-main">
                {src && !failed[src] ? (
                    <img
                        src={src}
                        alt={`${title} — նկար ${index + 1}`}
                        onError={() => imageFailed(src)}
                    />
                ) : (
                    <div className="gallery-empty">
                        🚗
                        <p>Նկարը հասանելի չէ</p>
                    </div>
                )}

                {images.length > 1 && (
                    <>
                        <button
                            className="gallery-prev"
                            aria-label="Նախորդ նկար"
                            onClick={() => {
                                setIndex(
                                    (index + images.length - 1) % images.length,
                                );
                            }}
                        >
                            ‹
                        </button>

                        <button
                            className="gallery-next"
                            aria-label="Հաջորդ նկար"
                            onClick={() => {
                                setIndex((index + 1) % images.length);
                            }}
                        >
                            ›
                        </button>
                    </>
                )}

                <span className="gallery-counter" aria-live="polite">
                    {images.length ? index + 1 : 0} / {images.length}
                </span>
            </div>

            <div className="gallery-thumbs">
                {images.map((image, i) => (
                    <button
                        key={`${image}-${i}`}
                        aria-label={`Ցուցադրել նկար ${i + 1}`}
                        aria-pressed={i === index}
                        onClick={() => setIndex(i)}
                    >
                        {failed[image] ? (
                            <span>Նկար {i + 1}</span>
                        ) : (
                            <img
                                src={image}
                                alt=""
                                loading="lazy"
                                onError={() => imageFailed(image)}
                            />
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}

export default function CarDetailsPage({ id }) {
    const [state, setState] = useState({
        car: null,
        loading: true,
        error: "",
        offline: false,
    });

    const [copied, setCopied] = useState("");
    const [purchase, setPurchase] = useState({
        busy: false,
        message: "",
        error: "",
    });
    const { products } = useProducts();
    const { format } = useCurrency();
    const [favorite, toggleFavorite] = useFavorite(id);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const car = await apiRequest(
                    `/products/${encodeURIComponent(id)}`,
                    {
                        signal: controller.signal,
                    },
                );

                setState({
                    car,
                    loading: false,
                    error: "",
                    offline: false,
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setState({
                    car: null,
                    loading: false,
                    error: error.message,
                    offline: false,
                });
            }
        }

        load();

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (state.car) {
            document.title = `${state.car.title} — ArmMotors`;
        }
    }, [state.car]);

    async function share() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied("Հղումը պատճենված է");
        } catch {
            setCopied("Պատճենեք հղումը հասցեի տողից։");
        }
    }

    const { car, loading, error } = state;

    const images = car?.images?.length
        ? car.images
        : car?.image
          ? [car.image]
          : [];

    const specs = car
        ? [
              ["Մակնիշ", car.brand],
              ["Մոդել", car.model],
              ["Տարեթիվ", car.year],
              [
                  "Վազք",
                  car.mileage != null
                      ? `${car.mileage.toLocaleString("en-US")} կմ`
                      : null,
              ],
              ["Վառելիք", FUELS[car.fuel]],
              [
                  "Ղեկ",
                  car.steering === "left"
                      ? "Ձախ"
                      : car.steering === "right"
                        ? "Աջ"
                        : null,
              ],
              ["Գույն", car.color],
              ["Տարածաշրջան", car.region],
              ["Վիճակ", car.condition],
              ["VIN", car.vin || "Նշված չէ"],
          ]
        : [];

    function openSupport() {
        window.dispatchEvent(
            new CustomEvent("open-support", {
                detail: {
                    listingId: id,
                    title: car.title,
                },
            }),
        );
    }

    return (
        <>
            <Header />

            <main className="details-page">
                <nav className="detail-breadcrumb" aria-label="Էջի ուղի">
                    <a href="/">Գլխավոր</a>
                    <span>/</span>
                    <a href="/cars">Հայտարարություններ</a>
                    <span>/</span>
                    <span>{car?.title || "Մանրամասներ"}</span>
                </nav>

                {loading ? (
                    <p role="status">Բեռնվում է…</p>
                ) : error ? (
                    <section className="detail-panel">
                        <h1>Հայտարարությունը հասանելի չէ</h1>

                        <p role="alert">{error}</p>

                        <a href="/cars">Դիտել այլ մեքենաներ →</a>
                    </section>
                ) : (
                    car && (
                        <>
                            <div className="detail-heading">
                                <div>
                                    <span className="section-label">
                                        {car.region} ·{" "}
                                        {car.year || car.condition}
                                    </span>

                                    <p>Հայտարարություն #{car.id || car._id}</p>
                                </div>

                                <button
                                    className="detail-secondary"
                                    onClick={share}
                                >
                                    Պատճենել հղումը ↗
                                </button>
                            </div>

                            <p role="status">{copied}</p>

                            <div className="detail-layout">
                                <div>
                                    <Gallery
                                        key={id}
                                        images={images}
                                        title={car.title}
                                    />

                                    <section className="detail-panel">
                                        <h2>Մանրամասներ</h2>

                                        <dl className="spec-grid">
                                            {specs
                                                .filter(
                                                    ([, value]) =>
                                                        value !== undefined &&
                                                        value !== null,
                                                )
                                                .map(([label, value]) => (
                                                    <div key={label}>
                                                        <dt>{label}</dt>
                                                        <dd>{value}</dd>
                                                    </div>
                                                ))}
                                        </dl>
                                    </section>

                                    <section className="detail-panel">
                                        <h2>Նկարագրություն</h2>

                                        <p className="car-description">
                                            {car.description ||
                                                "Նկարագրություն չի ավելացվել։"}
                                        </p>
                                    </section>
                                </div>

                                <aside className="seller-panel">
                                    <div className="listing-heading">
                                        <h1>
                                            {car.title}
                                            {car.year ? `, ${car.year} թ.` : ""}
                                        </h1>
                                        <button
                                            className="detail-favorite"
                                            onClick={toggleFavorite}
                                            aria-pressed={favorite}
                                            aria-label={
                                                favorite
                                                    ? "Հեռացնել ընտրյալներից"
                                                    : "Ավելացնել ընտրյալներում"
                                            }
                                        >
                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill={
                                                    favorite
                                                        ? "#e84967"
                                                        : "none"
                                                }
                                                stroke={
                                                    favorite
                                                        ? "#e84967"
                                                        : "currentColor"
                                                }
                                                strokeWidth="1.6"
                                                aria-hidden="true"
                                            >
                                                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <strong className="detail-price">
                                        {format(
                                            car.price,
                                            car.currency || "AMD",
                                        )}
                                    </strong>
                                    <CurrencySelect />

                                    <p>{car.region}</p>

                                    <hr />

                                    <div className="seller-identity">
                                        <span
                                            className="seller-avatar"
                                            aria-hidden="true"
                                        >
                                            {(car.brand || "A").slice(0, 1)}
                                        </span>
                                        <div>
                                            <h2>Կապ վաճառողի հետ</h2>
                                            <p>{car.region}</p>
                                        </div>
                                    </div>

                                    {car.phone && !car.isDemo ? (
                                        <a
                                            className="detail-primary"
                                            href={`tel:${car.phone.replace(/[^+0-9]/g, "")}`}
                                        >
                                            Զանգահարել · {car.phone}
                                        </a>
                                    ) : (
                                        <p>
                                            Հայտարարությունը վաճառողի հեռախոս
                                            չունի։
                                        </p>
                                    )}

                                    <button
                                        className="detail-secondary"
                                        onClick={openSupport}
                                    >
                                        Կապ ադմինի հետ
                                    </button>

                                    <button
                                        className="detail-primary"
                                        disabled={
                                            purchase.busy ||
                                            !!purchase.message ||
                                            car.status === "sold"
                                        }
                                        onClick={async () => {
                                            if (
                                                !localStorage.getItem("token")
                                            ) {
                                                window.location.assign(
                                                    `/login?next=${encodeURIComponent(`/cars/${id}`)}`,
                                                );
                                                return;
                                            }
                                            setPurchase({
                                                busy: true,
                                                message: "",
                                                error: "",
                                            });
                                            try {
                                                await apiRequest("/orders", {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        productId: id,
                                                    }),
                                                });
                                                setPurchase({
                                                    busy: false,
                                                    error: "",
                                                    message:
                                                        "Հայտն ուղարկված է։ Հետևեք դրան «Իմ հաշիվը» բաժնում։",
                                                });
                                            } catch (error) {
                                                setPurchase({
                                                    busy: false,
                                                    message: "",
                                                    error: error.message,
                                                });
                                            }
                                        }}
                                    >
                                        {car.status === "sold"
                                            ? "Վաճառված է"
                                            : purchase.busy
                                              ? "Ուղարկվում է…"
                                              : "Գնման հայտ ուղարկել"}
                                    </button>
                                    <p role="status">{purchase.message}</p>
                                    {purchase.error && (
                                        <p role="alert" className="form-error">
                                            {purchase.error}
                                        </p>
                                    )}
                                    <small>
                                        Մինչև գործարքը անձամբ ստուգեք մեքենայի և
                                        փաստաթղթերի տվյալները։
                                    </small>
                                </aside>
                            </div>
                            {products.some(
                                (item) =>
                                    item.id !== id && item.brand === car.brand,
                            ) && (
                                <section className="related-cars">
                                    <h2>Նմանատիպ մեքենաներ</h2>
                                    <div className="products-grid">
                                        {products
                                            .filter(
                                                (item) =>
                                                    item.id !== id &&
                                                    item.brand === car.brand,
                                            )
                                            .slice(0, 4)
                                            .map((item) => (
                                                <ProductCard
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )
                )}
            </main>
        </>
    );
}
