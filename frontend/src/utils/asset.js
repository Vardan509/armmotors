export function asset(path) {
    if (!path) return "";

    // Եթե նկարը արտաքին URL է, վերադարձնում ենք առանց փոփոխելու
    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:") ||
        path.startsWith("blob:")
    ) {
        return path;
    }

    // Հեռացնում ենք սկզբի ավելորդ /
    const cleanPath = path.replace(/^\/+/, "");

    // Աշխատում է և՛ localhost-ում, և՛ GitHub Pages-ում
    return `${import.meta.env.BASE_URL}${cleanPath}`;
}
