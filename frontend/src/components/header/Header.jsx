import { useEffect, useRef, useState } from "react";

import { setCurrencyByLanguage } from "../../utils/useCurrency";
import { apiRequest } from "../../utils/api";
import { useI18n } from "../../utils/i18n";
import { asset } from "../../utils/asset";

import NotificationBell from "../notifications/NotificationBell";

import "./Header.css";

const BASE = import.meta.env.BASE_URL;

function pageUrl(path = "/") {
    return `${BASE}${String(path).replace(/^\/+/, "")}`;
}

function currentPage() {
    const base = BASE.replace(/\/+$/, "");
    let path = window.location.pathname;

    if (base && (path === base || path.startsWith(base + "/"))) {
        path = path.slice(base.length);
    }

    return path.replace(/\/+$/, "") || "/";
}

// Օգտատիրոջ տվյալները վերցնում ենք միայն
// այն դեպքում, երբ կա նաև token։
function getStoredSession() {
    const token = localStorage.getItem("token");

    if (!token) {
        return {
            token: null,
            user: null,
        };
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
        return {
            token,
            user: null,
        };
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
        case "search":
            return (
                <svg {...props}>
                    <circle cx="10.8" cy="10.8" r="7.2" />
                    <path d="m16.3 16.3 4.7 4.7" />
                </svg>
            );

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

function LanguageMenu({ selected, languages, open, onToggle, onSelect }) {
    return (
        <div className="am-language">
            <button
                type="button"
                className="am-language-button"
                onClick={onToggle}
                aria-expanded={open}
                aria-label="Փոխել լեզուն"
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
    const { language, languages, setLanguage, t } = useI18n();

    const [session, setSession] = useState(getStoredSession);

    const [languageOpen, setLanguageOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const headerRef = useRef(null);

    const token = session.token;
    const user = session.user;

    // Կոճակի տեսանելիությունը որոշվում է
    // պահպանված մուտքի տվյալներով։
    const isLoggedIn = Boolean(token);

    const isAdmin =
        isLoggedIn && (user?.isAdmin === true || user?.role === "admin");

    const path = currentPage();

    const isHome = path === "/";

    const isCars = path === "/cars" || path.startsWith("/cars/");

    const isSearch = path === "/search";
    const isFavorites = path === "/favorites";
    const isAccount = path === "/account";

    const selectedLanguage =
        languages.find((item) => item.code === language) || languages[0];

    const addListingUrl = isLoggedIn
        ? pageUrl("/add-product")
        : pageUrl("/login?next=%2Fadd-product");

    // =====================================
    // LANGUAGE AND CURRENCY
    // =====================================

    useEffect(() => {
        setCurrencyByLanguage(language);
    }, [language]);

    // =====================================
    // SESSION
    // =====================================

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

    // Տվյալները ստուգում ենք backend-ից,
    // որպեսզի միայն localStorage-ի user դաշտին
    // չվստահենք։
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

                // Միայն անվավեր session-ի դեպքում
                // թաքցնում ենք օգտատիրոջ նշանը։
                if (error?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    setSession({
                        token: null,
                        user: null,
                    });
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

    // =====================================
    // CLOSE DROPDOWNS
    // =====================================

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

    // =====================================
    // CHANGE LANGUAGE
    // =====================================

    function changeLanguage(code) {
        if (!languages.some((item) => item.code === code)) {
            return;
        }

        setLanguage(code);
        setCurrencyByLanguage(code);
        setLanguageOpen(false);
    }

    // =====================================
    // FAVORITES
    // =====================================

    function handleFavoritesClick(event) {
        if (!isLoggedIn) {
            event.preventDefault();

            window.location.assign(pageUrl("/login?next=%2Ffavorites"));
        }
    }

    // =====================================
    // SUPPORT
    // =====================================

    function openSupport() {
        window.dispatchEvent(new CustomEvent("open-support"));

        setMoreOpen(false);
        setMobileOpen(false);
    }

    // =====================================
    // LOGOUT
    // =====================================

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

            window.location.assign(pageUrl("/"));
        }
    }

    return (
        <>
            <header className="site-header" ref={headerRef}>
                <div className="am-header-container">
                    {/* HEADER TOP */}

                    <div className="am-header-top">
                        {/* LOGO */}

                        <a
                            href={pageUrl("/")}
                            className="am-logo"
                            aria-label="ArmMotors գլխավոր էջ"
                        >
                            <img src={asset("/logo.png")} alt="ArmMotors" />
                        </a>

                        {/* RIGHT ACTIONS */}

                        <div className="am-header-actions">
                            {/* SEARCH */}

                            <a
                                href={pageUrl("/search")}
                                className={`am-icon-button ${
                                    isSearch ? "active" : ""
                                }`}
                                title="Որոնում"
                                aria-label="Որոնում"
                            >
                                <Icon name="search" />
                            </a>

                            {/* FAVORITES */}

                            <a
                                href={pageUrl("/favorites")}
                                onClick={handleFavoritesClick}
                                className={`am-icon-button ${
                                    isFavorites ? "active" : ""
                                }`}
                                title={t("favorites")}
                                aria-label={t("favorites")}
                            >
                                <Icon name="heart" />
                            </a>

                            {/* LOGIN / ACCOUNT */}

                            {isLoggedIn ? (
                                <a
                                    href={pageUrl("/account")}
                                    className={`am-icon-button am-account-button ${
                                        isAccount ? "active" : ""
                                    }`}
                                    title="Իմ հաշիվը"
                                    aria-label="Իմ հաշիվը"
                                >
                                    <Icon name="user" />
                                </a>
                            ) : (
                                <a
                                    href={pageUrl("/login")}
                                    className="am-login-button"
                                >
                                    {t("login")}
                                </a>
                            )}

                            {/* ADD PRODUCT */}

                            <a href={addListingUrl} className="am-add-button">
                                <Icon name="plus" size={19} />

                                <span>{t("addListing")}</span>
                            </a>

                            {/* MOBILE MENU BUTTON */}

                            <button
                                type="button"
                                className="am-mobile-menu-button"
                                aria-label="Բացել ընտրացանկը"
                                aria-expanded={mobileOpen}
                                onClick={() => setMobileOpen((old) => !old)}
                            >
                                <Icon name="menu" />
                            </button>
                        </div>
                    </div>

                    {/* HEADER BOTTOM */}

                    <div className="am-header-bottom">
                        {/* NAVIGATION */}

                        <nav
                            className="am-main-nav"
                            aria-label="Հիմնական ընտրացանկ"
                        >
                            <a
                                href={pageUrl("/")}
                                className={isHome ? "active" : ""}
                                aria-current={isHome ? "page" : undefined}
                            >
                                {t("home")}
                            </a>

                            <a
                                href={pageUrl("/cars")}
                                className={isCars ? "active" : ""}
                                aria-current={isCars ? "page" : undefined}
                            >
                                {t("listings")}
                            </a>

                            <a href={pageUrl("/#brands")}>Մակնիշներ</a>
                        </nav>

                        {/* LANGUAGE AND MORE */}

                        <div className="am-header-secondary">
                            <LanguageMenu
                                selected={selectedLanguage}
                                languages={languages}
                                open={languageOpen}
                                onToggle={() => {
                                    setLanguageOpen((old) => !old);

                                    setMoreOpen(false);
                                }}
                                onSelect={changeLanguage}
                            />

                            <div className="am-more">
                                <button
                                    type="button"
                                    className="am-more-trigger"
                                    aria-expanded={moreOpen}
                                    onClick={() => {
                                        setMoreOpen((old) => !old);

                                        setLanguageOpen(false);
                                    }}
                                >
                                    Ավելին
                                    <Icon name="chevron" size={14} />
                                </button>

                                {moreOpen && (
                                    <div className="am-more-dropdown">
                                        {/* COMPARE */}

                                        <a href={pageUrl("/compare")}>
                                            <Icon name="compare" size={18} />
                                            Համեմատել
                                        </a>

                                        {/* MESSAGES */}

                                        {isLoggedIn && (
                                            <a href={pageUrl("/messages")}>
                                                <Icon
                                                    name="message"
                                                    size={18}
                                                />
                                                Հաղորդագրություններ
                                            </a>
                                        )}

                                        {/* SUPPORT */}

                                        <button
                                            type="button"
                                            onClick={openSupport}
                                        >
                                            <Icon name="message" size={18} />
                                            Կապ մեզ հետ
                                        </button>

                                        {/* NOTIFICATIONS */}

                                        {isLoggedIn && (
                                            <div className="am-menu-notifications">
                                                <span>Ծանուցումներ</span>

                                                <NotificationBell />
                                            </div>
                                        )}

                                        <div className="am-menu-divider" />

                                        {/* LOGGED IN */}

                                        {isLoggedIn ? (
                                            <>
                                                <a href={pageUrl("/account")}>
                                                    <Icon
                                                        name="user"
                                                        size={18}
                                                    />
                                                    Իմ հաշիվը
                                                </a>

                                                {/* ADMIN */}

                                                {isAdmin && (
                                                    <a href={pageUrl("/admin")}>
                                                        <Icon
                                                            name="settings"
                                                            size={18}
                                                        />
                                                        Ադմինիստրատոր
                                                    </a>
                                                )}

                                                {/* LOGOUT */}

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
                                                        ? "Դուրս է գալիս..."
                                                        : t("logout")}
                                                </button>
                                            </>
                                        ) : (
                                            <a href={pageUrl("/login")}>
                                                <Icon name="user" size={18} />

                                                {t("login")}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MOBILE DROPDOWN */}

                    {mobileOpen && (
                        <nav
                            className="am-mobile-dropdown"
                            aria-label="Հեռախոսի ընտրացանկ"
                        >
                            <a href={pageUrl("/")}>{t("home")}</a>

                            <a href={pageUrl("/cars")}>{t("listings")}</a>

                            <a href={pageUrl("/#brands")}>Մակնիշներ</a>

                            <a href={pageUrl("/search")}>Որոնում</a>

                            <a href={pageUrl("/compare")}>Համեմատել</a>

                            {isLoggedIn && (
                                <a href={pageUrl("/messages")}>
                                    Հաղորդագրություններ
                                </a>
                            )}

                            <button type="button" onClick={openSupport}>
                                Կապ մեզ հետ
                            </button>

                            <div className="am-mobile-language">
                                <LanguageMenu
                                    selected={selectedLanguage}
                                    languages={languages}
                                    open={languageOpen}
                                    onToggle={() =>
                                        setLanguageOpen((old) => !old)
                                    }
                                    onSelect={changeLanguage}
                                />
                            </div>

                            {isLoggedIn && (
                                <div className="am-mobile-notifications">
                                    <span>Ծանուցումներ</span>

                                    <NotificationBell />
                                </div>
                            )}

                            {isAdmin && (
                                <a href={pageUrl("/admin")}>Ադմինիստրատոր</a>
                            )}

                            {isLoggedIn ? (
                                <>
                                    <a href={pageUrl("/account")}>Իմ հաշիվը</a>

                                    <button
                                        type="button"
                                        onClick={logout}
                                        disabled={loggingOut}
                                    >
                                        {t("logout")}
                                    </button>
                                </>
                            ) : (
                                <a href={pageUrl("/login")}>{t("login")}</a>
                            )}
                        </nav>
                    )}
                </div>
            </header>

            {/* MOBILE BOTTOM NAVIGATION */}

            <nav className="am-mobile-bottom-nav" aria-label="Արագ անցումներ">
                <a href={pageUrl("/")} className={isHome ? "active" : ""}>
                    <Icon name="home" size={20} />

                    <span>{t("homeNav")}</span>
                </a>

                <a
                    href={pageUrl("/favorites")}
                    onClick={handleFavoritesClick}
                    className={isFavorites ? "active" : ""}
                >
                    <Icon name="heart" size={20} />

                    <span>{t("favoritesNav")}</span>
                </a>

                <a href={addListingUrl} className="am-bottom-add">
                    <span className="am-bottom-add-icon">
                        <Icon name="plus" size={22} />
                    </span>

                    <span>{t("addNav")}</span>
                </a>

                <button type="button" onClick={openSupport}>
                    <Icon name="message" size={20} />

                    <span>{t("chatNav")}</span>
                </button>

                {isLoggedIn ? (
                    <a
                        href={pageUrl("/account")}
                        className={isAccount ? "active" : ""}
                    >
                        <Icon name="user" size={20} />

                        <span>{t("accountNav")}</span>
                    </a>
                ) : (
                    <a href={pageUrl("/login")}>
                        <Icon name="user" size={20} />

                        <span>{t("login")}</span>
                    </a>
                )}
            </nav>
        </>
    );
}
