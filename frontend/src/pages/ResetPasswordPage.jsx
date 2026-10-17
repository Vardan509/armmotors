import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { apiRequest, clearAuthSession } from "../utils/api";

import { useI18n } from "../utils/i18n";

import "./PasswordRecovery.css";

export default function ResetPasswordPage() {
    const { t } = useI18n();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token") || "";

    const [validating, setValidating] = useState(true);
    const [valid, setValid] = useState(false);

    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // ==========================================
    // VALIDATE TOKEN
    // ==========================================

    useEffect(() => {
        let active = true;

        async function validateToken() {
            setValidating(true);
            setValid(false);
            setError("");

            if (!token) {
                setValidating(false);
                return;
            }

            try {
                const result = await apiRequest(
                    `/auth/reset-password/validate?token=${encodeURIComponent(
                        token,
                    )}`,
                    {
                        skipAuthRefresh: true,
                    },
                );

                if (active) {
                    setValid(result?.valid === true);
                }
            } catch {
                if (active) {
                    setValid(false);
                }
            } finally {
                if (active) {
                    setValidating(false);
                }
            }
        }

        void validateToken();

        return () => {
            active = false;
        };
    }, [token]);

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading || !valid || success) {
            return;
        }

        setError("");

        if (password.length < 8) {
            setError(`${t("newPassword")}: 8+`);
            return;
        }

        if (password !== repeatPassword) {
            setError(t("passwordsMismatch"));
            return;
        }

        setLoading(true);

        try {
            await apiRequest("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                    token,
                    password,
                    repeatPassword,
                }),
                skipAuthRefresh: true,
            });

            clearAuthSession();

            setPassword("");
            setRepeatPassword("");
            setSuccess(true);
        } catch (requestError) {
            setError(requestError.message || t("error"));
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <main className="recovery-page">
            <section className="recovery-card">
                <div className="recovery-brand">ARMMOTORS</div>

                <h1>{t("resetPassword")}</h1>

                {validating ? (
                    <p className="recovery-description" role="status">
                        {t("loading")}
                    </p>
                ) : success ? (
                    <>
                        <p className="recovery-success" role="status">
                            {t("resetSuccess")}
                        </p>

                        <Link to="/login" className="recovery-back">
                            {t("backToLogin")}
                        </Link>
                    </>
                ) : !valid ? (
                    <>
                        <p className="recovery-error" role="alert">
                            {t("invalidResetLink")}
                        </p>

                        <Link to="/forgot-password" className="recovery-back">
                            {t("recoveryTitle")}
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="recovery-description">
                            {t("newPassword")}
                        </p>

                        <form className="recovery-form" onSubmit={handleSubmit}>
                            <label htmlFor="new-password">
                                {t("newPassword")}
                            </label>

                            <input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setError("");
                                }}
                                minLength={8}
                                autoComplete="new-password"
                                required
                                disabled={loading}
                            />

                            <label htmlFor="repeat-new-password">
                                {t("confirmNewPassword")}
                            </label>

                            <input
                                id="repeat-new-password"
                                type={showPassword ? "text" : "password"}
                                value={repeatPassword}
                                onChange={(event) => {
                                    setRepeatPassword(event.target.value);
                                    setError("");
                                }}
                                minLength={8}
                                autoComplete="new-password"
                                required
                                disabled={loading}
                            />

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "9px",
                                    marginTop: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={(event) =>
                                        setShowPassword(event.target.checked)
                                    }
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                        accentColor: "#b99547",
                                    }}
                                />

                                <span>
                                    {showPassword
                                        ? t("hidePassword")
                                        : t("showPassword")}
                                </span>
                            </label>

                            {error && (
                                <p className="recovery-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}>
                                {loading ? t("processing") : t("resetPassword")}
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
