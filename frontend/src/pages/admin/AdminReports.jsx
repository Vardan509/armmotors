import { useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import useRemote from "../../utils/useRemote";
import { useI18n } from "../../utils/i18n";

import "./AdminReports.css";

const TEXTS = {
    hy: {
        title: "Բողոքների կառավարում",
        description:
            "Ստուգեք օգտատերերի բողոքները և անհրաժեշտության դեպքում թաքցրեք հայտարարությունները։",
        back: "Վերադառնալ ադմին",
        open: "Նոր բողոքներ",
        resolved: "Մշակված",
        pending: "Սպասում է",
        loading: "Բեռնվում է...",
        emptyTitle: "Բողոքներ չկան",
        emptyDescription: "Այս բաժնում դեռ տվյալներ չկան։",
        deletedListing: "Ջնջված հայտարարություն",
        user: "Օգտատեր",
        noDescription: "Լրացուցիչ նկարագրություն չկա։",
        view: "Դիտել հայտարարությունը",
        resolve: "Նշել մշակված",
        hide: "Թաքցնել հայտարարությունը",
        reopen: "Կրկին բացել",
        previous: "Նախորդ",
        next: "Հաջորդ",
        pagination: "Բողոքների էջեր",
        saved: "Փոփոխությունը պահպանված է։",
        loadError: "Բողոքները բեռնել չհաջողվեց։",
        actionError: "Գործողությունը չհաջողվեց։ Կրկին փորձեք։",
        hideConfirm:
            "Թաքցնե՞լ այս հայտարարությունը։ Այն այլևս չի ցուցադրվի հրապարակային ցանկում։",
        reasons: {
            spam: "Սպամ",
            fraud: "Կասկածելի հայտարարություն",
            incorrect: "Սխալ տեղեկություններ",
            other: "Այլ պատճառ",
        },
    },

    ru: {
        title: "Управление жалобами",
        description:
            "Проверяйте жалобы пользователей и при необходимости скрывайте объявления.",
        back: "Вернуться в админ-панель",
        open: "Новые жалобы",
        resolved: "Обработано",
        pending: "Ожидает",
        loading: "Загрузка...",
        emptyTitle: "Жалоб нет",
        emptyDescription: "В этом разделе пока нет данных.",
        deletedListing: "Удалённое объявление",
        user: "Пользователь",
        noDescription: "Дополнительного описания нет.",
        view: "Посмотреть объявление",
        resolve: "Отметить обработанной",
        hide: "Скрыть объявление",
        reopen: "Открыть повторно",
        previous: "Назад",
        next: "Далее",
        pagination: "Страницы жалоб",
        saved: "Изменение сохранено.",
        loadError: "Не удалось загрузить жалобы.",
        actionError: "Не удалось выполнить действие. Попробуйте ещё раз.",
        hideConfirm:
            "Скрыть это объявление? Оно больше не будет отображаться в публичном списке.",
        reasons: {
            spam: "Спам",
            fraud: "Подозрительное объявление",
            incorrect: "Неверная информация",
            other: "Другая причина",
        },
    },

    en: {
        title: "Manage reports",
        description: "Review user reports and hide listings when necessary.",
        back: "Back to administration",
        open: "Open reports",
        resolved: "Resolved",
        pending: "Pending",
        loading: "Loading...",
        emptyTitle: "No reports",
        emptyDescription: "There is no data in this section yet.",
        deletedListing: "Deleted listing",
        user: "User",
        noDescription: "No additional description.",
        view: "View listing",
        resolve: "Mark as resolved",
        hide: "Hide listing",
        reopen: "Reopen",
        previous: "Previous",
        next: "Next",
        pagination: "Report pages",
        saved: "Change saved.",
        loadError: "Could not load reports.",
        actionError: "Could not complete the action. Please try again.",
        hideConfirm:
            "Hide this listing? It will no longer appear in the public list.",
        reasons: {
            spam: "Spam",
            fraud: "Suspicious listing",
            incorrect: "Incorrect information",
            other: "Other reason",
        },
    },
};

export default function AdminReports() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    const [status, setStatus] = useState("open");
    const [page, setPage] = useState(1);
    const [revision, setRevision] = useState(0);
    const [busy, setBusy] = useState("");
    const [failed, setFailed] = useState(false);
    const [saved, setSaved] = useState(false);

    const state = useRemote(
        `/reports/admin?status=${status}&page=${page}`,
        revision,
    );

    const items = Array.isArray(state.data?.items) ? state.data.items : [];

    const total = Math.max(0, Number(state.data?.total) || 0);

    const limit = Math.max(1, Number(state.data?.limit) || 15);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    function changeFilter(nextStatus) {
        setStatus(nextStatus);
        setPage(1);
        setFailed(false);
        setSaved(false);
    }

    async function handleAction(report, action) {
        if (busy || state.loading) return;

        if (action === "hide-product" && !window.confirm(text.hideConfirm)) {
            return;
        }

        const id = String(report._id || report.id || "");

        if (!id) return;

        setBusy(id);
        setFailed(false);
        setSaved(false);

        try {
            await apiRequest(`/reports/admin/${encodeURIComponent(id)}`, {
                method: "PATCH",
                body: JSON.stringify({ action }),
            });

            /*
             * Վերջին քարտը ընթացիկ էջից հեռացվելու դեպքում
             * վերադառնում ենք նախորդ էջ։
             */
            if (items.length === 1 && page > 1) {
                setPage((current) => current - 1);
            }

            setSaved(true);
            setRevision((current) => current + 1);
        } catch {
            setFailed(true);
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

    function productTitle(product) {
        return (
            product?.translations?.[language]?.title ||
            product?.titleTranslations?.[language] ||
            product?.title ||
            text.deletedListing
        );
    }

    return (
        <main className="admin-reports-page">
            <div className="admin-reports-header">
                <div>
                    <span className="admin-reports-eyebrow">
                        ARMMOTORS ADMIN
                    </span>

                    <h1>{text.title}</h1>
                    <p>{text.description}</p>
                </div>

                <Link to="/admin">{text.back}</Link>
            </div>

            <div className="admin-reports-toolbar">
                {["open", "resolved"].map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={status === value ? "selected" : ""}
                        aria-pressed={status === value}
                        disabled={Boolean(busy)}
                        onClick={() => changeFilter(value)}
                    >
                        {text[value]}
                    </button>
                ))}
            </div>

            {failed && (
                <p className="admin-reports-error" role="alert">
                    {text.actionError}
                </p>
            )}

            {saved && (
                <p className="admin-reports-success" role="status">
                    {text.saved}
                </p>
            )}

            {state.loading ? (
                <p role="status">{text.loading}</p>
            ) : state.error ? (
                <p className="admin-reports-error" role="alert">
                    {text.loadError}
                </p>
            ) : items.length === 0 ? (
                <div className="admin-reports-empty">
                    <h2>{text.emptyTitle}</h2>
                    <p>{text.emptyDescription}</p>
                </div>
            ) : (
                <div className="admin-reports-list">
                    {items.map((report) => {
                        const product = report.product;
                        const reporter = report.reporter;

                        const id = String(report._id || report.id || "");

                        const productId = product?._id || product?.id;

                        const isOpen = report.status === "open";

                        return (
                            <article className="admin-report-card" key={id}>
                                <div className="admin-report-top">
                                    <div>
                                        <span className="admin-report-reason">
                                            {text.reasons[report.reason] ||
                                                text.reasons.other}
                                        </span>

                                        <h2>{productTitle(product)}</h2>

                                        <p>
                                            {reporter?.name || text.user}{" "}
                                            {reporter?.surname || ""}
                                        </p>

                                        <small>{reporter?.email || ""}</small>
                                    </div>

                                    <span
                                        className={`admin-report-status ${
                                            isOpen ? "open" : "resolved"
                                        }`}
                                    >
                                        {isOpen ? text.pending : text.resolved}
                                    </span>
                                </div>

                                <div
                                    className="admin-report-description"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {report.details || text.noDescription}
                                </div>

                                <p className="admin-report-date">
                                    {formatDate(report.createdAt)}
                                </p>

                                <div className="admin-report-actions">
                                    {productId && (
                                        <Link
                                            to={`/cars/${encodeURIComponent(
                                                productId,
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {text.view}
                                        </Link>
                                    )}

                                    {isOpen ? (
                                        <>
                                            <button
                                                type="button"
                                                disabled={
                                                    Boolean(busy) ||
                                                    state.loading
                                                }
                                                onClick={() =>
                                                    handleAction(
                                                        report,
                                                        "resolve",
                                                    )
                                                }
                                            >
                                                {text.resolve}
                                            </button>

                                            {productId &&
                                                product.status !== "draft" && (
                                                    <button
                                                        type="button"
                                                        className="danger"
                                                        disabled={
                                                            Boolean(busy) ||
                                                            state.loading
                                                        }
                                                        onClick={() =>
                                                            handleAction(
                                                                report,
                                                                "hide-product",
                                                            )
                                                        }
                                                    >
                                                        {text.hide}
                                                    </button>
                                                )}
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={
                                                Boolean(busy) || state.loading
                                            }
                                            onClick={() =>
                                                handleAction(report, "reopen")
                                            }
                                        >
                                            {text.reopen}
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!state.loading && !state.error && totalPages > 1 && (
                <nav
                    className="admin-reports-pagination"
                    aria-label={text.pagination}
                >
                    <button
                        type="button"
                        disabled={page === 1 || Boolean(busy)}
                        onClick={() => {
                            setPage((current) => current - 1);
                            setSaved(false);
                        }}
                    >
                        {text.previous}
                    </button>

                    <span>
                        {page} / {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page >= totalPages || Boolean(busy)}
                        onClick={() => {
                            setPage((current) => current + 1);
                            setSaved(false);
                        }}
                    >
                        {text.next}
                    </button>
                </nav>
            )}
        </main>
    );
}
