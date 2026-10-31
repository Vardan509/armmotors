import { useCallback, useEffect, useState } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    Navigate,
    useParams,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import HomePage from "./components/header/HomePage";
import CarsPage from "./pages/CarsPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AddProductPage from "./pages/AddProductPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import SellerPage from "./pages/SellerPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminReports from "./pages/admin/AdminReports";
import FavoritesPage from "./pages/FavoritesPage";
import AccountPage from "./pages/AccountPage";
import ComparePage from "./pages/ComparePage";
import SearchPage from "./pages/SearchPage";
import MonetizationPage from "./pages/MonetizationPage";
import MessagesPage from "./components/messaging/MessagesPage";
import SessionBootstrap from "./components/SessionBootstrap";

import { getAccessToken } from "./utils/api";

import "./components/header/HomePage.css";
import "./pages/CarDetailsPage.css";
import "./pages/ComparePage.css";
import "./global.css";
import "./styles/ArmMotorsSearchFix.css";

const BASE = import.meta.env.BASE_URL;

// ==========================================
// AUTHENTICATION
// ==========================================

function hasValidAccessToken() {
    const token = getAccessToken();

    if (!token) return false;

    try {
        const parts = token.split(".");

        if (parts.length !== 3) return false;

        const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );

        return Number(payload.exp || 0) * 1000 > Date.now() + 10_000;
    } catch {
        return false;
    }
}

// ==========================================
// PROTECTED ADD PRODUCT
// ==========================================

function ProtectedAddProduct() {
    const [authenticated, setAuthenticated] = useState(hasValidAccessToken);

    useEffect(() => {
        function updateSession() {
            setAuthenticated(hasValidAccessToken());
        }

        window.addEventListener("session-changed", updateSession);

        window.addEventListener("storage", updateSession);

        return () => {
            window.removeEventListener("session-changed", updateSession);

            window.removeEventListener("storage", updateSession);
        };
    }, []);

    if (!authenticated) {
        return <Navigate to="/login?next=%2Fadd-product" replace />;
    }

    return <AddProductPage />;
}

// ==========================================
// DETAILS ROUTES
// ==========================================

function SellerRoute() {
    const { id } = useParams();

    return <SellerPage id={id} />;
}

function CarDetailsRoute() {
    const { id } = useParams();

    return <CarDetailsPage id={id} />;
}

// ==========================================
// ADMIN ROUTES
// ==========================================

const ADMIN_SECTIONS = [
    "users",
    "products",
    "orders",
    "messages",
    "broadcasts",
    "audit",
];

function AdminRoute() {
    const { section = "" } = useParams();

    if (section && !ADMIN_SECTIONS.includes(section)) {
        return <NotFound />;
    }

    return <AdminPage section={section} />;
}

// ==========================================
// NOT FOUND — BLUE / WHITE DESIGN
// ==========================================

function NotFound() {
    return (
        <main
            style={{
                minHeight: "75vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                background: "#f6f8fc",
                fontFamily: 'Arial, "Noto Sans Armenian", sans-serif',
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "560px",
                    padding: "55px 30px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "22px",
                    background: "#ffffff",
                    textAlign: "center",
                    boxShadow: "0 15px 45px rgba(20,38,63,0.06)",
                }}
            >
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "9px 16px",
                        borderRadius: "30px",
                        background: "#edf3fa",
                        color: "#24476d",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                    }}
                >
                    ARMMOTORS
                </div>

                <h1
                    style={{
                        margin: "18px 0 5px",
                        color: "#14263f",
                        fontSize: "clamp(70px, 15vw, 115px)",
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: "-5px",
                    }}
                >
                    404
                </h1>

                <h2
                    style={{
                        margin: "20px 0 12px",
                        color: "#14263f",
                        fontSize: "23px",
                        fontWeight: 800,
                    }}
                >
                    Էջը չի գտնվել
                </h2>

                <p
                    style={{
                        maxWidth: "380px",
                        margin: "0 auto 28px",
                        color: "#64748b",
                        fontSize: "14px",
                        lineHeight: 1.8,
                    }}
                >
                    Հնարավոր է՝ էջը հեռացվել է, հասցեն փոխվել է կամ մուտքագրված
                    հղումը սխալ է։
                </p>

                <Link
                    to="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "46px",
                        padding: "0 25px",
                        borderRadius: "11px",
                        background: "#14263f",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 800,
                        textDecoration: "none",
                    }}
                >
                    Վերադառնալ գլխավոր էջ
                </Link>
            </div>
        </main>
    );
}

// ==========================================
// APPLICATION ROUTES
// ==========================================

function ApplicationRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<HomePage />} />

                <Route path="cars" element={<CarsPage />} />

                <Route path="cars/:id" element={<CarDetailsRoute />} />

                <Route path="sellers/:id" element={<SellerRoute />} />

                <Route path="seller/:id" element={<SellerRoute />} />

                <Route path="login" element={<AuthPage />} />

                <Route
                    path="registration"
                    element={<AuthPage registration />}
                />

                <Route path="register" element={<AuthPage registration />} />

                <Route
                    path="forgot-password"
                    element={<ForgotPasswordPage />}
                />

                <Route path="reset-password" element={<ResetPasswordPage />} />

                <Route path="add-product" element={<ProtectedAddProduct />} />

                <Route path="favorites" element={<FavoritesPage />} />

                <Route path="account" element={<AccountPage />} />

                <Route path="compare" element={<ComparePage />} />

                <Route path="search" element={<SearchPage />} />

                <Route path="messages" element={<MessagesPage />} />

                <Route path="monetization" element={<MonetizationPage />} />

                <Route
                    path="admin/payments"
                    element={<MonetizationPage admin />}
                />

                <Route path="admin/reports" element={<AdminReports />} />

                <Route path="admin" element={<AdminRoute />} />

                <Route path="admin/:section" element={<AdminRoute />} />

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
    const [sessionReady, setSessionReady] = useState(false);

    const handleSessionReady = useCallback(() => {
        setSessionReady(true);
    }, []);

    return (
        <BrowserRouter basename={BASE}>
            {!sessionReady && <SessionBootstrap onReady={handleSessionReady} />}

            {sessionReady ? (
                <ApplicationRoutes />
            ) : (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f6f8fc",
                        color: "#14263f",
                        fontFamily: 'Arial, "Noto Sans Armenian", sans-serif',
                        fontSize: "14px",
                        fontWeight: 600,
                    }}
                >
                    ArmMotors-ը բեռնվում է…
                </div>
            )}
        </BrowserRouter>
    );
}
