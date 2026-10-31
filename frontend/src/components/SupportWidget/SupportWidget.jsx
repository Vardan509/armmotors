import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../../utils/api";
import useInterfaceText from "../../utils/interfaceText";

import "./SupportWidget.css";

const BUSINESS_PREFIX = "[ԲԻԶՆԵՍ ԱՌԱՋԱՐԿ / ԳՈՎԱԶԴ]";

const INITIAL_FORM = {
    name: "",
    email: "",
    text: "",
};

export default function SupportWidget() {
    const { tr } = useInterfaceText();

    const dialogRef = useRef(null);
    const triggerRef = useRef(null);

    const [form, setForm] = useState(INITIAL_FORM);
    const [listing, setListing] = useState(null);
    const [businessMode, setBusinessMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorKey, setErrorKey] = useState("");
    const [successKey, setSuccessKey] = useState("");

    /*
     * null-ը նշանակում է՝ դեռ չխմբագրված բիզնես ձևանմուշ։
     * Այն լեզուն փոխելիս նույնպես թարգմանվում է։
     */
    const message = form.text === null ? tr("businessTemplate") : form.text;

    const maximumLength = businessMode
        ? 2000 - BUSINESS_PREFIX.length - 2
        : 2000;

    useEffect(() => {
        function open(event) {
            const detail = event.detail || {};
            const business = detail.type === "business";

            setBusinessMode(business);
            setListing(detail.listingId ? detail : null);
            setErrorKey("");
            setSuccessKey("");

            setForm((current) => ({
                ...current,
                text: business ? null : "",
            }));

            if (!dialogRef.current?.open) {
                dialogRef.current?.showModal();
            }
        }

        window.addEventListener("open-support", open);

        return () => {
            window.removeEventListener("open-support", open);
        };
    }, []);

    function changeField(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function submit(event) {
        event.preventDefault();

        if (loading) return;

        const text = businessMode
            ? `${BUSINESS_PREFIX}\n\n${message.trim()}`
            : message.trim();

        if (text.length > 2000) {
            setErrorKey("tooLong");
            return;
        }

        setLoading(true);
        setErrorKey("");
        setSuccessKey("");

        try {
            await apiRequest("/messages", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    text,
                    listingId: listing?.listingId || "",
                }),
            });

            setSuccessKey(businessMode ? "businessSuccess" : "supportSuccess");

            setForm((current) => ({
                ...current,
                text: "",
            }));
        } catch {
            setErrorKey("sendError");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                className="support-trigger"
                ref={triggerRef}
                aria-label={tr("writeAdmin")}
                aria-haspopup="dialog"
                onClick={() =>
                    window.dispatchEvent(new CustomEvent("open-support"))
                }
            >
                <svg
                    viewBox="0 0 24 24"
                    width="25"
                    height="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                >
                    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z" />
                    <path d="M7 10h10M7 14h6" />
                </svg>
            </button>

            <dialog
                ref={dialogRef}
                className="support-dialog"
                aria-labelledby="support-title"
                onClose={() => triggerRef.current?.focus()}
                onCancel={(event) => {
                    if (loading) event.preventDefault();
                }}
            >
                <div className="support-heading">
                    <div>
                        <small>
                            {tr(businessMode ? "business" : "support")}
                        </small>

                        <h2 id="support-title">
                            {tr(businessMode ? "business" : "supportTitle")}
                        </h2>
                    </div>

                    <button
                        type="button"
                        aria-label={tr("close")}
                        disabled={loading}
                        onClick={() => dialogRef.current?.close()}
                    >
                        ×
                    </button>
                </div>

                {businessMode && (
                    <>
                        <p>{tr("businessIntro")}</p>

                        <p
                            className="support-listing"
                            style={{
                                padding: "11px 13px",
                                borderRadius: 9,
                                background: "#f3f7fc",
                                color: "#244b77",
                                border: "1px solid #dce5ef",
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            {tr("businessBadge")}
                        </p>
                    </>
                )}

                {listing && (
                    <p className="support-listing">
                        {tr("listing")}: {listing.title || listing.listingId}
                    </p>
                )}

                {successKey ? (
                    <div className="support-success" role="status">
                        <strong>{tr("sent")}</strong>
                        <p>{tr(successKey)}</p>

                        <button
                            type="button"
                            className="detail-secondary"
                            onClick={() => {
                                setSuccessKey("");
                                setErrorKey("");

                                setForm((current) => ({
                                    ...current,
                                    text: businessMode ? null : "",
                                }));
                            }}
                        >
                            {tr("newMessage")}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <fieldset disabled={loading}>
                            <label>
                                {tr("name")}

                                <input
                                    name="name"
                                    autoComplete="name"
                                    required
                                    minLength={2}
                                    maxLength={80}
                                    value={form.name}
                                    onChange={changeField}
                                />
                            </label>

                            <label>
                                {tr("email")}

                                <input
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    maxLength={254}
                                    value={form.email}
                                    onChange={changeField}
                                />
                            </label>

                            <label>
                                {tr(
                                    businessMode
                                        ? "yourProposal"
                                        : "yourQuestion",
                                )}

                                <textarea
                                    name="text"
                                    required
                                    minLength={5}
                                    maxLength={maximumLength}
                                    rows={5}
                                    value={message}
                                    onChange={changeField}
                                    placeholder={tr(
                                        businessMode
                                            ? "proposalPlaceholder"
                                            : "messagePlaceholder",
                                    )}
                                />
                            </label>

                            <small>
                                {message.length} / {maximumLength}
                            </small>

                            {errorKey && (
                                <p className="form-error" role="alert">
                                    {tr(errorKey)}
                                </p>
                            )}

                            <button className="support-submit" type="submit">
                                {loading
                                    ? tr("sending")
                                    : `${tr(
                                          businessMode
                                              ? "sendBusiness"
                                              : "sendMessage",
                                      )} →`}
                            </button>
                        </fieldset>
                    </form>
                )}
            </dialog>
        </>
    );
}
