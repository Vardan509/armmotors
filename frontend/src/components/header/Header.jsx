import { useEffect, useRef, useState } from "react";
import { setCurrencyByLanguage } from "../../utils/useCurrency";
import { apiRequest } from "../../utils/api";
import { useI18n } from "../../utils/i18n";
import { asset } from "../../utils/asset";
import "./Header.css";

// Աշխատում է localhost-ում և GitHub Pages-ում
const BASE = import.meta.env.BASE_URL;

function pageUrl(path = "/") {
    const cleanPath = String(path).replace(/^\/+/, "");
    return `${BASE}${cleanPath}`;
}

function currentPage() {
    const basePath = BASE.replace(/\/+$/, "");
    let path = window.location.pathname;

    if (basePath && (path === basePath || path.startsWith(basePath + "/"))) {
        path = path.slice(basePath.length);
    }

    return path.replace(/\/+$/, "") || "/";
}

function Icon({ name }) {
    const common = {
        width: 22,
        height: 22,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    if (name === "home") {
        return (
            <svg {...common}>
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M5.5 10.5V21h13V10.5" />
                <path d="M9.5 21v-6h5v6" />
            </svg>
        );
    }

    if (name === "heart") {
        return (
            <svg {...common}>
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
        );
    }

    if (name === "plus") {
        return (
            <svg {...common}>
                <path d="M12 5v14M5 12h14" />
            </svg>
        );
    }

    if (name === "chat") {
        return (
            <svg {...common}>
                <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2V11.5a9.5 9.5 0 0 1 19 0Z" />
                <path d="M7 10h10M7 14h6" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
    );
}

function LanguageMenu({
    selected,
    languages,
    open,
    onToggle,
    onSelect,
    compact = false,
}) {
    return (
        <div className={`language-menu ${compact ? "compact" : ""}`}>
            <button
                type="button"
                className="language-trigger"
                onClick={onToggle}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="Ընտրել լեզուն"
            >
                <span className="language-flag">{selected?.flag}</span>

                {!compact && (
                    <span className="language-name">
                        {selected?.code?.toUpperCase()}
                    </span>
                )}

                <span className="language-chevron">⌄</span>
            </button>

            {open && (
                <div className="language-popover">
                    {languages.map((item) => (
                        <button
                            type="button"
                            key={item.code}
                            className={
                                item.code === selected?.code ? "active" : ""
                            }
                            onClick={() => onSelect(item.code)}
                            aria-pressed={item.code === selected?.code}
                        >
                            <span>{item.flag}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const { language, languages, setLanguage, t } = useI18n();

    const [languageOpen, setLanguageOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const headerRef = useRef(null);

    const path = currentPage();

    let user = null;

    try {
        const savedUser = localStorage.getItem("user");
        user = savedUser ? JSON.parse(savedUser) : null;
    } catch {
        user = null;
    }

    const selectedLanguage =
        languages.find((item) => item.code === language) || languages[0];

    const isHome = path === "/";
    const isCars = path === "/cars" || path.startsWith("/cars/");
    const isFavorites = path === "/favorites";
    const isAccount = path === "/account";

    useEffect(() => {
        setCurrencyByLanguage(language);
    }, [language]);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                headerRef.current &&
                !headerRef.current.contains(event.target)
            ) {
                setLanguageOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setLanguageOpen(false);
            }
        }

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    async function logout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await apiRequest("/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.warn("Logout request failed:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.dispatchEvent(new Event("session-changed"));
            window.location.assign(pageUrl("/"));
        }
    }

    function changeLanguage(code) {
        if (!languages.some((item) => item.code === code)) {
            return;
        }

        setLanguage(code);
        setCurrencyByLanguage(code);
        setLanguageOpen(false);
    }

    function toggleLanguageMenu() {
        setLanguageOpen((previous) => !previous);
    }

    function openSupport() {
        window.dispatchEvent(new CustomEvent("open-support"));
    }

    function handleFavoritesClick(event) {
        const token = localStorage.getItem("token");

        if (!token) {
            event.preventDefault();

            window.location.assign(pageUrl("/login?next=%2Ffavorites"));
        }
    }

    return (
        <>
            <header className="site-header" ref={headerRef}>
                {/* DESKTOP HEADER */}
                <div className="desktop-header desktop-header-only">
                    <a
                        className="header-logo"
                        href={pageUrl("/")}
                        aria-label="ArmMotors"
                    >
                        <img
                            src={asset("/logo.png")}
                            alt="ArmMotors"
                            className="header-logo-image"
                        />
                    </a>

                    <nav className="header-nav" aria-label="Main navigation">
                        <a
                            href={pageUrl("/")}
                            className={
                                isHome ? "header-link active" : "header-link"
                            }
                            aria-current={isHome ? "page" : undefined}
                        >
                            {t("home")}
                        </a>

                        <a
                            href={pageUrl("/cars")}
                            className={
                                isCars ? "header-link active" : "header-link"
                            }
                            aria-current={isCars ? "page" : undefined}
                        >
                            {t("listings")}
                        </a>
                    </nav>

                    <div className="header-actions">
                        <LanguageMenu
                            selected={selectedLanguage}
                            languages={languages}
                            open={languageOpen}
                            onToggle={toggleLanguageMenu}
                            onSelect={changeLanguage}
                        />

                        {/* DESKTOP FAVORITES */}
                        <a
                            href={pageUrl("/favorites")}
                            onClick={handleFavoritesClick}
                            className={`header-icon-button ${
                                isFavorites ? "active" : ""
                            }`}
                            title={t("favorites")}
                            aria-label={t("favorites")}
                            aria-current={isFavorites ? "page" : undefined}
                        >
                            <Icon name="heart" />
                        </a>

                        {user ? (
                            <>
                                <a
                                    href={pageUrl("/account")}
                                    className={`header-icon-button ${
                                        isAccount ? "active" : ""
                                    }`}
                                    title={t("account")}
                                    aria-label={t("account")}
                                >
                                    <Icon name="account" />
                                </a>

                                {user.isAdmin && (
                                    <a
                                        href={pageUrl("/admin")}
                                        className="header-text-button"
                                    >
                                        {t("admin")}
                                    </a>
                                )}

                                <button
                                    type="button"
                                    className="header-text-button"
                                    onClick={logout}
                                    disabled={loggingOut}
                                >
                                    {t("logout")}
                                </button>
                            </>
                        ) : (
                            <a
                                href={pageUrl("/login")}
                                className="header-login-button"
                            >
                                {t("login")}
                            </a>
                        )}

                        <a
                            href={pageUrl("/add-product")}
                            className="header-add-button"
                        >
                            <Icon name="plus" />
                            <span>{t("addListing")}</span>
                        </a>
                    </div>
                </div>

                {/* MOBILE HEADER */}
                <div className="mobile-header-bar">
                    <a
                        className="mobile-header-logo"
                        href={pageUrl("/")}
                        aria-label={t("home")}
                    >
                        <img src={asset("/logo.png")} alt="ArmMotors" />
                    </a>

                    <div className="mobile-header-actions">
                        <LanguageMenu
                            selected={selectedLanguage}
                            languages={languages}
                            open={languageOpen}
                            onToggle={toggleLanguageMenu}
                            onSelect={changeLanguage}
                            compact
                        />

                        {/* MOBILE TOP FAVORITES */}
                        <a
                            className="mobile-like-link"
                            href={pageUrl("/favorites")}
                            onClick={handleFavoritesClick}
                            aria-label={t("favorites")}
                        >
                            <Icon name="heart" />
                        </a>
                    </div>
                </div>
            </header>

            {/* MOBILE BOTTOM MENU */}
            <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
                <a
                    href={pageUrl("/")}
                    className={isHome ? "active" : ""}
                    aria-current={isHome ? "page" : undefined}
                >
                    <Icon name="home" />
                    <span>{t("homeNav")}</span>
                </a>

                <a
                    href={pageUrl("/favorites")}
                    onClick={handleFavoritesClick}
                    className={isFavorites ? "active" : ""}
                    aria-current={isFavorites ? "page" : undefined}
                >
                    <Icon name="heart" />
                    <span>{t("favoritesNav")}</span>
                </a>

                <a
                    href={pageUrl("/add-product")}
                    className="mobile-add-nav"
                    aria-label={t("addListing")}
                >
                    <span className="mobile-add-circle">
                        <Icon name="plus" />
                    </span>

                    <span>{t("addNav")}</span>
                </a>

                <button type="button" onClick={openSupport}>
                    <Icon name="chat" />
                    <span>{t("chatNav")}</span>
                </button>

                <a
                    href={pageUrl(user ? "/account" : "/login")}
                    className={isAccount ? "active" : ""}
                    aria-current={isAccount ? "page" : undefined}
                >
                    <Icon name="account" />
                    <span>{t("accountNav")}</span>
                </a>
            </nav>
        </>
    );
}
