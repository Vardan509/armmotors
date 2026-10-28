import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/api";

import "./MessagesPage.css";

function getMyId() {
    try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");

        const user = stored.user || stored;

        return String(user.id || user._id || "");
    } catch {
        return "";
    }
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);

    const [selectedId, setSelectedId] = useState("");

    const [chat, setChat] = useState(null);
    const [text, setText] = useState("");

    const [loading, setLoading] = useState(true);

    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");

    const myId = getMyId();
    const token = localStorage.getItem("token");

    // ==========================================
    // LOAD CONVERSATIONS
    // ==========================================

    const loadConversations = useCallback(async () => {
        try {
            const result = await apiRequest("/conversations");

            setConversations(Array.isArray(result?.items) ? result.items : []);
        } catch (err) {
            setError(err.message || "Զրույցները բեռնել չհաջողվեց։");
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // LOAD CHAT
    // ==========================================

    const loadChat = useCallback(async (id) => {
        if (!id) return;

        try {
            const result = await apiRequest(
                `/conversations/${encodeURIComponent(id)}`,
            );

            setChat(result);
        } catch (err) {
            setError(err.message || "Հաղորդագրությունները բեռնել չհաջողվեց։");
        }
    }, []);

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        void loadConversations();
    }, [token, loadConversations]);

    // ==========================================
    // CONVERSATIONS POLLING
    // ==========================================

    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                void loadConversations();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [token, loadConversations]);

    // ==========================================
    // CHAT POLLING
    // ==========================================

    useEffect(() => {
        if (!token || !selectedId) return;

        void loadChat(selectedId);

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                void loadChat(selectedId);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [token, selectedId, loadChat]);

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    async function sendMessage(event) {
        event.preventDefault();

        const message = text.trim();

        if (!message || !selectedId || sending) {
            return;
        }

        setSending(true);
        setError("");

        try {
            await apiRequest(
                `/conversations/${encodeURIComponent(selectedId)}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        text: message,
                    }),
                },
            );

            setText("");

            await Promise.all([loadChat(selectedId), loadConversations()]);
        } catch (err) {
            setError(err.message || "Հաղորդագրությունը ուղարկել չհաջողվեց։");
        } finally {
            setSending(false);
        }
    }

    // ==========================================
    // AUTH REQUIRED
    // ==========================================

    if (!token) {
        return (
            <main className="messages-auth">
                <h1>Հաղորդագրություններ</h1>

                <p>Զրույցները տեսնելու համար մուտք գործեք։</p>

                <Link to="/login?next=%2Fmessages">Մուտք գործել</Link>
            </main>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <main className="messages-page">
            <div className="messages-heading">
                <div>
                    <span>ARMMOTORS</span>

                    <h1>Իմ հաղորդագրությունները</h1>

                    <p>Կապ հաստատեք վաճառողների և գնորդների հետ։</p>
                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="messages-error" role="alert">
                    {error}

                    <button type="button" onClick={() => setError("")}>
                        Փակել
                    </button>
                </div>
            )}

            <div className="messages-layout">
                {/* CONVERSATIONS */}

                <aside className="messages-sidebar">
                    <h2>Զրույցներ</h2>

                    {loading && <p className="messages-muted">Բեռնվում է...</p>}

                    {!loading && conversations.length === 0 && (
                        <p className="messages-muted">Դեռ զրույցներ չունեք։</p>
                    )}

                    {conversations.map((conversation) => {
                        const conversationId = String(
                            conversation._id || conversation.id,
                        );

                        const buyerId = String(
                            conversation.buyer?._id ||
                                conversation.buyer?.id ||
                                conversation.buyer ||
                                "",
                        );

                        const isBuyer = buyerId === myId;

                        const other = isBuyer
                            ? conversation.seller
                            : conversation.buyer;

                        const otherName = [other?.name, other?.surname]
                            .filter(Boolean)
                            .join(" ");

                        const selected = selectedId === conversationId;

                        return (
                            <button
                                type="button"
                                key={conversationId}
                                className={`messages-conversation ${
                                    selected ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setSelectedId(conversationId);
                                    setChat(null);
                                    setError("");
                                }}
                            >
                                <div className="messages-conversation-top">
                                    <strong>{otherName || "Օգտատեր"}</strong>

                                    {conversation.unreadCount > 0 && (
                                        <span className="messages-unread">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>

                                <small>
                                    {conversation.product?.title ||
                                        "Հայտարարություն"}
                                </small>

                                <p>
                                    {conversation.lastMessage ||
                                        "Զրույցը սկսված է"}
                                </p>
                            </button>
                        );
                    })}
                </aside>

                {/* CHAT */}

                <section className="messages-chat">
                    {!selectedId ? (
                        <div className="messages-empty">
                            <div className="messages-empty-icon">
                                <svg
                                    width="44"
                                    height="44"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    aria-hidden="true"
                                >
                                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z" />
                                </svg>
                            </div>

                            <h2>Ընտրեք զրույցը</h2>

                            <p>Ձախ կողմից ընտրեք օգտատիրոջը։</p>
                        </div>
                    ) : !chat ? (
                        <div className="messages-empty">
                            Զրույցը բեռնվում է...
                        </div>
                    ) : (
                        <>
                            {/* CHAT HEADER */}

                            <div className="messages-chat-header">
                                <div>
                                    <strong>Հաղորդագրություններ</strong>

                                    <small>
                                        {(chat.messages || []).length}{" "}
                                        հաղորդագրություն
                                    </small>
                                </div>

                                {chat.productId && (
                                    <Link
                                        to={`/cars/${encodeURIComponent(
                                            chat.productId,
                                        )}`}
                                    >
                                        Հայտարարություն →
                                    </Link>
                                )}
                            </div>

                            {/* MESSAGES */}

                            <div className="messages-chat-body">
                                {(chat.messages || []).length === 0 && (
                                    <p className="messages-muted">
                                        Գրեք առաջին հաղորդագրությունը։
                                    </p>
                                )}

                                {(chat.messages || []).map((message) => {
                                    const senderId = String(
                                        message.sender?._id ||
                                            message.sender?.id ||
                                            message.sender ||
                                            "",
                                    );

                                    const mine = senderId === myId;

                                    return (
                                        <div
                                            key={message._id || message.id}
                                            className={`messages-bubble ${
                                                mine ? "mine" : "other"
                                            }`}
                                        >
                                            <p>{message.text}</p>

                                            <small>
                                                {message.createdAt
                                                    ? new Date(
                                                          message.createdAt,
                                                      ).toLocaleString("hy-AM")
                                                    : ""}

                                                {mine &&
                                                    (message.read
                                                        ? " · Կարդացված"
                                                        : " · Ուղարկված")}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* COMPOSE */}

                            <form
                                className="messages-compose"
                                onSubmit={sendMessage}
                            >
                                <textarea
                                    value={text}
                                    onChange={(event) =>
                                        setText(event.target.value)
                                    }
                                    placeholder="Գրեք հաղորդագրություն..."
                                    maxLength={2000}
                                    rows={2}
                                    aria-label="Հաղորդագրություն"
                                />

                                <button
                                    type="submit"
                                    disabled={sending || !text.trim()}
                                >
                                    {sending ? "Ուղարկվում է..." : "Ուղարկել"}
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
