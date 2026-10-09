const LOCAL_API = "http://localhost:3001/api";

const configuredApi = import.meta.env.VITE_API_URL?.trim();

export const API_URL = (
    configuredApi || (import.meta.env.DEV ? LOCAL_API : "")
).replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
    if (!API_URL) {
        throw new Error("Backend-ի հրապարակված հասցեն դեռ կարգավորված չէ։");
    }

    const token = localStorage.getItem("token");

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 12000);

    const onAbort = () => controller.abort();

    options.signal?.addEventListener("abort", onAbort, {
        once: true,
    });

    try {
        const headers = new Headers(options.headers);

        if (
            options.body != null &&
            !(options.body instanceof FormData) &&
            !headers.has("Content-Type")
        ) {
            headers.set("Content-Type", "application/json");
        }

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const response = await fetch(
            `${API_URL}/${String(path).replace(/^\/+/, "")}`,
            {
                ...options,
                headers,
                signal: controller.signal,
            },
        );

        const data =
            response.status === 204
                ? null
                : await response.json().catch(() => null);

        if (!response.ok) {
            if (response.status === 401 || data?.code === "ACCOUNT_BANNED") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.dispatchEvent(new Event("session-changed"));
            }

            const error = new Error(
                data?.message ||
                    data?.error ||
                    `Հարցումը չհաջողվեց։ Status: ${response.status}`,
            );

            error.status = response.status;
            error.data = data;

            throw error;
        }

        return data;
    } catch (error) {
        if (options.signal?.aborted) {
            throw error;
        }

        if (error.name === "AbortError") {
            throw new Error("Սերվերի պատասխանը ուշանում է։ Փորձիր կրկին։");
        }

        if (error instanceof TypeError) {
            throw new Error(
                "Backend-ին միանալ չհաջողվեց։ Ստուգիր API հասցեն և սերվերի հասանելիությունը։",
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);

        options.signal?.removeEventListener("abort", onAbort);
    }
}
