import { useState } from "react";

import { apiRequest } from "../../utils/api";
import useRemote from "../../utils/useRemote";
import { useI18n } from "../../utils/i18n";

import { Notice, Pagination } from "./AdminPage";

const TEXT = {
    hy: {
        recipients: "ակտիվ հասցեատեր",
        refresh: "Թարմացնել կարգավիճակները",
        smtp: "Ուղարկման համար լրացրեք SMTP կարգավորումները .env-ում։",
        newEmail: "Նոր նամակ",
        privacy:
            "Ստացողները չեն տեսնի միմյանց email-ները։ Արգելափակված ու ջնջված հաշիվները չեն ստանա նամակը։",
        subject: "Վերնագիր",
        body: "Նամակի տեքստը",
        preview: "Նախադիտել նամակը",
        saveDraft: "Պահպանել սևագիրը",
        previewTitle: "Նամակի նախադիտում",
        email: "Նամակ",
        status: "Կարգավիճակ",
        deliveries: "Ուղարկումներ",
        actions: "Գործողություններ",
        failed: "Սխալ",
        verify: "Ստուգել",
        sendAll: "Ուղարկել բոլորին",
        cancel: "Չեղարկել",
        deliveryList: "Առաքումների ցանկ",
        confirmSend: "Հաստատե՞լ ուղարկումը",
        sendDescription: (count) =>
            `Նամակը կուղարկվի բոլոր ${count} ակտիվ գրանցված հաշիվներին։`,
        sendConfirm: "Հաստատել և ուղարկել",
        close: "Փակել",
        draftSaved:
            "Նամակը պահպանված է որպես սևագիր։ Ուղարկելու համար հաստատեք ցանկից։",
        queued: "Նամակը ավելացվել է ուղարկման հերթին։",
        generalError: "Տեղի ունեցավ սխալ։",
        empty: "Դեռ նամակներ չկան։",
        labels: {
            draft: "Սևագիր",
            preparing: "Հասցեատերերը հավաքվում են",
            queued: "Ուղարկման հերթում",
            completed: "Ավարտված",
            cancelled: "Չեղարկված",
            sent: "Ուղարկված",
            pending: "Սպասող",
            sending: "Ուղարկվում է",
            failed: "Սխալ",
            uncertain: "Առաքումը պետք է ստուգել",
            skipped: "Բաց թողնված",
        },
    },

    ru: {
        recipients: "активных получателей",
        refresh: "Обновить статусы",
        smtp: "Настройте SMTP в файле .env для отправки писем.",
        newEmail: "Новое письмо",
        privacy:
            "Получатели не увидят email друг друга. Заблокированные и удалённые аккаунты не получат письмо.",
        subject: "Тема",
        body: "Текст письма",
        preview: "Предпросмотр",
        saveDraft: "Сохранить черновик",
        previewTitle: "Предпросмотр письма",
        email: "Письмо",
        status: "Статус",
        deliveries: "Доставки",
        actions: "Действия",
        failed: "Ошибок",
        verify: "Проверить",
        sendAll: "Отправить всем",
        cancel: "Отменить",
        deliveryList: "Список доставок",
        confirmSend: "Подтвердить отправку?",
        sendDescription: (count) =>
            `Письмо будет отправлено всем активным получателям (${count}).`,
        sendConfirm: "Подтвердить и отправить",
        close: "Закрыть",
        draftSaved:
            "Письмо сохранено как черновик. Подтвердите отправку в списке.",
        queued: "Письмо добавлено в очередь отправки.",
        generalError: "Произошла ошибка.",
        empty: "Писем пока нет.",
        labels: {
            draft: "Черновик",
            preparing: "Подготовка получателей",
            queued: "В очереди",
            completed: "Завершено",
            cancelled: "Отменено",
            sent: "Отправлено",
            pending: "Ожидает",
            sending: "Отправляется",
            failed: "Ошибка",
            uncertain: "Нужна проверка доставки",
            skipped: "Пропущено",
        },
    },

    en: {
        recipients: "active recipients",
        refresh: "Refresh statuses",
        smtp: "Configure SMTP in the .env file to send emails.",
        newEmail: "New email",
        privacy:
            "Recipients cannot see each other's email addresses. Banned and deleted accounts will not receive this email.",
        subject: "Subject",
        body: "Email message",
        preview: "Preview email",
        saveDraft: "Save draft",
        previewTitle: "Email preview",
        email: "Email",
        status: "Status",
        deliveries: "Deliveries",
        actions: "Actions",
        failed: "Failed",
        verify: "Check",
        sendAll: "Send to all",
        cancel: "Cancel",
        deliveryList: "Delivery details",
        confirmSend: "Confirm sending?",
        sendDescription: (count) =>
            `The email will be sent to all ${count} active registered recipients.`,
        sendConfirm: "Confirm and send",
        close: "Close",
        draftSaved: "Email saved as a draft. Confirm sending from the list.",
        queued: "Email added to the sending queue.",
        generalError: "Something went wrong.",
        empty: "No emails yet.",
        labels: {
            draft: "Draft",
            preparing: "Preparing recipients",
            queued: "Queued",
            completed: "Completed",
            cancelled: "Cancelled",
            sent: "Sent",
            pending: "Pending",
            sending: "Sending",
            failed: "Failed",
            uncertain: "Delivery needs verification",
            skipped: "Skipped",
        },
    },
};

