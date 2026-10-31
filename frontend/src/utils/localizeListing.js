const LANGUAGE_INDEX = {
    hy: 0,
    ru: 1,
    en: 2,
};

const UI = {
    brands: ["Մակնիշներ", "Марки", "Brands"],
    more: ["Ավելին", "Ещё", "More"],
    compare: ["Համեմատել", "Сравнить", "Compare"],
    messages: ["Հաղորդագրություններ", "Сообщения", "Messages"],
    contactUs: ["Կապ մեզ հետ", "Связаться с нами", "Contact us"],
    notifications: ["Ծանուցումներ", "Уведомления", "Notifications"],
    account: ["Իմ հաշիվը", "Мой аккаунт", "My account"],
    administrator: ["Ադմինիստրատոր", "Администратор", "Administrator"],
    search: ["Որոնում", "Поиск", "Search"],
    currency: ["Արժույթ", "Валюта", "Currency"],
    logoutProgress: ["Դուրս է գալիս...", "Выход...", "Logging out..."],
    changeLanguage: ["Փոխել լեզուն", "Сменить язык", "Change language"],
    openMenu: ["Բացել ընտրացանկը", "Открыть меню", "Open menu"],
    mainMenu: ["Հիմնական ընտրացանկ", "Главное меню", "Main navigation"],
    mobileMenu: ["Հեռախոսի ընտրացանկ", "Мобильное меню", "Mobile navigation"],
    quickLinks: ["Արագ անցումներ", "Быстрые переходы", "Quick links"],
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

    automatic: ["Ավտոմատ", "Автомат", "Automatic"],
    manual: ["Մեխանիկական", "Механика", "Manual"],
    robotic: ["Ռոբոտացված", "Робот", "Robotic"],
    cvt: ["Վարիատոր", "Вариатор", "CVT"],

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
    orange: ["Նարնջագույն", "Оранжевый", "Orange"],
    purple: ["Մանուշակագույն", "Фиолетовый", "Purple"],

    yerevan: ["Երևան", "Ереван", "Yerevan"],
    aragatsotn: ["Արագածոտն", "Арагацотн", "Aragatsotn"],
    ararat: ["Արարատ", "Арарат", "Ararat"],
    armavir: ["Արմավիր", "Армавир", "Armavir"],
    gegharkunik: ["Գեղարքունիք", "Гегаркуник", "Gegharkunik"],
    kotayk: ["Կոտայք", "Котайк", "Kotayk"],
    lori: ["Լոռի", "Лори", "Lori"],
    shirak: ["Շիրակ", "Ширак", "Shirak"],
    syunik: ["Սյունիք", "Сюник", "Syunik"],
    tavush: ["Տավուշ", "Тавуш", "Tavush"],
    vayotsDzor: ["Վայոց ձոր", "Вайоц Дзор", "Vayots Dzor"],

    vagharshapat: ["Վաղարշապատ", "Вагаршапат", "Vagharshapat"],
    ejmiatsin: ["Էջմիածին", "Эчмиадзин", "Etchmiadzin"],
    gyumri: ["Գյումրի", "Гюмри", "Gyumri"],
    vanadzor: ["Վանաձոր", "Ванадзор", "Vanadzor"],
    abovyan: ["Աբովյան", "Абовян", "Abovyan"],
    hrazdan: ["Հրազդան", "Раздан", "Hrazdan"],
    ashtarak: ["Աշտարակ", "Аштарак", "Ashtarak"],
    artashat: ["Արտաշատ", "Арташат", "Artashat"],
    sevan: ["Սևան", "Севан", "Sevan"],
    dilijan: ["Դիլիջան", "Дилижан", "Dilijan"],
    kapan: ["Կապան", "Капан", "Kapan"],
    goris: ["Գորիս", "Горис", "Goris"],
    sisian: ["Սիսիան", "Сисиан", "Sisian"],
    meghri: ["Մեղրի", "Мегри", "Meghri"],
    ijevan: ["Իջևան", "Иджеван", "Ijevan"],
    berd: ["Բերդ", "Берд", "Berd"],
    noemberyan: ["Նոյեմբերյան", "Ноемберян", "Noyemberyan"],
    gavar: ["Գավառ", "Гавар", "Gavar"],
    martuni: ["Մարտունի", "Мартуни", "Martuni"],
    vardenis: ["Վարդենիս", "Варденис", "Vardenis"],
    chambarak: ["Ճամբարակ", "Чамбарак", "Chambarak"],
    charentsavan: ["Չարենցավան", "Чаренцаван", "Charentsavan"],
    byureghavan: ["Բյուրեղավան", "Бюрегаван", "Byureghavan"],
    yeghvard: ["Եղվարդ", "Егвард", "Yeghvard"],
    tsaghkadzor: ["Ծաղկաձոր", "Цахкадзор", "Tsaghkadzor"],
    masis: ["Մասիս", "Масис", "Masis"],
    vedi: ["Վեդի", "Веди", "Vedi"],
    talin: ["Թալին", "Талин", "Talin"],
    aparan: ["Ապարան", "Апаран", "Aparan"],
    artik: ["Արթիկ", "Артик", "Artik"],
    maralik: ["Մարալիկ", "Маралик", "Maralik"],
    spitak: ["Սպիտակ", "Спитак", "Spitak"],
    alaverdi: ["Ալավերդի", "Алаверди", "Alaverdi"],
    stepanavan: ["Ստեփանավան", "Степанаван", "Stepanavan"],
    tashir: ["Տաշիր", "Ташир", "Tashir"],
    jermuk: ["Ջերմուկ", "Джермук", "Jermuk"],
    yeghegnadzor: ["Եղեգնաձոր", "Ехегнадзор", "Yeghegnadzor"],
    vayk: ["Վայք", "Вайк", "Vayk"],
};

