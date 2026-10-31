import { useCallback, useEffect, useRef, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import useInterfaceText from "../../utils/interfaceText";

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

function getId(value) {
    return String(value?._id || value?.id || value || "");
}

export default function MessagesPage() {
    const { tr, locale } = useInterfaceText();
    const [params, setParams] = useSearchParams();

    const selectedId = params.get("conversation") || params.get("chat") || "";

    const [conversations, setConversations] = useState([]);
    const [chat, setChat] = useState(null);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [errorKey, setErrorKey] = useState("");

    const mountedRef = useRef(false);
    const selectedRef = useRef(selectedId);
    const chatRequestRef = useRef(0);
    const listRequestRef = useRef(0);

    selectedRef.current = selectedId;

    const myId = getMyId();
    const token = localStorage.getItem("token");
    const draft = drafts[selectedId] || "";

    const loadConversations = useCallback(async () => {
        const requestId = ++listRequestRef.current;

        try {
            const result = await apiRequest("/conversations");

            if (!mountedRef.current || requestId !== listRequestRef.current) {
                return;
            }

            setConversations(Array.isArray(result?.items) ? result.items : []);
        } catch {
            if (mountedRef.current && requestId === listRequestRef.current) {
                setErrorKey("loadError");
            }
        } finally {
            if (mountedRef.current && requestId === listRequestRef.current) {
                setLoading(false);
            }
        }
    }, []);

    const loadChat = useCallback(async (id) => {
        if (!id) return;

        const requestId = ++chatRequestRef.current;

        try {
            const result = await apiRequest(
                `/conversations/${encodeURIComponent(id)}`,
            );

            if (
                !mountedRef.current ||
                selectedRef.current !== id ||
                requestId !== chatRequestRef.current
            ) {
                return;
            }

            setChat({ id, data: result });
        } catch {
            if (
                mountedRef.current &&
                selectedRef.current === id &&
                requestId === chatRequestRef.current
            ) {
                setErrorKey("loadError");
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            chatRequestRef.current += 1;
            listRequestRef.current += 1;
        };
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setConversations([]);
            setChat(null);
            return;
        }

        setLoading(true);
        void loadConversations();

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                void loadConversations();
            }
        }, 10000);

        return () => {
            window.clearInterval(timer);
            listRequestRef.current += 1;
        };
    }, [token, loadConversations]);

    useEffect(() => {
        if (!token || !selectedId) return;

        setErrorKey("");
        void loadChat(selectedId);

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                void loadChat(selectedId);
            }
        }, 5000);

        return () => {
            window.clearInterval(timer);
            chatRequestRef.current += 1;
        };
    }, [token, selectedId, loadChat]);

    function selectConversation(id) {
        const next = new URLSearchParams(params);

        next.delete("chat");
        next.set("conversation", id);

        setParams(next, {
            replace: true,
            preventScrollReset: true,
        });

        setErrorKey("");
    }

    async function sendMessage(event) {
        event.preventDefault();

        const conversationId = selectedId;
        const originalDraft = drafts[conversationId] || "";
        const message = originalDraft.trim();

        if (!message || !conversationId || sending) return;

        setSending(true);
        setErrorKey("");

        try {
            await apiRequest(
                `/conversations/${encodeURIComponent(conversationId)}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({ text: message }),
                },
            );

            if (!mountedRef.current) return;

            setDrafts((current) =>
                current[conversationId] === originalDraft
                    ? { ...current, [conversationId]: "" }
                    : current,
            );

            await Promise.all([
                loadConversations(),
                selectedRef.current === conversationId
                    ? loadChat(conversationId)
                    : Promise.resolve(),
            ]);
        } catch {
            if (mountedRef.current) {
                setErrorKey("sendError");
            }
        } finally {
            if (mountedRef.current) {
                setSending(false);
            }
        }
    }

    function formattedDate(value) {
        const date = new Date(value);

        return Number.isFinite(date.getTime())
            ? date.toLocaleString(locale)
            : "";
    }

    if (!token) {
        return (
            <main className="messages-auth">
                <h1>{tr("messages")}</h1>
                <p>{tr("chatLogin")}</p>

                <Link to="/login?next=%2Fmessages">{tr("login")}</Link>
            </main>
        );
    }

    const currentChat = chat?.id === selectedId ? chat.data : null;

    const messages = Array.isArray(currentChat?.messages)
        ? currentChat.messages
        : [];

    return (
        <main className="messages-page">
            <div className="messages-heading">
                <div>
                    <span>ARMMOTORS</span>
                    <h1>{tr("myMessages")}</h1>
                    <p>{tr("messagesIntro")}</p>
                </div>
            </div>

            {errorKey && (
                <div className="messages-error" role="alert">
                    {tr(errorKey)}

                    <button type="button" onClick={() => setErrorKey("")}>
                        {tr("close")}
                    </button>
                </div>
            )}

            <div className="messages-layout">
                <aside className="messages-sidebar">
                    <h2>{tr("conversations")}</h2>

                    {loading && (
                        <p className="messages-muted" role="status">
                            {tr("loading")}
                        </p>
                    )}

                    {!loading && !errorKey && conversations.length === 0 && (
                        <p className="messages-muted">{tr("noChats")}</p>
                    )}

                    {conversations.map((conversation) => {
                        const id = getId(conversation);
                        const isBuyer = getId(conversation.buyer) === myId;

                        const other = isBuyer
                            ? conversation.seller
                            : conversation.buyer;

                        const otherName = [other?.name, other?.surname]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <button
                                type="button"
                                key={id}
                                className={`messages-conversation ${
                                    selectedId === id ? "selected" : ""
                                }`}
                                aria-pressed={selectedId === id}
                                onClick={() => selectConversation(id)}
                            >
                                <div className="messages-conversation-top">
                                    <strong>{otherName || tr("user")}</strong>

                                    {conversation.unreadCount > 0 && (
                                        <span className="messages-unread">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>

                                <small>
                                    {conversation.product?.title ||
                                        tr("listing")}
                                </small>

                                <p>
                                    {conversation.lastMessage ||
                                        tr("chatStarted")}
                                </p>
                            </button>
                        );
                    })}
                </aside>

                <section className="messages-chat">
                    {!selectedId ? (
                        <div className="messages-empty">
                            <h2>{tr("chooseChat")}</h2>
                            <p>{tr("chooseUser")}</p>
                        </div>
                    ) : !currentChat ? (
                        <div className="messages-empty" role="status">
                            {errorKey ? tr(errorKey) : tr("loading")}
                        </div>
                    ) : (
                        <>
                            <div className="messages-chat-header">
                                <div>
                                    <strong>{tr("messages")}</strong>

                                    <small>
                                        {tr("messageCount", {
                                            count: messages.length,
                                        })}
                                    </small>
                                </div>

                                {currentChat.productId && (
                                    <Link
                                        to={`/cars/${encodeURIComponent(
                                            getId(currentChat.productId),
                                        )}`}
                                    >
                                        {tr("listing")} →
                                    </Link>
                                )}
                            </div>

                            <div className="messages-chat-body">
                                {messages.length === 0 && (
                                    <p className="messages-muted">
                                        {tr("firstMessage")}
                                    </p>
                                )}

                                {messages.map((message) => {
                                    const mine = getId(message.sender) === myId;

                                    return (
                                        <div
                                            key={getId(message)}
                                            className={`messages-bubble ${
                                                mine ? "mine" : "other"
                                            }`}
                                        >
                                            <p>{message.text}</p>

                                            <small>
                                                {formattedDate(
                                                    message.createdAt,
                                                )}

                                                {mine &&
                                                    ` · ${tr(
                                                        message.read
                                                            ? "read"
                                                            : "sent",
                                                    )}`}
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
                                    value={draft}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        setDrafts((current) => ({
                                            ...current,
                                            [selectedId]: value,
                                        }));
                                    }}
                                    placeholder={tr("messagePlaceholder")}
                                    aria-label={tr("message")}
                                    maxLength={2000}
                                    rows={2}
                                />

                                <button
                                    type="submit"
                                    disabled={sending || !draft.trim()}
                                >
                                    {tr(sending ? "sending" : "send")}
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
