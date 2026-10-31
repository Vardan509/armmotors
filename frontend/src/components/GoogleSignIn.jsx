import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest, saveAuthSession } from "../utils/api";

import { useI18n } from "../utils/i18n";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

const TEXTS = {
    hy: {
        loading: "Google ծառայությունը բեռնվում է...",
        checking: "Google հաշիվը ստուգվում է...",
        unavailable: "Google-ով մուտքն այս պահին հասանելի չէ։",
        loadError: "Google ծառայությունը բեռնել չհաջողվեց։",
        loginError: "Google-ով մուտք գործել չհաջողվեց։ Կրկին փորձեք։",
        linkError: "Google հաշիվը կապակցել չհաջողվեց։",
        linked: "Google հաշիվը հաջողությամբ կապակցված է։",
        retry: "Կրկին փորձել",
    },

    ru: {
        loading: "Загрузка сервиса Google...",
        checking: "Проверка аккаунта Google...",
        unavailable: "Вход через Google сейчас недоступен.",
        loadError: "Не удалось загрузить сервис Google.",
        loginError: "Не удалось войти через Google. Попробуйте ещё раз.",
        linkError: "Не удалось привязать аккаунт Google.",
        linked: "Аккаунт Google успешно привязан.",
        retry: "Повторить",
    },

    en: {
        loading: "Loading the Google service...",
        checking: "Verifying your Google account...",
        unavailable: "Google sign-in is currently unavailable.",
        loadError: "Could not load the Google service.",
        loginError: "Could not sign in with Google. Please try again.",
        linkError: "Could not link your Google account.",
        linked: "Your Google account has been linked.",
        retry: "Try again",
    },
};

let scriptPromise = null;

function loadGoogle() {
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }

    if (scriptPromise) {
        return scriptPromise;
    }

    scriptPromise = new Promise((resolve, reject) => {
        let script = Array.from(document.scripts).find(
            (element) => element.src.split("?")[0] === GOOGLE_SCRIPT,
        );

        const created = !script;

        if (!script) {
            script = document.createElement("script");
            script.src = GOOGLE_SCRIPT;
            script.async = true;
            script.defer = true;
        }

        function cleanup() {
            window.clearTimeout(timeout);
            script.removeEventListener("load", onLoad);
            script.removeEventListener("error", onError);
        }

        function onLoad() {
            cleanup();

            if (window.google?.accounts?.id) {
                resolve();
            } else {
                if (created) script.remove();
                reject(new Error("GOOGLE_SCRIPT_ERROR"));
            }
        }

        function onError() {
            cleanup();

            if (created) script.remove();

            reject(new Error("GOOGLE_SCRIPT_ERROR"));
        }

        const timeout = window.setTimeout(onError, 15000);

        script.addEventListener("load", onLoad);
        script.addEventListener("error", onError);

        if (created) {
            document.head.appendChild(script);
        }

        if (window.google?.accounts?.id) {
            onLoad();
        }
    }).catch((error) => {
        scriptPromise = null;
        throw error;
    });

    return scriptPromise;
}

function safeDestination(value) {
    if (
        typeof value !== "string" ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        /[\\\u0000-\u0020]/.test(value)
    ) {
        return "/";
    }

    return value;
}

export default function GoogleSignIn({
    destination = "/",
    link = false,
    onLinked,
}) {
    const navigate = useNavigate();
    const { language } = useI18n();

    const text = TEXTS[language] || TEXTS.hy;

    const targetRef = useRef(null);
    const linkedRef = useRef(onLinked);
    const destinationRef = useRef(destination);
    const busyRef = useRef(false);

    const [ready, setReady] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [busy, setBusy] = useState(false);
    const [errorKey, setErrorKey] = useState("");
    const [success, setSuccess] = useState(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        linkedRef.current = onLinked;
        destinationRef.current = destination;
    }, [onLinked, destination]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        setReady(false);
        setInitializing(true);
        setErrorKey("");
        setSuccess(false);

        async function initialize() {
            let config;

            try {
                config = await apiRequest("/auth/config", {
                    signal: controller.signal,
                });

                if (!config?.googleClientId) {
                    throw new Error("GOOGLE_CONFIG_MISSING");
                }
            } catch {
                if (active) {
                    setErrorKey("unavailable");
                    setInitializing(false);
                }

                return;
            }

            try {
                await loadGoogle();
            } catch {
                if (active) {
                    setErrorKey("loadError");
                    setInitializing(false);
                }

                return;
            }

            if (!active) return;

            try {
                window.google.accounts.id.initialize({
                    client_id: config.googleClientId,

                    callback: async ({ credential }) => {
                        if (!active || !credential || busyRef.current) {
                            return;
                        }

                        busyRef.current = true;

                        setBusy(true);
                        setErrorKey("");
                        setSuccess(false);

                        let result;

                        try {
                            result = await apiRequest(
                                link ? "/auth/google/link" : "/auth/google",
                                {
                                    method: "POST",
                                    body: JSON.stringify({
                                        credential,
                                    }),
                                },
                            );

                            if (!active) return;

                            if (!link) {
                                saveAuthSession(result);
                            }
                        } catch {
                            if (active) {
                                setErrorKey(link ? "linkError" : "loginError");
                            }

                            return;
                        } finally {
                            busyRef.current = false;

                            if (active) {
                                setBusy(false);
                            }
                        }

                        if (!active) return;

                        if (link) {
                            setSuccess(true);
                            linkedRef.current?.();
                            return;
                        }

                        const requestedDestination = safeDestination(
                            destinationRef.current,
                        );

                        navigate(
                            requestedDestination === "/" && result.user?.isAdmin
                                ? "/admin"
                                : requestedDestination,
                            { replace: true },
                        );
                    },
                });

                setReady(true);
                setInitializing(false);
            } catch {
                if (active) {
                    setErrorKey("loadError");
                    setInitializing(false);
                }
            }
        }

        void initialize();

        return () => {
            active = false;
            controller.abort();
        };
    }, [link, navigate, revision]);

    useEffect(() => {
        const target = targetRef.current;

        if (!ready || !target || !window.google?.accounts?.id) {
            return;
        }

        target.replaceChildren();

        window.google.accounts.id.renderButton(target, {
            type: "standard",
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: "continue_with",
            logo_alignment: "left",
            locale: language,
            width: String(
                Math.max(240, Math.min(400, target.clientWidth || 360)),
            ),
        });

        return () => {
            target.replaceChildren();
        };
    }, [ready, language]);

    return (
        <div className="google-signin-modern" aria-busy={initializing || busy}>
            <div className="google-button-shell" ref={targetRef} />

            {initializing && (
                <p role="status" className="google-status">
                    {text.loading}
                </p>
            )}

            {busy && (
                <p role="status" className="google-status">
                    {text.checking}
                </p>
            )}

            {errorKey && (
                <p className="google-unavailable" role="alert">
                    {text[errorKey]}
                </p>
            )}

            {success && (
                <p className="google-status" role="status">
                    {text.linked}
                </p>
            )}

            {!ready && !initializing && errorKey && (
                <button
                    type="button"
                    className="detail-secondary"
                    onClick={() => setRevision((current) => current + 1)}
                >
                    {text.retry}
                </button>
            )}
        </div>
    );
}
