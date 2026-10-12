import { useEffect } from "react";

import HomePage from "./components/header/HomePage";

import CarsPage from "./pages/CarsPage";
import AuthPage from "./pages/AuthPage";
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

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SupportWidget from "./components/SupportWidget/SupportWidget";

import "./components/header/HomePage.css";
import "./pages/CarDetailsPage.css";
import "./pages/ComparePage.css";
import "./global.css";

const BASE = import.meta.env.BASE_URL;

// ==========================================
// GET CURRENT PATH
// ==========================================

function getCurrentPath() {
    let path = window.location.pathname;

    const basePath = BASE.replace(/\/+$/, "");

    if (basePath && (path === basePath || path.startsWith(basePath + "/"))) {
        path = path.slice(basePath.length);
    }

    return path.replace(/\/+$/, "") || "/";
}

// ==========================================
// PROTECTED ADD PRODUCT PAGE
// ==========================================

function ProtectedAddProduct() {
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            const loginUrl = `${BASE}login?next=%2Fadd-product`;

            window.location.replace(loginUrl);
        }
    }, [token]);

    // Եթե օգտատերը մուտք չի գործել,
    // չենք ցուցադրում միջանկյալ պատուհանը։
    if (!token) {
        return null;
    }

    // Մուտք գործած օգտատերը տեսնում է
    // հայտարարության տեղադրման էջը։
    return <AddProductPage />;
}

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
    return (
        <>
            <Page />

            <SupportWidget />

            <ScrollToTop />
        </>
    );
}

// ==========================================
// ROUTES
// ==========================================

function Page() {
    const path = getCurrentPath();

    // SELLER PAGE
    const sellerMatch = path.match(/^\/sellers\/([a-f0-9]{24})$/i);

    if (sellerMatch) {
        return <SellerPage id={sellerMatch[1]} />;
    }

    // CAR DETAILS
    const detail = path.match(/^\/cars\/([^/]+)$/);

    if (detail) {
        return <CarDetailsPage id={decodeURIComponent(detail[1])} />;
    }

    // MONETIZATION
    if (path === "/monetization") {
        return <MonetizationPage />;
    }

    // ADMIN PAYMENTS
    if (path === "/admin/payments") {
        return <MonetizationPage admin />;
    }

    // MESSAGES
    if (path === "/messages") {
        return <MessagesPage />;
    }

    // ADMIN REPORTS
    if (path === "/admin/reports") {
        return <AdminReports />;
    }

    // ADMIN PAGE
    if (
        /^\/admin(?:\/(users|products|orders|messages|broadcasts|audit))?$/.test(
            path,
        )
    ) {
        return <AdminPage section={path.split("/")[2] || ""} />;
    }

    // FAVORITES
    if (path === "/favorites") {
        return <FavoritesPage />;
    }

    // ACCOUNT
    if (path === "/account") {
        return <AccountPage />;
    }

    // COMPARE
    if (path === "/compare") {
        return <ComparePage />;
    }

    // SEARCH
    if (path === "/search") {
        return <SearchPage />;
    }

    // HOME
    if (path === "/") {
        return <HomePage />;
    }

    // CARS
    if (path === "/cars") {
        return <CarsPage />;
    }

    // LOGIN
    if (path === "/login") {
        return <AuthPage />;
    }

    // REGISTRATION
    if (path === "/registration") {
        return <AuthPage registration />;
    }

    // ADD PRODUCT - PROTECTED
    if (path === "/add-product") {
        return <ProtectedAddProduct />;
    }

    // 404
    return (
        <main
            style={{
                minHeight: "70vh",
                padding: "80px 20px",
                textAlign: "center",
                background: "#ffffff",
            }}
        >
            <h1>Էջը չի գտնվել</h1>

            <a href={BASE}>Վերադառնալ գլխավոր էջ</a>
        </main>
    );
}
