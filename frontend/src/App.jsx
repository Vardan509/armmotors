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

import { getAccessToken, clearAuthSession } from "./utils/api";

import "./components/header/HomePage.css";
import "./pages/CarDetailsPage.css";
import "./pages/ComparePage.css";
import "./global.css";
import "./styles/ArmMotorsSearchFix.css";

const BASE = import.meta.env.BASE_URL;

// ==========================================
// TOKEN VALIDATION
// ==========================================

function hasValidAccessToken() {
    const token = getAccessToken();

    if (!token) return false;

    try {
        const parts = token.split(".");

        if (parts.length !== 3) {
            return false;
        }

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
// NOT FOUND
// ==========================================

function NotFound() {
    return (
        <main
            style={{
                minHeight: "65vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "50px 20px",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    fontSize: "70px",
                    margin: "0 0 10px",
                    color: "#b99547",
                }}
            >
                404
            </h1>

            <h2>Էջը չի գտնվել</h2>

            <p style={{ color: "#777" }}>Ձեր որոնած էջը գոյություն չունի։</p>

            <Link
                to="/"
                style={{
                    padding: "13px 24px",
                    borderRadius: "9px",
                    background: "#b99547",
                    color: "#fff",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginTop: "15px",
                }}
            >
                Վերադառնալ գլխավոր էջ
            </Link>
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

                <Route path="login" element={<AuthPage />} />

                <Route
                    path="registration"
                    element={<AuthPage registration />}
                />

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
                        justifyContent: "center",
                        alignItems: "center",
                        background: "#fff",
                        color: "#555",
                        fontSize: "14px",
                    }}
                >
                    ArmMotors-ը բեռնվում է…
                </div>
            )}
        </BrowserRouter>
    );
}
