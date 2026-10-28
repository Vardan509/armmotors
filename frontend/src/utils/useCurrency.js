
import { useEffect, useSyncExternalStore } from "react";
import initialRates from "../data/exchange-rates.json";

export const CURRENCIES = ["USD", "AMD", "RUB"];

const listeners = new Set();

function read(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function save(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage-ը կարող է անհասանելի լինել։
    }
}

function getLanguageCurrency() {
    const language =
        read("armmotors-language") ||
        read("language") ||
        "hy";

    return language === "ru" ? "RUB" : "USD";
}

let cachedRates = null;

try {
    cachedRates = JSON.parse(read("armmotors-rates"));
} catch {
    cachedRates = null;
}

function validRates(data) {
    return (
        data?.result === "success" &&
        data.base_code === "AMD" &&
        CURRENCIES.every(
            (code) =>
                Number.isFinite(data.rates?.[code]) &&
                data.rates[code] > 0
        )
    );
}

let state = {
    currency: getLanguageCurrency(),

    data:
        validRates(cachedRates) &&
        cachedRates.time_last_update_unix >
            initialRates.time_last_update_unix
            ? cachedRates
            : initialRates,
};

let requested = false;

function emit() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

function getSnapshot() {
    return state;
}

export function setCurrency(currency) {
    if (!CURRENCIES.includes(currency)) {
        return;
    }

    if (state.currency === currency) {
        return;
    }

    state = {
        ...state,
        currency,
    };

    save("armmotors-currency", currency);
    save("currency", currency);

    emit();
}

export function setCurrencyByLanguage(language) {
    setCurrency(language === "ru" ? "RUB" : "USD");
}

if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
        if (
            event.key === "armmotors-currency" &&
            CURRENCIES.includes(event.newValue)
        ) {
            state = {
                ...state,
                currency: event.newValue,
            };

            emit();
        }
    });

    // Համատեղելիություն գործող Header.jsx-ի հետ
    window.addEventListener("currency-change", (event) => {
        const currency = event.detail?.currency;

        if (CURRENCIES.includes(currency)) {
            setCurrency(currency);
        }
    });
}

export function convertPrice(
    price,
    currency,
    rates,
    source = "AMD"
) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
        return 0;
    }

    const sourceRate = rates?.[source];
    const targetRate = rates?.[currency];

    if (
        !Number.isFinite(sourceRate) ||
        !Number.isFinite(targetRate) ||
        sourceRate <= 0 ||
        targetRate <= 0
    ) {
        return amount;
    }

    return (amount / sourceRate) * targetRate;
}

export function formatPrice(
    price,
    currency,
    rates,
    source = "AMD"
) {
    const amount = convertPrice(
        price,
        currency,
        rates,
        source
    );

    const formatted = Math.round(amount).toLocaleString(
        "en-US"
    );

    if (currency === "USD") {
        return `$${formatted}`;
    }

    if (currency === "RUB") {
        return `${formatted} ₽`;
    }

    return `${formatted} ֏`;
}

export default function useCurrency() {
    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getSnapshot
    );

    useEffect(() => {
        if (
            requested ||
            snapshot.data.time_next_update_unix * 1000 >
                Date.now()
        ) {
            return;
        }

        requested = true;

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 8000);

        async function updateRates() {
            try {
                const response = await fetch(
                    "https://open.er-api.com/v6/latest/AMD",
                    {
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Exchange rates unavailable"
                    );
                }

                const data = await response.json();

                if (!validRates(data)) {
                    throw new Error(
                        "Invalid exchange rates"
                    );
                }

                save(
                    "armmotors-rates",
                    JSON.stringify(data)
                );

                state = {
                    ...state,
                    data,
                };

                emit();
            } catch {
                // Օգտագործում ենք պահպանված փոխարժեքները։
            } finally {
                clearTimeout(timeout);
            }
        }

        updateRates();

        return () => {
            clearTimeout(timeout);
        };
    }, [snapshot.data]);

    return {
        currency: snapshot.currency,

        setCurrency,

        updatedAt:
            snapshot.data.time_last_update_unix * 1000,

        format: (price, source = "AMD") =>
            formatPrice(
                price,
                snapshot.currency,
                snapshot.data.rates,
                source
            ),

        convert: (
            price,
            currency = snapshot.currency,
            source = "AMD"
        ) =>
            convertPrice(
                price,
                currency,
                snapshot.data.rates,
                source
            ),
    };
}