function normalize(value) {
    return String(value)
        .normalize("NFKC")
        .trim()
        .toLocaleLowerCase()
        .replace(/և/g, "եւ")
        .replace(/\s+/g, " ");
}

/*
 * Գույնի «Սպիտակ» և քաղաքի «Սպիտակ» անունները
 * տարբերակելու համար օգտագործում ենք նաև դաշտի տեսակը։
 */
const LOCATION_KEYS = new Set([
    "yerevan",
    "aragatsotn",
    "ararat",
    "armavir",
    "gegharkunik",
    "kotayk",
    "lori",
    "shirak",
    "syunik",
    "tavush",
    "vayotsDzor",
    "vagharshapat",
    "ejmiatsin",
    "gyumri",
    "vanadzor",
    "abovyan",
    "hrazdan",
    "ashtarak",
    "artashat",
    "sevan",
    "dilijan",
    "kapan",
    "goris",
    "sisian",
    "meghri",
    "ijevan",
    "berd",
    "noemberyan",
    "gavar",
    "martuni",
    "vardenis",
    "chambarak",
    "charentsavan",
    "byureghavan",
    "yeghvard",
    "tsaghkadzor",
    "masis",
    "vedi",
    "talin",
    "aparan",
    "artik",
    "maralik",
    "spitak",
    "alaverdi",
    "stepanavan",
    "tashir",
    "jermuk",
    "yeghegnadzor",
    "vayk",
]);

const VALUE_LOOKUP = new Map();
const LOCATION_LOOKUP = new Map();

for (const [key, translations] of Object.entries(VALUES)) {
    const lookup = LOCATION_KEYS.has(key) ? LOCATION_LOOKUP : VALUE_LOOKUP;

    for (const value of [key, ...translations]) {
        lookup.set(normalize(value), key);
    }
}

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
    grey: "gray",
    sev: "black",
    spitak: "white",
    karmir: "red",
    kapuyt: "blue",
    kanach: "green",
    dexin: "yellow",
    moxraguyn: "gray",
    mokhraguyn: "gray",
    arcataguyn: "silver",
    черный: "black",
    зеленый: "green",
    желтый: "yellow",
    auto: "automatic",
    at: "automatic",
    автоматическая: "automatic",
    автоматический: "automatic",
    ավտոմատիկ: "automatic",
    mechanic: "manual",
    mechanical: "manual",
    mt: "manual",
    механическая: "manual",
    մեխանիկա: "manual",
    robot: "robotic",
    роботизированная: "robotic",
    variator: "cvt",
};

for (const [alias, key] of Object.entries(ALIASES)) {
    VALUE_LOOKUP.set(normalize(alias), key);
}

const LOCATION_ALIASES = {
    erevan: "yerevan",
    երեվան: "yerevan",
    ejmiacin: "ejmiatsin",
    echmiadzin: "ejmiatsin",
    etchmiadzin: "ejmiatsin",
    noyemberyan: "noemberyan",
};

for (const [alias, key] of Object.entries(LOCATION_ALIASES)) {
    LOCATION_LOOKUP.set(normalize(alias), key);
}

export function uiText(language, key) {
    const index = LANGUAGE_INDEX[language] ?? 0;
    return UI[key]?.[index] ?? key;
}

export function localizeListingValue(value, language = "hy", field = "") {
    if (value === undefined || value === null || value === "") {
        return value;
    }

    const normalized = normalize(value);
    const isLocation = [
        "region",
        "community",
        "settlement",
        "location",
    ].includes(field);

    const key = isLocation
        ? LOCATION_LOOKUP.get(normalized)
        : VALUE_LOOKUP.get(normalized) || LOCATION_LOOKUP.get(normalized);

    if (!key) return value;

    return VALUES[key][LANGUAGE_INDEX[language] ?? 0];
}

export function localizeListingFields(product, language = "hy") {
    if (!product || typeof product !== "object") {
        return product;
    }

    const localized = { ...product };

    for (const field of [
        "fuel",
        "steering",
        "condition",
        "color",
        "region",
        "community",
        "settlement",
        "transmission",
        "gearbox",
        "gearboxType",
    ]) {
        localized[field] = localizeListingValue(
            product[field],
            language,
            field,
        );
    }

    return localized;
}
