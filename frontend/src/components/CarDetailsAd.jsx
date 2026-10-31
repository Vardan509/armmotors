import { useI18n } from "../utils/i18n";
import { asset } from "../utils/asset";

import "./CarDetailsAd.css";

const BANNERS = {
    hy: "/data/armmotors-banner.png",
    ru: "/data/armmotors-banner-ru.png",
    en: "/data/armmotors-banner-en.png",
};

const TEXTS = {
    hy: {
        label: "Գովազդ",
        area: "Գովազդային տարածք",
        alt: "Ձեր գովազդը մեր հարթակում",
        contact: "Կապվել ադմինի հետ՝ գովազդի կամ համագործակցության համար",
    },

    ru: {
        label: "Реклама",
        area: "Рекламное место",
        alt: "Ваша реклама на нашей платформе",
        contact:
            "Связаться с администрацией по вопросам рекламы или сотрудничества",
    },

    en: {
        label: "Advertisement",
        area: "Advertising space",
        alt: "Your ad on our platform",
        contact: "Contact administration about advertising or collaboration",
    },
};

export default function CarDetailsAd() {
    const { language } = useI18n();

    const text = TEXTS[language] || TEXTS.hy;
    const banner = BANNERS[language] || BANNERS.hy;

    function openBusinessProposal() {
        window.dispatchEvent(
            new CustomEvent("open-support", {
                detail: {
                    type: "business",
                    source: "car-details-banner",
                },
            }),
        );
    }

    function handleImageError(event) {
        const image = event.currentTarget;

        if (image.dataset.fallback === "true") return;

        image.dataset.fallback = "true";
        image.src = asset(BANNERS.hy);
    }

    return (
        <section className="arm-details-ad" aria-label={text.area}>
            <button
                type="button"
                className="arm-details-ad-link"
                onClick={openBusinessProposal}
                aria-label={text.contact}
                title={text.contact}
                style={{
                    display: "block",
                    width: "100%",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    color: "inherit",
                    font: "inherit",
                    textAlign: "inherit",
                    cursor: "pointer",
                }}
            >
                <div className="arm-details-ad-image-wrap">
                    <img
                        key={banner}
                        src={asset(banner)}
                        alt={text.alt}
                        className="arm-details-ad-image"
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                    />

                    <span className="arm-details-ad-label">{text.label}</span>
                </div>
            </button>
        </section>
    );
}
