import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { setCurrencyByLanguage } from "../../utils/useCurrency";
import { apiRequest } from "../../utils/api";
import { useI18n } from "../../utils/i18n";
import { asset } from "../../utils/asset";
import { uiText } from "../../utils/localizeListing";

import NotificationBell from "../notifications/NotificationBell";

import "./Header.css";

function getStoredSession() {
    const token = localStorage.getItem("token");

    if (!token) {
        return { token: null, user: null };
    }

    try {
        const raw = localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;

        return {
            token,
            user:
                parsed && typeof parsed === "object"
                    ? parsed.user || parsed
                    : null,
        };
    } catch {
        return { token, user: null };
    }
}

function Icon({ name, size = 21 }) {
    const props = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.75,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    switch (name) {
        case "heart":
            return (
                <svg {...props}>
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
            );

        case "user":
            return (
                <svg {...props}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                </svg>
            );

        case "plus":
            return (
                <svg {...props}>
                    <path d="M12 5v14M5 12h14" />
                </svg>
            );

        case "menu":
            return (
                <svg {...props}>
                    <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
            );

        case "chevron":
            return (
                <svg {...props}>
                    <path d="m6 9 6 6 6-6" />
                </svg>
            );

        case "compare":
            return (
                <svg {...props}>
                    <path d="M8 4v16M16 4v16" />
                    <path d="M3 8h10M11 16h10" />
                    <path d="m5 6-2 2 2 2M19 14l2 2-2 2" />
                </svg>
            );

        case "message":
            return (
                <svg {...props}>
                    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2V11.5a9.5 9.5 0 0 1 19 0Z" />
                    <path d="M7 10h10M7 14h6" />
                </svg>
            );

        case "logout":
            return (
                <svg {...props}>
                    <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
                    <path d="M12 12h9m-4-4 4 4-4 4" />
                </svg>
            );

        case "settings":
            return (
                <svg {...props}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
                </svg>
            );

        case "home":
            return (
                <svg {...props}>
                    <path d="m3 11 9-7 9 7" />
                    <path d="M5 10v11h14V10M9 21v-7h6v7" />
                </svg>
            );

        default:
            return null;
    }
}

