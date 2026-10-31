import { useCallback, useEffect, useRef, useState } from "react";

import { apiRequest } from "../../utils/api";
import usePageText from "../../utils/pageText";

export default function AccountBroadcasts() {
    const { tr, language, locale } = usePageText();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorKey, setErrorKey] = useState("");
    const [expanded, setExpanded] = useState(null);
    const [reading, setReading] = useState(null);

    const mountedRef = useRef(false);
    const requestRef = useRef(0);

    const load = useCallback(async () => {
        const requestId = ++requestRef.current;

        if (mountedRef.current) {
            setLoading(true);
        }

        try {
            const result = await apiRequest("/notifications/broadcasts");

            if (!mountedRef.current || requestId !== requestRef.current) {
                return;
            }

            setItems(Array.isArray(result?.items) ? result.items : []);

            setErrorKey("");
        } catch {
            if (mountedRef.current && requestId === requestRef.current) {
                setErrorKey("loadError");
            }
        } finally {
            if (mountedRef.current && requestId === requestRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        void load();

        function refresh() {
            void load();
        }

        window.addEventListener("notifications-updated", refresh);

        return () => {
            mountedRef.current = false;
            requestRef.current += 1;

            window.removeEventListener("notifications-updated", refresh);
        };
    }, [load]);

    async function openLetter(item) {
        setExpanded((current) => (current === item.id ? null : item.id));

        if (item.read || reading) return;

        setReading(item.id);
        setErrorKey("");

        try {
            await apiRequest(
                `/notifications/broadcasts/${encodeURIComponent(
                    item.deliveryId,
                )}/read`,
                { method: "PATCH" },
            );

            if (!mountedRef.current) return;

            setItems((current) =>
                current.map((letter) =>
                    letter.id === item.id ? { ...letter, read: true } : letter,
                ),
            );

            window.dispatchEvent(new Event("notifications-updated"));
        } catch {
            if (mountedRef.current) {
                setErrorKey("actionError");
            }
        } finally {
            if (mountedRef.current) {
                setReading(null);
            }
        }
    }

    function formattedDate(value) {
        const date = new Date(value);

        return Number.isFinite(date.getTime())
            ? date.toLocaleString(locale)
            : "";
    }

    return (
        <section className="account-section" id="account-notifications">
            <div className="account-section-head">
                <h2>{tr("lettersTitle")}</h2>

                <button
                    type="button"
                    onClick={() => void load()}
                    disabled={loading}
                >
                    {tr("refresh")}
                </button>
            </div>

            {errorKey && (
                <p className="account-error" role="alert">
                    {tr(errorKey)}
                </p>
            )}

            {loading ? (
                <p role="status">{tr("loading")}</p>
            ) : items.length === 0 ? (
                !errorKey && (
                    <div className="account-empty">
                        <h3>{tr("noLetters")}</h3>
                        <p>{tr("lettersEmpty")}</p>
                    </div>
                )
            ) : (
                <div
                    style={{
                        display: "grid",
                        gap: 12,
                    }}
                >
                    {items.map((item) => {
                        const translated = item.translations?.[language];

                        const title = translated?.title || item.title;

                        const body = translated?.text || item.text;

                        return (
                            <article
                                key={item.id}
                                style={{
                                    padding: 18,
                                    border: "1px solid #dce5ef",
                                    borderRadius: 14,
                                    background: item.read
                                        ? "#ffffff"
                                        : "#f3f7fc",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => openLetter(item)}
                                    aria-expanded={expanded === item.id}
                                    style={{
                                        display: "flex",
                                        width: "100%",
                                        gap: 12,
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        border: 0,
                                        background: "transparent",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        color: "inherit",
                                        font: "inherit",
                                    }}
                                >
                                    <span>
                                        <strong>{title}</strong>

                                        <small
                                            style={{
                                                display: "block",
                                                marginTop: 6,
                                                color: "#607086",
                                            }}
                                        >
                                            {formattedDate(item.createdAt)}
                                        </small>
                                    </span>

                                    <span>
                                        {tr(item.read ? "read" : "unread")}
                                    </span>
                                </button>

                                {expanded === item.id && (
                                    <p
                                        style={{
                                            marginTop: 16,
                                            whiteSpace: "pre-wrap",
                                            overflowWrap: "anywhere",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {body}
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
