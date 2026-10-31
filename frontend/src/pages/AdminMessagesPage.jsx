import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

const PAGE_SIZE = 30;

const TEXTS = {
    hy: {
        section: "ԱԴՄԻՆԻ ԲԱԺԻՆ",
        title: "Հաղորդագրություններ",
        total: "Հաղորդագրություններ՝",
        refresh: "Թարմացնել",
        loading: "Բեռնվում է...",
        empty: "Հաղորդագրություններ չկան։",
        new: "Նոր",
        resolved: "Մշակված",
        openListing: "Բացել հայտարարությունը",
        reply: "Պատասխանել էլ. փոստով",
        subject: "ArmMotors — Ձեր հարցը",
        saving: "Պահպանվում է...",
        markResolved: "Նշել մշակված",
        markNew: "Նշել նոր",
        pagination: "Հաղորդագրությունների էջեր",
        previous: "Նախորդ",
        next: "Հաջորդ",
        page: "Էջ",
        loadError: "Հաղորդագրությունները բեռնել չհաջողվեց։",
        updateError: "Հաղորդագրության կարգավիճակը փոխել չհաջողվեց։",
        login: "Ադմինի մուտք",
    },

    ru: {
        section: "ПАНЕЛЬ АДМИНИСТРАТОРА",
        title: "Сообщения",
        total: "Сообщений:",
        refresh: "Обновить",
        loading: "Загрузка...",
        empty: "Сообщений нет.",
        new: "Новое",
        resolved: "Обработано",
        openListing: "Открыть объявление",
        reply: "Ответить по email",
        subject: "ArmMotors — Ваш вопрос",
        saving: "Сохранение...",
        markResolved: "Отметить обработанным",
        markNew: "Отметить новым",
        pagination: "Страницы сообщений",
        previous: "Назад",
        next: "Далее",
        page: "Страница",
        loadError: "Не удалось загрузить сообщения.",
        updateError: "Не удалось изменить статус сообщения.",
        login: "Вход администратора",
    },

    en: {
        section: "ADMINISTRATION",
        title: "Messages",
        total: "Messages:",
        refresh: "Refresh",
        loading: "Loading...",
        empty: "No messages.",
        new: "New",
        resolved: "Resolved",
        openListing: "Open listing",
        reply: "Reply by email",
        subject: "ArmMotors — Your inquiry",
        saving: "Saving...",
        markResolved: "Mark as resolved",
        markNew: "Mark as new",
        pagination: "Message pages",
        previous: "Previous",
        next: "Next",
        page: "Page",
        loadError: "Could not load messages.",
        updateError: "Could not update the message status.",
        login: "Administrator sign-in",
    },
};

export default function AdminMessagesPage() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorKey, setErrorKey] = useState("");
    const [busy, setBusy] = useState("");
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setErrorKey("");

        async function loadMessages() {
            try {
                const result = await apiRequest(`/messages?page=${page}`, {
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;

                setMessages(
                    Array.isArray(result?.messages) ? result.messages : [],
                );

                setTotal(Math.max(0, Number(result?.total) || 0));
            } catch {
                if (!controller.signal.aborted) {
                    setErrorKey("loadError");
                    setMessages([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadMessages();

        return () => controller.abort();
    }, [page, revision]);

    async function changeStatus(message) {
        if (busy) return;

        const id = String(message._id || message.id || "");

        if (!id) return;

        setBusy(id);
        setErrorKey("");

        try {
            await apiRequest(`/messages/${encodeURIComponent(id)}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: message.status === "new" ? "resolved" : "new",
                }),
            });

            setRevision((current) => current + 1);
        } catch {
            setErrorKey("updateError");
        } finally {
            setBusy("");
        }
    }

    function formatDate(value) {
        const date = new Date(value);

        return Number.isFinite(date.getTime())
            ? date.toLocaleString(locale)
            : "";
    }

    function getListingId(value) {
        if (!value) return "";

        return typeof value === "object"
            ? String(value._id || value.id || "")
            : String(value);
    }

    return (
        <main className="details-page">
            <div className="detail-heading">
                <div>
                    <span className="section-label">{text.section}</span>

                    <h1>{text.title}</h1>

                    <p>
                        {text.total} {total.toLocaleString(locale)}
                    </p>
                </div>

                <button
                    type="button"
                    className="detail-secondary"
                    disabled={loading || Boolean(busy)}
                    onClick={() => setRevision((current) => current + 1)}
                >
                    {text.refresh}
                </button>
            </div>

            {errorKey && (
                <p role="alert">
                    {text[errorKey]}{" "}
                    {errorKey === "loadError" && (
                        <Link to="/login?next=%2Fadmin%2Fmessages">
                            {text.login}
                        </Link>
                    )}
                </p>
            )}

            {loading ? (
                <p role="status">{text.loading}</p>
            ) : messages.length === 0 ? (
                !errorKey && <p>{text.empty}</p>
            ) : (
                messages.map((message) => {
                    const id = String(message._id || message.id || "");

                    const listingId = getListingId(message.listingId);

                    const isNew = message.status === "new";
                    const date = formatDate(message.createdAt);

                    return (
                        <article className="admin-message" key={id}>
                            <header>
                                <strong>{message.name}</strong>

                                <span>
                                    {isNew
                                        ? `● ${text.new}`
                                        : `✓ ${text.resolved}`}
                                </span>
                            </header>

                            <p>{message.email}</p>

                            {date && (
                                <time
                                    dateTime={new Date(
                                        message.createdAt,
                                    ).toISOString()}
                                >
                                    {date}
                                </time>
                            )}

                            {listingId && (
                                <p>
                                    <Link
                                        to={`/cars/${encodeURIComponent(
                                            listingId,
                                        )}`}
                                    >
                                        {text.openListing} →
                                    </Link>
                                </p>
                            )}

                            <p
                                style={{
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {message.text}
                            </p>

                            <footer>
                                {message.email && (
                                    <a
                                        className="detail-primary"
                                        href={`mailto:${encodeURIComponent(
                                            message.email,
                                        )}?subject=${encodeURIComponent(
                                            text.subject,
                                        )}`}
                                    >
                                        {text.reply}
                                    </a>
                                )}

                                <button
                                    type="button"
                                    className="detail-secondary"
                                    disabled={loading || Boolean(busy)}
                                    onClick={() => changeStatus(message)}
                                >
                                    {busy === id
                                        ? text.saving
                                        : isNew
                                          ? text.markResolved
                                          : text.markNew}
                                </button>
                            </footer>
                        </article>
                    );
                })
            )}

            {!loading && total > PAGE_SIZE && (
                <nav className="admin-pagination" aria-label={text.pagination}>
                    <button
                        type="button"
                        className="detail-secondary"
                        disabled={page === 1 || Boolean(busy)}
                        onClick={() =>
                            setPage((current) => Math.max(1, current - 1))
                        }
                    >
                        ← {text.previous}
                    </button>

                    <span>
                        {text.page} {page}
                    </span>

                    <button
                        type="button"
                        className="detail-secondary"
                        disabled={page * PAGE_SIZE >= total || Boolean(busy)}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        {text.next} →
                    </button>
                </nav>
            )}
        </main>
    );
}
