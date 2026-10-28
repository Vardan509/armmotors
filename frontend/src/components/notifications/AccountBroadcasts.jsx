import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";

export default function AccountBroadcasts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(null);

    const load = useCallback(async () => {
        try {
            const result = await apiRequest("/notifications/broadcasts");

            setItems(Array.isArray(result.items) ? result.items : []);

            setError("");
        } catch (err) {
            setError(err.message || "Նամակները բեռնել չհաջողվեց։");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();

        function refresh() {
            void load();
        }

        window.addEventListener("notifications-updated", refresh);

        return () => {
            window.removeEventListener("notifications-updated", refresh);
        };
    }, [load]);

    async function openLetter(item) {
        setExpanded(expanded === item.id ? null : item.id);

        if (item.read) return;

        try {
            await apiRequest(
                `/notifications/broadcasts/${encodeURIComponent(
                    item.deliveryId,
                )}/read`,
                {
                    method: "PATCH",
                },
            );

            await load();

            window.dispatchEvent(new Event("notifications-updated"));
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="account-section" id="account-notifications">
            <div className="account-section-head">
                <h2>Նամակներ ադմինիստրացիայից</h2>

                <button type="button" onClick={load}>
                    Թարմացնել
                </button>
            </div>

            {loading ? (
                <p>Նամակները բեռնվում են...</p>
            ) : error ? (
                <p className="account-error" role="alert">
                    {error}
                </p>
            ) : items.length === 0 ? (
                <div className="account-empty">
                    <h3>Նամակներ դեռ չկան</h3>

                    <p>
                        ArmMotors-ի ադմինիստրացիայի հաղորդագրություններն այստեղ
                        կհայտնվեն։
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gap: 12,
                    }}
                >
                    {items.map((item) => (
                        <article
                            key={item.id}
                            style={{
                                padding: 18,
                                border: "1px solid #e9e5dd",
                                borderRadius: 14,
                                background: item.read ? "#fff" : "#fffaf0",
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
                                }}
                            >
                                <span>
                                    <strong>{item.title}</strong>

                                    <small
                                        style={{
                                            display: "block",
                                            marginTop: 6,
                                            color: "#888",
                                        }}
                                    >
                                        {new Date(
                                            item.createdAt,
                                        ).toLocaleString("hy-AM")}
                                    </small>
                                </span>

                                <span>{item.read ? "Կարդացված" : "Նոր"}</span>
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
                                    {item.text}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
