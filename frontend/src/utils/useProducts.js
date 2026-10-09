import { useEffect, useState } from "react";

import { apiRequest } from "./api";

export default function useProducts() {
    const [state, setState] = useState({
        products: [],
        loading: true,
        error: ""
    });

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const data = await apiRequest("/products", {
                    signal: controller.signal
                });

                if (!Array.isArray(data)) {
                    throw new Error("Սերվերի սխալ պատասխան։");
                }

                const products = data.map(product => ({
                    ...product,

                    id: product._id || product.id,

                    image: product.images?.[0] || product.image
                }));

                setState({
                    products,
                    loading: false,
                    error: ""
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    setState({
                        products: [],
                        loading: false,
                        error: error.message
                    });
                }
            }
        }

        load();

        return () => controller.abort();
    }, []);

    return state;
}
