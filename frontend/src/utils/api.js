const LOCAL_API = "http://localhost:3001/api";

const configuredApi = import.meta.env.VITE_API_URL?.trim();

export const API_URL = (
    configuredApi || (import.meta.env.DEV ? LOCAL_API : "")
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
    if (!API_URL) {
        throw new Error("Backend-ի հասցեն կարգավորված չէ։");
    }

    const { timeoutMs = 30000, signal, ...fetchOptions } = options;

    const token = localStorage.getItem("token");

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    const onAbort = () => controller.abort();

    if (signal?.aborted) {
        controller.abort();
    } else {
        signal?.addEventListener("abort", onAbort, {
            once: true,
        });
    }

    try {
        const headers = new Headers(fetchOptions.headers);

        if (
            fetchOptions.body != null &&
            !(fetchOptions.body instanceof FormData) &&
            !headers.has("Content-Type")
        ) {
            headers.set("Content-Type", "application/json");
        }

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const url = `${API_URL}/${String(path).replace(/^\/+/, "")}`;

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") || "";

        let data = null;

        if (response.status !== 204) {
            if (contentType.includes("application/json")) {
                data = await response.json().catch(() => null);
            } else {
                data = await response.text().catch(() => null);
            }
        }

        if (!response.ok) {
            const message =
                (typeof data === "object" && (data?.message || data?.error)) ||
                (typeof data === "string" && data) ||
                `Հարցումը չհաջողվեց։ Status: ${response.status}`;

            const error = new Error(message);

            error.status = response.status;
            error.data = data;

            const isAuthRequest = /^\/?auth(?:\/|$)/.test(
                String(path).replace(/^\/+/, ""),
            );

            const accountBanned = data?.code === "ACCOUNT_BANNED";

            if (
                accountBanned ||
                (response.status === 401 && !isAuthRequest && token)
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.dispatchEvent(new Event("session-changed"));
            }

            throw error;
        }

        return data;
    } catch (error) {
        if (signal?.aborted) {
            throw new Error("Հարցումը չեղարկվել է։");
        }

        if (error.name === "AbortError") {
            throw new Error("Սերվերի պատասխանը ուշանում է։ Փորձեք կրկին։");
        }

        if (error instanceof TypeError) {
            throw new Error(
                "Backend-ին միանալ չհաջողվեց։ Ստուգեք սերվերի հասանելիությունը։",
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);

        signal?.removeEventListener("abort", onAbort);
    }
}
