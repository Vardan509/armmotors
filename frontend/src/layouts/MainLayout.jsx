import { Outlet } from "react-router-dom";

import Header from "../components/header/Header";
import SupportWidget from "../components/SupportWidget/SupportWidget";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";

export default function MainLayout() {
    return (
        <>
            <Header />

            <Outlet />

            <SupportWidget />

            <ScrollToTop />
        </>
    );
}
