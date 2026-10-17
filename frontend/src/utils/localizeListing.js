const DICTIONARY = {
    hy: {
        brands: "Մակնիշներ",
        more: "Ավելին",
        compare: "Համեմատել",
        messages: "Հաղորդագրություններ",
        contactUs: "Կապ մեզ հետ",
        notifications: "Ծանուցումներ",
        account: "Իմ հաշիվը",
        administrator: "Ադմինիստրատոր",
        search: "Որոնում",
        currency: "Արժույթ",
        logoutProgress: "Դուրս է գալիս...",
        changeLanguage: "Փոխել լեզուն",
        openMenu: "Բացել ընտրացանկը",
        mainMenu: "Հիմնական ընտրացանկ",
        mobileMenu: "Հեռախոսի ընտրացանկ",
        quickLinks: "Արագ անցումներ",
    },
    ru: {
        brands: "Марки",
        more: "Ещё",
        compare: "Сравнить",
        messages: "Сообщения",
        contactUs: "Связаться с нами",
        notifications: "Уведомления",
        account: "Мой аккаунт",
        administrator: "Администратор",
        search: "Поиск",
        currency: "Валюта",
        logoutProgress: "Выход...",
        changeLanguage: "Сменить язык",
        openMenu: "Открыть меню",
        mainMenu: "Главное меню",
        mobileMenu: "Мобильное меню",
        quickLinks: "Быстрые переходы",
    },
    en: {
        brands: "Brands",
        more: "More",
        compare: "Compare",
        messages: "Messages",
        contactUs: "Contact us",
        notifications: "Notifications",
        account: "My account",
        administrator: "Administrator",
        search: "Search",
        currency: "Currency",
        logoutProgress: "Logging out...",
        changeLanguage: "Change language",
        openMenu: "Open menu",
        mainMenu: "Main navigation",
        mobileMenu: "Mobile navigation",
        quickLinks: "Quick links",
    },
};

const VALUES = {
    petrol: ["Բենզին", "Бензин", "Petrol"],
    diesel: ["Դիզել", "Дизель", "Diesel"],
    gas: ["Գազ", "Газ", "Gas"],
    electric: ["Էլեկտրական", "Электрический", "Electric"],
    hybrid: ["Հիբրիդ", "Гибрид", "Hybrid"],

    left: ["Ձախ", "Левый", "Left"],
    right: ["Աջ", "Правый", "Right"],

    new: ["Նոր", "Новый", "New"],
    used: ["Օգտագործված", "Б/у", "Used"],

    black: ["Սև", "Чёрный", "Black"],
    white: ["Սպիտակ", "Белый", "White"],
    silver: ["Արծաթագույն", "Серебристый", "Silver"],
    gray: ["Մոխրագույն", "Серый", "Gray"],
    red: ["Կարմիր", "Красный", "Red"],
    blue: ["Կապույտ", "Синий", "Blue"],
    green: ["Կանաչ", "Зелёный", "Green"],
    yellow: ["Դեղին", "Жёлтый", "Yellow"],
    brown: ["Շագանակագույն", "Коричневый", "Brown"],
    gold: ["Ոսկեգույն", "Золотой", "Gold"],
    beige: ["Բեժ", "Бежевый", "Beige"],

    yerevan: ["Երևան", "Ереван", "Yerevan"],
    vagharshapat: ["Վաղարշապատ", "Вагаршапат", "Vagharshapat"],
    gyumri: ["Գյումրի", "Гюмри", "Gyumri"],
    vanadzor: ["Վանաձոր", "Ванадзор", "Vanadzor"],
    abovyan: ["Աբովյան", "Абовян", "Abovyan"],
    hrazdan: ["Հրազդան", "Раздан", "Hrazdan"],
    armavir: ["Արմավիր", "Армавир", "Armavir"],
    ashtarak: ["Աշտարակ", "Аштарак", "Ashtarak"],
    artashat: ["Արտաշատ", "Арташат", "Artashat"],
    ararat: ["Արարատ", "Арарат", "Ararat"],
    sevan: ["Սևան", "Севан", "Sevan"],
    dilijan: ["Դիլիջան", "Дилижан", "Dilijan"],
    ejmiatsin: ["Էջմիածին", "Эчмиадзин", "Etchmiadzin"],
};

const ALIASES = {
    benzin: "petrol",
    gasoline: "petrol",
    benzine: "petrol",
    benz: "petrol",

    gaz: "gas",

    elektro: "electric",

    dzax: "left",
    aj: "right",

    nor: "new",
    ogtagorcvac: "used",
    ogtagorcvatc: "used",
    "բ/ու": "used",
    "б/у": "used",

    sev: "black",
    spitak: "white",
    karmir: "red",
    kapuyt: "blue",
    kanach: "green",
    dexin: "yellow",
    moxraguyn: "gray",
    mokhraguyn: "gray",
    arcataguyn: "silver",

    erevan: "yerevan",
    yerevan: "yerevan",
    ejmiacin: "ejmiatsin",
    echmiadzin: "ejmiatsin",
    etchmiadzin: "ejmiatsin",
};

const LANGUAGE_INDEX = {
    hy: 0,
    ru: 1,
    en: 2,
};

const LOOKUP = new Map();

for (const [key, translations] of Object.entries(VALUES)) {
    LOOKUP.set(key, key);

    for (const translation of translations) {
        LOOKUP.set(translation.trim().toLocaleLowerCase(), key);
    }
}

for (const [alias, key] of Object.entries(ALIASES)) {
    LOOKUP.set(alias.toLocaleLowerCase(), key);
}

export function uiText(language, key) {
    const lang = LANGUAGE_INDEX[language] !== undefined ? language : "hy";

    return DICTIONARY[lang]?.[key] || DICTIONARY.hy[key] || key;
}

export function localizeListingValue(value, language = "hy") {
    if (value === undefined || value === null || value === "") {
        return value;
    }

    const normalized = String(value).trim().toLocaleLowerCase();

    const key = LOOKUP.get(normalized);

    if (!key) {
        return value;
    }

    const index = LANGUAGE_INDEX[language] ?? 0;

    return VALUES[key][index];
}

export function localizeListingFields(product, language = "hy") {
    if (!product || typeof product !== "object") {
        return product;
    }

    return {
        ...product,
        fuel: localizeListingValue(product.fuel, language),
        steering: localizeListingValue(product.steering, language),
        condition: localizeListingValue(product.condition, language),
        color: localizeListingValue(product.color, language),
        region: localizeListingValue(product.region, language),
    };
}
