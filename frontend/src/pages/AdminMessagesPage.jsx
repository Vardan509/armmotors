import { useEffect, useState } from "react";

import Header from "../components/header/Header";
import { apiRequest } from "../utils/api";

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState("");
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setError("");

            try {
                const data = await apiRequest(
                    `/messages?page=${page}`,
                    {
                        signal: controller.signal
                    }
                );

                setMessages(data.messages);
                setTotal(data.total);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setError(error.message);
                    setMessages([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => controller.abort();
    }, [page, refresh]);

    async function changeStatus(message) {
        setBusy(message._id);
        setError("");

        try {
            const updated = await apiRequest(
                `/messages/${message._id}`,
                {
                    method: "PATCH",

                    body: JSON.stringify({
                        status: message.status === "new"
                            ? "resolved"
                            : "new"
                    })
                }
            );

            setMessages(prev =>
                prev.map(item =>
                    item._id === updated._id ? updated : item
                )
            );
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy("");
        }
    }

    return (
        <>
            <Header />

            <main className="details-page">
                <div className="detail-heading">
                    <div>
                        <span className="section-label">
                            ԱԴՄԻՆԻ ԲԱԺԻՆ
                        </span>

                        <h1>Հաղորդագրություններ</h1>

                        <p>{total} հաղորդագրություն</p>
                    </div>

                    <button
                        className="detail-secondary"
                        disabled={loading}
                        onClick={() => setRefresh(value => value + 1)}
                    >
                        Թարմացնել
                    </button>
                </div>

                {error && (
                    <p role="alert">
                        {error}{" "}

                        <a href="/login?next=/admin/messages">
                            Ադմինի մուտք
                        </a>
                    </p>
                )}

                {loading ? (
                    <p role="status">Բեռնվում է…</p>
                ) : !error && messages.length === 0 ? (
                    <p>Հաղորդագրություններ չկան։</p>
                ) : (
                    messages.map(message => (
                        <article
                            className="admin-message"
                            key={message._id}
                        >
                            <header>
                                <strong>{message.name}</strong>

                                <span>
                                    {message.status === "new"
                                        ? "● Նոր"
                                        : "✓ Մշակված"}
                                </span>
                            </header>

                            <p>{message.email}</p>

                            <time>
                                {new Date(message.createdAt)
                                    .toLocaleString("hy-AM")}
                            </time>

                            {message.listingId && (
                                <p>
                                    <a
                                        href={`/cars/${encodeURIComponent(message.listingId)}`}
                                    >
                                        Բացել հայտարարությունը →
                                    </a>
                                </p>
                            )}

                            <p>{message.text}</p>

                            <footer>
                                <a
                                    className="detail-primary"
                                    href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent("ArmMotors — Ձեր հարցը")}`}
                                >
                                    Պատասխանել email-ով
                                </a>

                                <button
                                    className="detail-secondary"
                                    disabled={Boolean(busy)}
                                    onClick={() => changeStatus(message)}
                                >
                                    {busy === message._id
                                        ? "Պահպանվում է…"
                                        : message.status === "new"
                                            ? "Նշել մշակված"
                                            : "Նշել նոր"}
                                </button>
                            </footer>
                        </article>
                    ))
                )}

                <nav
                    className="admin-pagination"
                    aria-label="Հաղորդագրությունների էջեր"
                >
                    <button
                        className="detail-secondary"
                        disabled={page === 1 || loading}
                        onClick={() => setPage(value => value - 1)}
                    >
                        ← Նախորդ
                    </button>

                    <span>{page}</span>

                    <button
                        className="detail-secondary"
                        disabled={page * 30 >= total || loading}
                        onClick={() => setPage(value => value + 1)}
                    >
                        Հաջորդ →
                    </button>
                </nav>
            </main>
        </>
    );
}