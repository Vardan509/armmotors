import { useEffect, useState } from "react";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

const LABELS = {
    hy: {
        translating: "Նկարագրությունը թարգմանվում է...",
        unavailable: "Նկարագրություն չկա։",
        original: "Ցուցադրվում է բնօրինակ նկարագրությունը։",
    },

    en: {
        translating: "Translating description...",
        unavailable: "No description available.",
        original: "Showing the original description.",
    },

    ru: {
        translating: "Перевод описания...",
        unavailable: "Описание отсутствует.",
        original: "Показано оригинальное описание.",
    },
};

export default function TranslatedDescription({ productId, description = "" }) {
    const { language } = useI18n();

    const labels = LABELS[language] || LABELS.hy;

    const [state, setState] = useState({
        text: description,
        loading: false,
        failed: false,
    });

    useEffect(() => {
        let cancelled = false;

        const controller = new AbortController();

        const original = String(description || "");

        if (!original.trim() || !productId) {
            setState({
                text: original,
                loading: false,
                failed: false,
            });

            return () => controller.abort();
        }

        setState({
            text: original,
            loading: true,
            failed: false,
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

                if (cancelled) return;

                setState({
                    text: result.description || original,
                    loading: false,
                    failed: false,
                });
            } catch (error) {
                if (cancelled) return;

                setState({
                    text: original,
                    loading: false,
                    failed: true,
                });
            }
        }

        void loadTranslation();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [productId, description, language]);

    return (
        <div>
            {state.loading && (
                <p
                    role="status"
                    style={{
                        fontSize: 13,
                        color: "#888",
                        marginBottom: 12,
                    }}
                >
                    {labels.translating}
                </p>
            )}

            <p className="car-description" style={{ whiteSpace: "pre-line" }}>
                {state.text || labels.unavailable}
            </p>

            {state.failed && (
                <small
                    style={{
                        display: "block",
                        color: "#888",
                        marginTop: 10,
                    }}
                >
                    {labels.original}
                </small>
            )}
        </div>
    );
}
