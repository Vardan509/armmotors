const PRODUCTION_ORIGIN = "https://armmotors.onrender.com";

function isLocalHost(hostname) {
    return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
        hostname.toLowerCase(),
    );
}

function getUploadOrigin() {
    if (
        typeof window !== "undefined" &&
        isLocalHost(window.location.hostname)
    ) {
        return "http://localhost:3001";
    }

    return PRODUCTION_ORIGIN;
}

export function resolveImageUrl(value) {
    if (typeof value !== "string") return "";

    const source = value.trim();

    if (!source) return "";

    if (/^(blob:|data:image\/)/i.test(source)) {
        return source;
    }

    const origin = getUploadOrigin();

    // Նոր հարաբերական uploads հղումներ։
    if (/^\/?uploads\//i.test(source)) {
        return `${origin}/${source.replace(/^\/+/, "")}`;
    }

    // Հին localhost հղումները փոխարինում ենք ճիշտ սերվերով։
    try {
        const url = new URL(
            source.startsWith("//") ? `https:${source}` : source,
        );

        if (!["http:", "https:"].includes(url.protocol)) {
            return "";
        }

        if (isLocalHost(url.hostname) && url.pathname.startsWith("/uploads/")) {
            return `${origin}${url.pathname}${url.search}${url.hash}`;
        }

        return url.href;
    } catch {
        // Պահպանում ենք մյուս հարաբերական նկարների հղումները։
        return source;
    }
}
