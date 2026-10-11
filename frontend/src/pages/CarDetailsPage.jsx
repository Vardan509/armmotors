import { useEffect, useState } from "react";

import Header from "../components/header/Header";
import ProductCard from "../components/ProductCard/ProductCard";
import ReportProduct from "../components/ReportProduct";
import CurrencySelect from "../components/CurrencySelect";

import { apiRequest } from "../utils/api";
import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import useFavorite from "../utils/useFavorite";

import "./CarDetailsPage.css";

const BASE = import.meta.env.BASE_URL;

const FUELS = {
    petrol: "Բենզին",
    diesel: "Դիզել",
    electric: "Էլեկտրական",
    hybrid: "Հիբրիդ",
    gas: "Գազ",
};

function getProductId(product) {
    return String(product?._id || product?.id || "");
}

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

    function previousImage() {
        setIndex((current) => (current + images.length - 1) % images.length);
    }

    function nextImage() {
        setIndex((current) => (current + 1) % images.length);
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
                        <p>Նկարը հասանելի չէ</p>
                    </div>
                )}

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="gallery-prev"
                            aria-label="Նախորդ նկար"
                            onClick={previousImage}
                        >
                            ‹
                        </button>

                        <button
                            type="button"
                            className="gallery-next"
                            aria-label="Հաջորդ նկար"
                            onClick={nextImage}
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
                        type="button"
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
    });

    const [copied, setCopied] = useState("");

    const [purchase, setPurchase] = useState({
        busy: false,
        message: "",
        error: "",
    });

    const { products = [] } = useProducts();
    const { format } = useCurrency();
    const [favorite, toggleFavorite] = useFavorite(id);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            setState({
                car: null,
                loading: true,
                error: "",
            });

            try {
                const car = await apiRequest(
                    `/products/${encodeURIComponent(id)}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (controller.signal.aborted) return;

                setState({
                    car,
                    loading: false,
                    error: "",
                });
            } catch (error) {
                if (controller.signal.aborted) return;

                setState({
                    car: null,
                    loading: false,
                    error:
                        error.message || "Հայտարարությունը բեռնել չհաջողվեց։",
                });
            }
        }

        load();

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!state.car) return;

        const previousTitle = document.title;

        document.title = `${state.car.title} — ArmMotors`;

        return () => {
            document.title = previousTitle;
        };
    }, [state.car]);

    async function share() {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setCopied("Հղումը պատճենված է");
        } catch {
            setCopied("Պատճենեք հղումը հասցեի տողից։");
        }
    }

    function openSupport() {
        window.dispatchEvent(
            new CustomEvent("open-support", {
                detail: {
                    listingId: id,
                    title: state.car?.title || "",
                },
            }),
        );
    }

    async function sendPurchaseRequest() {
        if (!localStorage.getItem("token")) {
            window.location.assign(
                `${BASE}login?next=${encodeURIComponent(`/cars/${id}`)}`,
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
                message: "Հայտն ուղարկված է։ Հետևեք դրան «Իմ հաշիվը» բաժնում։",
            });
        } catch (error) {
            setPurchase({
                busy: false,
                message: "",
                error: error.message || "Գնման հայտը ուղարկել չհաջողվեց։",
            });
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
                      ? `${Number(car.mileage).toLocaleString("en-US")} կմ`
                      : null,
              ],
              ["Վառելիք", FUELS[car.fuel] || car.fuel],
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

    const relatedCars = car
        ? products
              .filter(
                  (item) =>
                      getProductId(item) !== getProductId(car) &&
                      item.brand === car.brand &&
                      item.status !== "sold" &&
                      item.status !== "draft",
              )
              .slice(0, 4)
        : [];

    return (
        <>
            <Header />

            <main className="details-page">
                <nav className="detail-breadcrumb" aria-label="Էջի ուղի">
                    <a href={BASE}>Գլխավոր</a>

                    <span>/</span>

                    <a href={`${BASE}cars`}>Հայտարարություններ</a>

                    <span>/</span>

                    <span>{car?.title || "Մանրամասներ"}</span>
                </nav>

                {loading ? (
                    <p role="status">Բեռնվում է…</p>
                ) : error ? (
                    <section className="detail-panel">
                        <h1>Հայտարարությունը հասանելի չէ</h1>

                        <p role="alert">{error}</p>

                        <a href={`${BASE}cars`}>Դիտել այլ մեքենաներ →</a>
                    </section>
                ) : (
                    car && (
                        <>
                            <div className="detail-heading">
                                <div>
                                    <span className="section-label">
                                        {car.region}
                                        {" · "}
                                        {car.year || car.condition}
                                    </span>

                                    <p>Հայտարարություն #{getProductId(car)}</p>
                                </div>

                                <button
                                    type="button"
                                    className="detail-secondary"
                                    onClick={share}
                                >
                                    Պատճենել հղումը ↗
                                </button>
                            </div>

                            {copied && <p role="status">{copied}</p>}

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
                                                        value !== null &&
                                                        value !== "",
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
                                            type="button"
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

                                    {typeof car.views === "number" && (
                                        <p className="detail-views">
                                            Դիտումներ՝{" "}
                                            {car.views.toLocaleString("en-US")}
                                        </p>
                                    )}

                                    {car.status === "sold" && (
                                        <p className="detail-sold-label">
                                            Վաճառված է
                                        </p>
                                    )}

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
                                            href={`tel:${String(
                                                car.phone,
                                            ).replace(/[^+0-9]/g, "")}`}
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
                                        type="button"
                                        className="detail-secondary"
                                        onClick={openSupport}
                                    >
                                        Կապ ադմինի հետ
                                    </button>

                                    <button
                                        type="button"
                                        className="detail-primary"
                                        disabled={
                                            purchase.busy ||
                                            Boolean(purchase.message) ||
                                            car.status === "sold"
                                        }
                                        onClick={sendPurchaseRequest}
                                    >
                                        {car.status === "sold"
                                            ? "Վաճառված է"
                                            : purchase.busy
                                              ? "Ուղարկվում է…"
                                              : "Գնման հայտ ուղարկել"}
                                    </button>

                                    {purchase.message && (
                                        <p role="status">{purchase.message}</p>
                                    )}

                                    {purchase.error && (
                                        <p role="alert" className="form-error">
                                            {purchase.error}
                                        </p>
                                    )}

                                    <small>
                                        Մինչև գործարքը անձամբ ստուգեք մեքենայի և
                                        փաստաթղթերի տվյալները։
                                    </small>

                                    {/* ԲՈՂՈՔԱՐԿՄԱՆ ՀԱՄԱԿԱՐԳ */}
                                    <ReportProduct
                                        productId={getProductId(car)}
                                    />
                                </aside>
                            </div>

                            {relatedCars.length > 0 && (
                                <section className="related-cars">
                                    <h2>Նմանատիպ մեքենաներ</h2>

                                    <div className="products-grid">
                                        {relatedCars.map((item) => (
                                            <ProductCard
                                                key={getProductId(item)}
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
