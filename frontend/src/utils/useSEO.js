import { useEffect } from "react";

const DEFAULT_TITLE =
    "ArmMotors — Ավտոմեքենաներ և պահեստամասեր";

const DEFAULT_DESCRIPTION =
    "ArmMotors՝ ավտոմեքենաների և պահեստամասերի հայտարարությունների հարթակ Հայաստանում։";

function setMeta(attribute, name, value) {
    let element = document.head.querySelector(
        `meta[${attribute}="${name}"]`
    );

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
    }

    element.setAttribute("content", value);
}

export default function useSEO({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    image,
    canonical,
} = {}) {
    useEffect(() => {
        const absoluteUrl = new URL(
            canonical || window.location.href,
            window.location.origin
        ).href;

        const imageUrl = image
            ? new URL(
                  image,
                  window.location.origin
              ).href
            : null;

        document.title = title;

        setMeta(
            "name",
            "description",
            description
        );

        setMeta(
            "property",
            "og:type",
            "website"
        );

        setMeta(
            "property",
            "og:title",
            title
        );

        setMeta(
            "property",
            "og:description",
            description
        );

        setMeta(
            "property",
            "og:url",
            absoluteUrl
        );

        setMeta(
            "name",
            "twitter:card",
            imageUrl
                ? "summary_large_image"
                : "summary"
        );

        setMeta(
            "name",
            "twitter:title",
            title
        );

        setMeta(
            "name",
            "twitter:description",
            description
        );

        if (imageUrl) {
            setMeta(
                "property",
                "og:image",
                imageUrl
            );

            setMeta(
                "name",
                "twitter:image",
                imageUrl
            );
        }

        let link = document.head.querySelector(
            'link[rel="canonical"]'
        );

        if (!link) {
            link = document.createElement("link");
            link.rel = "canonical";
            document.head.appendChild(link);
        }

        link.href = absoluteUrl;

        return () => {
            document.title = DEFAULT_TITLE;

            setMeta(
                "name",
                "description",
                DEFAULT_DESCRIPTION
            );
        };
    }, [
        title,
        description,
        image,
        canonical,
    ]);
}