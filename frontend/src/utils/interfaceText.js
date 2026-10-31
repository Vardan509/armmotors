import { useI18n } from "./i18n";

const TEXTS = {
    loading: ["Բեռնվում է...", "Загрузка...", "Loading..."],
    sending: ["Ուղարկվում է...", "Отправка...", "Sending..."],
    send: ["Ուղարկել", "Отправить", "Send"],
    sent: ["Ուղարկված է", "Отправлено", "Sent"],
    close: ["Փակել", "Закрыть", "Close"],
    cancel: ["Չեղարկել", "Отмена", "Cancel"],
    retry: ["Կրկին փորձել", "Повторить", "Try again"],
    back: ["Հետ", "Назад", "Back"],
    refresh: ["Թարմացնել", "Обновить", "Refresh"],
    account: ["Իմ հաշիվը", "Мой аккаунт", "My account"],
    login: ["Մուտք գործել", "Войти", "Sign in"],
    name: ["Անուն", "Имя", "Name"],
    email: ["Էլ. փոստ", "Эл. почта", "Email"],
    listing: ["Հայտարարություն", "Объявление", "Listing"],
    user: ["Օգտատեր", "Пользователь", "User"],
    read: ["Կարդացված", "Прочитано", "Read"],
    new: ["Նոր", "Новое", "New"],

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
    sendError: [
        "Հաղորդագրությունն ուղարկել չհաջողվեց։",
        "Не удалось отправить сообщение.",
        "Could not send the message.",
    ],

    search: ["Որոնել", "Поиск", "Search"],
    searchPlaceholder: [
        "Որոնել՝ BMW X5, Toyota Camry...",
        "Поиск: BMW X5, Toyota Camry...",
        "Search: BMW X5, Toyota Camry...",
    ],
    searchLabel: [
        "Մեքենաների և պահեստամասերի որոնում",
        "Поиск автомобилей и запчастей",
        "Search cars and spare parts",
    ],

    promotion: [
        "Հայտարարության առաջխաղացում",
        "Продвижение объявления",
        "Listing promotion",
    ],
    promotionTitle: [
        "Առաջխաղացում և փաթեթներ",
        "Продвижение и пакеты",
        "Promotion and packages",
    ],
    paymentAdmin: [
        "Վճարումների հաստատում",
        "Подтверждение платежей",
        "Payment confirmation",
    ],
    paymentAdminIntro: [
        "Հաստատեք միայն իրականում ստացված և ստուգված վճարումները։",
        "Подтверждайте только фактически полученные и проверенные платежи.",
        "Confirm only payments that have been received and verified.",
    ],
    loginRequired: [
        "Այս բաժնից օգտվելու համար մուտք գործեք։",
        "Войдите, чтобы пользоваться этим разделом.",
        "Sign in to use this section.",
    ],
    freePublications: [
        "Անվճար հրապարակումներ",
        "Бесплатные публикации",
        "Free listings",
    ],
    remaining: [
        "Մնացել է {count} անվճար հայտարարություն։",
        "Осталось бесплатных объявлений: {count}.",
        "Free listings remaining: {count}.",
    ],
    publicationRules: [
        "Առաջին {limit} հրապարակումներն անվճար են։ Հաջորդ յուրաքանչյուրի համար՝ {price}։",
        "Первые {limit} публикаций бесплатны. Каждая следующая — {price}.",
        "Your first {limit} listings are free. Each additional listing costs {price}.",
    ],
    publicationPaid: [
        "Նոր հայտարարություն՝ {price}",
        "Новое объявление — {price}",
        "New listing: {price}",
    ],
    publicationPending: [
        "Հրապարակելիս կստեղծվի վճարման հայտ։ Հայտարարությունը կհրապարակվի վճարման հաստատումից հետո։",
        "При публикации будет создана заявка на оплату. Объявление появится после подтверждения платежа.",
        "Publishing creates a payment request. The listing goes live after payment confirmation.",
    ],
    packages: [
        "Առավելությունների փաթեթներ",
        "Пакеты продвижения",
        "Promotion packages",
    ],
    top7: ["TOP՝ 7 օր", "TOP — 7 дней", "TOP — 7 days"],
    top30: ["TOP՝ 30 օր", "TOP — 30 дней", "TOP — 30 days"],
    auto7: [
        "Ավտոթարմացում՝ 7 օր",
        "Автообновление — 7 дней",
        "Auto refresh — 7 days",
    ],
    days7: ["7 օր", "7 дней", "7 days"],
    days30: ["30 օր", "30 дней", "30 days"],
    topBenefit: [
        "TOP նշան և առաջնահերթ ցուցադրում։",
        "Значок TOP и приоритетный показ.",
        "A TOP badge and priority placement.",
    ],
    topMonthBenefit: [
        "Առաջնահերթություն ցուցակի վերին հատվածում՝ 30 օր։",
        "Приоритетное размещение в верхней части списка на 30 дней.",
        "Priority placement near the top of the list for 30 days.",
    ],
    autoBenefit: [
        "Ամենօրյա ավտոմատ թարմացում՝ 7 օր։",
        "Ежедневное автоматическое обновление в течение 7 дней.",
        "Automatic daily refresh for 7 days.",
    ],
    managePackages: [
        "Փաթեթ ընտրելու համար բացեք Ձեր հայտարարությունների կառավարումը։",
        "Чтобы выбрать пакет, откройте управление своими объявлениями.",
        "Open your listing management page to select a package.",
    ],
    paymentWarning: [
        "Ավտոմատ գանձում միացված չէ։ Հայտն ակտիվացնում է ադմինը՝ վճարումը ստուգելուց հետո։",
        "Автоматическое списание не подключено. Администратор активирует заявку после проверки платежа.",
        "Automatic charging is not enabled. An administrator activates the request after verifying payment.",
    ],
    payments: [
        "Իմ վճարման հայտերը",
        "Мои заявки на оплату",
        "My payment requests",
    ],
    pendingPayments: ["Վճարման հայտեր", "Заявки на оплату", "Payment requests"],
    noPayments: [
        "Վճարման հայտեր դեռ չկան։",
        "Заявок на оплату пока нет.",
        "No payment requests yet.",
    ],
    publication: ["Վճարովի հրապարակում", "Платная публикация", "Paid listing"],
    paid: ["Հաստատված", "Подтверждено", "Confirmed"],
    rejected: ["Մերժված", "Отклонено", "Rejected"],
    pending: ["Սպասող", "Ожидает", "Pending"],
    reference: [
        "Վճարման հաստատման համար",
        "Номер подтверждения платежа",
        "Payment reference",
    ],
    referenceRequired: [
        "Նշեք իրական վճարման հաստատման համարը։",
        "Укажите номер подтверждённого платежа.",
        "Enter the verified payment reference.",
    ],
    approve: ["Հաստատել", "Подтвердить", "Approve"],
    reject: ["Մերժել", "Отклонить", "Reject"],
    updated: ["Կարգավիճակը թարմացվեց։", "Статус обновлён.", "Status updated."],
    topActive: ["★ TOP ակտիվ", "★ TOP активен", "★ TOP active"],
    allTerms: ["Բոլոր պայմանները", "Все условия", "All terms"],
    refreshEvery4: [
        "Թարմացնել՝ 4 օրը մեկ",
        "Обновить — раз в 4 дня",
        "Refresh — once every 4 days",
    ],
    refreshed: [
        "Հայտարարությունը թարմացվեց։",
        "Объявление обновлено.",
        "Listing refreshed.",
    ],
    requestCreated: [
        "Վճարման հայտը ստեղծվեց։ Այն կակտիվանա ադմինի հաստատումից հետո։",
        "Заявка на оплату создана. Она активируется после подтверждения администратора.",
        "Payment request created. It will activate after administrator approval.",
    ],
    createRequest: ["Ստեղծել հայտ", "Создать заявку", "Create request"],

    support: ["Օգնություն", "Помощь", "Support"],
    writeAdmin: [
        "Գրել ադմինին",
        "Написать администратору",
        "Contact administration",
    ],
    supportTitle: ["Ինչո՞վ օգնենք", "Чем помочь?", "How can we help?"],
    business: ["Բիզնես առաջարկ", "Бизнес-предложение", "Business proposal"],
    businessIntro: [
        "Գովազդի կամ համագործակցության համար լրացրեք տվյալներն ու ուղարկեք առաջարկը։",
        "Для рекламы или сотрудничества заполните данные и отправьте предложение.",
        "For advertising or collaboration, enter your details and send a proposal.",
    ],
    businessBadge: [
        "Գովազդի և համագործակցության հարցում",
        "Запрос на рекламу и сотрудничество",
        "Advertising and collaboration inquiry",
    ],
    businessTemplate: [
        "Բարև Ձեզ։ Ցանկանում եմ գովազդ տեղադրել ArmMotors կայքում։ Խնդրում եմ տեղեկացնել պայմանները և արժեքները։",
        "Здравствуйте! Я хочу разместить рекламу на ArmMotors. Пожалуйста, сообщите условия и стоимость.",
        "Hello! I would like to advertise on ArmMotors. Please share the terms and pricing.",
    ],
    yourProposal: [
        "Ձեր բիզնես առաջարկը",
        "Ваше бизнес-предложение",
        "Your business proposal",
    ],
    yourQuestion: ["Ձեր հարցը", "Ваш вопрос", "Your question"],
    proposalPlaceholder: [
        "Նկարագրեք Ձեր առաջարկը...",
        "Опишите ваше предложение...",
        "Describe your proposal...",
    ],
    messagePlaceholder: [
        "Գրեք Ձեր հաղորդագրությունը...",
        "Напишите сообщение...",
        "Write your message...",
    ],
    sendBusiness: [
        "Ուղարկել բիզնես առաջարկը",
        "Отправить предложение",
        "Send proposal",
    ],
    sendMessage: [
        "Ուղարկել հաղորդագրությունը",
        "Отправить сообщение",
        "Send message",
    ],
    supportSuccess: [
        "Հաղորդագրությունն ուղարկված է։ Կարող ենք պատասխանել Ձեր նշած էլ. փոստով։",
        "Сообщение отправлено. Мы можем ответить на указанный email.",
        "Message sent. We can reply to the email address you provided.",
    ],
    businessSuccess: [
        "Բիզնես առաջարկն ուղարկված է։ Կարող ենք պատասխանել Ձեր նշած էլ. փոստով։",
        "Предложение отправлено. Мы можем ответить на указанный email.",
        "Proposal sent. We can reply to the email address you provided.",
    ],
    newMessage: ["Նոր հաղորդագրություն", "Новое сообщение", "New message"],
    tooLong: [
        "Հաղորդագրությունը չափազանց երկար է։",
        "Сообщение слишком длинное.",
        "The message is too long.",
    ],

    messages: ["Հաղորդագրություններ", "Сообщения", "Messages"],
    myMessages: ["Իմ հաղորդագրությունները", "Мои сообщения", "My messages"],
    messagesIntro: [
        "Կապ հաստատեք վաճառողների և գնորդների հետ։",
        "Общайтесь с продавцами и покупателями.",
        "Connect with sellers and buyers.",
    ],
    chatLogin: [
        "Զրույցները տեսնելու համար մուտք գործեք։",
        "Войдите, чтобы просматривать переписки.",
        "Sign in to view your conversations.",
    ],
    conversations: ["Զրույցներ", "Переписки", "Conversations"],
    noChats: [
        "Դեռ զրույցներ չունեք։",
        "У вас пока нет переписок.",
        "You have no conversations yet.",
    ],
    chatStarted: [
        "Զրույցը սկսված է",
        "Переписка начата",
        "Conversation started",
    ],
    chooseChat: [
        "Ընտրեք զրույցը",
        "Выберите переписку",
        "Choose a conversation",
    ],
    chooseUser: [
        "Ցանկից ընտրեք օգտատիրոջը։",
        "Выберите пользователя из списка.",
        "Select a user from the list.",
    ],
    firstMessage: [
        "Գրեք առաջին հաղորդագրությունը։",
        "Напишите первое сообщение.",
        "Write the first message.",
    ],
    messageCount: [
        "Հաղորդագրություններ՝ {count}",
        "Сообщений: {count}",
        "Messages: {count}",
    ],
    message: ["Հաղորդագրություն", "Сообщение", "Message"],

    notifications: ["Ծանուցումներ", "Уведомления", "Notifications"],
    unreadCount: [
        "Չկարդացված՝ {count}",
        "Непрочитанных: {count}",
        "Unread: {count}",
    ],
    noNotifications: [
        "Ծանուցումներ չկան",
        "Уведомлений нет",
        "No notifications",
    ],
    notificationsIntro: [
        "Ադմինի նամակներն ու նոր հաղորդագրություններն այստեղ կերևան։",
        "Здесь появятся письма администрации и новые сообщения.",
        "Administration announcements and new messages will appear here.",
    ],

    photos: [
        "Հայտարարության նկարներ",
        "Фотографии объявления",
        "Listing photos",
    ],
    photoRules: [
        "Ընտրեք մինչև 12 նկար՝ JPEG, PNG կամ WebP ձևաչափով, յուրաքանչյուրը՝ մինչև 5 ՄԲ։ Նկարներն ավտոմատ կվերբեռնվեն։",
        "Выберите до 12 изображений JPEG, PNG или WebP, до 5 МБ каждое. Загрузка начнётся автоматически.",
        "Select up to 12 JPEG, PNG, or WebP images, up to 5 MB each. They will upload automatically.",
    ],
    invalidPhotos: [
        "Ընտրեք JPEG, PNG կամ WebP նկարներ՝ մինչև 5 ՄԲ։",
        "Выберите изображения JPEG, PNG или WebP размером до 5 МБ.",
        "Choose JPEG, PNG, or WebP images up to 5 MB each.",
    ],
    tooManyPhotos: [
        "Թույլատրվում է առավելագույնը 12 նկար։",
        "Допускается не более 12 изображений.",
        "A maximum of 12 images is allowed.",
    ],
    uploadError: [
        "Նկարները վերբեռնել չհաջողվեց։",
        "Не удалось загрузить изображения.",
        "Could not upload the images.",
    ],
    choosePhotos: ["Ընտրել նկարներ", "Выбрать изображения", "Choose images"],
    uploading: [
        "Նկարները վերբեռնվում են...",
        "Изображения загружаются...",
        "Uploading images...",
    ],
    waitUpload: [
        "Սպասեք մինչև վերբեռնումն ավարտվի",
        "Дождитесь завершения загрузки",
        "Wait for the upload to finish",
    ],
    clickPhotos: [
        "Սեղմեք այստեղ՝ նկարներ ընտրելու համար",
        "Нажмите здесь, чтобы выбрать изображения",
        "Click here to select images",
    ],
    processingPhotos: [
        "Նկարները մշակվում և պահպանվում են...",
        "Изображения обрабатываются и сохраняются...",
        "Processing and saving images...",
    ],
    selectedPhoto: [
        "Ընտրված նկար {number}",
        "Выбранное изображение {number}",
        "Selected image {number}",
    ],

    car: ["Ավտոմեքենա", "Автомобиль", "Car"],
    gallery: [
        "Հայտարարության նկարներ",
        "Фотографии объявления",
        "Listing images",
    ],
    moveImage: [
        "Մեծացնել կամ տեղափոխել նկարը",
        "Увеличить или переместить изображение",
        "Zoom or move the image",
    ],
    image: ["Նկար {number}", "Изображение {number}", "Image {number}"],
    imageUnavailable: [
        "Նկարը հասանելի չէ",
        "Изображение недоступно",
        "Image unavailable",
    ],
    previousImage: ["Նախորդ նկար", "Предыдущее изображение", "Previous image"],
    nextImage: ["Հաջորդ նկար", "Следующее изображение", "Next image"],
    zoomOut: ["Փոքրացնել", "Уменьшить", "Zoom out"],
    zoomIn: ["Մեծացնել", "Увеличить", "Zoom in"],
    resetImage: ["Վերականգնել", "Сбросить", "Reset"],
    showImage: [
        "Ցուցադրել նկար {number}",
        "Показать изображение {number}",
        "Show image {number}",
    ],
};

export default function useInterfaceText() {
    const { language } = useI18n();

    const index = language === "ru" ? 1 : language === "en" ? 2 : 0;

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
