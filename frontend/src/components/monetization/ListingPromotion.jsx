import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import useInterfaceText from "../../utils/interfaceText";

import "./ListingPromotion.css";

const PLANS = {
    top7: { price: 200, benefit: "topBenefit" },
    top30: { price: 600, benefit: "topMonthBenefit" },
    auto7: { price: 100, benefit: "autoBenefit" },
};

export default function ListingPromotion({ product }) {
    const { tr, locale } = useInterfaceText();

    const [busy, setBusy] = useState("");
    const [selected, setSelected] = useState("");
    const [messageKey, setMessageKey] = useState("");
    const [errorKey, setErrorKey] = useState("");

    const dialogRef = useRef(null);

    const plan = PLANS[selected];

    useEffect(() => {
        if (plan && !dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }

        if (!plan && dialogRef.current?.open) {
            dialogRef.current.close();
        }
    }, [plan]);

    if (!product?._id || product.status !== "active") {
        return null;
    }

    const topActive =
        product.topUntil && new Date(product.topUntil).getTime() > Date.now();

    function dram(value) {
        return `${Number(value).toLocaleString(locale)} ֏`;
    }

    async function send(kind) {
        if (busy) return;

        setBusy(kind);
        setMessageKey("");
        setErrorKey("");

        try {
            const productId = encodeURIComponent(product._id);

            if (kind === "refresh") {
                await apiRequest(
                    `/monetization/products/${productId}/refresh`,
                    { method: "POST" },
                );

                setMessageKey("refreshed");
            } else {
                await apiRequest(
                    `/monetization/products/${productId}/upgrade`,
                    {
                        method: "POST",
                        body: JSON.stringify({ kind }),
                    },
                );

                setMessageKey("requestCreated");
                setSelected("");
            }
        } catch {
            setErrorKey("actionError");
        } finally {
            setBusy("");
        }
    }

    return (
        <section className="listing-promotion" aria-label={tr("promotion")}>
            <div className="listing-promotion-heading">
                <b>{tr(topActive ? "topActive" : "promotion")}</b>

                <Link to="/monetization">{tr("allTerms")} ↗</Link>
            </div>

            <div className="listing-promotion-buttons">
                <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => send("refresh")}
                >
                    ↻ {tr("refreshEvery4")}
                </button>

                {Object.entries(PLANS).map(([kind, details]) => (
                    <button
                        key={kind}
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => {
                            setErrorKey("");
                            setSelected(kind);
                        }}
                    >
                        {kind === "auto7" ? "↻" : "★"} {tr(kind)} ·{" "}
                        {dram(details.price)}
                    </button>
                ))}
            </div>

            {messageKey && (
                <p className="listing-promotion-message" role="status">
                    {tr(messageKey)}
                </p>
            )}

            {errorKey && (
                <p className="listing-promotion-error" role="alert">
                    {tr(errorKey)}
                </p>
            )}

            <dialog
                ref={dialogRef}
                className="promotion-modal"
                aria-label={plan ? tr(selected) : tr("promotion")}
                onClose={() => setSelected("")}
            >
                {plan && (
                    <>
                        <button
                            className="promotion-close"
                            type="button"
                            onClick={() => setSelected("")}
                            aria-label={tr("close")}
                            disabled={Boolean(busy)}
                        >
                            ×
                        </button>

                        <span className="promotion-eyebrow">
                            ARMMOTORS PREMIUM
                        </span>

                        <h3>{tr(selected)}</h3>

                        <strong className="promotion-price">
                            {dram(plan.price)}
                        </strong>

                        <ul>
                            <li>{tr(plan.benefit)}</li>
                        </ul>

                        <p>{tr("paymentWarning")}</p>

                        {errorKey && (
                            <p className="listing-promotion-error" role="alert">
                                {tr(errorKey)}
                            </p>
                        )}

                        <div className="promotion-modal-actions">
                            <button
                                type="button"
                                disabled={Boolean(busy)}
                                onClick={() => setSelected("")}
                            >
                                {tr("cancel")}
                            </button>

                            <button
                                type="button"
                                disabled={Boolean(busy)}
                                onClick={() => send(selected)}
                            >
                                {tr(busy ? "loading" : "createRequest")}
                            </button>
                        </div>
                    </>
                )}
            </dialog>
        </section>
    );
}
