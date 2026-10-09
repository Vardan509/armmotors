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

export default function App() {
    return (
        <>
            <Page />
            <SupportWidget />
        </>
    );
}

function Page() {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";

    const detail = path.match(/^\/cars\/([^/]+)$/);

    if (detail) {
        return <CarDetailsPage id={detail[1]} />;
    }

    if (
        /^\/admin(?:\/(users|products|orders|messages|broadcasts|audit))?$/.test(
            path,
        )
    )
        return <AdminPage section={path.split("/")[2] || ""} />;
    if (path === "/favorites") return <FavoritesPage />;
    if (path === "/account") return <AccountPage />;

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
        <main style={{ padding: "40px", textAlign: "center" }}>
            <h1>Էջը չի գտնվել</h1>
            <a href="/">Գլխավոր էջ</a>
        </main>
    );
}
