const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001/api"
).replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("token");

    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,

            signal: options.signal
                ? AbortSignal.any([
                      options.signal,
                      AbortSignal.timeout(12000)
                  ])
                : AbortSignal.timeout(12000),

            headers: {
                "Content-Type": "application/json",

                ...(token
                    ? {
                          Authorization: `Bearer ${token}`
                      }
                    : {}),

                ...(options.headers || {})
            }
        });
    } catch (error) {
        if (options.signal?.aborted) {
            throw error;
        }

        throw new Error(
            "Backend-ին միանալ չհաջողվեց։ Ստուգիր, որ backend-ը աշխատում է localhost:3001-ում։",
            {
                cause: error
            }
        );
    }

    const data =
        response.status === 204
            ? null
            : await response.json().catch(() => null);

    if (!response.ok) {
        if (
            response.status === 401 ||
            data?.code === "ACCOUNT_BANNED"
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.dispatchEvent(
                new Event("session-changed")
            );
        }

        const error = new Error(
            data?.message ||
                data?.error ||
                `Հարցումը չհաջողվեց։ Status: ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}

export { API_URL };