
import { useState } from "react";
import { apiRequest } from "../utils/api";
import "./ReportProduct.css";

const BASE = import.meta.env.BASE_URL;

export default function ReportProduct({ productId }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("incorrect");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!localStorage.getItem("token")) {
            window.location.assign(
                `${BASE}login?next=${encodeURIComponent(
                    window.location.pathname
                )}`
            );
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const result = await apiRequest("/reports", {
                method: "POST",
                body: JSON.stringify({
                    productId,
                    reason,
                    details,
                }),
            });

            setMessage(
                result?.message || "Բողոքը հաջողությամբ ուղարկվեց։"
            );

            setSuccess(true);
            setDetails("");
        } catch (error) {
            setMessage(error.message);
            setSuccess(false);
        } finally {
            setLoading(false);
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
                    Բողոքել հայտարարության մասին
                </button>
            ) : (
                <form
                    className="report-form"
                    onSubmit={handleSubmit}
                >
                    <div className="report-form-heading">
                        <h3>Հայտնել խնդրի մասին</h3>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Փակել"
                        >
                            ×
                        </button>
                    </div>

                    <label htmlFor="report-reason">
                        Բողոքի պատճառ
                    </label>

                    <select
                        id="report-reason"
                        value={reason}
                        onChange={(event) =>
                            setReason(event.target.value)
                        }
                    >
                        <option value="incorrect">
                            Սխալ տեղեկություններ
                        </option>
                        <option value="spam">
                            Կրկնվող կամ գովազդային հայտարարություն
                        </option>
                        <option value="fraud">
                            Կասկածելի հայտարարություն
                        </option>
                        <option value="other">
                            Այլ պատճառ
                        </option>
                    </select>

                    <label htmlFor="report-details">
                        Նկարագրություն
                    </label>

                    <textarea
                        id="report-details"
                        rows={4}
                        maxLength={1000}
                        placeholder="Նկարագրեք խնդիրը..."
                        value={details}
                        onChange={(event) =>
                            setDetails(event.target.value)
                        }
                    />

                    {message && (
                        <p
                            className={
                                success
                                    ? "report-success"
                                    : "report-error"
                            }
                            role="status"
                        >
                            {message}
                        </p>
                    )}

                    <button
                        className="report-submit"
                        type="submit"
                        disabled={loading || success}
                    >
                        {loading
                            ? "Ուղարկվում է..."
                            : success
                              ? "Ուղարկված է"
                              : "Ուղարկել բողոքը"}
                    </button>
                </form>
            )}
        </section>
    );
}
