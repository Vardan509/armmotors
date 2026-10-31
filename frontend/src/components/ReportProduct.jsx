import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

import "./ReportProduct.css";

const TEXTS = {
    hy: {
        open: "Բողոքել հայտարարության մասին",
        title: "Հայտնել խնդրի մասին",
        close: "Փակել",
        reason: "Բողոքի պատճառ",
        incorrect: "Սխալ տեղեկություններ",
        spam: "Կրկնվող կամ գովազդային հայտարարություն",
        fraud: "Կասկածելի հայտարարություն",
        other: "Այլ պատճառ",
        description: "Նկարագրություն",
        placeholder: "Նկարագրեք խնդիրը...",
        sending: "Ուղարկվում է...",
        sent: "Ուղարկված է",
        submit: "Ուղարկել բողոքը",
        success: "Բողոքը հաջողությամբ ուղարկվեց։",
        error: "Չհաջողվեց ուղարկել բողոքը։ Կրկին փորձեք։",
    },

    ru: {
        open: "Пожаловаться на объявление",
        title: "Сообщить о проблеме",
        close: "Закрыть",
        reason: "Причина жалобы",
        incorrect: "Неверная информация",
        spam: "Повторное или рекламное объявление",
        fraud: "Подозрительное объявление",
        other: "Другая причина",
        description: "Описание",
        placeholder: "Опишите проблему...",
        sending: "Отправка...",
        sent: "Отправлено",
        submit: "Отправить жалобу",
        success: "Жалоба успешно отправлена.",
        error: "Не удалось отправить жалобу. Попробуйте ещё раз.",
    },

    en: {
        open: "Report this listing",
        title: "Report a problem",
        close: "Close",
        reason: "Reason for reporting",
        incorrect: "Incorrect information",
        spam: "Duplicate or promotional listing",
        fraud: "Suspicious listing",
        other: "Other reason",
        description: "Description",
        placeholder: "Describe the problem...",
        sending: "Sending...",
        sent: "Sent",
        submit: "Submit report",
        success: "Your report has been submitted successfully.",
        error: "Could not submit your report. Please try again.",
    },
};

export default function ReportProduct({ productId }) {
    const navigate = useNavigate();
    const { language } = useI18n();

    const text = TEXTS[language] || TEXTS.hy;

    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("incorrect");
    const [details, setDetails] = useState("");
    const [status, setStatus] = useState("idle");

    const loading = status === "loading";
    const success = status === "success";

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading || success) return;

        if (!localStorage.getItem("token")) {
            const next =
                window.location.pathname +
                window.location.search +
                window.location.hash;

            navigate(`/login?next=${encodeURIComponent(next)}`);
            return;
        }

        setStatus("loading");

        try {
            await apiRequest("/reports", {
                method: "POST",
                body: JSON.stringify({
                    productId,
                    reason,
                    details: details.trim(),
                }),
            });

            setStatus("success");
            setDetails("");
        } catch {
            setStatus("error");
        }
    }

    return (
        <section className="report-product">
            {!open ? (
                <button
                    type="button"
                    className="report-open-button"
                    onClick={() => setOpen(true)}
                >
                    {text.open}
                </button>
            ) : (
                <form className="report-form" onSubmit={handleSubmit}>
                    <div className="report-form-heading">
                        <h3>{text.title}</h3>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label={text.close}
                        >
                            ×
                        </button>
                    </div>

                    <label htmlFor="report-reason">{text.reason}</label>

                    <select
                        id="report-reason"
                        value={reason}
                        disabled={loading || success}
                        onChange={(event) => {
                            setReason(event.target.value);

                            if (status === "error") {
                                setStatus("idle");
                            }
                        }}
                    >
                        <option value="incorrect">{text.incorrect}</option>

                        <option value="spam">{text.spam}</option>

                        <option value="fraud">{text.fraud}</option>

                        <option value="other">{text.other}</option>
                    </select>

                    <label htmlFor="report-details">{text.description}</label>

                    <textarea
                        id="report-details"
                        rows={4}
                        maxLength={1000}
                        placeholder={text.placeholder}
                        value={details}
                        disabled={loading || success}
                        onChange={(event) => {
                            setDetails(event.target.value);

                            if (status === "error") {
                                setStatus("idle");
                            }
                        }}
                    />

                    {success && (
                        <p className="report-success" role="status">
                            {text.success}
                        </p>
                    )}

                    {status === "error" && (
                        <p className="report-error" role="alert">
                            {text.error}
                        </p>
                    )}

                    <button
                        className="report-submit"
                        type="submit"
                        disabled={loading || success}
                    >
                        {loading
                            ? text.sending
                            : success
                              ? text.sent
                              : text.submit}
                    </button>
                </form>
            )}
        </section>
    );
}
