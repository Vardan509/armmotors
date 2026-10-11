
import HomePage from "./components/header/HomePage";

import CarsPage from "./pages/CarsPage";
import AuthPage from "./pages/AuthPage";
import AddProductPage from "./pages/AddProductPage";
import CarDetailsPage from "./pages/CarDetailsPage";

import AdminPage from "./pages/admin/AdminPage";
import AdminReports from "./pages/admin/AdminReports";

import FavoritesPage from "./pages/FavoritesPage";
import AccountPage from "./pages/AccountPage";
import ComparePage from "./pages/ComparePage";
import SearchPage from "./pages/SearchPage";

import MessagesPage from "./components/messaging/MessagesPage";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SupportWidget from "./components/SupportWidget/SupportWidget";

import "./components/header/HomePage.css";
import "./pages/CarDetailsPage.css";
import "./pages/ComparePage.css";
import "./global.css";

const BASE = import.meta.env.BASE_URL;

function getCurrentPath() {
    let path = window.location.pathname;

    const basePath = BASE.replace(/\/+$/, "");

    if (
        basePath &&
        (path === basePath || path.startsWith(basePath + "/"))
    ) {
        path = path.slice(basePath.length);
    }

    return path.replace(/\/+$/, "") || "/";
}

export default function App() {
    return (
        <>
            <Page />
            <SupportWidget />
            <ScrollToTop />
        </>
    );
}

function Page() {
    const path = getCurrentPath();

    const detail = path.match(/^\/cars\/([^/]+)$/);

    if (detail) {
        return (
            <CarDetailsPage
                id={decodeURIComponent(detail[1])}
            />
        );
    }

    if (path === "/messages") {
        return <MessagesPage />;
    }

    if (path === "/admin/reports") {
        return <AdminReports />;
    }

    if (
        /^\/admin(?:\/(users|products|orders|messages|broadcasts|audit))?$/.test(
            path
        )
    ) {
        return (
            <AdminPage
                section={path.split("/")[2] || ""}
            />
        );
    }

    if (path === "/favorites") {
        return <FavoritesPage />;
    }

    if (path === "/account") {
        return <AccountPage />;
    }

    if (path === "/compare") {
        return <ComparePage />;
    }

    if (path === "/search") {
        return <SearchPage />;
    }

    if (path === "/") {
        return <HomePage />;
    }

    if (path === "/cars") {
        return <CarsPage />;
    }

    if (path === "/login") {
        return <AuthPage />;
    }

    if (path === "/registration") {
        return <AuthPage registration />;
    }

    if (path === "/add-product") {
        return <AddProductPage />;
    }

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

            <a href={BASE}>
                Վերադառնալ գլխավոր էջ
            </a>
        </main>
    );
}
