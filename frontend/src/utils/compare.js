const STORAGE_KEY = "armmotors-compare";
const EVENT_NAME = "armmotors-compare-change";
const MAX_ITEMS = 3;

export function getCompareIds() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        return Array.isArray(saved)
            ? saved.map(String).slice(0, MAX_ITEMS)
            : [];
    } catch {
        return [];
    }
}

function saveCompareIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

    window.dispatchEvent(new Event(EVENT_NAME));
}

export function toggleCompare(id) {
    const value = String(id);
    const ids = getCompareIds();

    if (ids.includes(value)) {
        saveCompareIds(ids.filter((item) => item !== value));

        return {
            success: true,
            added: false,
        };
    }

    if (ids.length >= MAX_ITEMS) {
        return {
            success: false,
            message: "Կարող եք համեմատել առավելագույնը 3 մեքենա։",
        };
    }

    saveCompareIds([...ids, value]);

    return {
        success: true,
        added: true,
    };
}

export function removeCompare(id) {
    saveCompareIds(getCompareIds().filter((item) => item !== String(id)));
}

export function clearCompare() {
    saveCompareIds([]);
}

export function subscribeCompare(callback) {
    window.addEventListener(EVENT_NAME, callback);
    window.addEventListener("storage", callback);

    return () => {
        window.removeEventListener(EVENT_NAME, callback);
        window.removeEventListener("storage", callback);
    };
}
