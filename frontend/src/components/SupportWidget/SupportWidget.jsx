import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../../utils/api";

import "./SupportWidget.css";

const BUSINESS_PREFIX = "[ԲԻԶՆԵՍ ԱՌԱՋԱՐԿ / ԳՈՎԱԶԴ]";

const BUSINESS_TEMPLATE =
    "Բարև Ձեզ։ Ցանկանում եմ գովազդ տեղադրել ArmMotors կայքում։ Խնդրում եմ տեղեկացնել գովազդի տեղադրման պայմանները և արժեքները։";

const INITIAL_FORM = {
    name: "",
    email: "",
    text: "",
};

export default function SupportWidget() {
    const dialogRef = useRef(null);
    const triggerRef = useRef(null);

    const [form, setForm] = useState(INITIAL_FORM);

    const [listing, setListing] = useState(null);
    const [businessMode, setBusinessMode] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================
    // OPEN SUPPORT DIALOG
    // =====================================

    useEffect(() => {
        function open(event) {
            const detail = event.detail || {};

            const isBusiness = detail.type === "business";

            setBusinessMode(isBusiness);

            setListing(detail.listingId ? detail : null);

            setSuccess("");
            setError("");

            setForm((previous) => ({
                ...previous,
                text: isBusiness ? BUSINESS_TEMPLATE : "",
            }));

            if (dialogRef.current && !dialogRef.current.open) {
                dialogRef.current.showModal();
            }
        }

        window.addEventListener("open-support", open);

        return () => {
            window.removeEventListener("open-support", open);
        };
    }, []);

    // =====================================
    // INPUT CHANGES
    // =====================================

    function changeField(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    // =====================================
    // SEND MESSAGE
    // =====================================

    async function submit(event) {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const messageText = businessMode
                ? `${BUSINESS_PREFIX}\n\n${form.text.trim()}`
                : form.text.trim();

            if (messageText.length > 2000) {
                throw new Error("Հաղորդագրությունը չափազանց երկար է։");
            }

            await apiRequest("/messages", {
                method: "POST",

                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    text: messageText,
                    listingId: listing?.listingId || "",
                }),
            });

            setSuccess(
                businessMode
                    ? "Ձեր բիզնես առաջարկն ուղարկված է ադմինին։ Մենք կարող ենք պատասխանել Ձեր նշած email-ով։"
                    : "Հաղորդագրությունն ուղարկված է ադմինին։ Պատասխանի համար նշված է Ձեր email-ը։",
            );

            setForm((previous) => ({
                ...previous,
                text: "",
            }));
        } catch (err) {
            setError(err.message || "Հաղորդագրությունը ուղարկել չհաջողվեց։");
        } finally {
            setLoading(false);
        }
    }

    // =====================================
    // COMPONENT
    // =====================================

    return (
        <>
            {/* FLOATING SUPPORT BUTTON */}

            <button
                type="button"
                className="support-trigger"
                ref={triggerRef}
                aria-label="Գրել ադմինին"
                aria-haspopup="dialog"
                onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-support"));
                }}
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

            {/* DIALOG */}

            <dialog
                ref={dialogRef}
                className="support-dialog"
                aria-labelledby="support-title"
                onClose={() => triggerRef.current?.focus()}
            >
                {/* HEADER */}

                <div className="support-heading">
                    <div>
                        <small>
                            {businessMode
                                ? "  BUSINESS"
                                : "  ՕԳՆՈՒԹՅՈՒՆ"}
                        </small>

                        <h2 id="support-title">
                            {businessMode ? "Բիզնես առաջարկ" : "Ինչո՞վ օգնենք"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Փակել"
                        onClick={() => dialogRef.current?.close()}
                    >
                        ×
                    </button>
                </div>

                {/* INTRODUCTION */}

                <p>
                    {businessMode
                        ? "Ցանկանո՞ւմ եք գովազդ տեղադրել ArmMotors կայքում։ Նշեք Ձեր անունը, email-ը և ուղարկեք առաջարկը։"
                        : ""}
                </p>

                {/* BUSINESS BADGE */}

                {businessMode && (
                    <p
                        className="support-listing"
                        style={{
                            padding: "11px 13px",
                            borderRadius: "9px",
                            background: "#fff7e8",
                            color: "#98712e",
                            border: "1px solid #ead6aa",
                            fontSize: "12px",
                            fontWeight: 700,
                        }}
                    >
                        Գովազդի և համագործակցության հարցում
                    </p>
                )}

                {/* LISTING CONTEXT */}

                {listing && (
                    <p className="support-listing">
                        Հայտարարություն՝ {listing.title || listing.listingId}
                    </p>
                )}

                {/* SUCCESS MESSAGE */}

                {success ? (
                    <div className="support-success" role="status">
                        <strong>Ուղարկված է</strong>

                        <p>{success}</p>

                        <button
                            type="button"
                            className="detail-secondary"
                            onClick={() => {
                                setSuccess("");

                                setForm((previous) => ({
                                    ...previous,
                                    text: businessMode ? BUSINESS_TEMPLATE : "",
                                }));
                            }}
                        >
                            Նոր հաղորդագրություն
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <fieldset disabled={loading}>
                            {/* NAME */}

                            <label>
                                Անուն
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

                            {/* EMAIL */}

                            <label>
                                Email
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

                            {/* MESSAGE */}

                            <label>
                                {businessMode
                                    ? "Ձեր բիզնես առաջարկը"
                                    : "Ձեր հարցը"}

                                <textarea
                                    name="text"
                                    required
                                    minLength={5}
                                    maxLength={businessMode ? 1950 : 2000}
                                    rows={5}
                                    value={form.text}
                                    onChange={changeField}
                                    placeholder={
                                        businessMode
                                            ? "Նկարագրեք Ձեր գովազդային առաջարկը..."
                                            : "Գրեք Ձեր հաղորդագրությունը..."
                                    }
                                />
                            </label>

                            {/* CHARACTER COUNTER */}

                            <small>
                                {form.text.length} /{" "}
                                {businessMode ? 1950 : 2000}
                            </small>

                            {/* ERROR */}

                            {error && (
                                <p className="form-error" role="alert">
                                    {error}
                                </p>
                            )}

                            {/* SUBMIT */}

                            <button className="support-submit" type="submit">
                                {loading
                                    ? "Ուղարկվում է…"
                                    : businessMode
                                      ? "Ուղարկել բիզնես առաջարկը →"
                                      : "Ուղարկել հաղորդագրությունը →"}
                            </button>
                        </fieldset>
                    </form>
                )}
            </dialog>
        </>
    );
}
