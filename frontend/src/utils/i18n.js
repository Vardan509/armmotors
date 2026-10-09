import { useEffect, useState } from "react";

export const LANGUAGES = [
    {
        code: "hy",
        label: "Հայերեն",
        flag: "🇦🇲",
    },
    {
        code: "ru",
        label: "Русский",
        flag: "🇷🇺",
    },
    {
        code: "en",
        label: "English",
        flag: "🇺🇸",
    },
];

const messages = {
    hy: {
        headerMarket: "Ավտոմեքենաներ և պահեստամասեր",

        home: "Գլխավոր",

        listings: "Հայտարարություններ",

        brands: "Մակնիշներ",

        favorites: "Նախընտրելի",

        account: "Իմ հաշիվը",

        admin: "Ադմին պանել",

        logout: "Ելք",

        login: "Մուտք",

        register: "Գրանցում",

        addListing: "Տեղադրել հայտարարություն",

        searchPlaceholder: "Որոնում...",

        marketLabel: "",

        heroTitle: "",

        heroText: "",

        popularBrands: "",

        popularBrands: "Տարածված Մակնիշներ",

        listingCount: "հայտարարություն",

        latestListings: " Թոփ հայտարարությունները",

        searchResults: "Որոնման արդյունքներ",

        loading: "Բեռնվում է…",

        clearFilters: "Մաքրել ֆիլտրերը",

        noResults: "Այս պայմաններով հայտարարություն չի գտնվել։",

        showAll: "Ցուցադրել բոլորը",

        imageUnavailable: "Նկարը հասանելի չէ",

        addFavorite: "Ավելացնել ընտրյալներում",

        removeFavorite: "Հեռացնել ընտրյալներից",

        demo: "Ցուցադրական",

        homeNav: "Գլխավոր",

        favoritesNav: "Սիրված",

        addNav: "Ավելացնել",

        chatNav: "Հարցեր",

        accountNav: "Հաշիվ",
    },

    ru: {
        headerMarket: "Автомобили и запчасти",

        home: "Главная",

        listings: "Объявления",

        brands: "Марки",

        favorites: "Избранное",

        account: "Мой аккаунт",

        admin: "Админ-панель",

        logout: "Выйти",

        login: "Войти",

        register: "Регистрация",

        addListing: "Добавить объявление",

        searchPlaceholder: "Поиск...",

        marketLabel: "АВТОРЫНОК",

        heroTitle: "Найдите свой следующий автомобиль",

        heroText: "Автомобили и запчасти в одном месте.",

        popularBrands: "ПОПУЛЯРНЫЕ МАРКИ",

        chooseBrand: "Выберите любимую марку",

        listingCount: "объявлений",

        latestListings: "Новые объявления",

        searchResults: "Результаты поиска",

        loading: "Загрузка…",

        clearFilters: "Сбросить фильтры",

        noResults: "По этим условиям ничего не найдено.",

        showAll: "Показать все",

        imageUnavailable: "Фото недоступно",

        addFavorite: "Добавить в избранное",

        removeFavorite: "Удалить из избранного",

        demo: "Демо",

        homeNav: "Главная",

        favoritesNav: "Избранное",

        addNav: "Добавить",

        chatNav: "Сообщения",

        accountNav: "Аккаунт",
    },

    en: {
        headerMarket: "Cars and spare parts",

        home: "Home",

        listings: "Listings",

        brands: "Brands",

        favorites: "Favorites",

        account: "My account",

        admin: "Admin panel",

        logout: "Log out",

        login: "Log in",

        register: "Register",

        addListing: "Add listing",

        searchPlaceholder: "Search...",

        marketLabel: "CAR MARKET",

        heroTitle: "Find your next car",

        heroText: "Cars and spare parts in one place.",

        popularBrands: "POPULAR BRANDS",

        chooseBrand: "Choose your preferred brand",

        listingCount: "listings",

        latestListings: "Latest listings",

        searchResults: "Search results",

        loading: "Loading…",

        clearFilters: "Clear filters",

        noResults: "No listings match these filters.",

        showAll: "Show all",

        imageUnavailable: "Image unavailable",

        addFavorite: "Add to favorites",

        removeFavorite: "Remove from favorites",

        demo: "Demo",

        homeNav: "Home",

        favoritesNav: "Favorites",

        addNav: "Add",

        chatNav: "Messages",

        accountNav: "Account",
    },
};

export function getLanguage() {
    const value = localStorage.getItem("armmotors-language");

    const valid = LANGUAGES.some((item) => item.code === value);

    return valid ? value : "hy";
}

export function setLanguage(code) {
    const valid = LANGUAGES.some((item) => item.code === code);

    if (!valid) {
        return;
    }

    localStorage.setItem("armmotors-language", code);

    document.documentElement.lang = code;

    window.dispatchEvent(
        new CustomEvent("language-changed", {
            detail: code,
        }),
    );
}

export function useI18n() {
    const [language, setCurrentLanguage] = useState(getLanguage);

    useEffect(() => {
        document.documentElement.lang = language;

        function handler(event) {
            setCurrentLanguage(event.detail || getLanguage());
        }

        window.addEventListener("language-changed", handler);

        return () => {
            window.removeEventListener("language-changed", handler);
        };
    }, [language]);

    return {
        language,

        languages: LANGUAGES,

        setLanguage,

        t(key) {
            return messages[language]?.[key] ?? messages.hy[key] ?? key;
        },
    };
}
