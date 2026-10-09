import HomePage from "./components/header/HomePage";

import CarsPage from "./pages/CarsPage";
import AuthPage from "./pages/AuthPage";
import AddProductPage from "./pages/AddProductPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import AdminPage from "./pages/admin/AdminPage";
import FavoritesPage from "./pages/FavoritesPage";
import AccountPage from "./pages/AccountPage";

import SupportWidget from "./components/SupportWidget/SupportWidget";

import "./components/header/HomePage.css";
import "./pages/CarDetailsPage.css";
import "./global.css";

// Vite-ի base-ը՝
// localhost-ում՝ "/"
// GitHub Pages-ում՝ "/armmotors/"
const BASE = import.meta.env.BASE_URL;

function getCurrentPath() {
    let path = window.location.pathname;

    // Հեռացնում ենք GitHub Pages-ի base-ը
    const basePath = BASE.replace(/\/+$/, "");

    if (basePath && (path === basePath || path.startsWith(basePath + "/"))) {
        path = path.slice(basePath.length);
    }

    // Նորմալացնում ենք հասցեն
    return path.replace(/\/+$/, "") || "/";
}

export default function App() {
    return (
        <>
            <Page />
            <SupportWidget />
        </>
    );
}

function Page() {
    const path = getCurrentPath();

    // Մեքենայի մանրամասների էջ
    const detail = path.match(/^\/cars\/([^/]+)$/);

    if (detail) {
        return <CarDetailsPage id={decodeURIComponent(detail[1])} />;
    }

    // Admin Panel
    if (
        /^\/admin(?:\/(users|products|orders|messages|broadcasts|audit))?$/.test(
            path,
        )
    ) {
        return <AdminPage section={path.split("/")[2] || ""} />;
    }

    // Favorites
    if (path === "/favorites") {
        return <FavoritesPage />;
    }

    // Account
    if (path === "/account") {
        return <AccountPage />;
    }

    // Գլխավոր էջ
    if (path === "/") {
        return <HomePage />;
    }

    // Մեքենաների էջ
    if (path === "/cars") {
        return <CarsPage />;
    }

    // Մուտք
    if (path === "/login") {
        return <AuthPage />;
    }

    // Գրանցում
    if (path === "/registration") {
        return <AuthPage registration />;
    }

    // Հայտարարություն ավելացնել
    if (path === "/add-product") {
        return <AddProductPage />;
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
