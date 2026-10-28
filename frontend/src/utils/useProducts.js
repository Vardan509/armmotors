import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "./api";

const AUTO_RETRY_MS = 15000;

export default function useProducts() {
    const [revision, setRevision] = useState(0);

    const [state, setState] = useState({
        products: [],
        loading: true,
        error: "",
    });

    const retry = useCallback(() => {
        setRevision((value) => value + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        let retryTimer;
        let firstAttempt = true;

        async function load() {
            if (controller.signal.aborted) {
                return;
            }

            if (firstAttempt) {
                setState((previous) => ({
                    ...previous,
                    loading: true,
                    error: "",
                }));
            }

            firstAttempt = false;

            try {
                const data = await apiRequest("/products", {
                    signal: controller.signal,
                });

                if (!Array.isArray(data)) {
                    throw new Error("Սերվերի սխալ պատասխան։");
                }

                if (controller.signal.aborted) {
                    return;
                }

                setState({
                    products: data.map((product) => ({
                        ...product,

                        id: product._id || product.id,

                        image: product.images?.[0] || product.image,
                    })),

                    loading: false,
                    error: "",
                });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setState({
                    products: [],
                    loading: false,

                    error:
                        error.message ||
                        "Հայտարարությունները բեռնել չհաջողվեց։",
                });

                retryTimer = setTimeout(load, AUTO_RETRY_MS);
            }
        }

        void load();

        return () => {
            clearTimeout(retryTimer);
            controller.abort();
        };
    }, [revision]);

    return {
        ...state,
        retry,
    };
}
