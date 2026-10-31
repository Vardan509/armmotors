import { useI18n } from "./i18n";

const LANGUAGES = {
    hy: 0,
    ru: 1,
    en: 2,
};

const TEXTS = {
    account: ["Անձնական էջ", "Личный кабинет", "My account"],
    accountIntro: [
        "Կառավարեք Ձեր հայտարարությունները, հետևեք վիճակագրությանը և գնման հայտերին։",
        "Управляйте объявлениями, следите за статистикой и заявками на покупку.",
        "Manage your listings, track statistics, and review purchase requests.",
    ],
    promotion: ["Առաջխաղացում", "Продвижение", "Promotion"],
    loading: ["Բեռնվում է...", "Загрузка...", "Loading..."],
    loginTitle: [
        "Մուտք գործեք Ձեր հաշիվ",
        "Войдите в свой аккаунт",
        "Sign in to your account",
    ],
    loginDescription: [
        "Հայտարարությունները կառավարելու համար մուտք գործեք։",
        "Войдите, чтобы управлять объявлениями.",
        "Sign in to manage your listings.",
    ],
    login: ["Մուտք գործել", "Войти", "Sign in"],
    profile: ["Իմ պրոֆիլը", "Мой профиль", "My profile"],
    phoneMissing: [
        "Հեռախոսահամար նշված չէ",
        "Номер телефона не указан",
        "Phone number not provided",
    ],
    favorites: ["Իմ հավանածները", "Моё избранное", "My favorites"],
    statistics: [
        "Հայտարարությունների վիճակագրություն",
        "Статистика объявлений",
        "Listing statistics",
    ],
    totalListings: [
        "Ընդհանուր հայտարարություններ",
        "Всего объявлений",
        "Total listings",
    ],
    activeListings: [
        "Ակտիվ հայտարարություններ",
        "Активные объявления",
        "Active listings",
    ],
    soldListings: [
        "Վաճառված հայտարարություններ",
        "Проданные объявления",
        "Sold listings",
    ],
    totalViews: ["Ընդհանուր դիտումներ", "Всего просмотров", "Total views"],
    myListings: ["Իմ հայտարարությունները", "Мои объявления", "My listings"],
    manageListings: [
        "Կառավարեք Ձեր տեղադրած մեքենաներն ու պահեստամասերը։",
        "Управляйте объявлениями об автомобилях и запчастях.",
        "Manage your car and spare part listings.",
    ],
    add: ["Ավելացնել", "Добавить", "Add"],
    addListing: [
        "Տեղադրել հայտարարություն",
        "Разместить объявление",
        "Post a listing",
    ],
    loadError: [
        "Տվյալները բեռնել չհաջողվեց։ Կրկին փորձեք։",
        "Не удалось загрузить данные. Попробуйте ещё раз.",
        "Could not load the data. Please try again.",
    ],
    actionError: [
        "Գործողությունը չհաջողվեց։ Կրկին փորձեք։",
        "Не удалось выполнить действие. Попробуйте ещё раз.",
        "Could not complete the action. Please try again.",
    ],
    noListings: [
        "Դեռ հայտարարություններ չունեք",
        "У вас пока нет объявлений",
        "You have no listings yet",
    ],
    firstListing: [
        "Ավելացրեք Ձեր առաջին մեքենան կամ պահեստամասը։",
        "Добавьте свой первый автомобиль или запчасть.",
        "Add your first car or spare part.",
    ],
    noImage: ["Նկար չկա", "Нет фото", "No image"],
    active: ["Ակտիվ", "Активное", "Active"],
    draft: ["Սևագիր", "Черновик", "Draft"],
    sold: ["Վաճառված", "Продано", "Sold"],
    views: ["դիտում", "просмотров", "views"],
    price: ["Գին", "Цена", "Price"],
    status: ["Կարգավիճակ", "Статус", "Status"],
    save: ["Պահպանել", "Сохранить", "Save"],
    cancel: ["Չեղարկել", "Отмена", "Cancel"],
    view: ["Դիտել", "Посмотреть", "View"],
    edit: ["Խմբագրել", "Редактировать", "Edit"],
    delete: ["Ջնջել", "Удалить", "Delete"],
    deleteConfirm: [
        "Վստա՞հ եք, որ ուզում եք ջնջել հայտարարությունը։",
        "Вы уверены, что хотите удалить объявление?",
        "Are you sure you want to delete this listing?",
    ],
    paymentPending: [
        "Հայտարարությունը սպասում է վճարման հաստատմանը։",
        "Объявление ожидает подтверждения оплаты.",
        "This listing is awaiting payment confirmation.",
    ],
    viewRequest: ["Դիտել հայտը", "Посмотреть заявку", "View request"],
    myOrders: [
        "Իմ գնման հայտերը",
        "Мои заявки на покупку",
        "My purchase requests",
    ],
    ordersIntro: [
        "Ձեր կատարած հայտերի ընթացիկ կարգավիճակները։",
        "Текущие статусы ваших заявок.",
        "The current status of your purchase requests.",
    ],
    noOrders: [
        "Գնման հայտեր դեռ չկան",
        "Заявок на покупку пока нет",
        "No purchase requests yet",
    ],
    ordersEmpty: [
        "Ձեր գնման հայտերը կհայտնվեն այստեղ։",
        "Ваши заявки на покупку появятся здесь.",
        "Your purchase requests will appear here.",
    ],
    pending: ["Սպասում է", "Ожидает", "Pending"],
    completed: ["Հաստատված", "Подтверждено", "Confirmed"],
    cancelled: ["Չեղարկված", "Отменено", "Cancelled"],
    cancelOrder: ["Չեղարկել հայտը", "Отменить заявку", "Cancel request"],
    seller: ["Վաճառող", "Продавец", "Seller"],
    sellerUnavailable: [
        "Վաճառողը հասանելի չէ",
        "Продавец недоступен",
        "Seller unavailable",
    ],
    sellerIntro: [
        "ArmMotors-ի վաճառող",
        "Продавец ArmMotors",
        "ArmMotors seller",
    ],
    joined: [
        "ArmMotors-ում՝ {year} թվականից",
        "На ArmMotors с {year} года",
        "On ArmMotors since {year}",
    ],
    sellerListings: [
        "{name}-ի հայտարարությունները",
        "Объявления: {name}",
        "Listings by {name}",
    ],
    found: [
        "Գտնվել է {count} հայտարարություն",
        "Найдено объявлений: {count}",
        "Listings found: {count}",
    ],
    home: ["Գլխավոր", "Главная", "Home"],
    listings: ["Հայտարարություններ", "Объявления", "Listings"],
    breadcrumb: ["Էջի ուղի", "Навигация по страницам", "Breadcrumb"],
    backListings: [
        "Վերադառնալ հայտարարություններին",
        "Вернуться к объявлениям",
        "Back to listings",
    ],
    cars: ["Մեքենաներ", "Автомобили", "Cars"],
    parts: ["Պահեստամասեր", "Запчасти", "Spare parts"],
    all: ["Բոլորը", "Все", "All"],
    listingType: ["Հայտարարության տեսակ", "Тип объявления", "Listing type"],
    sort: ["Դասավորել", "Сортировка", "Sort by"],
    newest: ["Նորերը սկզբում", "Сначала новые", "Newest first"],
    priceAsc: [
        "Գին՝ աճման կարգով",
        "Цена: по возрастанию",
        "Price: low to high",
    ],
    priceDesc: [
        "Գին՝ նվազման կարգով",
        "Цена: по убыванию",
        "Price: high to low",
    ],
    mostViewed: ["Ամենադիտվածները", "Самые просматриваемые", "Most viewed"],
    emptyListings: ["Հայտարարություններ չկան", "Объявлений нет", "No listings"],
    emptySection: [
        "Այս բաժնում ակտիվ հայտարարություններ դեռ չկան։",
        "В этом разделе пока нет активных объявлений.",
        "There are no active listings in this section yet.",
    ],
    showAll: ["Ցույց տալ բոլորը", "Показать все", "Show all"],
    footerDescription: [
        "ArmMotors-ը ավտոմեքենաների և պահեստամասերի հայտարարությունների հարթակ է ամբողջ Հայաստանում։ Գտեք Ձեր հաջորդ մեքենան կամ տեղադրեք հայտարարություն։",
        "ArmMotors — платформа объявлений об автомобилях и запчастях по всей Армении. Найдите свой следующий автомобиль или разместите объявление.",
        "ArmMotors is a marketplace for cars and spare parts across Armenia. Find your next car or post a listing.",
    ],
    quickLinks: ["Արագ հղումներ", "Быстрые ссылки", "Quick links"],
    categories: ["Կատեգորիաներ", "Категории", "Categories"],
    contact: ["Կապ մեզ հետ", "Связаться с нами", "Contact us"],
    allCars: ["Բոլոր մեքենաները", "Все автомобили", "All cars"],
    electric: ["Էլեկտրական", "Электромобили", "Electric cars"],
    hybrid: ["Հիբրիդ", "Гибриды", "Hybrid cars"],
    support: [
        "Հարցերի դեպքում կապվեք մեզ հետ",
        "Свяжитесь с нами по вопросам",
        "Contact us for assistance",
    ],
    follow: ["Հետևեք մեզ", "Мы в соцсетях", "Follow us"],
    rights: [
        "Բոլոր իրավունքները պաշտպանված են։",
        "Все права защищены.",
        "All rights reserved.",
    ],
    slogan: [
        "Ձեր հաջորդ մեքենան սկսվում է այստեղից։",
        "Ваш следующий автомобиль начинается здесь.",
        "Your next car starts here.",
    ],
    armenia: ["Հայաստան", "Армения", "Armenia"],
    madeForArmenia: [
        "Ստեղծված է Հայաստանի համար",
        "Создано для Армении",
        "Made for Armenia",
    ],
    lettersTitle: [
        "Նամակներ ադմինիստրացիայից",
        "Письма от администрации",
        "Messages from administration",
    ],
    refresh: ["Թարմացնել", "Обновить", "Refresh"],
    noLetters: ["Նամակներ դեռ չկան", "Писем пока нет", "No messages yet"],
    lettersEmpty: [
        "ArmMotors-ի ադմինիստրացիայի հաղորդագրություններն այստեղ կհայտնվեն։",
        "Сообщения администрации ArmMotors появятся здесь.",
        "Messages from the ArmMotors administration will appear here.",
    ],
    read: ["Կարդացված", "Прочитано", "Read"],
    unread: ["Նոր", "Новое", "New"],
};

export default function usePageText() {
    const { language } = useI18n();

    const index = LANGUAGES[language] ?? 0;

    function tr(key, values = {}) {
        const template = TEXTS[key]?.[index] ?? key;

        return template.replace(/\{(\w+)\}/g, (match, name) =>
            values[name] !== undefined ? String(values[name]) : match,
        );
    }

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    return { tr, language, locale };
}
