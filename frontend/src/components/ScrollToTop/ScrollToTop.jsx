import { useEffect, useState } from "react";
import "./ScrollToTop.css";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setVisible(window.scrollY > 500);
        }

        handleScroll();

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    if (!visible) return null;

    return (
        <button
            type="button"
            className="scroll-to-top"
            onClick={() =>
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                })
            }
            aria-label="Վերադառնալ էջի սկիզբ"
            title="Վերև"
        >
            ↑
        </button>
    );
}
