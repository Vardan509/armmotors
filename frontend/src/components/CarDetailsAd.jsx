import "./CarDetailsAd.css";

export default function CarDetailsAd() {
    const advertisement = {
        image: `${import.meta.env.BASE_URL}images/ads/car-details-ad.webp`,
        link: "",
        alt: "ArmMotors գովազդային տարածք",
    };

    const content = (
        <div className="arm-details-ad-image-wrap">
            <img
                src={advertisement.image}
                alt={advertisement.alt}
                className="arm-details-ad-image"
                loading="lazy"
            />

            <span className="arm-details-ad-label">Գովազդ</span>
        </div>
    );

    return (
        <section className="arm-details-ad" aria-label="Գովազդային տարածք">
            {advertisement.link ? (
                <a
                    href={advertisement.link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="arm-details-ad-link"
                >
                    {content}
                </a>
            ) : (
                content
            )}
        </section>
    );
}
