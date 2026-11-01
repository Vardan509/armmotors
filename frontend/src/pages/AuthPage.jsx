import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { apiRequest, saveAuthSession, logoutUser } from "../utils/api";

import { useI18n } from "../utils/i18n";

import GoogleSignIn from "../components/GoogleSignIn";
import GoogleAccountLink from "../components/GoogleAccountLink";

import "./Account.css";
import "./Forms.css";
import "./AuthPagePremium.css";
import "./AuthPageClean.css";

const EMPTY_FORM = {
    name: "",
    surname: "",
    phone: "",
    email: "",
    password: "",
    repetPassword: "",
};

const TEXT = {
    hy: {
        welcome: "Բարի վերադարձ",
        register: "Ստեղծեք Ձեր հաշիվը",
        description: "Մուտք գործեք Ձեր ArmMotors հաշիվ՝ շարունակելու համար։",
        registerDescription: "Միացեք ArmMotors-ին և գտեք Ձեր հաջորդ մեքենան։",
        remember: "Հիշել ինձ 30 օր",
        forgot: "Մոռացե՞լ եք գաղտնաբառը",
        or: "կամ",
        show: "Ցույց տալ գաղտնաբառը",
        hide: "Թաքցնել գաղտնաբառը",
    },
    ru: {
        welcome: "С возвращением",
        register: "Создайте аккаунт",
        description: "Войдите в свой аккаунт ArmMotors, чтобы продолжить.",
        registerDescription:
            "Присоединяйтесь к ArmMotors и найдите свой автомобиль.",
        remember: "Запомнить на 30 дней",
        forgot: "Забыли пароль?",
        or: "или",
        show: "Показать пароль",
        hide: "Скрыть пароль",
    },
    en: {
        welcome: "Welcome back",
        register: "Create your account",
        description: "Sign in to your ArmMotors account to continue.",
        registerDescription: "Join ArmMotors and find your next car.",
        remember: "Remember me for 30 days",
        forgot: "Forgot password?",
        or: "or",
        show: "Show password",
        hide: "Hide password",
    },
};

function getSafeDestination(requestedNext) {
    if (
        typeof requestedNext === "string" &&
        /^\/(?:add-product|favorites|account|admin(?:\/(?:users|products|orders|messages|broadcasts|audit))?|cars\/[a-f0-9]{24})$/.test(
            requestedNext,
        )
    ) {
        return requestedNext;
    }

    return "/account";
}

function EyeIcon({ visible }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
        </svg>
    );
}

