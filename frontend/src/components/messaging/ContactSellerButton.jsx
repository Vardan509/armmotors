
import { useState } from "react";
import { apiRequest } from "../../utils/api";

const BASE = import.meta.env.BASE_URL;

export default function ContactSellerButton({ productId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function startConversation() {
        if (!productId || loading) return;

        if (!localStorage.getItem("token")) {
            window.location.assign(
                `${BASE}login?next=/cars/${encodeURIComponent(productId)}`
            );
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await apiRequest(
                "/conversations/start",
                {
                    method: "POST",
                    body: JSON.stringify({ productId }),
                }
            );

            window.location.assign(
                `${BASE}messages?chat=${encodeURIComponent(result.id)}`
            );
        } catch (err) {
            setError(
                err.message || "Զրույցը սկսել չհաջողվեց։"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                disabled={loading || !productId}
                onClick={startConversation}
                style={{
                    width: "100%",
                    minHeight: 48,
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: 10,
                    background: "#d4af37",
                    color: "#202020",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                }}
            >
                {loading
                    ? "Բացվում է..."
                    : "Գրել վաճառողին"}
            </button>

            {error && (
                <p
                    role="alert"
                    style={{
                        marginTop: 10,
                        color: "#bb3333",
                        fontSize: 12,
                    }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}
