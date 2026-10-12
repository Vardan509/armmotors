
import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../utils/api";

import "./NotificationBell.css";

const BASE = import.meta.env.BASE_URL;

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const rootRef = useRef(null);

    const loadNotifications = useCallback(async () => {
        if (!localStorage.getItem("token")) {
            setItems([]);
            setUnreadCount(0);
            return;
        }

        try {
            const result = await apiRequest(
                "/notifications",
                { timeoutMs: 10000 }
            );

            setItems(result.items || []);
            setUnreadCount(
                Number(result.unreadCount || 0)
            );
        } catch {
            // Մի խանգարիր Header-ի աշխատանքին,
            // եթե backend-ը ժամանակավորապես անհասանելի է։
        }
    }, []);

    useEffect(() => {
        void loadNotifications();

        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                void loadNotifications();
            }
        }, 15000);

        const refresh = () => {
            void loadNotifications();
        };

        window.addEventListener(
            "session-changed",
            refresh
        );

        window.addEventListener(
            "focus",
            refresh
        );

        return () => {
            window.clearInterval(interval);

            window.removeEventListener(
                "session-changed",
                refresh
            );

            window.removeEventListener(
                "focus",
                refresh
            );
        };
    }, [loadNotifications]);

    useEffect(() => {
        function onPointerDown(event) {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        function onKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener(
            "pointerdown",
            onPointerDown
        );

        document.addEventListener(
            "keydown",
            onKeyDown
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                onPointerDown
            );

            document.removeEventListener(
                "keydown",
                onKeyDown
            );
        };
    }, []);

    async function toggle() {
        if (!localStorage.getItem("token")) {
            window.location.assign(
                `${BASE}login?next=%2Fmessages`
            );
            return;
        }

        const next = !open;
        setOpen(next);

        if (next) {
            setLoading(true);
            await loadNotifications();
            setLoading(false);
        }
    }

    function openConversation(conversationId) {
        const url = new URL(
            `${BASE}messages`,
            window.location.origin
        );

        url.searchParams.set(
            "conversation",
            conversationId
        );

        window.location.assign(url.href);
    }

    return (
        <div
            className="am-notifications"
            ref={rootRef}
        >
            <button
                type="button"
                className="am-notifications-trigger"
                onClick={toggle}
                aria-label={`Ծանուցումներ, ${unreadCount} չկարդացված հաղորդագրություն`}
                aria-expanded={open}
                aria-haspopup="dialog"
                title="Ծանուցումներ"
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
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="am-notifications-panel"
                    role="dialog"
                    aria-label="Ծանուցումներ"
                >
                    <div className="am-notifications-head">
                        <div>
                            <strong>Ծանուցումներ</strong>

                            <small>
                                {unreadCount} չկարդացված
                            </small>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Փակել"
                        >
                            ×
                        </button>
                    </div>

                    <div className="am-notifications-body">
                        {loading && items.length === 0 ? (
                            <p className="am-notifications-empty">
                                Բեռնվում է...
                            </p>
                        ) : items.length === 0 ? (
                            <div className="am-notifications-empty">
                                <strong>
                                    Նոր ծանուցումներ չկան
                                </strong>

                                <p>
                                    Նոր հաղորդագրություններն
                                    այստեղ կերևան։
                                </p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    className="am-notification-item"
                                    onClick={() =>
                                        openConversation(
                                            item.conversationId
                                        )
                                    }
                                >
                                    <span className="am-notification-dot" />

                                    <span className="am-notification-content">
                                        <strong>
                                            {item.title}
                                        </strong>

                                        <span>
                                            {item.description}
                                        </span>

                                        <small>
                                            {item.unreadCount} նոր հաղորդագրություն
                                        </small>
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    <a
                        className="am-notifications-footer"
                        href={`${BASE}messages`}
                    >
                        Բոլոր հաղորդագրությունները →
                    </a>
                </div>
            )}
        </div>
    );
}
