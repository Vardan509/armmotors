import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../utils/api";
import useInterfaceText from "../utils/interfaceText";

import "./MonetizationPage.css";

const PACKAGES = [
    { kind: "top7", price: 200, days: "days7", benefit: "topBenefit" },
    { kind: "top30", price: 600, days: "days30", benefit: "topMonthBenefit" },
    { kind: "auto7", price: 100, days: "days7", benefit: "autoBenefit" },
];

export default function MonetizationPage({ admin = false }) {
    const { tr, locale } = useInterfaceText();
    const token = localStorage.getItem("token");

    const [plans, setPlans] = useState(null);
    const [payments, setPayments] = useState([]);
    const [busy, setBusy] = useState("");
    const [errorKey, setErrorKey] = useState("");
    const [noticeKey, setNoticeKey] = useState("");
    const [revision, setRevision] = useState(0);
    const [reference, setReference] = useState({});
    const [loading, setLoading] = useState(Boolean(token));

    useEffect(() => {
        const controller = new AbortController();

        if (!token) {
            setPlans(null);
            setPayments([]);
            setLoading(false);
            return () => controller.abort();
        }

        setLoading(true);
        setErrorKey("");

        async function load() {
            try {
                const [pricing, list] = await Promise.all([
                    apiRequest("/monetization/plans", {
                        signal: controller.signal,
                    }),
                    apiRequest(
                        admin
                            ? "/monetization/admin/payments"
                            : "/monetization/payments",
                        { signal: controller.signal },
                    ),
                ]);

                if (controller.signal.aborted) return;

                setPlans(pricing);
                setPayments(Array.isArray(list) ? list : []);
            } catch {
                if (!controller.signal.aborted) {
                    setErrorKey("loadError");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => controller.abort();
    }, [token, admin, revision]);

    function dram(value) {
        return `${Number(value || 0).toLocaleString(locale)} ֏`;
    }

    function date(value) {
        const parsed = new Date(value);

        return Number.isFinite(parsed.getTime())
            ? parsed.toLocaleDateString(locale)
            : "";
    }

    async function changePayment(id, action) {
        if (busy) return;

        const paymentReference = String(reference[id] || "").trim();

        if (action === "approve" && !paymentReference) {
            setErrorKey("referenceRequired");
            return;
        }

        setBusy(id);
        setErrorKey("");
        setNoticeKey("");

        try {
            await apiRequest(
                `/monetization/admin/payments/${encodeURIComponent(id)}/${action}`,
                {
                    method: "POST",
                    body: JSON.stringify({ paymentReference }),
                },
            );

            setNoticeKey("updated");
            setRevision((value) => value + 1);
        } catch {
            setErrorKey("actionError");
        } finally {
            setBusy("");
        }
    }

    const freeLimit = Number(plans?.freeLimit ?? 5);
    const used = Number(plans?.used ?? 0);
    const remaining = Math.max(0, freeLimit - used);

    return (
        <main className="money-page">
            <div className="money-container">
                <h1>{tr(admin ? "paymentAdmin" : "promotionTitle")}</h1>

                {admin && (
                    <p className="money-lead">{tr("paymentAdminIntro")}</p>
                )}

                {errorKey && (
                    <p className="money-error" role="alert">
                        {tr(errorKey)}
                    </p>
                )}

                {noticeKey && (
                    <p className="money-notice" role="status">
                        {tr(noticeKey)}
                    </p>
                )}

                {!token ? (
                    <p>
                        {tr("loginRequired")}{" "}
                        <Link to="/login?next=%2Fmonetization">
                            {tr("login")}
                        </Link>
                    </p>
                ) : loading ? (
                    <p role="status">{tr("loading")}</p>
                ) : (
                    <>
                        {!admin && plans && (
                            <>
                                <section className="money-quota">
                                    <strong>
                                        {Math.min(freeLimit, used)} /{" "}
                                        {freeLimit}
                                    </strong>

                                    <div>
                                        <b>{tr("freePublications")}</b>

                                        <p>
                                            {tr("remaining", {
                                                count: remaining,
                                            })}
                                        </p>

                                        <p>
                                            {tr("publicationRules", {
                                                limit: freeLimit,
                                                price: dram(100),
                                            })}
                                        </p>
                                    </div>
                                </section>

                                <h2>{tr("packages")}</h2>

                                <div className="money-grid">
                                    {PACKAGES.map((plan) => (
                                        <article
                                            key={plan.kind}
                                            className={`money-plan ${
                                                plan.kind === "top30"
                                                    ? "featured"
                                                    : ""
                                            }`}
                                        >
                                            <span>{tr(plan.kind)}</span>
                                            <h3>{dram(plan.price)}</h3>
                                            <b>{tr(plan.days)}</b>
                                            <p>{tr(plan.benefit)}</p>
                                        </article>
                                    ))}
                                </div>

                                <p className="money-explain">
                                    {tr("managePackages")}{" "}
                                    <Link to="/account">{tr("account")} →</Link>
                                </p>

                                <p className="money-warning">
                                    {tr("paymentWarning")}
                                </p>
                            </>
                        )}

                        <section className="money-history">
                            <h2>
                                {tr(admin ? "pendingPayments" : "payments")}
                            </h2>

                            {payments.length === 0 ? (
                                !errorKey && <p>{tr("noPayments")}</p>
                            ) : (
                                <div className="money-list">
                                    {payments.map((payment) => {
                                        const kind = [
                                            "publication",
                                            "top7",
                                            "top30",
                                            "auto7",
                                        ].includes(payment.kind)
                                            ? tr(payment.kind)
                                            : payment.kind;

                                        const status = [
                                            "paid",
                                            "rejected",
                                            "pending",
                                        ].includes(payment.status)
                                            ? tr(payment.status)
                                            : payment.status;

                                        return (
                                            <article
                                                key={payment._id}
                                                className="money-transaction"
                                            >
                                                <div>
                                                    <strong>{kind}</strong>

                                                    <small>
                                                        {date(
                                                            payment.createdAt,
                                                        )}
                                                    </small>

                                                    {admin && (
                                                        <small>
                                                            {payment.user
                                                                ?.email || ""}
                                                            {" · "}
                                                            {payment.product
                                                                ?.title || ""}
                                                        </small>
                                                    )}
                                                </div>

                                                <strong>
                                                    {dram(payment.amount)}
                                                </strong>

                                                <span
                                                    className={`money-status ${payment.status}`}
                                                >
                                                    {status}
                                                </span>

                                                {admin && (
                                                    <div className="money-admin-actions">
                                                        <input
                                                            aria-label={tr(
                                                                "reference",
                                                            )}
                                                            placeholder={tr(
                                                                "reference",
                                                            )}
                                                            value={
                                                                reference[
                                                                    payment._id
                                                                ] || ""
                                                            }
                                                            onChange={(event) =>
                                                                setReference(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        [payment._id]:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                        />

                                                        <button
                                                            type="button"
                                                            disabled={Boolean(
                                                                busy,
                                                            )}
                                                            onClick={() =>
                                                                changePayment(
                                                                    payment._id,
                                                                    "approve",
                                                                )
                                                            }
                                                        >
                                                            {tr("approve")}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={Boolean(
                                                                busy,
                                                            )}
                                                            onClick={() =>
                                                                changePayment(
                                                                    payment._id,
                                                                    "reject",
                                                                )
                                                            }
                                                        >
                                                            {tr("reject")}
                                                        </button>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