export default function AdminBroadcasts() {
    const { language } = useI18n();

    const t = TEXT[language] || TEXT.hy;

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    const [subject, setSubject] = useState("");
    const [emailText, setEmailText] = useState("");
    const [html, setHtml] = useState("");

    const [revision, setRevision] = useState(0);
    const [page, setPage] = useState(1);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selected, setSelected] = useState(null);
    const [deliveries, setDeliveries] = useState(null);

    const state = useRemote(`/admin/broadcasts?page=${page}`, revision);

    const rows = state.data?.items || [];

    function getStatus(status) {
        return t.labels[status] || status || "—";
    }

    async function task(callback) {
        if (busy) return;

        setBusy(true);
        setError("");
        setMessage("");

        try {
            await callback();
        } catch (requestError) {
            setError(requestError.message || t.generalError);
        } finally {
            setBusy(false);
        }
    }

    // ==========================================
    // EMAIL PREVIEW
    // ==========================================

    async function preview() {
        await task(async () => {
            const result = await apiRequest("/admin/broadcasts/preview", {
                method: "POST",
                body: JSON.stringify({
                    subject,
                    text: emailText,
                }),
            });

            setHtml(result.html || "");
        });
    }

    // ==========================================
    // SAVE DRAFT
    // ==========================================

    async function save(event) {
        event.preventDefault();

        await task(async () => {
            await apiRequest("/admin/broadcasts", {
                method: "POST",
                body: JSON.stringify({
                    subject,
                    text: emailText,
                }),
            });

            setSubject("");
            setEmailText("");
            setHtml("");

            setMessage(t.draftSaved);
            setPage(1);
            setRevision((value) => value + 1);
        });
    }

    // ==========================================
    // CONFIRM SENDING
    // ==========================================

    async function confirmSend() {
        if (!selected) return;

        const id = selected._id;

        await task(async () => {
            await apiRequest(
                `/admin/broadcasts/${encodeURIComponent(id)}/send`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        confirm: true,
                    }),
                },
            );

            setSelected(null);
            setRevision((value) => value + 1);
            setMessage(t.queued);
        });
    }

    // ==========================================
    // CANCEL
    // ==========================================

    async function cancel(row) {
        await task(async () => {
            await apiRequest(
                `/admin/broadcasts/${encodeURIComponent(row._id)}/cancel`,
                {
                    method: "POST",
                },
            );

            setRevision((value) => value + 1);
        });
    }

    // ==========================================
    // DELIVERY HISTORY
    // ==========================================

    async function inspect(row, targetPage = 1) {
        if (!row) return;

        await task(async () => {
            const result = await apiRequest(
                `/admin/broadcasts/${encodeURIComponent(row._id)}/deliveries?page=${targetPage}`,
            );

            setDeliveries({
                ...result,
                broadcast: row,
            });
        });
    }

    return (
        <>
            <Notice state={state} />

            {/* CONTROL BAR */}

            <div className="admin-toolbar">
                <span>
                    {state.data?.recipients || 0} {t.recipients}
                </span>

                <button
                    type="button"
                    disabled={busy}
                    onClick={() => setRevision((value) => value + 1)}
                >
                    {t.refresh}
                </button>

                {state.data && !state.data.mailConfigured && <p>{t.smtp}</p>}
            </div>

            {error && (
                <p role="alert" className="admin-error">
                    {error}
                </p>
            )}

            {message && (
                <p role="status" className="admin-success">
                    {message}
                </p>
            )}

            {/* NEW EMAIL */}

            <section className="admin-panel">
                <h2>{t.newEmail}</h2>

                <p>{t.privacy}</p>

                <form className="admin-edit-form" onSubmit={save}>
                    <label>
                        {t.subject}

                        <input
                            value={subject}
                            onChange={(event) => {
                                setSubject(event.target.value);
                                setHtml("");
                            }}
                            required
                            maxLength={150}
                        />
                    </label>

                    <label>
                        {t.body}

                        <textarea
                            value={emailText}
                            onChange={(event) => {
                                setEmailText(event.target.value);
                                setHtml("");
                            }}
                            required
                            maxLength={10000}
                            rows={7}
                        />
                    </label>

                    <div className="admin-row-actions">
                        <button
                            type="button"
                            disabled={
                                busy || !subject.trim() || !emailText.trim()
                            }
                            onClick={preview}
                        >
                            {t.preview}
                        </button>

                        <button
                            type="submit"
                            disabled={busy}
                            className="admin-primary"
                        >
                            {t.saveDraft}
                        </button>
                    </div>
                </form>

                {html && (
                    <iframe
                        className="broadcast-preview"
                        title={t.previewTitle}
                        srcDoc={html}
                        sandbox=""
                    />
                )}
            </section>

            {/* EMAIL HISTORY */}

            <div className="admin-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>{t.email}</th>
                            <th>{t.status}</th>
                            <th>{t.deliveries}</th>
                            <th>{t.actions}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => {
                            const counts = row.counts || {};

                            return (
                                <tr key={row._id}>
                                    <td>
                                        {row.subject}

                                        <small>
                                            {row.createdAt
                                                ? new Date(
                                                      row.createdAt,
                                                  ).toLocaleDateString(locale)
                                                : "—"}
                                        </small>
                                    </td>

                                    <td>
                                        <span className="admin-status">
                                            {getStatus(row.status)}
                                        </span>
                                    </td>

                                    <td>
                                        {counts.sent || 0} / {row.total || 0}
                                        <small>
                                            {t.failed}: {counts.failed || 0}
                                            {" · "}
                                            {t.verify}: {counts.uncertain || 0}
                                        </small>
                                    </td>

                                    <td>
                                        <div className="admin-row-actions">
                                            {row.status === "draft" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        busy ||
                                                        !state.data
                                                            ?.mailConfigured
                                                    }
                                                    onClick={() =>
                                                        setSelected(row)
                                                    }
                                                >
                                                    {t.sendAll}
                                                </button>
                                            )}

                                            {["draft", "queued"].includes(
                                                row.status,
                                            ) && (
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => cancel(row)}
                                                >
                                                    {t.cancel}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => inspect(row)}
                                            >
                                                {t.deliveryList}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {!state.loading && rows.length === 0 && (
                    <p className="admin-empty">{t.empty}</p>
                )}
            </div>

            <Pagination
                page={page}
                setPage={setPage}
                total={state.data?.total || 0}
            />

            {/* SEND CONFIRMATION */}

            {selected && (
                <div className="admin-modal-backdrop">
                    <section
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="broadcast-confirm-title"
                    >
                        <h2 id="broadcast-confirm-title">{t.confirmSend}</h2>

                        <strong>{selected.subject}</strong>

                        <p className="admin-message-body">{selected.text}</p>

                        <p>{t.sendDescription(state.data?.recipients || 0)}</p>

                        {error && (
                            <p className="admin-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="admin-row-actions">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setSelected(null)}
                            >
                                {t.cancel}
                            </button>

                            <button
                                type="button"
                                className="admin-primary"
                                disabled={busy }
                                onClick={confirmSend}
                            >
                                {t.sendConfirm}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* DELIVERY DETAILS */}

            {deliveries && (
                <div className="admin-modal-backdrop">
                    <section
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="deliveries-title"
                    >
                        <div className="admin-panel-heading">
                            <h2 id="deliveries-title">
                                {deliveries.broadcast.subject}
                            </h2>

                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setDeliveries(null)}
                                aria-label={t.close}
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>{t.status}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(deliveries.items || []).map((row) => (
                                        <tr key={row._id}>
                                            <td>{row.email}</td>
                                            <td>
                                                {getStatus(row.status)}

                                                {row.error && (
                                                    <small>{row.error}</small>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            page={deliveries.page || 1}
                            setPage={(value) => {
                                const currentPage = deliveries.page || 1;

                                const nextPage =
                                    typeof value === "function"
                                        ? value(currentPage)
                                        : value;

                                inspect(deliveries.broadcast, nextPage);
                            }}
                            total={deliveries.total || 0}
                        />
                    </section>
                </div>
            )}
        </>
    );
}
