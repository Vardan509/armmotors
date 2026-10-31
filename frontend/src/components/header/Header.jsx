import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import { useI18n } from "../../utils/i18n";
import { uiText } from "../../utils/localizeListing";
import { setCurrencyByLanguage } from "../../utils/useCurrency";
import { asset } from "../../utils/asset";

import NotificationBell from "../notifications/NotificationBell";

import "./Header.css";

function readSession() {
    const token = localStorage.getItem("token");

    if (!token) return { token: null, user: null };

    try {
        const stored = JSON.parse(localStorage.getItem("user") || "null");

        return {
            token,
            user: stored?.user || stored || null,
        };
    } catch {
        return { token, user: null };
    }
}

const ICONS = {
    heart: (
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    home: (
        <>
            <path d="m3 11 9-7 9 7" />
            <path d="M5 10v11h14V10M9 21v-7h6v7" />
        </>
    ),
    cars: (
        <>
            <path d="m5 11 2-5h10l2 5" />
            <rect x="3" y="11" width="18" height="7" rx="2" />
            <path d="M6 18v2M18 18v2M7 14h1M16 14h1" />
        </>
    ),
    compare: <path d="M4 7h16M16 3l4 4-4 4M20 17H4M8 13l-4 4 4 4" />,
    message: (
        <>
            <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2V11.5a9.5 9.5 0 0 1 19 0Z" />
            <path d="M7 10h10M7 14h6" />
        </>
    ),
    logout: (
        <>
            <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
            <path d="M12 12h9m-4-4 4 4-4 4" />
        </>
    ),
    settings: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
        </>
    ),
};

