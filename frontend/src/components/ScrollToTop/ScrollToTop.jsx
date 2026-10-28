import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import "./ScrollToTop.css";

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    const [visible, setVisible] = useState(false);

    // ==========================================
    // HANDLE SCROLL BUTTON
    // ==========================================

    useEffect(() => {
        function handleScroll() {
            setVisible(window.scrollY > 500);
        }

        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // ==========================================
    // SCROLL ON ROUTE CHANGE
    // ==========================================

    useEffect(() => {
        if (!hash) {
            window.scrollTo({
                top: 0,
                behavior: "instant",
            });

            return;
        }

        const id = decodeURIComponent(hash.slice(1));

        let attempts = 0;

        const scrollToElement = () => {
            const element = document.getElementById(id);

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                return;
            }

            if (attempts < 10) {
                attempts += 1;

                requestAnimationFrame(scrollToElement);
            }
        };

        requestAnimationFrame(scrollToElement);
    }, [pathname, hash]);

    // ==========================================
    // SCROLL TO TOP BUTTON
    // ==========================================

    if (!visible) {
        return null;
    }

    return (
        <button
            type="button"
            className="scroll-to-top"
            onClick={() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }}
            aria-label="Վերադառնալ էջի սկիզբ"
            title="Վերև"
        >
            ↑
        </button>
    );
}
