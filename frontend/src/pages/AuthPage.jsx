import { useState } from "react";

import { apiRequest } from "../utils/api";

import Header from "../components/header/Header";

import GoogleSignIn from "../components/GoogleSignIn";

import "./Account.css";
import "./Forms.css";

const EMPTY_FORM = {
    name: "",
    surname: "",
    phone: "",
    email: "",
    password: "",
    repetPassword: "",
};

export default function AuthPage({ registration = false }) {
    const [mode, setMode] = useState(registration ? "register" : "login");

    const [form, setForm] = useState(EMPTY_FORM);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const isRegistration = mode === "register";

    const requestedNext = new URLSearchParams(window.location.search).get(
        "next",
    );

    const destination =
        requestedNext &&
        /^\/(?:add-product|favorites|account|admin(?:\/(?:users|products|orders|messages|broadcasts|audit))?|cars\/[a-f0-9]{24})$/.test(
            requestedNext,
        )
            ? requestedNext
            : "/";

    function switchMode(nextMode) {
        if (nextMode === mode) return;

        setMode(nextMode);

        setError("");

        setShowPassword(false);

        setForm(EMPTY_FORM);
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

        setError("");

        if (isRegistration && form.password !== form.repetPassword) {
            setError("Գաղտնաբառերը չեն համընկնում։");

            return;
        }

        setLoading(true);

        try {
            const data = await apiRequest(
                isRegistration ? "/auth/reg" : "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify(
                        isRegistration
                            ? form
                            : {
                                  login: form.email,
                                  password: form.password,
                              },
                    ),
                },
            );

            localStorage.setItem("token", data.token);

            localStorage.setItem("user", JSON.stringify(data.user));

            window.dispatchEvent(new Event("session-changed"));

            window.location.assign(
                destination === "/" && data.user.isAdmin
                    ? "/admin"
                    : destination,
            );
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Header />

            <main className="auth-shell">
                <section className="auth-panel">
                    <div className="auth-card">
                        <div
                            className="auth-tabs"
                            role="tablist"
                            aria-label="Հաշիվ"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={!isRegistration}
                                className={!isRegistration ? "active" : ""}
                                onClick={() => switchMode("login")}
                            >
                                Մուտք
                            </button>

                            <button
                                type="button"
                                role="tab"
                                aria-selected={isRegistration}
                                className={isRegistration ? "active" : ""}
                                onClick={() => switchMode("register")}
                            >
                                Գրանցում
                            </button>
                        </div>

                        <div className="auth-title-block">
                            <span className="auth-eyebrow">
                                {isRegistration ? "ՆՈՐ ՀԱՇԻՎ" : "ԲԱՐԻ ԳԱԼՈՒՍՏ"}
                            </span>

                            <h2>
                                {isRegistration
                                    ? "Ստեղծեք Ձեր հաշիվը"
                                    : "Մուտք գործեք Ձեր հաշիվ"}
                            </h2>

                            <p>
                                {isRegistration
                                    ? "Մի քանի քայլ և Դուք պատրաստ եք օգտվել ArmMotors-ից։"
                                    : "Մուտք գործեք Ձեր ArmMotors հաշիվ։"}
                            </p>
                        </div>

                        <div className="auth-component-frame" key={mode}>
                            <form
                                className="auth-form-modern"
                                onSubmit={handleSubmit}
                            >
                                {isRegistration && (
                                    <div className="auth-two-columns">
                                        <label>
                                            <span>Անուն</span>

                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={changeField}
                                                minLength={2}
                                                autoComplete="given-name"
                                                placeholder="Վարդան"
                                                required
                                            />
                                        </label>

                                        <label>
                                            <span>Ազգանուն</span>

                                            <input
                                                type="text"
                                                name="surname"
                                                value={form.surname}
                                                onChange={changeField}
                                                minLength={2}
                                                autoComplete="family-name"
                                                placeholder="Հանոյան"
                                                required
                                            />
                                        </label>
                                    </div>
                                )}

                                {isRegistration && (
                                    <label>
                                        <span>Հեռախոսահամար</span>

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
                                                inputMode="tel"
                                                placeholder="+374 00 00 00 00"
                                                required
                                            />
                                        </div>
                                    </label>
                                )}

                                <label>
                                    <span>Email</span>

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

                                <label>
                                    <span>Գաղտնաբառ</span>

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
                                                isRegistration ? 8 : undefined
                                            }
                                            autoComplete={
                                                isRegistration
                                                    ? "new-password"
                                                    : "current-password"
                                            }
                                            placeholder="Առնվազն 8 նիշ"
                                            required
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    (value) => !value,
                                                )
                                            }
                                        >
                                            {showPassword
                                                ? "Թաքցնել"
                                                : "Տեսնել"}
                                        </button>
                                    </div>
                                </label>

                                {isRegistration && (
                                    <label>
                                        <span>Կրկնեք գաղտնաբառը</span>

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
                                                placeholder="Կրկնեք գաղտնաբառը"
                                                required
                                            />
                                        </div>
                                    </label>
                                )}

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
                                    <span>
                                        {loading
                                            ? "Սպասեք..."
                                            : isRegistration
                                              ? "Ստեղծել հաշիվ"
                                              : "Մուտք գործել"}
                                    </span>

                                    {!loading && <span>→</span>}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>կամ շարունակել</span>
                            </div>

                            <GoogleSignIn destination={destination} />

                            <p className="auth-switch-copy">
                                {isRegistration
                                    ? "Արդեն հաշիվ ունե՞ք։"
                                    : "Դեռ հաշիվ չունե՞ք։"}

                                <button
                                    type="button"
                                    onClick={() =>
                                        switchMode(
                                            isRegistration
                                                ? "login"
                                                : "register",
                                        )
                                    }
                                >
                                    {isRegistration
                                        ? "Մուտք գործել"
                                        : "Գրանցվել"}
                                </button>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
