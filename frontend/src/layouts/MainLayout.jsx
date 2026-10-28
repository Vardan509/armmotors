import { Outlet } from "react-router-dom";

import Header from "../components/header/Header";
import SupportWidget from "../components/SupportWidget/SupportWidget";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import CompareTray from "../components/compare/CompareTray";

export default function MainLayout() {
    return (
        <>
            <Header />

            <Outlet />

            <CompareTray />

            <SupportWidget />

            <ScrollToTop />
        </>
    );
}
