import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../../utils/api";

import "./SupportWidget.css";

export default function SupportWidget() {
    const dialogRef = useRef(null);
    const triggerRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        text: ""
    });

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        function open(event) {
            setListing(event.detail || null);
            setSuccess("");
            setError("");

            if (!dialogRef.current.open) {
                dialogRef.current.showModal();
            }
        }

        window.addEventListener("open-support", open);

        return () => {
            window.removeEventListener("open-support", open);
        };
    }, []);

    function changeField(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function submit(e) {
        e.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await apiRequest("/messages", {
                method: "POST",

                body: JSON.stringify({
                    ...form,
                    listingId: listing?.listingId || ""
                })
            });

            setSuccess(
                "Հաղորդագրությունը պահպանված է և հասանելի է ադմինին։ Պատասխանի համար նշված է Ձեր email-ը։"
            );

            setForm(prev => ({
                ...prev,
                text: ""
            }));
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                className="support-trigger"
                ref={triggerRef}
                aria-label="Գրել ադմինին"
                aria-haspopup="dialog"
                onClick={() => {
                    window.dispatchEvent(
                        new CustomEvent("open-support")
                    );
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

            <dialog
                ref={dialogRef}
                className="support-dialog"
                aria-labelledby="support-title"
                onClose={() => triggerRef.current?.focus()}
            >
                <div className="support-heading">
                    <div>
                        <small>ARMMOTORS · ՕԳՆՈՒԹՅՈՒՆ</small>

                        <h2 id="support-title">
                            Ինչո՞վ օգնենք
                        </h2>
                    </div>

                    <button
                        aria-label="Փակել"
                        onClick={() => dialogRef.current.close()}
                    >
                        ×
                    </button>
                </div>

                <p>
                    Գրեք Ձեր հարցը և նշեք email-ը, որով ադմինը
                    կարող է կապվել Ձեզ հետ։
                </p>

                {listing && (
                    <p className="support-listing">
                        Հայտարարություն՝ {listing.title}
                    </p>
                )}

                {success ? (
                    <div className="support-success" role="status">
                        <strong>✓ Ուղարկված է</strong>

                        <p>{success}</p>

                        <button
                            className="detail-secondary"
                            onClick={() => setSuccess("")}
                        >
                            Նոր հարց
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit}>
                        <fieldset disabled={loading}>
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

                            <label>
                                Ձեր հարցը

                                <textarea
                                    name="text"
                                    required
                                    minLength={5}
                                    maxLength={2000}
                                    rows={4}
                                    value={form.text}
                                    onChange={changeField}
                                />
                            </label>

                            <small>
                                {form.text.length} / 2000
                            </small>

                            {error && (
                                <p className="form-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                className="support-submit"
                                type="submit"
                            >
                                {loading
                                    ? "Ուղարկվում է…"
                                    : "Ուղարկել հաղորդագրությունը →"}
                            </button>
                        </fieldset>
                    </form>
                )}
            </dialog>
        </>
    );
}
