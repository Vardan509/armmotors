import { useEffect, useState } from "react";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

const TEXTS = {
    hy: {
        loading: "Նկարագրությունը թարգմանվում է...",
        empty: "Նկարագրություն չի ավելացվել։",
        unavailable: "Թարգմանությունը հասանելի չէ։ Ցուցադրվում է բնօրինակը։",
        retry: "Կրկին փորձել",
    },
    ru: {
        loading: "Перевод описания...",
        empty: "Описание не добавлено.",
        unavailable: "Перевод недоступен. Показан оригинал.",
        retry: "Повторить",
    },
    en: {
        loading: "Translating description...",
        empty: "No description provided.",
        unavailable: "Translation is unavailable. Showing the original.",
        retry: "Try again",
    },
};

export default function TranslatedDescription({ productId, description = "" }) {
    const { language } = useI18n();

    const text = TEXTS[language] || TEXTS.hy;
    const original = String(description || "").trim();

    const [attempt, setAttempt] = useState(0);

    const [state, setState] = useState({
        key: "",
        status: "loading",
        description: "",
        sourceLanguage: undefined,
    });

    const requestKey = JSON.stringify([productId, language, original, attempt]);

    useEffect(() => {
        const controller = new AbortController();

        if (!original || !productId) {
            setState({
                key: requestKey,
                status: original ? "unavailable" : "empty",
                description: original,
                sourceLanguage: undefined,
            });

            return () => controller.abort();
        }

        setState({
            key: requestKey,
            status: "loading",
            description: "",
            sourceLanguage: undefined,
        });

        async function loadTranslation() {
            try {
                const result = await apiRequest(
                    `/translations/${encodeURIComponent(
                        productId,
                    )}/description?lang=${encodeURIComponent(language)}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (controller.signal.aborted) return;

                const translatedDescription =
                    typeof result?.description === "string"
                        ? result.description.trim()
                        : "";

                const ready =
                    result?.ready === true &&
                    result?.fallback !== true &&
                    result?.language === language &&
                    Boolean(translatedDescription);

                setState({
                    key: requestKey,
                    status: ready ? "ready" : "unavailable",
                    description: ready ? translatedDescription : original,
                    sourceLanguage: result?.sourceLanguage,
                });
            } catch {
                if (controller.signal.aborted) return;

                setState({
                    key: requestKey,
                    status: "unavailable",
                    description: original,
                    sourceLanguage: undefined,
                });
            }
        }

        void loadTranslation();

        return () => controller.abort();
    }, [productId, language, original, requestKey]);

    if (!original) {
        return <p className="car-description">{text.empty}</p>;
    }

    const status = state.key === requestKey ? state.status : "loading";

    const loading = status === "loading";
    const unavailable = status === "unavailable";

    const sourceLanguage = ["hy", "ru", "en"].includes(state.sourceLanguage)
        ? state.sourceLanguage
        : undefined;

    return (
        <div className="translated-description" aria-busy={loading}>
            {loading ? (
                <p
                    role="status"
                    style={{
                        color: "#607086",
                        fontSize: 13,
                        lineHeight: 1.6,
                    }}
                >
                    {text.loading}
                </p>
            ) : (
                <>
                    {unavailable && (
                        <div style={{ marginBottom: 14 }}>
                            <p
                                role="status"
                                style={{
                                    color: "#607086",
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                }}
                            >
                                {text.unavailable}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setAttempt((current) => current + 1);
                                }}
                                style={{
                                    padding: "8px 12px",
                                    border: "1px solid #dce5ef",
                                    borderRadius: 8,
                                    background: "#ffffff",
                                    color: "#244b77",
                                    font: "inherit",
                                    fontSize: 13,
                                    cursor: "pointer",
                                }}
                            >
                                {text.retry}
                            </button>
                        </div>
                    )}

                    <p
                        className="car-description"
                        lang={unavailable ? sourceLanguage : language}
                        style={{
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {unavailable ? original : state.description}
                    </p>
                </>
            )}
        </div>
    );
}
