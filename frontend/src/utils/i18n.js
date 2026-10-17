import { useEffect, useState } from "react";

export const LANGUAGES = [
    { code: "hy", label: "Հայերեն", flag: "🇦🇲" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇺🇸" },
];

const messages = {
    hy: {
        // HEADER
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

        // HOME
        marketLabel: "ԱՎՏՈՇՈՒԿԱ",
        heroTitle: "Գտեք Ձեր հաջորդ մեքենան",
        heroText: "Մեքենաներ և պահեստամասեր՝ մեկ վայրում։",
        popularBrands: "Տարածված Մակնիշներ",
        chooseBrand: "Ընտրեք Ձեր նախընտրած մակնիշը",
        listingCount: "հայտարարություն",
        latestListings: "Թոփ հայտարարությունները",
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

        // COMMON
        save: "Պահպանել",
        cancel: "Չեղարկել",
        close: "Փակել",
        back: "Վերադառնալ",
        continue: "Շարունակել",
        submit: "Ուղարկել",
        search: "Որոնել",
        filters: "Ֆիլտրեր",
        all: "Բոլորը",
        yes: "Այո",
        no: "Ոչ",
        next: "Հաջորդը",
        previous: "Նախորդը",
        error: "Տեղի ունեցավ սխալ։",
        retry: "Կրկին փորձել",
        required: "Պարտադիր դաշտ",
        email: "Էլ. փոստ",
        phone: "Հեռախոսահամար",
        name: "Անուն",
        surname: "Ազգանուն",
        description: "Նկարագրություն",
        price: "Գին",
        region: "Տարածաշրջան",

        // AUTH
        welcome: "Բարի գալուստ",
        newAccount: "Նոր հաշիվ",
        loginTitle: "Մուտք գործեք Ձեր հաշիվ",
        registerTitle: "Ստեղծեք Ձեր հաշիվը",
        loginDescription: "Մուտք գործեք Ձեր ArmMotors հաշիվ։",
        registerDescription: "Ստեղծեք հաշիվ և օգտվեք ArmMotors-ից։",
        password: "Գաղտնաբառ",
        repeatPassword: "Կրկնեք գաղտնաբառը",
        showPassword: "Տեսնել",
        hidePassword: "Թաքցնել",
        forgotPassword: "Մոռացե՞լ եք գաղտնաբառը",
        rememberMe: "Հիշել ինձ 30 օր",
        createAccount: "Ստեղծել հաշիվ",
        loggingIn: "Մուտք է կատարվում…",
        processing: "Սպասեք...",
        continueWithGoogle: "Շարունակել Google-ով",
        alreadyHaveAccount: "Արդեն հաշիվ ունե՞ք։",
        dontHaveAccount: "Դեռ հաշիվ չունե՞ք։",
        passwordsMismatch: "Գաղտնաբառերը չեն համընկնում։",
        accountSettings: "Հաշվի կարգավորումներ",
        goToAccount: "Անցնել իմ հաշիվ",
        logoutAccount: "Դուրս գալ հաշվից",

        // PASSWORD RECOVERY
        recoveryTitle: "Վերականգնել գաղտնաբառը",
        recoveryDescription:
            "Նշեք Ձեր էլ. փոստը՝ վերականգնման հղում ստանալու համար։",
        sendRecoveryLink: "Ուղարկել վերականգնման հղումը",
        recoveryEmailSent:
            "Եթե այս էլ. փոստով հաշիվ գոյություն ունի, կստանաք վերականգնման հղում։",
        backToLogin: "Վերադառնալ մուտքի էջ",
        newPassword: "Նոր գաղտնաբառ",
        confirmNewPassword: "Կրկնեք նոր գաղտնաբառը",
        resetPassword: "Փոխել գաղտնաբառը",
        resetSuccess: "Գաղտնաբառը հաջողությամբ փոխվել է։",
        invalidResetLink: "Վերականգնման հղումը սխալ է կամ ժամկետանց։",

        // VEHICLE DETAILS
        listingDetails: "Հայտարարության մանրամասներ",
        details: "Մանրամասներ",
        make: "Մակնիշ",
        model: "Մոդել",
        year: "Տարեթիվ",
        mileage: "Վազք",
        mileageUnit: "կմ",
        fuel: "Վառելիք",
        steering: "Ղեկ",
        color: "Գույն",
        condition: "Վիճակ",
        left: "Ձախ",
        right: "Աջ",
        new: "Նոր",
        used: "Օգտագործված",
        petrol: "Բենզին",
        diesel: "Դիզել",
        gas: "Գազ",
        electric: "Էլեկտրական",
        hybrid: "Հիբրիդ",
        sold: "Վաճառված է",
        noDescription: "Նկարագրություն չի ավելացվել։",
        copyLink: "Պատճենել հղումը",
        linkCopied: "Հղումը պատճենված է",
        relatedCars: "Նմանատիպ մեքենաներ",
        sellerPage: "Դիտել վաճառողի էջը",
        contactSeller: "Կապ վաճառողի հետ",
        callSeller: "Զանգահարել",
        writeSeller: "Գրել վաճառողին",
        contactUnavailable: "Հեռախոսահամարը հասանելի չէ։",
        contactAppNote: "Համապատասխան հավելվածը պետք է հասանելի լինի։",
        contactSupport: "Կապվել աջակցման հետ",
        reportListing: "Բողոքել հայտարարությունից",
        listingUnavailable: "Հայտարարությունը հասանելի չէ",

        // FILTERS
        priceFrom: "Գին՝ սկսած",
        priceTo: "Գին՝ մինչև",
        yearFrom: "Տարեթիվ՝ սկսած",
        yearTo: "Տարեթիվ՝ մինչև",
        mileageFrom: "Վազք՝ սկսած",
        mileageTo: "Վազք՝ մինչև",
        selectBrand: "Ընտրել մակնիշը",
        selectModel: "Ընտրել մոդելը",
        applyFilters: "Կիրառել ֆիլտրերը",
        customsCleared: "Մաքսազերծված",
        comfort: "Հարմարություններ",
        headlights: "Լուսարձակներ",
        interior: "Սրահ",
    },

    ru: {
        // HEADER
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
        addListing: "Разместить объявление",
        searchPlaceholder: "Поиск...",

        // HOME
        marketLabel: "АВТОРЫНОК",
        heroTitle: "Найдите свой следующий автомобиль",
        heroText: "Автомобили и запчасти в одном месте.",
        popularBrands: "ПОПУЛЯРНЫЕ МАРКИ",
        chooseBrand: "Выберите предпочитаемую марку",
        listingCount: "объявлений",
        latestListings: "Популярные объявления",
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

        // COMMON
        save: "Сохранить",
        cancel: "Отмена",
        close: "Закрыть",
        back: "Назад",
        continue: "Продолжить",
        submit: "Отправить",
        search: "Поиск",
        filters: "Фильтры",
        all: "Все",
        yes: "Да",
        no: "Нет",
        next: "Далее",
        previous: "Назад",
        error: "Произошла ошибка.",
        retry: "Повторить",
        required: "Обязательное поле",
        email: "Эл. почта",
        phone: "Номер телефона",
        name: "Имя",
        surname: "Фамилия",
        description: "Описание",
        price: "Цена",
        region: "Регион",

        // AUTH
        welcome: "Добро пожаловать",
        newAccount: "Новый аккаунт",
        loginTitle: "Войдите в свой аккаунт",
        registerTitle: "Создайте аккаунт",
        loginDescription: "Войдите в свой аккаунт ArmMotors.",
        registerDescription: "Создайте аккаунт и пользуйтесь ArmMotors.",
        password: "Пароль",
        repeatPassword: "Повторите пароль",
        showPassword: "Показать",
        hidePassword: "Скрыть",
        forgotPassword: "Забыли пароль?",
        rememberMe: "Запомнить меня на 30 дней",
        createAccount: "Создать аккаунт",
        loggingIn: "Выполняется вход…",
        processing: "Подождите...",
        continueWithGoogle: "Продолжить через Google",
        alreadyHaveAccount: "Уже есть аккаунт?",
        dontHaveAccount: "Нет аккаунта?",
        passwordsMismatch: "Пароли не совпадают.",
        accountSettings: "Настройки аккаунта",
        goToAccount: "Перейти в мой аккаунт",
        logoutAccount: "Выйти из аккаунта",

        // PASSWORD RECOVERY
        recoveryTitle: "Восстановление пароля",
        recoveryDescription:
            "Укажите email, чтобы получить ссылку для восстановления.",
        sendRecoveryLink: "Отправить ссылку",
        recoveryEmailSent:
            "Если аккаунт с таким email существует, вы получите ссылку.",
        backToLogin: "Вернуться ко входу",
        newPassword: "Новый пароль",
        confirmNewPassword: "Повторите новый пароль",
        resetPassword: "Изменить пароль",
        resetSuccess: "Пароль успешно изменён.",
        invalidResetLink: "Ссылка недействительна или истекла.",

        // VEHICLE DETAILS
        listingDetails: "Информация об объявлении",
        details: "Характеристики",
        make: "Марка",
        model: "Модель",
        year: "Год выпуска",
        mileage: "Пробег",
        mileageUnit: "км",
        fuel: "Топливо",
        steering: "Руль",
        color: "Цвет",
        condition: "Состояние",
        left: "Левый",
        right: "Правый",
        new: "Новый",
        used: "Б/у",
        petrol: "Бензин",
        diesel: "Дизель",
        gas: "Газ",
        electric: "Электро",
        hybrid: "Гибрид",
        sold: "Продано",
        noDescription: "Описание отсутствует.",
        copyLink: "Скопировать ссылку",
        linkCopied: "Ссылка скопирована",
        relatedCars: "Похожие автомобили",
        sellerPage: "Страница продавца",
        contactSeller: "Связаться с продавцом",
        callSeller: "Позвонить",
        writeSeller: "Написать продавцу",
        contactUnavailable: "Номер телефона недоступен.",
        contactAppNote: "Для связи необходимо соответствующее приложение.",
        contactSupport: "Связаться с поддержкой",
        reportListing: "Пожаловаться",
        listingUnavailable: "Объявление недоступно",

        // FILTERS
        priceFrom: "Цена от",
        priceTo: "Цена до",
        yearFrom: "Год от",
        yearTo: "Год до",
        mileageFrom: "Пробег от",
        mileageTo: "Пробег до",
        selectBrand: "Выбрать марку",
        selectModel: "Выбрать модель",
        applyFilters: "Применить фильтры",
        customsCleared: "Растаможен",
        comfort: "Комфорт",
        headlights: "Фары",
        interior: "Салон",
    },

    en: {
        // HEADER
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

        // HOME
        marketLabel: "CAR MARKET",
        heroTitle: "Find your next car",
        heroText: "Cars and spare parts in one place.",
        popularBrands: "POPULAR BRANDS",
        chooseBrand: "Choose your preferred brand",
        listingCount: "listings",
        latestListings: "Featured listings",
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

        // COMMON
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        back: "Back",
        continue: "Continue",
        submit: "Submit",
        search: "Search",
        filters: "Filters",
        all: "All",
        yes: "Yes",
        no: "No",
        next: "Next",
        previous: "Previous",
        error: "Something went wrong.",
        retry: "Try again",
        required: "Required field",
        email: "Email",
        phone: "Phone number",
        name: "First name",
        surname: "Last name",
        description: "Description",
        price: "Price",
        region: "Region",

        // AUTH
        welcome: "Welcome",
        newAccount: "New account",
        loginTitle: "Log in to your account",
        registerTitle: "Create your account",
        loginDescription: "Log in to your ArmMotors account.",
        registerDescription: "Create an account and start using ArmMotors.",
        password: "Password",
        repeatPassword: "Repeat password",
        showPassword: "Show",
        hidePassword: "Hide",
        forgotPassword: "Forgot password?",
        rememberMe: "Remember me for 30 days",
        createAccount: "Create account",
        loggingIn: "Logging in…",
        processing: "Please wait...",
        continueWithGoogle: "Continue with Google",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        passwordsMismatch: "Passwords do not match.",
        accountSettings: "Account settings",
        goToAccount: "Go to my account",
        logoutAccount: "Log out of account",

        // PASSWORD RECOVERY
        recoveryTitle: "Reset your password",
        recoveryDescription:
            "Enter your email to receive a password reset link.",
        sendRecoveryLink: "Send reset link",
        recoveryEmailSent:
            "If an account exists for this email, you will receive a reset link.",
        backToLogin: "Back to login",
        newPassword: "New password",
        confirmNewPassword: "Confirm new password",
        resetPassword: "Change password",
        resetSuccess: "Your password has been changed.",
        invalidResetLink: "The reset link is invalid or expired.",

        // VEHICLE DETAILS
        listingDetails: "Listing details",
        details: "Specifications",
        make: "Make",
        model: "Model",
        year: "Year",
        mileage: "Mileage",
        mileageUnit: "km",
        fuel: "Fuel",
        steering: "Steering",
        color: "Color",
        condition: "Condition",
        left: "Left",
        right: "Right",
        new: "New",
        used: "Used",
        petrol: "Petrol",
        diesel: "Diesel",
        gas: "Gas",
        electric: "Electric",
        hybrid: "Hybrid",
        sold: "Sold",
        noDescription: "No description provided.",
        copyLink: "Copy link",
        linkCopied: "Link copied",
        relatedCars: "Similar cars",
        sellerPage: "View seller profile",
        contactSeller: "Contact seller",
        callSeller: "Call seller",
        writeSeller: "Message seller",
        contactUnavailable: "Phone number unavailable.",
        contactAppNote: "The corresponding app must be available.",
        contactSupport: "Contact support",
        reportListing: "Report listing",
        listingUnavailable: "Listing unavailable",

        // FILTERS
        priceFrom: "Price from",
        priceTo: "Price to",
        yearFrom: "Year from",
        yearTo: "Year to",
        mileageFrom: "Mileage from",
        mileageTo: "Mileage to",
        selectBrand: "Select brand",
        selectModel: "Select model",
        applyFilters: "Apply filters",
        customsCleared: "Customs cleared",
        comfort: "Comfort",
        headlights: "Headlights",
        interior: "Interior",
    },
};

// ==========================================
// LANGUAGE HELPERS
// ==========================================

export function getLanguage() {
    if (typeof window === "undefined") {
        return "hy";
    }

    try {
        const saved = localStorage.getItem("armmotors-language");

        return LANGUAGES.some((item) => item.code === saved) ? saved : "hy";
    } catch {
        return "hy";
    }
}

export function setLanguage(code) {
    if (!LANGUAGES.some((item) => item.code === code)) {
        return;
    }

    if (typeof window === "undefined") {
        return;
    }

    try {
        localStorage.setItem("armmotors-language", code);
    } catch {
        // Private browsing may block storage.
    }

    document.documentElement.lang = code;

    window.dispatchEvent(
        new CustomEvent("language-changed", {
            detail: code,
        }),
    );
}

export function translate(language, key) {
    return messages[language]?.[key] ?? messages.hy[key] ?? key;
}

export function useI18n() {
    const [language, setCurrentLanguage] = useState(getLanguage);

    useEffect(() => {
        document.documentElement.lang = language;

        function handleLanguageChanged(event) {
            setCurrentLanguage(event.detail || getLanguage());
        }

        function handleStorage(event) {
            if (event.key === "armmotors-language") {
                setCurrentLanguage(getLanguage());
            }
        }

        window.addEventListener("language-changed", handleLanguageChanged);

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener(
                "language-changed",
                handleLanguageChanged,
            );

            window.removeEventListener("storage", handleStorage);
        };
    }, [language]);

    return {
        language,
        languages: LANGUAGES,
        setLanguage,
        t: (key) => translate(language, key),
    };
}
