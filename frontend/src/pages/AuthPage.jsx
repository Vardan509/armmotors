
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import {
    apiRequest,
    saveAuthSession,
    logoutUser,
} from "../utils/api";

import { useI18n } from "../utils/i18n";

import GoogleSignIn from "../components/GoogleSignIn";
import GoogleAccountLink from "../components/GoogleAccountLink";

import "./Account.css";
import "./Forms.css";
import "./AuthPagePremium.css";

const EMPTY_FORM = {
    name: "",
    surname: "",
    phone: "",
    email: "",
    password: "",
    repetPassword: "",
};

// Only internal, approved redirect destinations.
function getSafeDestination(requestedNext) {
    if (
        typeof requestedNext === "string" &&
        /^\/(?:add-product|favorites|account|admin(?:\/(?:users|products|orders|messages|broadcasts|audit))?|cars\/[a-f0-9]{24})$/.test(
            requestedNext
        )
    ) {
        return requestedNext;
    }

    // Ordinary login opens the account page.
    return "/account";
}

export default function AuthPage({ registration = false }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { t } = useI18n();

    const [mode, setMode] = useState(
        registration ? "register" : "login"
    );

    const [form, setForm] = useState({
        ...EMPTY_FORM,
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(() =>
        Boolean(localStorage.getItem("token"))
    );

    const isRegistration = mode === "register";

    const requestedNext = searchParams.get("next");

    const destination = getSafeDestination(requestedNext);

    // ==========================================
    // SESSION EVENTS
    // ==========================================

    useEffect(() => {
        function updateSession() {
            setIsLoggedIn(
                Boolean(localStorage.getItem("token"))
            );
        }

        window.addEventListener(
            "session-changed",
            updateSession
        );

        window.addEventListener(
            "storage",
            updateSession
        );

        return () => {
            window.removeEventListener(
                "session-changed",
                updateSession
            );

            window.removeEventListener(
                "storage",
                updateSession
            );
        };
    }, []);

    // ==========================================
    // SWITCH LOGIN / REGISTER
    // ==========================================

    function switchMode(nextMode) {
        if (nextMode === mode) return;

        setMode(nextMode);
        setError("");
        setShowPassword(false);
        setForm({ ...EMPTY_FORM });
    }

    // ==========================================
    // INPUT HANDLER
    // ==========================================

    function changeField(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    }

    // ==========================================
    // LOGIN / REGISTRATION
    // ==========================================

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setError("");

        if (
            isRegistration &&
            form.password !== form.repetPassword
        ) {
            setError(t("passwordsMismatch"));
            return;
        }

        setLoading(true);

        try {
            const body = isRegistration
                ? {
                      ...form,
                      remember,
                  }
                : {
                      login: form.email.trim(),
                      password: form.password,
                      remember,
                  };

            const data = await apiRequest(
                isRegistration
                    ? "/auth/reg"
                    : "/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify(body),
                }
            );

            saveAuthSession(data);

            // IMPORTANT:
            // /login -> /account
            // /login?next=/add-product -> /add-product
            // /login?next=/favorites -> /favorites

            navigate(destination, {
                replace: true,
            });
        } catch (requestError) {
            setError(
                requestError.message || t("error")
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // LOGOUT
    // ==========================================

    async function handleLogout() {
        setLoading(true);
        setError("");

        try {
            await logoutUser();

            setIsLoggedIn(false);

            navigate("/", {
                replace: true,
            });
        } catch (requestError) {
            setError(
                requestError.message || t("error")
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <main className="auth-shell">
            <section className="auth-panel">
                <div className="auth-card">
                    {isLoggedIn ? (
                        <div className="auth-component-frame">
                            <div className="auth-title-block">
                                <span className="auth-eyebrow">
                                    {t("accountSettings")}
                                </span>

                                <h2>Google Account</h2>

                                <p>{t("account")}</p>
                            </div>

                            <GoogleAccountLink />

                            {error && (
                                <p
                                    className="form-error auth-error"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            <button
                                type="button"
                                className="auth-submit"
                                onClick={() =>
                                    navigate(destination)
                                }
                            >
                                {destination === "/add-product"
                                    ? t("addProduct")
                                    : t("goToAccount")}
                            </button>

                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={handleLogout}
                                disabled={loading}
                            >
                                {t("logoutAccount")}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* LOGIN / REGISTER TABS */}

                            <div
                                className="auth-tabs"
                                role="tablist"
                                aria-label={t("account")}
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={!isRegistration}
                                    className={
                                        !isRegistration
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        switchMode("login")
                                    }
                                >
                                    {t("login")}
                                </button>

                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={isRegistration}
                                    className={
                                        isRegistration
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        switchMode("register")
                                    }
                                >
                                    {t("register")}
                                </button>
                            </div>

                            {/* TITLE */}

                            <div className="auth-title-block">
                                <span className="auth-eyebrow">
                                    {isRegistration
                                        ? t("newAccount")
                                        : t("welcome")}
                                </span>

                                <h2>
                                    {isRegistration
                                        ? t("registerTitle")
                                        : t("loginTitle")}
                                </h2>

                                <p>
                                    {isRegistration
                                        ? t("registerDescription")
                                        : t("loginDescription")}
                                </p>
                            </div>

                            <div
                                className="auth-component-frame"
                                key={mode}
                            >
                                <form
                                    className="auth-form-modern"
                                    onSubmit={handleSubmit}
                                >
                                    {/* NAME AND SURNAME */}

                                    {isRegistration && (
                                        <div className="auth-two-columns">
                                            <label>
                                                <span>
                                                    {t("name")}
                                                </span>

                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={changeField}
                                                    minLength={2}
                                                    autoComplete="given-name"
                                                    placeholder={t("name")}
                                                    required
                                                />
                                            </label>

                                            <label>
                                                <span>
                                                    {t("surname")}
                                                </span>

                                                <input
                                                    type="text"
                                                    name="surname"
                                                    value={form.surname}
                                                    onChange={changeField}
                                                    minLength={2}
                                                    autoComplete="family-name"
                                                    placeholder={t("surname")}
                                                    required
                                                />
                                            </label>
                                        </div>
                                    )}

                                    {/* PHONE */}

                                    {isRegistration && (
                                        <label>
                                            <span>
                                                {t("phone")}
                                            </span>

                                            <div className="auth-input-shell">
                                                <span className="auth-input-icon">
                                                    ☎
                                                </span>

                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={form.phone}
                                                    onChange={changeField}
                                                    autoComplete="tel"
                                                    placeholder="+374 00 00 00 00"
                                                    required
                                                />
                                            </div>
                                        </label>
                                    )}

                                    {/* EMAIL */}

                                    <label>
                                        <span>
                                            {t("email")}
                                        </span>

                                        <div className="auth-input-shell">
                                            <span className="auth-input-icon">
                                                @
                                            </span>

                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={changeField}
                                                autoComplete="email"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                    </label>

                                    {/* PASSWORD */}

                                    <label>
                                        <span>
                                            {t("password")}
                                        </span>

                                        <div className="auth-input-shell">
                                            <span className="auth-input-icon">
                                                ⌁
                                            </span>

                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={form.password}
                                                onChange={changeField}
                                                minLength={
                                                    isRegistration
                                                        ? 8
                                                        : undefined
                                                }
                                                autoComplete={
                                                    isRegistration
                                                        ? "new-password"
                                                        : "current-password"
                                                }
                                                placeholder={t("password")}
                                                required
                                            />

                                            <button
                                                type="button"
                                                className="auth-password-toggle"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                            >
                                                {showPassword
                                                    ? t("hidePassword")
                                                    : t("showPassword")}
                                            </button>
                                        </div>
                                    </label>

                                    {/* REPEAT PASSWORD */}

                                    {isRegistration && (
                                        <label>
                                            <span>
                                                {t("repeatPassword")}
                                            </span>

                                            <div className="auth-input-shell">
                                                <span className="auth-input-icon">
                                                    ✓
                                                </span>

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="repetPassword"
                                                    value={form.repetPassword}
                                                    onChange={changeField}
                                                    minLength={8}
                                                    autoComplete="new-password"
                                                    placeholder={t(
                                                        "repeatPassword"
                                                    )}
                                                    required
                                                />
                                            </div>
                                        </label>
                                    )}

                                    {/* FORGOT PASSWORD */}

                                    {!isRegistration && (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                margin: "-4px 0 15px",
                                            }}
                                        >
                                            <Link
                                                to="/forgot-password"
                                                style={{
                                                    color: "#b99547",
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {t("forgotPassword")}
                                            </Link>
                                        </div>
                                    )}

                                    {/* REMEMBER ME */}

                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            margin: "0 0 22px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(event) =>
                                                setRemember(
                                                    event.target.checked
                                                )
                                            }
                                            style={{
                                                width: "17px",
                                                height: "17px",
                                                accentColor: "#b99547",
                                                cursor: "pointer",
                                                flexShrink: 0,
                                            }}
                                        />

                                        <span
                                            style={{
                                                fontSize: "13px",
                                                color: "#555",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {t("rememberMe")}
                                        </span>
                                    </label>

                                    {/* ERROR */}

                                    {error && (
                                        <p
                                            className="form-error auth-error"
                                            role="alert"
                                        >
                                            {error}
                                        </p>
                                    )}

                                    {/* SUBMIT */}

                                    <button
                                        type="submit"
                                        className="auth-submit"
                                        disabled={loading}
                                    >
                                        <span>
                                            {loading
                                                ? t("processing")
                                                : isRegistration
                                                  ? t("createAccount")
                                                  : t("login")}
                                        </span>

                                        {!loading && (
                                            <span>→</span>
                                        )}
                                    </button>
                                </form>

                                {/* GOOGLE SIGN IN */}

                                <div className="auth-divider">
                                    <span>
                                        {t("continue")}
                                    </span>
                                </div>

                                <GoogleSignIn
                                    destination={destination}
                                    remember={remember}
                                />

                                {/* SWITCH MODE */}

                                <p className="auth-switch-copy">
                                    {isRegistration
                                        ? t("alreadyHaveAccount")
                                        : t("dontHaveAccount")}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                isRegistration
                                                    ? "login"
                                                    : "register"
                                            )
                                        }
                                    >
                                        {isRegistration
                                            ? t("login")
                                            : t("register")}
                                    </button>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
