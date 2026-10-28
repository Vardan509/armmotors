import { Link } from "react-router-dom";
import "./Footer.css";

const FOOTER_TEXT = {
    hy: {
        description:
            "ArmMotors-ը ավտոմեքենաների և պահեստամասերի հայտարարությունների հարթակ է ամբողջ Հայաստանում։ Գտեք ձեր հաջորդ մեքենան կամ տեղադրեք հայտարարություն։",
        navigation: "Արագ հղումներ",
        categories: "Կատեգորիաներ",
        contact: "Կապ մեզ հետ",
        home: "Գլխավոր",
        cars: "Հայտարարություններ",
        add: "Տեղադրել հայտարարություն",
        favorites: "Ընտրյալներ",
        account: "Իմ հաշիվը",
        allCars: "Բոլոր մեքենաները",
        electric: "Էլեկտրական",
        hybrid: "Հիբրիդ",
        parts: "Պահեստամասեր",
        support: "Հարցերի դեպքում կապվեք մեզ հետ",
        social: "Հետևեք մեզ",
        rights: "Բոլոր իրավունքները պաշտպանված են։",
        slogan: "Ձեր հաջորդ մեքենան սկսվում է այստեղից։",
    },
    ru: {
        description:
            "ArmMotors — платформа объявлений об автомобилях и запчастях по всей Армении.",
        navigation: "Быстрые ссылки",
        categories: "Категории",
        contact: "Контакты",
        home: "Главная",
        cars: "Объявления",
        add: "Разместить объявление",
        favorites: "Избранное",
        account: "Мой аккаунт",
        allCars: "Все автомобили",
        electric: "Электромобили",
        hybrid: "Гибриды",
        parts: "Запчасти",
        support: "Свяжитесь с нами по вопросам",
        social: "Мы в соцсетях",
        rights: "Все права защищены.",
        slogan: "Ваш следующий автомобиль начинается здесь.",
    },
    en: {
        description:
            "ArmMotors is a marketplace for cars and spare parts across Armenia.",
        navigation: "Quick links",
        categories: "Categories",
        contact: "Contact us",
        home: "Home",
        cars: "Listings",
        add: "Post a listing",
        favorites: "Favorites",
        account: "My account",
        allCars: "All cars",
        electric: "Electric cars",
        hybrid: "Hybrid cars",
        parts: "Spare parts",
        support: "Contact us for assistance",
        social: "Follow us",
        rights: "All rights reserved.",
        slogan: "Your next car starts here.",
    },
};

function Footer({ language = "hy" }) {
    const t = FOOTER_TEXT[language] || FOOTER_TEXT.hy;

    const navigation = [
        { title: t.home, link: "/" },
        { title: t.cars, link: "/cars" },
        { title: t.add, link: "/add-product" },
        { title: t.favorites, link: "/favorites" },
        { title: t.account, link: "/account" },
    ];

    const categories = [
        { title: t.allCars, link: "/cars" },
        { title: t.electric, link: "/cars?fuel=electric" },
        { title: t.hybrid, link: "/cars?fuel=hybrid" },
        { title: t.parts, link: "/cars?type=part" },
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

                        <p>{t.description}</p>

                        <div className="am-footer-social">
                            <span>{t.social}</span>

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
                        <h3>{t.navigation}</h3>
                        <ul>
                            {navigation.map((item) => (
                                <li key={item.link}>
                                    <Link to={item.link}>{item.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="am-footer-column">
                        <h3>{t.categories}</h3>
                        <ul>
                            {categories.map((item) => (
                                <li key={item.link}>
                                    <Link to={item.link}>{item.title}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="am-footer-column am-footer-contact">
                        <h3>{t.contact}</h3>

                        <p>{t.support}</p>

                        <a href="mailto:support@armmotors.am">
                            support@armmotors.am
                        </a>

                        <div className="am-footer-location">
                            <span>ARMENIA</span>
                            <strong>ArmMotors</strong>
                        </div>
                    </div>
                </div>

                <div className="am-footer-banner">
                    <div>
                        <span>ARMMOTORS</span>
                        <h2>{t.slogan}</h2>
                    </div>

                    <Link to="/add-product">
                        {t.add}
                        <span aria-hidden="true">↗</span>
                    </Link>
                </div>

                <div className="am-footer-bottom">
                    <p>
                        © {new Date().getFullYear()} ArmMotors. {t.rights}
                    </p>

                    <span>Made for Armenia</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
