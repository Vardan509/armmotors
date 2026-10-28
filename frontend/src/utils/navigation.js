const BASE = import.meta.env.BASE_URL;

export function pageUrl(path = "/") {
    if (typeof path !== "string") {
        return BASE;
    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("mailto:") ||
        path.startsWith("tel:")
    ) {
        return path;
    }

    const cleanPath = path.replace(/^\/+/, "");

    const basePath = BASE.replace(/^\/+/, "");

    if (basePath && cleanPath.startsWith(basePath)) {
        return `/${cleanPath}`;
    }

    return `${BASE}${cleanPath}`;
}

export function navigate(path = "/") {
    window.location.assign(pageUrl(path));
}