function Icon({ name, size = 20 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {ICONS[name]}
        </svg>
    );
}

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const { language, languages, setLanguage, t } = useI18n();

    const tr = (key) => uiText(language, key);

    const [session, setSession] = useState(readSession);
    const [openMenu, setOpenMenu] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);

    const [mobile, setMobile] = useState(
        () => window.matchMedia("(max-width: 768px)").matches,
    );

    const headerRef = useRef(null);
    const mobileButtonRef = useRef(null);

    const loggedIn = Boolean(session.token);

    const isAdmin =
        loggedIn &&
        (session.user?.isAdmin === true || session.user?.role === "admin");

    const path = location.pathname;

    const isHome = path === "/";
    const isCars = path === "/cars" || path.startsWith("/cars/");
    const isFavorites = path === "/favorites";
    const isAccount = path === "/account";

    const mobileOpen = mobile && openMenu === "mobile";

    const addListingUrl = loggedIn
        ? "/add-product"
        : "/login?next=%2Fadd-product";

    useEffect(() => {
        setCurrencyByLanguage(language);
    }, [language]);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 768px)");

        function change(event) {
            setMobile(event.matches);
            setOpenMenu("");
        }

        media.addEventListener("change", change);

        return () => {
            media.removeEventListener("change", change);
        };
    }, []);

    useEffect(() => {
        function updateSession() {
            setSession(readSession());
        }

        window.addEventListener("session-changed", updateSession);

        window.addEventListener("storage", updateSession);

        return () => {
            window.removeEventListener("session-changed", updateSession);

            window.removeEventListener("storage", updateSession);
        };
    }, []);

    useEffect(() => {
        if (!session.token) return;

        const controller = new AbortController();

        async function loadUser() {
            try {
                const result = await apiRequest("/auth/me", {
                    signal: controller.signal,
                });

                if (controller.signal.aborted) return;

                const user = result?.user || result;

                if (user && typeof user === "object") {
                    setSession((current) => ({
                        ...current,
                        user,
                    }));
                }
            } catch {
                /*
                 * SessionBootstrap և apiRequest-ը
                 * շարունակում են կառավարել սեսիան։
                 */
            }
        }

        void loadUser();

        return () => controller.abort();
    }, [session.token]);

    useEffect(() => {
        setOpenMenu("");
    }, [location.pathname, location.search, location.hash]);

    useEffect(() => {
        function outside(event) {
            if (!headerRef.current?.contains(event.target)) {
                setOpenMenu("");
            }
        }

        function keyboard(event) {
            if (event.key === "Escape") {
                setOpenMenu("");

                if (mobileOpen) {
                    mobileButtonRef.current?.focus();
                }
            }
        }

        document.addEventListener("pointerdown", outside);
        document.addEventListener("keydown", keyboard);

        return () => {
            document.removeEventListener("pointerdown", outside);

            document.removeEventListener("keydown", keyboard);
        };
    }, [mobileOpen]);

    useEffect(() => {
        if (!mobileOpen) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    function toggleMenu(name) {
        setOpenMenu((current) => (current === name ? "" : name));
    }

    function changeLanguage(code) {
        setLanguage(code);
        setCurrencyByLanguage(code);
        setOpenMenu("");
    }

    function favoritesClick(event) {
        setOpenMenu("");

        if (!loggedIn) {
            event.preventDefault();
            navigate("/login?next=%2Ffavorites");
        }
    }

    function openSupport() {
        setOpenMenu("");

        window.dispatchEvent(new CustomEvent("open-support"));
    }

    async function logout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await apiRequest("/auth/logout", {
                method: "POST",
            });
        } catch {
            // Տեղային սեսիան փակվում է նաև ցանցային սխալի դեպքում։
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setSession({ token: null, user: null });
            setOpenMenu("");
            setLoggingOut(false);

            window.dispatchEvent(new Event("session-changed"));

            navigate("/", { replace: true });
        }
    }

    function languageControl() {
        return (
            <div className="am-language">
                <button
                    type="button"
                    className="am-language-button"
                    onClick={() => toggleMenu("language")}
                    aria-label={tr("changeLanguage")}
                    aria-expanded={openMenu === "language"}
                >
                    <span>{language.toUpperCase()}</span>

                    <Icon name="chevron" size={12} />
                </button>

                {openMenu === "language" && (
                    <div className="am-language-dropdown">
                        {languages.map((item) => (
                            <button
                                type="button"
                                key={item.code}
                                className={
                                    item.code === language ? "selected" : ""
                                }
                                onClick={() => changeLanguage(item.code)}
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

    function menuContent() {
        return (
            <>
                {mobile && (
                    <>
                        <Link to="/">
                            <Icon name="home" />
                            <span>{t("home")}</span>
                        </Link>

                        <Link to="/cars">
                            <Icon name="cars" />
                            <span>{t("listings")}</span>
                        </Link>
                    </>
                )}

                <Link
                    to="/favorites"
                    onClick={favoritesClick}
                    className={isFavorites ? "active" : ""}
                >
                    <Icon name="heart" />
                    <span>{t("favorites")}</span>
                </Link>

                <Link to="/compare">
                    <Icon name="compare" />
                    <span>{tr("compare")}</span>
                </Link>

                {loggedIn && (
                    <Link to="/messages">
                        <Icon name="message" />
                        <span>{tr("messages")}</span>
                    </Link>
                )}

                <button type="button" onClick={openSupport}>
                    <Icon name="message" />
                    <span>{tr("contactUs")}</span>
                </button>

                {loggedIn && (
                    <div className="am-menu-notifications">
                        <span>{tr("notifications")}</span>
                        <NotificationBell />
                    </div>
                )}

                <div className="am-menu-divider" />

                <Link to={addListingUrl} className="am-menu-add-link">
                    <Icon name="plus" />
                    <span>{t("addListing")}</span>
                </Link>

                {loggedIn ? (
                    <>
                        <Link to="/account">
                            <Icon name="user" />
                            <span>{tr("account")}</span>
                        </Link>

                        {isAdmin && (
                            <Link to="/admin">
                                <Icon name="settings" />
                                <span>{tr("administrator")}</span>
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={logout}
                            disabled={loggingOut}
                        >
                            <Icon name="logout" />

                            <span>
                                {loggingOut
                                    ? tr("logoutProgress")
                                    : t("logout")}
                            </span>
                        </button>
                    </>
                ) : (
                    <Link to="/login">
                        <Icon name="user" />
                        <span>{t("login")}</span>
                    </Link>
                )}
            </>
        );
    }

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    className="am-header-backdrop"
                    aria-label={t("close")}
                    onClick={() => setOpenMenu("")}
                />
            )}

            <header className="site-header" ref={headerRef}>
                <div className="am-header-container">
                    <div className="am-header-top">
                        <Link to="/" className="am-logo" aria-label="ArmMotors">
                            <img src={asset("/logo.png")} alt="ArmMotors" />
                        </Link>

                        <div className="am-header-actions">
                            {!mobile && (
                                <Link
                                    to="/favorites"
                                    onClick={favoritesClick}
                                    className="am-icon-button"
                                    aria-label={t("favorites")}
                                    title={t("favorites")}
                                >
                                    <Icon name="heart" />
                                </Link>
                            )}

                            {mobile && languageControl()}

                            <Link
                                to={loggedIn ? "/account" : "/login"}
                                className={
                                    mobile || loggedIn
                                        ? "am-icon-button am-account-button"
                                        : "am-login-button"
                                }
                                aria-label={
                                    loggedIn ? tr("account") : t("login")
                                }
                                title={loggedIn ? tr("account") : t("login")}
                            >
                                {mobile || loggedIn ? (
                                    <Icon name="user" />
                                ) : (
                                    t("login")
                                )}
                            </Link>

                            {!mobile && (
                                <Link
                                    to={addListingUrl}
                                    className="am-add-button"
                                >
                                    <Icon name="plus" size={18} />
                                    <span>{t("addListing")}</span>
                                </Link>
                            )}

                            {mobile && (
                                <button
                                    ref={mobileButtonRef}
                                    type="button"
                                    className={`am-mobile-menu-button ${
                                        mobileOpen ? "is-open" : ""
                                    }`}
                                    aria-label={
                                        mobileOpen ? t("close") : tr("openMenu")
                                    }
                                    aria-expanded={mobileOpen}
                                    aria-controls={
                                        mobileOpen
                                            ? "am-mobile-menu"
                                            : undefined
                                    }
                                    onClick={() => toggleMenu("mobile")}
                                >
                                    <Icon
                                        name={mobileOpen ? "close" : "menu"}
                                    />
                                </button>
                            )}
                        </div>
                    </div>

                    {!mobile && (
                        <div className="am-header-bottom">
                            <nav
                                className="am-main-nav"
                                aria-label={tr("mainMenu")}
                            >
                                <Link to="/" className={isHome ? "active" : ""}>
                                    {t("home")}
                                </Link>

                                <Link
                                    to="/cars"
                                    className={isCars ? "active" : ""}
                                >
                                    {t("listings")}
                                </Link>
                            </nav>

                            <div className="am-header-secondary">
                                {languageControl()}

                                <div className="am-more">
                                    <button
                                        type="button"
                                        className="am-more-trigger"
                                        aria-expanded={openMenu === "more"}
                                        onClick={() => toggleMenu("more")}
                                    >
                                        {tr("more")}
                                        <Icon name="chevron" size={13} />
                                    </button>

                                    {openMenu === "more" && (
                                        <nav
                                            className="am-more-dropdown"
                                            aria-label={tr("mainMenu")}
                                        >
                                            {menuContent()}
                                        </nav>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {mobileOpen && (
                        <nav
                            id="am-mobile-menu"
                            className="am-mobile-dropdown"
                            aria-label={tr("mobileMenu")}
                        >
                            {menuContent()}
                        </nav>
                    )}
                </div>
            </header>

            <nav className="am-mobile-bottom-nav" aria-label={tr("quickLinks")}>
                <Link to="/" className={isHome ? "active" : ""}>
                    <Icon name="home" />
                    <span>{t("homeNav")}</span>
                </Link>

                <Link
                    to="/favorites"
                    onClick={favoritesClick}
                    className={isFavorites ? "active" : ""}
                >
                    <Icon name="heart" />
                    <span>{t("favoritesNav")}</span>
                </Link>

                <Link to={addListingUrl} className="am-bottom-add">
                    <span className="am-bottom-add-icon">
                        <Icon name="plus" />
                    </span>
                    <span>{t("addNav")}</span>
                </Link>

                <button type="button" onClick={openSupport}>
                    <Icon name="message" />
                    <span>{t("chatNav")}</span>
                </button>

                <Link
                    to={loggedIn ? "/account" : "/login"}
                    className={isAccount ? "active" : ""}
                >
                    <Icon name="user" />
                    <span>{loggedIn ? t("accountNav") : t("login")}</span>
                </Link>
            </nav>
        </>
    );
}
