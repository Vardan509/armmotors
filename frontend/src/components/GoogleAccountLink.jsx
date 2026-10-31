import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

const TEXTS = {
    hy: {
        title: "Կապել Google հաշիվը",
        description:
            "Ընտրեք նույն Google էլ. փոստը, որով ստեղծված է Ձեր ArmMotors հաշիվը։",
        loading: "Սպասեք...",
        success: "Google հաշիվը հաջողությամբ կապվել է։",
        linkError: "Google հաշիվը կապել չհաջողվեց։ Կրկին փորձեք։",
        configError: "Google-ով կապումն այս պահին հասանելի չէ։",
        scriptError: "Google ծառայությունը բեռնել չհաջողվեց։",
        retry: "Կրկին փորձել",
    },

    ru: {
        title: "Привязать аккаунт Google",
        description:
            "Выберите аккаунт Google с тем же email, который указан в вашем аккаунте ArmMotors.",
        loading: "Подождите...",
        success: "Аккаунт Google успешно привязан.",
        linkError: "Не удалось привязать аккаунт Google. Попробуйте ещё раз.",
        configError: "Привязка Google сейчас недоступна.",
        scriptError: "Не удалось загрузить сервис Google.",
        retry: "Повторить",
    },

    en: {
        title: "Link your Google account",
        description:
            "Choose the Google account with the same email address as your ArmMotors account.",
        loading: "Please wait...",
        success: "Your Google account has been linked.",
        linkError: "Could not link your Google account. Please try again.",
        configError: "Google account linking is currently unavailable.",
        scriptError: "Could not load the Google service.",
        retry: "Try again",
    },
};

let googleScriptPromise = null;

function loadGoogleScript() {
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }

    if (googleScriptPromise) {
        return googleScriptPromise;
    }

    googleScriptPromise = new Promise((resolve, reject) => {
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
            script.removeEventListener("load", loaded);
            script.removeEventListener("error", failed);
        }

        function loaded() {
            cleanup();

            if (window.google?.accounts?.id) {
                resolve();
            } else {
                if (created) script.remove();
                reject(new Error("GOOGLE_SCRIPT_ERROR"));
            }
        }

        function failed() {
            cleanup();

            if (created) script.remove();

            reject(new Error("GOOGLE_SCRIPT_ERROR"));
        }

        const timeout = window.setTimeout(failed, 15000);

        script.addEventListener("load", loaded);
        script.addEventListener("error", failed);

        if (created) {
            document.head.appendChild(script);
        }

        if (window.google?.accounts?.id) {
            loaded();
        }
    }).catch((error) => {
        googleScriptPromise = null;
        throw error;
    });

    return googleScriptPromise;
}

export default function GoogleAccountLink() {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const buttonRef = useRef(null);
    const linkingRef = useRef(false);

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorKey, setErrorKey] = useState("");
    const [success, setSuccess] = useState(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        let active = true;

        const controller = new AbortController();

        setReady(false);
        setLoading(true);
        setErrorKey("");

        async function initialize() {
            let config;

            try {
                config = await apiRequest("/auth/config", {
                    signal: controller.signal,
                });

                if (!config?.googleClientId) {
                    throw new Error("GOOGLE_CONFIG_ERROR");
                }
            } catch {
                if (active) {
                    setErrorKey("configError");
                    setLoading(false);
                }

                return;
            }

            try {
                await loadGoogleScript();
            } catch {
                if (active) {
                    setErrorKey("scriptError");
                    setLoading(false);
                }

                return;
            }

            if (!active) return;

            try {
                window.google.accounts.id.initialize({
                    client_id: config.googleClientId,

                    callback: async ({ credential }) => {
                        if (!active || !credential || linkingRef.current) {
                            return;
                        }

                        linkingRef.current = true;

                        setErrorKey("");
                        setSuccess(false);
                        setLoading(true);

                        try {
                            await apiRequest("/auth/google/link", {
                                method: "POST",
                                body: JSON.stringify({
                                    credential,
                                }),
                            });

                            if (active) {
                                setSuccess(true);
                            }
                        } catch {
                            if (active) {
                                setErrorKey("linkError");
                            }
                        } finally {
                            linkingRef.current = false;

                            if (active) {
                                setLoading(false);
                            }
                        }
                    },
                });

                setReady(true);
                setLoading(false);
            } catch {
                if (active) {
                    setErrorKey("scriptError");
                    setLoading(false);
                }
            }
        }

        void initialize();

        return () => {
            active = false;
            controller.abort();
        };
    }, [revision]);

    useEffect(() => {
        const container = buttonRef.current;

        if (!ready || !container || !window.google?.accounts?.id) {
            return;
        }

        container.replaceChildren();

        window.google.accounts.id.renderButton(container, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: "300",
            locale: language,
        });

        return () => {
            container.replaceChildren();
        };
    }, [ready, language]);

    return (
        <div className="google-link-section">
            <h3>{text.title}</h3>
            <p>{text.description}</p>

            <div ref={buttonRef} />

            {loading && <p role="status">{text.loading}</p>}

            {errorKey && (
                <p className="form-error" role="alert">
                    {text[errorKey]}
                </p>
            )}

            {success && <p role="status">{text.success}</p>}

            {!ready && !loading && errorKey && (
                <button
                    type="button"
                    className="detail-secondary"
                    onClick={() => {
                        setSuccess(false);
                        setRevision((current) => current + 1);
                    }}
                >
                    {text.retry}
                </button>
            )}
        </div>
    );
}
