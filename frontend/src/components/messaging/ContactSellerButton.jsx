import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import { useI18n } from "../../utils/i18n";

const TEXTS = {
    hy: {
        opening: "Բացվում է...",
        writeSeller: "Գրել վաճառողին",
        error: "Զրույցը սկսել չհաջողվեց։ Կրկին փորձեք։",
    },

    ru: {
        opening: "Открывается...",
        writeSeller: "Написать продавцу",
        error: "Не удалось начать переписку. Попробуйте ещё раз.",
    },

    en: {
        opening: "Opening...",
        writeSeller: "Message seller",
        error: "Could not start the conversation. Please try again.",
    },
};

export default function ContactSellerButton({ productId }) {
    const navigate = useNavigate();
    const { language } = useI18n();

    const text = TEXTS[language] || TEXTS.hy;

    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    const busyRef = useRef(false);

    async function startConversation() {
        if (!productId || busyRef.current) return;

        const listingPath = `/cars/${encodeURIComponent(productId)}`;

        if (!localStorage.getItem("token")) {
            navigate(`/login?next=${encodeURIComponent(listingPath)}`);

            return;
        }

        busyRef.current = true;
        setLoading(true);
        setFailed(false);

        try {
            const result = await apiRequest("/conversations/start", {
                method: "POST",
                body: JSON.stringify({ productId }),
            });

            const conversationId = result?.id || result?._id;

            if (!conversationId) {
                throw new Error("CONVERSATION_ID_MISSING");
            }

            const params = new URLSearchParams({
                conversation: String(conversationId),
            });

            navigate(`/messages?${params.toString()}`);
        } catch {
            setFailed(true);
        } finally {
            busyRef.current = false;
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                disabled={loading || !productId}
                onClick={startConversation}
                aria-busy={loading}
                style={{
                    width: "100%",
                    minHeight: 48,
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: 10,
                    background: "#14263f",
                    color: "#ffffff",
                    font: "inherit",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: loading || !productId ? "not-allowed" : "pointer",
                    opacity: loading || !productId ? 0.65 : 1,
                }}
            >
                {loading ? text.opening : text.writeSeller}
            </button>

            {failed && (
                <p
                    role="alert"
                    style={{
                        marginTop: 10,
                        color: "#bb3333",
                        fontSize: 12,
                        lineHeight: 1.6,
                    }}
                >
                    {text.error}
                </p>
            )}
        </div>
    );
}