export default function AuthPage({ registration = false }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { t, language } = useI18n();
    const text = TEXT[language] || TEXT.hy;

    const [mode, setMode] = useState(registration ? "register" : "login");

    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Սկզբից միացված է՝ սովորական և Google մուտքի համար։
    const [remember, setRemember] = useState(true);

    const [isLoggedIn, setIsLoggedIn] = useState(() =>
        Boolean(localStorage.getItem("token")),
    );

    const isRegistration = mode === "register";

    const destination = getSafeDestination(searchParams.get("next"));

    useEffect(() => {
        function updateSession() {
            setIsLoggedIn(Boolean(localStorage.getItem("token")));
        }

        window.addEventListener("session-changed", updateSession);
        window.addEventListener("storage", updateSession);

        return () => {
            window.removeEventListener("session-changed", updateSession);
            window.removeEventListener("storage", updateSession);
        };
    }, []);

    function switchMode(nextMode) {
        if (nextMode === mode || loading) return;

        setMode(nextMode);
        setError("");
        setShowPassword(false);
        setForm({ ...EMPTY_FORM });
    }

    function changeField(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setError("");

        if (isRegistration && form.password !== form.repetPassword) {
            setError(t("passwordsMismatch"));
            return;
        }

        setLoading(true);

        try {
            const body = isRegistration
                ? {
                      ...form,
                      email: form.email.trim(),
                      remember,
                  }
                : {
                      login: form.email.trim(),
                      password: form.password,
                      remember,
                  };

            const data = await apiRequest(
                isRegistration ? "/auth/reg" : "/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify(body),
                },
            );

            saveAuthSession(data);

            navigate(destination, {
                replace: true,
            });
        } catch (requestError) {
            setError(requestError.message || t("error"));
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        setLoading(true);
        setError("");

        try {
            await logoutUser();
            setIsLoggedIn(false);
            navigate("/", { replace: true });
        } catch (requestError) {
            setError(requestError.message || t("error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-shell am-auth-clean">
            <section className="auth-panel">
                <div className="auth-card">
                    {/* <Link
                        to="/"
                        className="am-auth-brand"
                        aria-label="ArmMotors"
                    >
                        Arm<span>Motors</span>
                    </Link> */}

                    {isLoggedIn ? (
                        <div className="auth-component-frame">
                            <div className="auth-title-block">
                                <h2>{t("account")}</h2>
                                <p>{t("accountSettings")}</p>
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
                                onClick={() => navigate(destination)}
                            >
                                {destination === "/add-product"
                                    ? t("addProduct")
                                    : t("goToAccount")}
                            </button>

                            <button
                                type="button"
                                className="am-auth-logout"
                                onClick={handleLogout}
                                disabled={loading}
                            >
                                {t("logoutAccount")}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="auth-tabs">
                                <button
                                    type="button"
                                    className={!isRegistration ? "active" : ""}
                                    aria-pressed={!isRegistration}
                                    disabled={loading}
                                    onClick={() => switchMode("login")}
                                >
                                    {t("login")}
                                </button>

                                <button
                                    type="button"
                                    className={isRegistration ? "active" : ""}
                                    aria-pressed={isRegistration}
                                    disabled={loading}
                                    onClick={() => switchMode("register")}
                                >
                                    {t("register")}
                                </button>
                            </div>

                            <div className="auth-title-block">
                                <h2>
                                    {isRegistration
                                        ? text.register
                                        : text.welcome}
                                </h2>

                                <p>
                                    {isRegistration
                                        ? text.registerDescription
                                        : text.description}
                                </p>
                            </div>

                            <div className="auth-component-frame" key={mode}>
                                <form
                                    className="auth-form-modern"
                                    onSubmit={handleSubmit}
                                    autoComplete="on"
                                >
                                    {isRegistration && (
                                        <>
                                            <div className="auth-two-columns">
                                                <label>
                                                    <span>{t("name")}</span>
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
                                                    <span>{t("surname")}</span>
                                                    <input
                                                        type="text"
                                                        name="surname"
                                                        value={form.surname}
                                                        onChange={changeField}
                                                        minLength={2}
                                                        autoComplete="family-name"
                                                        placeholder={t(
                                                            "surname",
                                                        )}
                                                        required
                                                    />
                                                </label>
                                            </div>

                                            <label>
                                                <span>{t("phone")}</span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={form.phone}
                                                    onChange={changeField}
                                                    autoComplete="tel"
                                                    placeholder="+374 00 00 00 00"
                                                    required
                                                />
                                            </label>
                                        </>
                                    )}

                                    <label>
                                        <span>{t("email")}</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={changeField}
                                            autoComplete={
                                                isRegistration
                                                    ? "email"
                                                    : "username"
                                            }
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </label>

                                    <label>
                                        <span>{t("password")}</span>

                                        <div className="auth-input-shell">
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
                                                aria-label={
                                                    showPassword
                                                        ? text.hide
                                                        : text.show
                                                }
                                                aria-pressed={showPassword}
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) => !previous,
                                                    )
                                                }
                                            >
                                                <EyeIcon
                                                    visible={showPassword}
                                                />
                                            </button>
                                        </div>
                                    </label>

                                    {isRegistration && (
                                        <label>
                                            <span>{t("repeatPassword")}</span>
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
                                                    "repeatPassword",
                                                )}
                                                required
                                            />
                                        </label>
                                    )}

                                    <div className="am-auth-options">
                                        <label className="am-auth-remember">
                                            <input
                                                type="checkbox"
                                                checked={remember}
                                                onChange={(event) =>
                                                    setRemember(
                                                        event.target.checked,
                                                    )
                                                }
                                            />
                                            <span>{text.remember}</span>
                                        </label>

                                        {!isRegistration && (
                                            <Link to="/forgot-password">
                                                {text.forgot}
                                            </Link>
                                        )}
                                    </div>

                                    {error && (
                                        <p
                                            className="form-error auth-error"
                                            role="alert"
                                        >
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="auth-submit"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? t("processing")
                                            : isRegistration
                                              ? t("createAccount")
                                              : t("login")}
                                    </button>
                                </form>

                                <div className="auth-divider">
                                    <span>{text.or}</span>
                                </div>

                                <GoogleSignIn
                                    destination={destination}
                                    remember={remember}
                                />

                                <p className="auth-switch-copy">
                                    {isRegistration
                                        ? t("alreadyHaveAccount")
                                        : t("dontHaveAccount")}

                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            switchMode(
                                                isRegistration
                                                    ? "login"
                                                    : "register",
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
