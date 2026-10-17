import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { apiRequest, saveAuthSession } from "../utils/api";

let scriptPromise = null;

// ==========================================
// LOAD GOOGLE SCRIPT
// ==========================================

function loadGoogle() {
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }

    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src = "https://accounts.google.com/gsi/client";

            script.async = true;
            script.defer = true;

            script.onload = resolve;

            script.onerror = () => {
                scriptPromise = null;

                reject(new Error("Google-ը բեռնել չհաջողվեց։"));
            };

            document.head.appendChild(script);
        });
    }

    return scriptPromise;
}

// ==========================================
// COMPONENT
// ==========================================

export default function GoogleSignIn({
    destination = "/",
    link = false,
    onLinked,
    remember = false,
}) {
    const navigate = useNavigate();

    const target = useRef(null);
    const linked = useRef(onLinked);
    const rememberRef = useRef(remember);

    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    // ======================================
    // KEEP CALLBACK VALUES UPDATED
    // ======================================

    useEffect(() => {
        linked.current = onLinked;
    }, [onLinked]);

    useEffect(() => {
        rememberRef.current = remember;
    }, [remember]);

    // ======================================
    // INITIALIZE GOOGLE
    // ======================================

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const config = await apiRequest("/auth/config");

                if (!config?.googleClientId) {
                    if (active) {
                        setMessage(
                            "Google մուտքը հասանելի կլինի GOOGLE_CLIENT_ID-ը կարգավորելուց հետո։",
                        );
                    }

                    return;
                }

                await loadGoogle();

                if (!active || !target.current) {
                    return;
                }

                window.google.accounts.id.initialize({
                    client_id: config.googleClientId,

                    callback: async ({ credential }) => {
                        if (!active || !credential) {
                            return;
                        }

                        setBusy(true);
                        setMessage("");

                        try {
                            const result = await apiRequest(
                                link ? "/auth/google/link" : "/auth/google",
                                {
                                    method: "POST",

                                    body: JSON.stringify({
                                        credential,

                                        ...(!link
                                            ? {
                                                  remember: rememberRef.current,
                                              }
                                            : {}),
                                    }),
                                },
                            );

                            if (!active) return;

                            if (link) {
                                setMessage("Google հաշիվը կապակցված է։");

                                linked.current?.();
                            } else {
                                saveAuthSession(result);

                                const redirectTo =
                                    destination === "/" && result.user?.isAdmin
                                        ? "/admin"
                                        : destination;

                                navigate(redirectTo, {
                                    replace: true,
                                });
                            }
                        } catch (error) {
                            if (active) {
                                setMessage(
                                    error.message || "Google մուտքը չհաջողվեց։",
                                );
                            }
                        } finally {
                            if (active) {
                                setBusy(false);
                            }
                        }
                    },
                });

                target.current.innerHTML = "";

                window.google.accounts.id.renderButton(target.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    shape: "rectangular",
                    text: "continue_with",
                    logo_alignment: "left",

                    width: Math.max(
                        240,
                        Math.min(400, target.current.clientWidth || 360),
                    ),
                });
            } catch (error) {
                if (active) {
                    setMessage(error.message || "Google-ը բեռնել չհաջողվեց։");
                }
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, [destination, link, navigate]);

    // ======================================
    // RENDER
    // ======================================

    return (
        <div className="google-signin-modern">
            <div className="google-button-shell" ref={target} />

            {busy && (
                <p role="status" className="google-status">
                    Google հաշիվը ստուգվում է…
                </p>
            )}

            {message && (
                <p className="google-unavailable" role="status">
                    {message}
                </p>
            )}
        </div>
    );
}
