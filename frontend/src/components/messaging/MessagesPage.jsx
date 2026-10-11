
import { useCallback, useEffect, useState } from "react";

import Header from "../header/Header";
import { apiRequest } from "../../utils/api";

import "./MessagesPage.css";

const BASE = import.meta.env.BASE_URL;

function getMyId() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
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

    const loadConversations = useCallback(async () => {
        try {
            const result = await apiRequest("/conversations");
            setConversations(result.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadChat = useCallback(async (id) => {
        if (!id) return;

        try {
            const result = await apiRequest(`/conversations/${id}`);
            setChat(result);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        loadConversations();
    }, [token, loadConversations]);

    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                loadConversations();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [token, loadConversations]);

    useEffect(() => {
        if (!selectedId) return;

        loadChat(selectedId);

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                loadChat(selectedId);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedId, loadChat]);

    async function sendMessage(event) {
        event.preventDefault();

        const message = text.trim();

        if (!message || !selectedId || sending) return;

        setSending(true);
        setError("");

        try {
            await apiRequest(
                `/conversations/${selectedId}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({ text: message }),
                }
            );

            setText("");

            await Promise.all([
                loadChat(selectedId),
                loadConversations(),
            ]);
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    }

    if (!token) {
        return (
            <>
                <Header />

                <main className="messages-auth">
                    <h1>Հաղորդագրություններ</h1>

                    <p>
                        Զրույցները տեսնելու համար մուտք գործեք։
                    </p>

                    <a href={`${BASE}login?next=/messages`}>
                        Մուտք գործել
                    </a>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="messages-page">
                <div className="messages-heading">
                    <div>
                        <span>ARMMOTORS</span>
                        <h1>Իմ հաղորդագրությունները</h1>
                        <p>
                            Կապ հաստատեք վաճառողների և գնորդների հետ։
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="messages-error" role="alert">
                        {error}

                        <button
                            type="button"
                            onClick={() => setError("")}
                        >
                            Փակել
                        </button>
                    </div>
                )}

                <div className="messages-layout">
                    <aside className="messages-sidebar">
                        <h2>Զրույցներ</h2>

                        {loading && (
                            <p className="messages-muted">
                                Բեռնվում է...
                            </p>
                        )}

                        {!loading && conversations.length === 0 && (
                            <p className="messages-muted">
                                Դեռ զրույցներ չունեք։
                            </p>
                        )}

                        {conversations.map((conversation) => {
                            const isBuyer =
                                String(
                                    conversation.buyer?._id ||
                                    conversation.buyer
                                ) === myId;

                            const other = isBuyer
                                ? conversation.seller
                                : conversation.buyer;

                            const otherName = [
                                other?.name,
                                other?.surname,
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <button
                                    type="button"
                                    key={conversation._id}
                                    className={`messages-conversation ${
                                        selectedId === conversation._id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSelectedId(conversation._id);
                                        setChat(null);
                                    }}
                                >
                                    <div className="messages-conversation-top">
                                        <strong>
                                            {otherName || "Օգտատեր"}
                                        </strong>

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
                                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5Z" />
                                    </svg>
                                </div>

                                <h2>Ընտրեք զրույցը</h2>
                                <p>
                                    Ձախ կողմից ընտրեք օգտատիրոջը։
                                </p>
                            </div>
                        ) : !chat ? (
                            <div className="messages-empty">
                                Զրույցը բեռնվում է...
                            </div>
                        ) : (
                            <>
                                <div className="messages-chat-header">
                                    <div>
                                        <strong>Հաղորդագրություններ</strong>
                                        <small>
                                            {chat.messages.length} հաղորդագրություն
                                        </small>
                                    </div>

                                    <a
                                        href={`${BASE}cars/${chat.productId}`}
                                    >
                                        Հայտարարություն →
                                    </a>
                                </div>

                                <div className="messages-chat-body">
                                    {chat.messages.length === 0 && (
                                        <p className="messages-muted">
                                            Գրեք առաջին հաղորդագրությունը։
                                        </p>
                                    )}

                                    {chat.messages.map((message) => {
                                        const mine =
                                            String(message.sender) === myId;

                                        return (
                                            <div
                                                key={message._id}
                                                className={`messages-bubble ${
                                                    mine ? "mine" : "other"
                                                }`}
                                            >
                                                <p>{message.text}</p>

                                                <small>
                                                    {new Date(
                                                        message.createdAt
                                                    ).toLocaleString("hy-AM")}

                                                    {mine &&
                                                        (message.read
                                                            ? " · Կարդացված"
                                                            : " · Ուղարկված")}
                                                </small>
                                            </div>
                                        );
                                    })}
                                </div>

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
                                        disabled={
                                            sending || !text.trim()
                                        }
                                    >
                                        {sending
                                            ? "Ուղարկվում է..."
                                            : "Ուղարկել"}
                                    </button>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
