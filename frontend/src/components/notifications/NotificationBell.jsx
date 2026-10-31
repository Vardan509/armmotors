import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import useInterfaceText from "../../utils/interfaceText";

import "./NotificationBell.css";

export default function NotificationBell() {
    const { tr, language, locale } = useInterfaceText();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [failed, setFailed] = useState(false);

    const rootRef = useRef(null);
    const buttonRef = useRef(null);
    const mountedRef = useRef(false);
    const requestRef = useRef(0);

    const panelId = useId();

    const loadNotifications = useCallback(async () => {
        const token = localStorage.getItem("token");
        const requestId = ++requestRef.current;

        if (!token) {
            if (mountedRef.current) {
                setItems([]);
                setUnreadCount(0);
                setSelected(null);
                setOpen(false);
                setFailed(false);
            }

            return;
        }

        try {
            const result = await apiRequest("/notifications", {
                timeoutMs: 10000,
            });

            if (
                !mountedRef.current ||
                requestId !== requestRef.current ||
                token !== localStorage.getItem("token")
            ) {
                return;
            }

            setItems(Array.isArray(result?.items) ? result.items : []);

            setUnreadCount(Math.max(0, Number(result?.unreadCount) || 0));

            setFailed(false);
        } catch {
            if (mountedRef.current && requestId === requestRef.current) {
                setFailed(true);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        void loadNotifications();

        const refresh = () => {
            void loadNotifications();
        };

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                refresh();
            }
        }, 15000);

        window.addEventListener("session-changed", refresh);
        window.addEventListener("focus", refresh);
        window.addEventListener("notifications-updated", refresh);

        return () => {
            mountedRef.current = false;
            requestRef.current += 1;

            window.clearInterval(timer);

            window.removeEventListener("session-changed", refresh);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("notifications-updated", refresh);
        };
    }, [loadNotifications]);

    useEffect(() => {
        function outside(event) {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        }

        function keyboard(event) {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", outside);
        document.addEventListener("keydown", keyboard);

        return () => {
            document.removeEventListener("pointerdown", outside);
            document.removeEventListener("keydown", keyboard);
        };
    }, []);

    async function toggle() {
        if (!localStorage.getItem("token")) {
            navigate("/login?next=%2Faccount");
            return;
        }

        const next = !open;

        setOpen(next);
        setSelected(null);

        if (next) {
            setLoading(true);

            try {
                await loadNotifications();
            } finally {
                if (mountedRef.current) setLoading(false);
            }
        }
    }

    async function openNotification(item) {
        if (item.type === "message") {
            const params = new URLSearchParams();

            if (item.conversationId) {
                params.set("conversation", item.conversationId);
            }

            setOpen(false);

            navigate(
                params.size ? `/messages?${params.toString()}` : "/messages",
            );

            return;
        }

        if (item.type !== "broadcast") return;

        setSelected(item);

        if (item.read) return;

        try {
            await apiRequest(
                `/notifications/broadcasts/${encodeURIComponent(
                    item.deliveryId,
                )}/read`,
                { method: "PATCH" },
            );

            if (!mountedRef.current) return;

            setSelected((current) =>
                current?.id === item.id ? { ...current, read: true } : current,
            );

            window.dispatchEvent(new Event("notifications-updated"));
        } catch {
            if (mountedRef.current) setFailed(true);
        }
    }

    function formatDate(value) {
        const date = new Date(value);

        return Number.isFinite(date.getTime())
            ? date.toLocaleString(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
              })
            : "";
    }

    function content(item, field) {
        return item.translations?.[language]?.[field] || item[field] || "";
    }

    return (
        <div className="am-notifications" ref={rootRef}>
            <button
                ref={buttonRef}
                type="button"
                className="am-notifications-trigger"
                onClick={toggle}
                aria-label={`${tr("notifications")}. ${tr("unreadCount", {
                    count: unreadCount,
                })}`}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-controls={open ? panelId : undefined}
                title={tr("notifications")}
            >
                <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                    <path d="M10 21h4" />
                </svg>

                {unreadCount > 0 && (
                    <span className="am-notifications-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    id={panelId}
                    className="am-notifications-panel"
                    role="dialog"
                    aria-label={tr("notifications")}
                >
                    <div className="am-notifications-head">
                        <div>
                            <strong>{tr("notifications")}</strong>

                            <small>
                                {tr("unreadCount", {
                                    count: unreadCount,
                                })}
                            </small>
                        </div>

                        <button
                            type="button"
                            aria-label={tr("close")}
                            onClick={() => {
                                setOpen(false);
                                setSelected(null);
                                buttonRef.current?.focus();
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div className="am-notifications-body">
                        {failed && (
                            <p className="am-notifications-empty" role="alert">
                                {tr("loadError")}
                            </p>
                        )}

                        {selected ? (
                            <div style={{ padding: 16 }}>
                                <button
                                    type="button"
                                    onClick={() => setSelected(null)}
                                    style={{ marginBottom: 14 }}
                                >
                                    ← {tr("back")}
                                </button>

                                <h3>{content(selected, "title")}</h3>

                                <small>{formatDate(selected.createdAt)}</small>

                                <p
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        lineHeight: 1.7,
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {content(selected, "text")}
                                </p>
                            </div>
                        ) : loading && items.length === 0 ? (
                            <p className="am-notifications-empty" role="status">
                                {tr("loading")}
                            </p>
                        ) : items.length === 0 ? (
                            !failed && (
                                <div className="am-notifications-empty">
                                    <strong>{tr("noNotifications")}</strong>

                                    <p>{tr("notificationsIntro")}</p>
                                </div>
                            )
                        ) : (
                            items.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    className="am-notification-item"
                                    onClick={() => openNotification(item)}
                                >
                                    <span
                                        className="am-notification-dot"
                                        style={{
                                            opacity:
                                                item.type === "broadcast"
                                                    ? item.read
                                                        ? 0
                                                        : 1
                                                    : item.unreadCount > 0
                                                      ? 1
                                                      : 0,
                                        }}
                                        aria-hidden="true"
                                    />

                                    <span className="am-notification-content">
                                        <strong>
                                            {item.type === "broadcast" &&
                                                "ARMMOTORS · "}
                                            {content(item, "title")}
                                        </strong>

                                        <span>
                                            {content(item, "description")}
                                        </span>

                                        <small>
                                            {formatDate(item.createdAt)}
                                        </small>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    <Link
                        className="am-notifications-footer"
                        to="/account"
                        onClick={() => setOpen(false)}
                    >
                        {tr("account")} →
                    </Link>
                </div>
            )}
        </div>
    );
}
