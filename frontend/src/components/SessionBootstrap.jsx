import { useEffect } from "react";

import {
    getAccessToken,
    refreshAccessToken,
    clearAuthSession,
} from "../utils/api";

// ==========================================
// CHECK JWT EXPIRATION
// ==========================================

function isTokenValid(token) {
    if (!token || typeof token !== "string") {
        return false;
    }

    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            return false;
        }

        const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");

        const payload = JSON.parse(atob(normalized));

        if (!payload.exp) {
            return false;
        }

        return Number(payload.exp) * 1000 > Date.now() + 30_000;
    } catch {
        return false;
    }
}

// ==========================================
// SESSION BOOTSTRAP
// ==========================================

export default function SessionBootstrap({ onReady }) {
    useEffect(() => {
        let active = true;

        async function initializeSession() {
            try {
                const token = getAccessToken();

                // No local access token:
                // visitor can continue as a guest.
                if (!token) {
                    return;
                }

                // Valid token:
                // no refresh request is needed.
                if (isTokenValid(token)) {
                    return;
                }

                // Expired token:
                // try to restore the session.
                try {
                    await refreshAccessToken();
                } catch (error) {
                    if (error?.status === 401 || error?.status === 403) {
                        clearAuthSession();
                    } else {
                        console.warn(
                            "[ArmMotors] Session restore:",
                            error?.message,
                        );
                    }
                }
            } finally {
                if (active) {
                    onReady?.();
                }
            }
        }

        void initializeSession();

        return () => {
            active = false;
        };
    }, [onReady]);

    return null;
}
