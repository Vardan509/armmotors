import { useState } from "react";
import { apiRequest } from "../../utils/api";
import useRemote from "../../utils/useRemote";
import "./AdminReports.css";

const BASE = import.meta.env.BASE_URL;

const REASONS = {
    spam: "Սպամ",
    fraud: "Կասկածելի հայտարարություն",
    incorrect: "Սխալ տեղեկություններ",
    other: "Այլ պատճառ",
};

export default function AdminReports() {
    const [status, setStatus] = useState("open");
    const [page, setPage] = useState(1);
    const [revision, setRevision] = useState(0);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const state = useRemote(
        `/reports/admin?status=${status}&page=${page}`,
        revision,
    );

    const items = state.data?.items || [];
    const total = state.data?.total || 0;
    const limit = state.data?.limit || 15;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    async function handleAction(report, action) {
        if (action === "hide-product") {
            const confirmed = window.confirm(
                "Թաքցնե՞լ այս հայտարարությունը։ Այն այլևս չի ցուցադրվի հրապարակային ցանկում։",
            );

            if (!confirmed) return;
        }

        setBusy(report._id);
        setError("");
        setMessage("");

        try {
            const result = await apiRequest(`/reports/admin/${report._id}`, {
                method: "PATCH",
                body: JSON.stringify({ action }),
            });

            setMessage(result.message || "Պահպանված է։");
            setRevision((value) => value + 1);
        } catch (err) {
            setError(err.message || "Գործողությունը չհաջողվեց։");
        } finally {
            setBusy("");
        }
    }

    return (
        <main className="admin-reports-page">
            <div className="admin-reports-header">
                <div>
                    <span className="admin-reports-eyebrow">
                        ARMMOTORS ADMIN
                    </span>

                    <h1>Բողոքների կառավարում</h1>

                    <p>
                        Ստուգեք օգտատերերի բողոքները և անհրաժեշտության դեպքում
                        թաքցրեք հայտարարությունները։
                    </p>
                </div>

                <a href={`${BASE}admin`}>Վերադառնալ ադմին</a>
            </div>

            <div className="admin-reports-toolbar">
                <button
                    className={status === "open" ? "selected" : ""}
                    onClick={() => {
                        setStatus("open");
                        setPage(1);
                    }}
                >
                    Նոր բողոքներ
                </button>

                <button
                    className={status === "resolved" ? "selected" : ""}
                    onClick={() => {
                        setStatus("resolved");
                        setPage(1);
                    }}
                >
                    Մշակված
                </button>
            </div>

            {error && (
                <p className="admin-reports-error" role="alert">
                    {error}
                </p>
            )}

            {message && (
                <p className="admin-reports-success" role="status">
                    {message}
                </p>
            )}

            {state.loading ? (
                <p>Բեռնվում է...</p>
            ) : state.error ? (
                <p className="admin-reports-error">{state.error}</p>
            ) : items.length === 0 ? (
                <div className="admin-reports-empty">
                    <h2>Բողոքներ չկան</h2>
                    <p>Այս բաժնում դեռ տվյալներ չկան։</p>
                </div>
            ) : (
                <div className="admin-reports-list">
                    {items.map((report) => {
                        const product = report.product;
                        const reporter = report.reporter;

                        return (
                            <article
                                className="admin-report-card"
                                key={report._id}
                            >
                                <div className="admin-report-top">
                                    <div>
                                        <span className="admin-report-reason">
                                            {REASONS[report.reason] ||
                                                report.reason}
                                        </span>

                                        <h2>
                                            {product?.title ||
                                                "Ջնջված հայտարարություն"}
                                        </h2>

                                        <p>
                                            {reporter?.name || "Օգտատեր"}{" "}
                                            {reporter?.surname || ""}
                                        </p>

                                        <small>{reporter?.email || ""}</small>
                                    </div>

                                    <span
                                        className={
                                            report.status === "open"
                                                ? "admin-report-status open"
                                                : "admin-report-status resolved"
                                        }
                                    >
                                        {report.status === "open"
                                            ? "Սպասում է"
                                            : "Մշակված"}
                                    </span>
                                </div>

                                <div className="admin-report-description">
                                    {report.details ||
                                        "Լրացուցիչ նկարագրություն չկա։"}
                                </div>

                                <p className="admin-report-date">
                                    {new Date(report.createdAt).toLocaleString(
                                        "hy-AM",
                                    )}
                                </p>

                                <div className="admin-report-actions">
                                    {product?._id && (
                                        <a
                                            href={`${BASE}cars/${product._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Դիտել հայտարարությունը
                                        </a>
                                    )}

                                    {report.status === "open" ? (
                                        <>
                                            <button
                                                disabled={Boolean(busy)}
                                                onClick={() =>
                                                    handleAction(
                                                        report,
                                                        "resolve",
                                                    )
                                                }
                                            >
                                                Նշել մշակված
                                            </button>

                                            {product &&
                                                product.status !== "draft" && (
                                                    <button
                                                        className="danger"
                                                        disabled={Boolean(busy)}
                                                        onClick={() =>
                                                            handleAction(
                                                                report,
                                                                "hide-product",
                                                            )
                                                        }
                                                    >
                                                        Թաքցնել հայտարարությունը
                                                    </button>
                                                )}
                                        </>
                                    ) : (
                                        <button
                                            disabled={Boolean(busy)}
                                            onClick={() =>
                                                handleAction(report, "reopen")
                                            }
                                        >
                                            Կրկին բացել
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="admin-reports-pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        Նախորդ
                    </button>

                    <span>
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((value) => value + 1)}
                    >
                        Հաջորդ
                    </button>
                </div>
            )}
        </main>
    );
}
