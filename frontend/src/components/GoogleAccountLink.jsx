import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../utils/api";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

export default function GoogleAccountLink() {
    const buttonRef = useRef(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        let script;

        async function initializeGoogle() {
            try {
                const config = await apiRequest("/auth/config");

                if (!config?.googleClientId) {
                    throw new Error("Google Client ID-ն կարգավորված չէ։");
                }

                if (!window.google?.accounts?.id) {
                    await new Promise((resolve, reject) => {
                        script = document.createElement("script");
                        script.src = GOOGLE_SCRIPT;
                        script.async = true;
                        script.defer = true;
                        script.onload = resolve;
                        script.onerror = () =>
                            reject(new Error("Google ծառայությունը չբեռնվեց։"));

                        document.head.appendChild(script);
                    });
                }

                if (!active || !buttonRef.current) return;

                window.google.accounts.id.initialize({
                    client_id: config.googleClientId,
                    callback: async ({ credential }) => {
                        if (!credential || !active) return;

                        setError("");
                        setSuccess("");
                        setLoading(true);

                        try {
                            const result = await apiRequest(
                                "/auth/google/link",
                                {
                                    method: "POST",
                                    body: JSON.stringify({
                                        credential,
                                    }),
                                },
                            );

                            if (active) {
                                setSuccess(
                                    result?.message ||
                                        "Google հաշիվը կապվել է։",
                                );
                            }
                        } catch (err) {
                            if (active) {
                                setError(
                                    err.message || "Google կապումը չհաջողվեց։",
                                );
                            }
                        } finally {
                            if (active) setLoading(false);
                        }
                    },
                });

                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                    width: 300,
                });

                setLoading(false);
            } catch (err) {
                if (active) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        initializeGoogle();

        return () => {
            active = false;
            script?.remove();
        };
    }, []);

    return (
        <div className="google-link-section">
            <h3>Կապել Google հաշիվը</h3>

            <p>
                Ընտրեք նույն Google email-ը, որով ստեղծված է Ձեր ArmMotors
                հաշիվը։
            </p>

            <div ref={buttonRef} />

            {loading && <p>Սպասեք...</p>}

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            {success && <p role="status">{success}</p>}
        </div>
    );
}
