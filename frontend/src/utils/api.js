const LOCAL_API = "http://localhost:3001/api";

const configuredApi = import.meta.env.VITE_API_URL?.trim() || "";

function normalizeApiUrl(value) {
    const clean = String(value || "").replace(/\/+$/, "");

    if (!clean) return "";

    return /\/api$/i.test(clean) ? clean : `${clean}/api`;
}

export const API_URL = normalizeApiUrl(
    configuredApi || (import.meta.env.DEV ? LOCAL_API : ""),
);

let refreshPromise = null;

// ==========================================
// API CONFIGURATION
// ==========================================

function validateApiUrl() {
    if (!API_URL) {
        throw new Error("Backend-ի հասցեն նշված չէ։ Լրացրեք VITE_API_URL-ը։");
    }

    let parsed;

    try {
        parsed = new URL(API_URL);
    } catch {
        throw new Error("VITE_API_URL-ը սխալ հասցե է։");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Backend-ի հասցեն սխալ է։");
    }

    if (
        import.meta.env.PROD &&
        (parsed.hostname === "localhost" ||
            parsed.hostname === "127.0.0.1" ||
            parsed.hostname.endsWith(".example"))
    ) {
        throw new Error("Production API հասցեն ճիշտ կարգավորված չէ։");
    }
}

// ==========================================
// SESSION HELPERS
// ==========================================

export function getAccessToken() {
    return localStorage.getItem("token");
}

export function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

export function saveAuthSession(data) {
    if (!data?.token || !data?.user) {
        throw new Error("Սերվերը չի վերադարձրել մուտքի տվյալները։");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.dispatchEvent(new Event("session-changed"));

    return data;
}

export function clearAuthSession() {
    const hadSession =
        Boolean(localStorage.getItem("token")) ||
        Boolean(localStorage.getItem("user"));

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (hadSession) {
        window.dispatchEvent(new Event("session-changed"));
    }
}

// ==========================================
// SAFE SESSION CLEAR
// ==========================================

function clearSessionIfUnchanged(expectedToken) {
    if (expectedToken && getAccessToken() === expectedToken) {
        clearAuthSession();
        return true;
    }

    return false;
}

// ==========================================
// RESPONSE PARSER
// ==========================================

async function parseResponse(response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json().catch(() => null);
    }

    return response.text().catch(() => null);
}

function createApiError(response, data) {
    const message =
        data?.code === "DATABASE_UNAVAILABLE"
            ? "Backend-ը միացված է, բայց MongoDB-ն անհասանելի է։"
            : (typeof data === "object" && (data?.message || data?.error)) ||
              (typeof data === "string" && data) ||
              `Հարցումը չհաջողվեց։ Status: ${response.status}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    return error;
}

// ==========================================
// FETCH WITH TIMEOUT
// ==========================================

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
    const { signal, ...fetchOptions } = options;

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const onAbort = () => controller.abort();

    if (signal?.aborted) {
        controller.abort();
    } else {
        signal?.addEventListener("abort", onAbort, { once: true });
    }

    try {
        return await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            credentials: "include",
        });
    } catch (error) {
        if (signal?.aborted) {
            throw new Error("Հարցումը չեղարկվել է։");
        }

        if (error?.name === "AbortError") {
            throw new Error("Սերվերի պատասխանը ուշանում է։");
        }

        if (error instanceof TypeError) {
            throw new Error(
                "Backend-ին միանալ չհաջողվեց։ Ստուգեք սերվերը և CORS-ը։",
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);

        signal?.removeEventListener("abort", onAbort);
    }
}

// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

export async function refreshAccessToken() {
    validateApiUrl();

    if (refreshPromise) {
        return refreshPromise;
    }

    const tokenBeforeRefresh = getAccessToken();

    const pending = (async () => {
        const response = await fetchWithTimeout(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await parseResponse(response);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSessionIfUnchanged(tokenBeforeRefresh);
            }

            throw createApiError(response, data);
        }

        if (getAccessToken() !== tokenBeforeRefresh) {
            return {
                token: getAccessToken(),
                user: getStoredUser(),
            };
        }

        return saveAuthSession(data);
    })();

    refreshPromise = pending;

    try {
        return await pending;
    } finally {
        if (refreshPromise === pending) {
            refreshPromise = null;
        }
    }
}

// ==========================================
// MAIN API REQUEST
// ==========================================

export async function apiRequest(path, options = {}) {
    validateApiUrl();

    const {
        timeoutMs = 20000,
        signal,
        skipAuthRefresh = false,
        ...fetchOptions
    } = options;

    const normalizedPath = String(path).replace(/^\/+/, "");

    const url = `${API_URL}/${normalizedPath}`;

    const isAuthEndpoint = /^auth(?:\/|$)/.test(normalizedPath);

    // ======================================
    // PUBLIC AUTH ENDPOINTS
    // ======================================

    const publicAuthEndpoints = new Set([
        "auth/login",
        "auth/reg",
        "auth/google",
        "auth/config",
        "auth/refresh",
        "auth/logout",
        "auth/forgot-password",
        "auth/reset-password",
        "auth/reset-password/validate",
    ]);

    // /auth/me և /auth/google/link
    // պետք է ուղարկեն Bearer token։

    const requiresBearer = !publicAuthEndpoints.has(
        normalizedPath.split("?")[0],
    );

    // ======================================
    // SEND REQUEST
    // ======================================

    async function sendRequest() {
        const token = getAccessToken();

        const headers = new Headers(fetchOptions.headers);

        if (
            fetchOptions.body != null &&
            !(fetchOptions.body instanceof FormData) &&
            !headers.has("Content-Type")
        ) {
            headers.set("Content-Type", "application/json");
        }

        if (token && requiresBearer) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const response = await fetchWithTimeout(
            url,
            {
                ...fetchOptions,
                headers,
                signal,
            },
            timeoutMs,
        );

        return {
            response,
            tokenUsed: token,
        };
    }

    let { response, tokenUsed } = await sendRequest();

    // ======================================
    // AUTHENTICATION RECOVERY
    // ======================================

    if (
        response.status === 401 &&
        !skipAuthRefresh &&
        requiresBearer &&
        tokenUsed
    ) {
        const currentToken = getAccessToken();

        if (currentToken && currentToken !== tokenUsed) {
            ({ response, tokenUsed } = await sendRequest());
        } else if (currentToken === tokenUsed) {
            try {
                await refreshAccessToken();

                if (getAccessToken()) {
                    ({ response, tokenUsed } = await sendRequest());
                }
            } catch (refreshError) {
                if (
                    refreshError.status === 401 ||
                    refreshError.status === 403
                ) {
                    clearSessionIfUnchanged(tokenUsed);
                }

                throw refreshError;
            }
        }
    }

    const data = await parseResponse(response);

    // ======================================
    // ERROR HANDLING
    // ======================================

    if (!response.ok) {
        if (data?.code === "ACCOUNT_BANNED") {
            clearSessionIfUnchanged(tokenUsed);
        } else if (response.status === 401 && requiresBearer) {
            clearSessionIfUnchanged(tokenUsed);
        }

        throw createApiError(response, data);
    }

    return data;
}

// ==========================================
// LOGOUT
// ==========================================

export async function logoutUser() {
    try {
        await apiRequest("/auth/logout", {
            method: "POST",
            skipAuthRefresh: true,
        });
    } finally {
        clearAuthSession();
    }
}
