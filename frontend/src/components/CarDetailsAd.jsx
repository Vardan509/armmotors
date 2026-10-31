import { useI18n } from "../utils/i18n";

import "./CarDetailsAd.css";

const TEXTS = {
    hy: {
        label: "Գովազդ",
        area: "Գովազդային տարածք",
        alt: "ArmMotors գովազդային տարածք",
    },

    ru: {
        label: "Реклама",
        area: "Рекламное место",
        alt: "Рекламное место ArmMotors",
    },

    en: {
        label: "Advertisement",
        area: "Advertising space",
        alt: "ArmMotors advertising space",
    },
};

export default function CarDetailsAd() {
    const { language } = useI18n();

    const text = TEXTS[language] || TEXTS.hy;

    const advertisement = {
        image: `${import.meta.env.BASE_URL}images/ads/car-details-ad.webp`,
        link: "",
    };

    const content = (
        <div className="arm-details-ad-image-wrap">
            <img
                src={advertisement.image}
                alt={text.alt}
                className="arm-details-ad-image"
                loading="lazy"
            />

            <span className="arm-details-ad-label">{text.label}</span>
        </div>
    );

    return (
        <section className="arm-details-ad" aria-label={text.area}>
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