function LanguageMenu({
    selected,
    languages,
    open,
    onToggle,
    onSelect,
    label,
}) {
    return (
        <div className="am-language">
            <button
                type="button"
                className="am-language-button"
                onClick={onToggle}
                aria-expanded={open}
                aria-label={label}
            >
                <span>{selected?.code?.toUpperCase() || "HY"}</span>
                <Icon name="chevron" size={13} />
            </button>

            {open && (
                <div className="am-language-dropdown">
                    {languages.map((item) => (
                        <button
                            key={item.code}
                            type="button"
                            className={
                                selected?.code === item.code ? "selected" : ""
                            }
                            onClick={() => onSelect(item.code)}
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
    const navigate = useNavigate();
    const location = useLocation();

    const { language, languages, setLanguage, t } = useI18n();

    const tr = (key) => uiText(language, key);

    const [session, setSession] = useState(getStoredSession);
    const [languageOpen, setLanguageOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const [mobileViewport, setMobileViewport] = useState(() =>
        typeof window !== "undefined"
            ? window.matchMedia("(max-width: 768px)").matches
            : false,
    );

    const headerRef = useRef(null);

    const token = session.token;
    const user = session.user;
    const isLoggedIn = Boolean(token);

    const isAdmin =
        isLoggedIn && (user?.isAdmin === true || user?.role === "admin");

    const path = location.pathname;

    const isHome = path === "/";
    const isCars = path === "/cars" || path.startsWith("/cars/");
    const isFavorites = path === "/favorites";
    const isAccount = path === "/account";

    const selectedLanguage =
        languages.find((item) => item.code === language) || languages[0];

    const addListingUrl = isLoggedIn
        ? "/add-product"
        : "/login?next=%2Fadd-product";

    useEffect(() => {
        setCurrencyByLanguage(language);
    }, [language]);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 768px)");

        function updateViewport(event) {
            setMobileViewport(event.matches);
        }

        setMobileViewport(media.matches);
        media.addEventListener("change", updateViewport);

        return () => {
            media.removeEventListener("change", updateViewport);
        };
    }, []);

    useEffect(() => {
        function updateSession() {
            setSession(getStoredSession());
        }

        window.addEventListener("session-changed", updateSession);
        window.addEventListener("storage", updateSession);

        return () => {
            window.removeEventListener("session-changed", updateSession);
            window.removeEventListener("storage", updateSession);
        };
    }, []);

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        async function loadCurrentUser() {
            try {
                const result = await apiRequest("/auth/me");

                if (cancelled) return;

                const currentUser = result?.user || result;

                if (currentUser && typeof currentUser === "object") {
                    setSession((previous) => ({
                        ...previous,
                        user: currentUser,
                    }));
                }
            } catch (error) {
                if (cancelled) return;

                if (error?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    setSession({
                        token: null,
                        user: null,
                    });

                    window.dispatchEvent(new Event("session-changed"));
                } else {
                    console.warn("Unable to verify current user:", error);
                }
            }
        }

        void loadCurrentUser();

        return () => {
            cancelled = true;
        };
    }, [token]);

    useEffect(() => {
        setLanguageOpen(false);
        setMoreOpen(false);
        setMobileOpen(false);
    }, [location.pathname, location.search, location.hash]);

    useEffect(() => {
        function handleOutside(event) {
            if (
                headerRef.current &&
                !headerRef.current.contains(event.target)
            ) {
                setLanguageOpen(false);
                setMoreOpen(false);
                setMobileOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setLanguageOpen(false);
                setMoreOpen(false);
                setMobileOpen(false);
            }
        }

        document.addEventListener("pointerdown", handleOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function changeLanguage(code) {
        if (!languages.some((item) => item.code === code)) {
            return;
        }

        setLanguage(code);
        setCurrencyByLanguage(code);
        setLanguageOpen(false);
    }

    function handleFavoritesClick(event) {
        if (!isLoggedIn) {
            event.preventDefault();
            navigate("/login?next=%2Ffavorites");
        }
    }

    function openSupport() {
        window.dispatchEvent(new CustomEvent("open-support"));

        setMoreOpen(false);
        setMobileOpen(false);
    }

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

            setSession({
                token: null,
                user: null,
            });

            window.dispatchEvent(new Event("session-changed"));

            setMoreOpen(false);
            setMobileOpen(false);
            setLoggingOut(false);

            navigate("/", { replace: true });
        }
    }

    function toggleMobileMenu() {
        setMobileOpen((previous) => !previous);
        setMoreOpen(false);
        setLanguageOpen(false);
    }

    function toggleMoreMenu() {
        setMoreOpen((previous) => !previous);
        setLanguageOpen(false);
        setMobileOpen(false);
    }

    function toggleLanguageMenu() {
        setLanguageOpen((previous) => !previous);
        setMoreOpen(false);
    }

    function renderNotifications() {
        return (
            <div className="am-menu-notifications">
                <span>{tr("notifications")}</span>
                <NotificationBell />
            </div>
        );
    }

    const languageMenu = (
        <LanguageMenu
            selected={selectedLanguage}
            languages={languages}
            open={languageOpen}
            onToggle={toggleLanguageMenu}
            onSelect={changeLanguage}
            label={tr("changeLanguage")}
        />
    );

    return (
        <>
            <header className="site-header" ref={headerRef}>
                <div className="am-header-container">
                    <div className="am-header-top">
                        <Link to="/" className="am-logo" aria-label="ArmMotors">
                            <img src={asset("/logo.png")} alt="ArmMotors" />
                        </Link>

                        <div className="am-header-actions">
                            <Link
                                to="/favorites"
                                onClick={handleFavoritesClick}
                                className={`am-icon-button ${
                                    isFavorites ? "active" : ""
                                }`}
                                title={t("favorites")}
                                aria-label={t("favorites")}
                            >
                                <Icon name="heart" />
                            </Link>

                            {isLoggedIn ? (
                                <Link
                                    to="/account"
                                    className={`am-icon-button am-account-button ${
                                        isAccount ? "active" : ""
                                    }`}
                                    title={tr("account")}
                                    aria-label={tr("account")}
                                >
                                    <Icon name="user" />
                                </Link>
                            ) : (
                                <Link to="/login" className="am-login-button">
                                    {t("login")}
                                </Link>
                            )}

                            <Link to={addListingUrl} className="am-add-button">
                                <Icon name="plus" size={19} />
                                <span>{t("addListing")}</span>
                            </Link>

                            <button
                                type="button"
                                className="am-mobile-menu-button"
                                aria-label={tr("openMenu")}
                                aria-expanded={mobileOpen}
                                onClick={toggleMobileMenu}
                            >
                                <Icon name="menu" />
                            </button>
                        </div>
                    </div>

                    <div className="am-header-bottom">
                        <nav
                            className="am-main-nav"
                            aria-label={tr("mainMenu")}
                        >
                            <Link
                                to="/"
                                className={isHome ? "active" : ""}
                                aria-current={isHome ? "page" : undefined}
                            >
                                {t("home")}
                            </Link>

                            <Link
                                to="/cars"
                                className={isCars ? "active" : ""}
                                aria-current={isCars ? "page" : undefined}
                            >
                                {t("listings")}
                            </Link>
                        </nav>

                        <div className="am-header-secondary">
                            {languageMenu}

                            <div className="am-more">
                                <button
                                    type="button"
                                    className="am-more-trigger"
                                    aria-expanded={moreOpen}
                                    onClick={toggleMoreMenu}
                                >
                                    {tr("more")}
                                    <Icon name="chevron" size={14} />
                                </button>

                                {moreOpen && (
                                    <div className="am-more-dropdown">
                                        <Link
                                            to="/compare"
                                            onClick={() => setMoreOpen(false)}
                                        >
                                            <Icon name="compare" size={18} />
                                            {tr("compare")}
                                        </Link>

                                        {isLoggedIn && (
                                            <Link
                                                to="/messages"
                                                onClick={() =>
                                                    setMoreOpen(false)
                                                }
                                            >
                                                <Icon
                                                    name="message"
                                                    size={18}
                                                />
                                                {tr("messages")}
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={openSupport}
                                        >
                                            <Icon name="message" size={18} />
                                            {tr("contactUs")}
                                        </button>

                                        {isLoggedIn &&
                                            !mobileViewport &&
                                            renderNotifications()}

                                        <div className="am-menu-divider" />

                                        {isLoggedIn ? (
                                            <>
                                                <Link
                                                    to="/account"
                                                    onClick={() =>
                                                        setMoreOpen(false)
                                                    }
                                                >
                                                    <Icon
                                                        name="user"
                                                        size={18}
                                                    />
                                                    {tr("account")}
                                                </Link>

                                                {isAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() =>
                                                            setMoreOpen(false)
                                                        }
                                                    >
                                                        <Icon
                                                            name="settings"
                                                            size={18}
                                                        />
                                                        {tr("administrator")}
                                                    </Link>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={logout}
                                                    disabled={loggingOut}
                                                >
                                                    <Icon
                                                        name="logout"
                                                        size={18}
                                                    />
                                                    {loggingOut
                                                        ? tr("logoutProgress")
                                                        : t("logout")}
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                to="/login"
                                                onClick={() =>
                                                    setMoreOpen(false)
                                                }
                                            >
                                                <Icon name="user" size={18} />
                                                {t("login")}
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {mobileOpen && (
                        <nav
                            className="am-mobile-dropdown"
                            aria-label={tr("mobileMenu")}
                        >
                            <Link to="/">{t("home")}</Link>

                            <Link to="/cars">{t("listings")}</Link>

                            <Link to="/compare">{tr("compare")}</Link>

                            {isLoggedIn && (
                                <Link to="/messages">{tr("messages")}</Link>
                            )}

                            <button type="button" onClick={openSupport}>
                                {tr("contactUs")}
                            </button>

                            <div className="am-mobile-language">
                                <LanguageMenu
                                    selected={selectedLanguage}
                                    languages={languages}
                                    open={languageOpen}
                                    onToggle={toggleLanguageMenu}
                                    onSelect={changeLanguage}
                                    label={tr("changeLanguage")}
                                />
                            </div>

                            {isLoggedIn && mobileViewport && (
                                <div className="am-mobile-notifications">
                                    {renderNotifications()}
                                </div>
                            )}

                            {isAdmin && (
                                <Link to="/admin">{tr("administrator")}</Link>
                            )}

                            {isLoggedIn ? (
                                <>
                                    <Link to="/account">{tr("account")}</Link>

                                    <button
                                        type="button"
                                        onClick={logout}
                                        disabled={loggingOut}
                                    >
                                        {loggingOut
                                            ? tr("logoutProgress")
                                            : t("logout")}
                                    </button>
                                </>
                            ) : (
                                <Link to="/login">{t("login")}</Link>
                            )}
                        </nav>
                    )}
                </div>
            </header>

            <nav className="am-mobile-bottom-nav" aria-label={tr("quickLinks")}>
                <Link to="/" className={isHome ? "active" : ""}>
                    <Icon name="home" size={20} />
                    <span>{t("homeNav")}</span>
                </Link>

                <Link
                    to="/favorites"
                    onClick={handleFavoritesClick}
                    className={isFavorites ? "active" : ""}
                >
                    <Icon name="heart" size={20} />
                    <span>{t("favoritesNav")}</span>
                </Link>

                <Link to={addListingUrl} className="am-bottom-add">
                    <span className="am-bottom-add-icon">
                        <Icon name="plus" size={22} />
                    </span>
                    <span>{t("addNav")}</span>
                </Link>

                <button type="button" onClick={openSupport}>
                    <Icon name="message" size={20} />
                    <span>{t("chatNav")}</span>
                </button>

                {isLoggedIn ? (
                    <Link to="/account" className={isAccount ? "active" : ""}>
                        <Icon name="user" size={20} />
                        <span>{t("accountNav")}</span>
                    </Link>
                ) : (
                    <Link to="/login">
                        <Icon name="user" size={20} />
                        <span>{t("login")}</span>
                    </Link>
                )}
            </nav>
        </>
    );
}
