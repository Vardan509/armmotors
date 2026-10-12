const LOCAL_API = "http://localhost:3001/api";

const configuredApi =
    import.meta.env.VITE_API_URL?.trim() || "";

function normalizeApiUrl(value) {
    const clean = String(value || "")
        .replace(/\/+$/, "");

    if (!clean) return "";

    return /\/api$/i.test(clean)
        ? clean
        : `${clean}/api`;
}

export const API_URL = normalizeApiUrl(
    configuredApi ||
    (import.meta.env.DEV ? LOCAL_API : "")
);

function validateApiUrl() {
    if (!API_URL) {
        throw new Error(
            "Backend-ի հասցեն նշված չէ։ Լրացրեք frontend/.env.production-ի VITE_API_URL-ը։"
        );
    }

    let parsed;

    try {
        parsed = new URL(API_URL);
    } catch {
        throw new Error(
            "VITE_API_URL-ը սխալ հասցե է։ Օրինակ՝ https://your-service.onrender.com/api"
        );
    }

    if (
        !["http:", "https:"].includes(parsed.protocol)
    ) {
        throw new Error(
            "Backend-ի հասցեն պետք է սկսվի http:// կամ https://։"
        );
    }

    if (
        import.meta.env.PROD &&
        (
            parsed.hostname === "localhost" ||
            parsed.hostname === "127.0.0.1" ||
            parsed.hostname.endsWith(".example")
        )
    ) {
        throw new Error(
            "Production API հասցեն օրինակային կամ localhost է։ Փոխեք frontend/.env.production-ի VITE_API_URL-ը և նորից build արեք։"
        );
    }
}

export async function apiRequest(
    path,
    options = {}
) {
    validateApiUrl();

    const {
        timeoutMs = 20000,
        signal,
        ...fetchOptions
    } = options;

    const token = localStorage.getItem("token");

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    const onAbort = () => controller.abort();

    if (signal?.aborted) {
        controller.abort();
    } else {
        signal?.addEventListener(
            "abort",
            onAbort,
            { once: true }
        );
    }

    try {
        const headers = new Headers(
            fetchOptions.headers
        );

        if (
            fetchOptions.body != null &&
            !(fetchOptions.body instanceof FormData) &&
            !headers.has("Content-Type")
        ) {
            headers.set(
                "Content-Type",
                "application/json"
            );
        }

        if (token) {
            headers.set(
                "Authorization",
                `Bearer ${token}`
            );
        }

        const url =
            `${API_URL}/${String(path).replace(/^\/+/, "")}`;

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: controller.signal,
        });

        const contentType =
            response.headers.get("content-type") || "";

        let data = null;

        if (response.status !== 204) {
            if (
                contentType.includes("application/json")
            ) {
                data = await response
                    .json()
                    .catch(() => null);
            } else {
                data = await response
                    .text()
                    .catch(() => null);
            }
        }

        if (!response.ok) {
            const message =
                data?.code === "DATABASE_UNAVAILABLE"
                    ? "Backend-ը միացված է, բայց MongoDB-ն անհասանելի է։ Ստուգեք backend-ի terminal-ը։"
                    : (
                        typeof data === "object" &&
                        (data?.message || data?.error)
                    ) ||
                    (
                        typeof data === "string" &&
                        data
                    ) ||
                    `Հարցումը չհաջողվեց։ Status: ${response.status}`;

            const error = new Error(message);

            error.status = response.status;
            error.data = data;

            const isAuthRequest =
                /^\/?auth(?:\/|$)/.test(
                    String(path).replace(/^\/+/, "")
                );

            const accountBanned =
                data?.code === "ACCOUNT_BANNED";

            if (
                accountBanned ||
                (
                    response.status === 401 &&
                    !isAuthRequest &&
                    token
                )
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.dispatchEvent(
                    new Event("session-changed")
                );
            }

            throw error;
        }

        return data;
    } catch (error) {
        if (signal?.aborted) {
            throw new Error(
                "Հարցումը չեղարկվել է։"
            );
        }

        if (error?.name === "AbortError") {
            throw new Error(
                "Սերվերի պատասխանը ուշանում է։ Ստուգեք backend-ի և MongoDB-ի վիճակը։"
            );
        }

        if (error instanceof TypeError) {
            throw new Error(
                "Backend-ին միանալ չհաջողվեց։ Ստուգեք սերվերի հասցեն, CORS-ը և արդյոք backend-ը աշխատում է։"
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);

        signal?.removeEventListener(
            "abort",
            onAbort
        );
    }
}