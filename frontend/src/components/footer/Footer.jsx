import { Link } from "react-router-dom";

import usePageText from "../../utils/pageText";

import "./style.css";

export default function Footer() {
    const { tr } = usePageText();

    const navigation = [
        ["home", "/"],
        ["listings", "/cars"],
        ["addListing", "/add-product"],
        ["favorites", "/favorites"],
        ["account", "/account"],
    ];

    const categories = [
        ["allCars", "/cars"],
        ["electric", "/cars?fuel=electric"],
        ["hybrid", "/cars?fuel=hybrid"],
        ["parts", "/search?type=part"],
    ];

    return (
        <footer className="am-footer">
            <div className="am-footer-container">
                <div className="am-footer-top">
                    <div className="am-footer-brand">
                        <Link to="/" className="am-footer-logo">
                            <span className="am-footer-logo-symbol">A</span>

                            <span>
                                ARM<span>MOTORS</span>
                            </span>
                        </Link>

                        <p>{tr("footerDescription")}</p>

                        <div className="am-footer-social">
                            <span>{tr("follow")}</span>

                            <div className="am-footer-social-links">
                                <a
                                    href="https://www.instagram.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    IG
                                </a>

                                <a
                                    href="https://www.facebook.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                >
                                    f
                                </a>

                                <a
                                    href="https://www.tiktok.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok"
                                >
                                    Tk
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="am-footer-column">
                        <h3>{tr("quickLinks")}</h3>

                        <ul>
                            {navigation.map(([key, link]) => (
                                <li key={link}>
                                    <Link to={link}>{tr(key)}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="am-footer-column">
                        <h3>{tr("categories")}</h3>

                        <ul>
                            {categories.map(([key, link]) => (
                                <li key={link}>
                                    <Link to={link}>{tr(key)}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="am-footer-column am-footer-contact">
                        <h3>{tr("contact")}</h3>
                        <p>{tr("support")}</p>

                        <a href="mailto:support@armmotors.am">
                            support@armmotors.am
                        </a>

                        <div className="am-footer-location">
                            <span>{tr("armenia")}</span>
                            <strong>ArmMotors</strong>
                        </div>
                    </div>
                </div>

                <div className="am-footer-banner">
                    <div>
                        <span>ARMMOTORS</span>
                        <h2>{tr("slogan")}</h2>
                    </div>

                    <Link to="/add-product">
                        {tr("addListing")}
                        <span aria-hidden="true">↗</span>
                    </Link>
                </div>

                <div className="am-footer-bottom">
                    <p>
                        © {new Date().getFullYear()} ArmMotors. {tr("rights")}
                    </p>

                    <span>{tr("madeForArmenia")}</span>
                </div>
            </div>
        </footer>
    );
}
