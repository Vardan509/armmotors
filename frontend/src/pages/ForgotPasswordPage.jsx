import { useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

import "./PasswordRecovery.css";

export default function ForgotPasswordPage() {
    const { t } = useI18n();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim(),
                }),
                skipAuthRefresh: true,
            });

            setSuccess(true);
        } catch (requestError) {
            setError(requestError.message || t("error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="recovery-page">
            <section className="recovery-card">
                <div className="recovery-brand">ARMMOTORS</div>

                <h1>{t("recoveryTitle")}</h1>

                {success ? (
                    <>
                        <p className="recovery-success" role="status">
                            {t("recoveryEmailSent")}
                        </p>

                        <Link to="/login" className="recovery-back">
                            {t("backToLogin")}
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="recovery-description">
                            {t("recoveryDescription")}
                        </p>

                        <form className="recovery-form" onSubmit={handleSubmit}>
                            <label htmlFor="recovery-email">{t("email")}</label>

                            <input
                                id="recovery-email"
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);

                                    setError("");
                                }}
                                placeholder="name@example.com"
                                autoComplete="email"
                                required
                                disabled={loading}
                            />

                            {error && (
                                <p className="recovery-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}>
                                {loading
                                    ? t("processing")
                                    : t("sendRecoveryLink")}
                            </button>
                        </form>

                        <Link to="/login" className="recovery-back">
                            {t("backToLogin")}
                        </Link>
                    </>
                )}
            </section>
        </main>
    );
}
