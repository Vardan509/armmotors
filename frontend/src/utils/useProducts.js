import { useCallback, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { apiRequest } from "./api";

const AUTO_RETRY_MS = 15000;

const TRANSMISSIONS = {
    automatic: "automatic",
    auto: "automatic",
    ավտոմատ: "automatic",
    автомат: "automatic",
    автоматическая: "automatic",

    manual: "manual",
    մեխանիկական: "manual",
    механика: "manual",
    механическая: "manual",

    robot: "robot",
    automated: "robot",
    ռոբոտ: "robot",
    робот: "robot",
    роботизированная: "robot",

    cvt: "cvt",
    վարիատոր: "cvt",
    вариатор: "cvt",
};

function normalizeTransmission(value) {
    const text = String(value || "")
        .trim()
        .toLowerCase();

    return TRANSMISSIONS[text] || text;
}

export default function useProducts() {
    const location = useLocation();

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
            if (controller.signal.aborted) return;

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

                if (controller.signal.aborted) return;

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
                if (controller.signal.aborted) return;

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

    let products = state.products;

    if (location.pathname.replace(/\/$/, "") === "/cars") {
        const params = new URLSearchParams(location.search);

        const engineFrom = params.get("engineFrom") || "";
        const engineTo = params.get("engineTo") || "";
        const transmission = params.get("transmission") || "";

        products = products.filter((product) => {
            if (engineFrom !== "" || engineTo !== "") {
                if (
                    product.engineVolume == null ||
                    product.engineVolume === ""
                ) {
                    return false;
                }

                const volume = Number(product.engineVolume);

                if (!Number.isFinite(volume)) return false;

                if (engineFrom !== "" && volume < Number(engineFrom)) {
                    return false;
                }

                if (engineTo !== "" && volume > Number(engineTo)) {
                    return false;
                }
            }

            if (transmission) {
                const actual =
                    product.transmission ||
                    product.gearbox ||
                    product.gearboxType;

                if (
                    normalizeTransmission(actual) !==
                    normalizeTransmission(transmission)
                ) {
                    return false;
                }
            }

            return true;
        });
    }

    return {
        ...state,
        products,
        retry,
    };
}
