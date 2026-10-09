import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../utils/api";

let scriptPromise;

function loadGoogle() {
    if (window.google?.accounts?.id) return Promise.resolve();

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
            document.head.append(script);
        });
    }

    return scriptPromise;
}

export default function GoogleSignIn({ destination = "/", link = false, onLinked }) {
    const target = useRef(null);
    const linked = useRef(onLinked);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        linked.current = onLinked;
    }, [onLinked]);

    useEffect(() => {
        let active = true;

        async function load() {
            try {
                const config = await apiRequest("/auth/config");

                if (!config.googleClientId) {
                    if (active) setMessage("Google մուտքը հասանելի կլինի GOOGLE_CLIENT_ID-ը կարգավորելուց հետո։");
                    return;
                }

                await loadGoogle();
                if (!active || !target.current) return;

                window.google.accounts.id.initialize({
                    client_id: config.googleClientId,
                    callback: async ({ credential }) => {
                        if (!active) return;

                        setBusy(true);
                        setMessage("");

                        try {
                            const result = await apiRequest(link ? "/auth/google/link" : "/auth/google", {
                                method: "POST",
                                body: JSON.stringify({ credential })
                            });

                            if (!active) return;

                            if (link) {
                                setMessage("Google հաշիվը կապակցված է։");
                                linked.current?.();
                            } else {
                                localStorage.setItem("token", result.token);
                                localStorage.setItem("user", JSON.stringify(result.user));
                                window.dispatchEvent(new Event("session-changed"));
                                window.location.assign(destination === "/" && result.user.isAdmin ? "/admin" : destination);
                            }
                        } catch (error) {
                            if (active) setMessage(error.message);
                        } finally {
                            if (active) setBusy(false);
                        }
                    }
                });

                target.current.innerHTML = "";
                window.google.accounts.id.renderButton(target.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    shape: "rectangular",
                    text: link ? "continue_with" : "continue_with",
                    logo_alignment: "left",
                    width: Math.max(240, Math.min(400, target.current.clientWidth || 360))
                });
            } catch (error) {
                if (active) setMessage(error.message);
            }
        }

        void load();
        return () => {
            active = false;
        };
    }, [destination, link]);

    return (
        <div className="google-signin-modern">
            <div className="google-button-shell" ref={target} />
            {busy && <p role="status" className="google-status">Google հաշիվը ստուգվում է…</p>}
            {message && <p className="google-unavailable" role="status">{message}</p>}
        </div>
    );
}
