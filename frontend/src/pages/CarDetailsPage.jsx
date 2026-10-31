import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CarDetailsAd from "../components/CarDetailsAd";
import ProductCard from "../components/ProductCard/ProductCard";
import ReportProduct from "../components/ReportProduct";
import CurrencySelect from "../components/CurrencySelect";
import CarImageGallery from "../components/CarImageGallery/CarImageGallery";
import TranslatedDescription from "../components/TranslatedDescription";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";
import useProducts from "../utils/useProducts";
import useCurrency from "../utils/useCurrency";
import useFavorite from "../utils/useFavorite";
import { localizeListingValue } from "../utils/localizeListing";

import "./CarDetailsPage.css";
import "./SellerContact.css";
import "./CarDetailsExtra.css";

const LANGUAGE_INDEX = {
    hy: 0,
    ru: 1,
    en: 2,
};

/*
 * Յուրաքանչյուր տողի հերթականությունը՝
 * հայերեն, ռուսերեն, անգլերեն։
 */
const TEXTS = {
    technical: [
        "Լրացուցիչ տեխնիկական տվյալներ",
        "Дополнительные характеристики",
        "Additional specifications",
    ],
    interior: [
        "Սրահ և հարմարավետություն",
        "Салон и комфорт",
        "Interior and comfort",
    ],
    exterior: [
        "Արտաքին տվյալներ",
        "Внешние характеристики",
        "Exterior features",
    ],
    comfort: [
        "Կոմֆորտ և հնարավորություններ",
        "Комфорт и оснащение",
        "Comfort and features",
    ],
    customsCleared: ["Մաքսազերծված է", "Растаможен", "Customs cleared"],
    paintCondition: ["Ներկի վիճակ", "Состояние краски", "Paint condition"],
    gasEquipment: ["Գազի սարքավորում", "Газовое оборудование", "Gas equipment"],
    gasCylinderReplaced: [
        "Գազի բալոնը փոխված է",
        "Газовый баллон заменён",
        "Gas cylinder replaced",
    ],
    wheelSize: ["Անվահեծերի չափ", "Размер дисков", "Wheel size"],
    interiorMaterial: ["Սրահի նյութ", "Материал салона", "Interior material"],
    sunroof: ["Լյուկ", "Люк", "Sunroof"],
    headlights: ["Լուսարձակներ", "Фары", "Headlights"],
    yes: ["Այո", "Да", "Yes"],
    no: ["Ոչ", "Нет", "No"],
    original: ["Գործարանային ներկ", "Заводская краска", "Original paint"],
    repainted: ["Վերաներկված", "Перекрашен", "Repainted"],
    installed: ["Տեղադրված է", "Установлено", "Installed"],
    notInstalled: ["Տեղադրված չէ", "Не установлено", "Not installed"],
    fabric: ["Կտոր", "Ткань", "Fabric"],
    leather: ["Կաշի", "Кожа", "Leather"],
    artificial: ["Արհեստական կաշի", "Искусственная кожа", "Artificial leather"],
    alcantara: ["Ալկանտարա", "Алькантара", "Alcantara"],
    other: ["Այլ", "Другое", "Other"],
    standard: ["Սովորական լյուկ", "Обычный люк", "Standard sunroof"],
    panoramic: ["Պանորամային լյուկ", "Панорамный люк", "Panoramic sunroof"],
    none: ["Չկա", "Отсутствует", "None"],
    halogen: ["Հալոգեն", "Галогенные", "Halogen"],
    xenon: ["Քսենոն", "Ксеноновые", "Xenon"],
    led: ["LED", "Светодиодные", "LED"],

    airConditioning: ["Օդորակիչ", "Кондиционер", "Air conditioning"],
    climateControl: ["Կլիմատ-կոնտրոլ", "Климат-контроль", "Climate control"],
    heatedSeats: ["Նստատեղերի տաքացում", "Подогрев сидений", "Heated seats"],
    ventilatedSeats: [
        "Նստատեղերի օդափոխություն",
        "Вентиляция сидений",
        "Ventilated seats",
    ],
    heatedSteering: ["Ղեկի տաքացում", "Подогрев руля", "Heated steering wheel"],
    heatedWindshield: [
        "Դիմապակու տաքացում",
        "Обогрев лобового стекла",
        "Heated windshield",
    ],
    cruiseControl: ["Կրուիզ-կոնտրոլ", "Круиз-контроль", "Cruise control"],
    adaptiveCruise: [
        "Ադապտիվ կրուիզ-կոնտրոլ",
        "Адаптивный круиз-контроль",
        "Adaptive cruise control",
    ],
    parkingSensors: ["Կայանման սենսորներ", "Парктроники", "Parking sensors"],
    rearCamera: ["Հետևի տեսախցիկ", "Камера заднего вида", "Rear camera"],
    camera360: ["360° տեսախցիկ", "Камера 360°", "360° camera"],
    keylessEntry: [
        "Առանց բանալիի մուտք",
        "Бесключевой доступ",
        "Keyless entry",
    ],
    startStop: [
        "Start/Stop համակարգ",
        "Система Start/Stop",
        "Start/Stop system",
    ],
    electricSeats: [
        "Էլեկտրական նստատեղեր",
        "Электрорегулировка сидений",
        "Electric seats",
    ],
    memorySeats: ["Նստատեղերի հիշողություն", "Память сидений", "Memory seats"],
    navigation: ["Նավիգացիա", "Навигация", "Navigation"],
    bluetooth: ["Bluetooth", "Bluetooth", "Bluetooth"],
    appleCarplay: ["Apple CarPlay", "Apple CarPlay", "Apple CarPlay"],
    androidAuto: ["Android Auto", "Android Auto", "Android Auto"],

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

    purchaseSuccess: [
        "Հայտն ուղարկված է։ Հետևեք դրան «Իմ հաշիվը» բաժնում։",
        "Заявка отправлена. Вы можете отслеживать её в своём аккаунте.",
        "Request sent. You can track it in your account.",
    ],
    purchaseError: [
        "Հայտը ուղարկել չհաջողվեց։ Կրկին փորձեք։",
        "Не удалось отправить заявку. Попробуйте ещё раз.",
        "Could not send the request. Please try again.",
    ],
    breadcrumb: ["Էջի ուղի", "Навигация по страницам", "Breadcrumb"],
};

function normalize(value) {
    return String(value)
        .normalize("NFKC")
        .trim()
        .toLocaleLowerCase()
        .replace(/և/g, "եւ")
        .replace(/[‐‑–—]/g, "-")
        .replace(/\s+/g, " ");
}

const VALUE_KEYS = new Map();

for (const [key, values] of Object.entries(TEXTS)) {
    VALUE_KEYS.set(normalize(key), key);

    for (const value of values) {
        if (!VALUE_KEYS.has(normalize(value))) {
            VALUE_KEYS.set(normalize(value), key);
        }
    }
}

const ALIASES = {
    gasoline: "petrol",
    benzine: "petrol",
    benzin: "petrol",
    gaz: "gas",
    grey: "gray",
    черный: "black",
    зеленый: "green",
    желтый: "yellow",
    "б/у": "used",
    "բ/ու": "used",
    արհեստական: "artificial",
    искусственная: "artificial",
    էկոկաշի: "artificial",
    экокожа: "artificial",
    "eco leather": "artificial",
    սովորական: "standard",
    обычный: "standard",
    панорамный: "panoramic",
    պանորամային: "panoramic",
    հալոգենային: "halogen",
    ксенон: "xenon",
    галоген: "halogen",
    "ադապտիվ կրուիզ": "adaptiveCruise",
    "adaptive cruise": "adaptiveCruise",
    "360 տեսախցիկ": "camera360",
    "360 camera": "camera360",
    ереван: "yerevan",
    երեվան: "yerevan",
};

for (const [alias, key] of Object.entries(ALIASES)) {
    VALUE_KEYS.set(normalize(alias), key);
}

function textFor(key, language) {
    const index = LANGUAGE_INDEX[language] ?? 0;

    return TEXTS[key]?.[index] ?? key;
}

function translateValue(value, language) {
    if (value === true) return textFor("yes", language);
    if (value === false) return textFor("no", language);

    if (value === undefined || value === null || value === "") {
        return "—";
    }

    if (typeof value === "number") {
        return value;
    }

    const normalized = normalize(value);

    if (normalized === "true") {
        return textFor("yes", language);
    }

    if (normalized === "false") {
        return textFor("no", language);
    }

    const key = VALUE_KEYS.get(normalized);

    if (key) {
        return textFor(key, language);
    }

    // Նախկին ընդհանուր բառարանը պահում ենք՝
    // այնտեղ ներառված քաղաքներն էլ թարգմանելու համար։
    return localizeListingValue(value, language);
}

function getProductId(product) {
    return String(product?._id || product?.id || "");
}

function getSellerId(car) {
    const owner = car?.owner || car?.seller;

    if (!owner) return "";

    return typeof owner === "string"
        ? owner
        : String(owner._id || owner.id || "");
}

function hasValue(value) {
    return value !== undefined && value !== null && value !== "";
}

function normalizePhone(value) {
    const digits = String(value ?? "").replace(/\D/g, "");

    if (!digits) return "";

    let number = digits;

    if (/^0\d{8}$/.test(digits)) {
        number = `374${digits.slice(1)}`;
    } else if (/^\d{8}$/.test(digits)) {
        number = `374${digits}`;
    } else if (digits.startsWith("00")) {
        number = digits.slice(2);
    }

    if (number.length < 8 || number.length > 15 || number.startsWith("0")) {
        return "";
    }

    return number;
}

function ContactIcon({ type }) {
    const paths = {
        phone: (
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.79a2 2 0 0 1-.45 2.11L8.07 8.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.71A2 2 0 0 1 22 16.92Z" />
        ),
        whatsapp: (
            <>
                <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Z" />
                <path d="M8.5 8.5c.6 3 3 5.4 6 6" />
                <path d="m9 8 1.5 2-1 1m5 2 1.5 1-1 2" />
            </>
        ),
        viber: (
            <>
                <path d="M7 3.5h10a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-5l-4.5 3v-3H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z" />
                <path d="M9 8.5c.4 2.8 2.7 5.1 5.5 5.5" />
                <path d="M13 8a3 3 0 0 1 3 3" />
            </>
        ),
    };

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[type]}
        </svg>
    );
}

function SellerContact({ car }) {
    const { t } = useI18n();
    const number = normalizePhone(car?.phone);

    if (!number || car?.isDemo) {
        return (
            <p className="seller-contact-empty">{t("contactUnavailable")}</p>
        );
    }

    return (
        <div className="seller-contact">
            <a
                href={`tel:+${number}`}
                className="seller-contact-call"
                aria-label={`${t("callSeller")}: ${car.phone}`}
            >
                <ContactIcon type="phone" />

                <span>
                    <strong>{t("callSeller")}</strong>
                    <small>{car.phone}</small>
                </span>

                <span className="seller-contact-arrow" aria-hidden="true">
                    ↗
                </span>
            </a>

            <div className="seller-contact-messengers">
                <a
                    href={`https://wa.me/${number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="seller-contact-whatsapp"
                    aria-label="WhatsApp"
                >
                    <ContactIcon type="whatsapp" />
                    <span>WhatsApp</span>
                </a>

                <a
                    href={`viber://chat?number=%2B${number}`}
                    className="seller-contact-viber"
                    aria-label="Viber"
                >
                    <ContactIcon type="viber" />
                    <span>Viber</span>
                </a>
            </div>
        </div>
    );
}

function ExtraSpecs({ car, language }) {
    const label = (key) => textFor(key, language);
    const valueText = (value) => translateValue(value, language);

    const technical = [
        ["customsCleared", car.customsCleared],
        ["paintCondition", car.paintCondition],
        ["gasEquipment", car.gasEquipment],
        ["gasCylinderReplaced", car.gasCylinderReplaced],
        ["wheelSize", car.wheelSize],
    ].filter(([, value]) => hasValue(value));

    const interior = [
        ["interiorMaterial", car.interiorMaterial],
        ["sunroof", car.sunroof],
    ].filter(([, value]) => hasValue(value));

    const headlights = Array.isArray(car.headlights)
        ? car.headlights.filter(hasValue)
        : hasValue(car.headlights)
          ? [car.headlights]
          : [];

    const comfort = [
        ...new Set(
            [
                ...(Array.isArray(car.comfort) ? car.comfort : []),
                ...(Array.isArray(car.comfortOptions)
                    ? car.comfortOptions
                    : []),
            ]
                .filter(hasValue)
                .map((value) => String(value)),
        ),
    ];

    if (
        car.type === "part" ||
        !(
            technical.length ||
            interior.length ||
            headlights.length ||
            comfort.length
        )
    ) {
        return null;
    }

    function renderRows(items) {
        return (
            <dl className="ap-detail-extra-grid">
                {items.map(([key, value]) => (
                    <div key={key} className="ap-detail-extra-row">
                        <dt>{label(key)}</dt>
                        <dd>{valueText(value)}</dd>
                    </div>
                ))}
            </dl>
        );
    }

    function renderFeatures(items) {
        return (
            <div className="ap-detail-features">
                {items.map((item, index) => (
                    <span
                        key={`${item}-${index}`}
                        className="ap-detail-feature"
                    >
                        <span aria-hidden="true">✓</span>
                        {valueText(item)}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <section className="detail-panel ap-detail-extras">
            <div className="ap-detail-extra-title">
                <span className="ap-detail-extra-title-icon" aria-hidden="true">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
                        <path d="m3 12 9 4.5 9-4.5" />
                        <path d="m3 16.5 9 4.5 9-4.5" />
                    </svg>
                </span>

                <h2>{label("technical")}</h2>
            </div>

            {technical.length > 0 && (
                <div className="ap-detail-extra-section">
                    {renderRows(technical)}
                </div>
            )}

            {interior.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{label("interior")}</h3>
                    {renderRows(interior)}
                </div>
            )}

            {headlights.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{label("headlights")}</h3>
                    {renderFeatures(headlights)}
                </div>
            )}

            {comfort.length > 0 && (
                <div className="ap-detail-extra-section">
                    <h3>{label("comfort")}</h3>
                    {renderFeatures(comfort)}
                </div>
            )}
        </section>
    );
}

export default function CarDetailsPage({ id }) {
    const navigate = useNavigate();
    const { t, language } = useI18n();

    const [state, setState] = useState({
        car: null,
        loading: true,
        failed: false,
    });

    const [copied, setCopied] = useState(false);
    const [purchaseStatus, setPurchaseStatus] = useState("idle");

    const { products = [] } = useProducts();
    const { format } = useCurrency();
    const [favorite, toggleFavorite] = useFavorite(id);

    const locale =
        language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM";

    useEffect(() => {
        const controller = new AbortController();

        setState({
            car: null,
            loading: true,
            failed: false,
        });

        setCopied(false);
        setPurchaseStatus("idle");

        async function loadProduct() {
            if (!id) {
                setState({
                    car: null,
                    loading: false,
                    failed: true,
                });

                return;
            }

            try {
                const result = await apiRequest(
                    `/products/${encodeURIComponent(id)}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (controller.signal.aborted) return;

                setState({
                    car: result?.product || result,
                    loading: false,
                    failed: false,
                });
            } catch {
                if (controller.signal.aborted) return;

                setState({
                    car: null,
                    loading: false,
                    failed: true,
                });
            }
        }

        void loadProduct();

        return () => controller.abort();
    }, [id]);

    const { car, loading, failed } = state;

    /*
     * Եթե backend-ը տրամադրում է թարգմանված վերնագրեր,
     * օգտագործվում է ընտրված լեզվի տարբերակը։
     */
    const translatedTitle =
        car?.translations?.[language]?.title ||
        car?.titleTranslations?.[language];

    const title =
        (typeof translatedTitle === "string" && translatedTitle.trim()) ||
        car?.title ||
        [car?.brand, car?.model].filter(Boolean).join(" ") ||
        "ArmMotors";

    useEffect(() => {
        if (!car) return;

        const previousTitle = document.title;
        document.title = `${title} — ArmMotors`;

        let meta = document.querySelector('meta[name="description"]');

        const createdMeta = !meta;

        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }

        const previousDescription = meta.getAttribute("content");

        const localizedDescription = car.translations?.[language]?.description;

        const description = String(
            (typeof localizedDescription === "string" &&
                localizedDescription) ||
                car.description ||
                `${title} — ArmMotors`,
        )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160);

        meta.setAttribute("content", description);

        return () => {
            document.title = previousTitle;

            if (createdMeta) {
                meta.remove();
            } else if (previousDescription === null) {
                meta.removeAttribute("content");
            } else {
                meta.setAttribute("content", previousDescription);
            }
        };
    }, [car, title, language]);

    async function share() {
        try {
            await navigator.clipboard.writeText(window.location.href);

            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    function requireLogin() {
        if (localStorage.getItem("token")) return false;

        navigate(`/login?next=${encodeURIComponent(`/cars/${id}`)}`);

        return true;
    }

    function handleFavorite() {
        if (requireLogin()) return;

        void toggleFavorite();
    }

    async function sendPurchaseRequest() {
        if (
            purchaseStatus === "loading" ||
            purchaseStatus === "success" ||
            car?.status === "sold"
        ) {
            return;
        }

        if (requireLogin()) return;

        setPurchaseStatus("loading");

        try {
            await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify({
                    productId: id,
                }),
            });

            setPurchaseStatus("success");
        } catch {
            setPurchaseStatus("error");
        }
    }

    const images =
        Array.isArray(car?.images) && car.images.length > 0
            ? car.images
            : car?.image
              ? [car.image]
              : [];

    const sellerId = getSellerId(car);

    const specs = car
        ? [
              [t("make"), car.brand],
              [t("model"), car.model],
              [t("year"), car.year],
              [
                  t("mileage"),
                  hasValue(car.mileage)
                      ? `${Number(car.mileage).toLocaleString(
                            locale,
                        )} ${t("mileageUnit")}`
                      : null,
              ],
              [
                  t("fuel"),
                  hasValue(car.fuel)
                      ? translateValue(car.fuel, language)
                      : null,
              ],
              [
                  t("steering"),
                  hasValue(car.steering)
                      ? translateValue(car.steering, language)
                      : null,
              ],
              [
                  t("color"),
                  hasValue(car.color)
                      ? translateValue(car.color, language)
                      : null,
              ],
              [
                  t("region"),
                  hasValue(car.region)
                      ? translateValue(car.region, language)
                      : null,
              ],
              [
                  t("condition"),
                  hasValue(car.condition)
                      ? translateValue(car.condition, language)
                      : null,
              ],
              ["VIN", car.vin || "—"],
          ]
        : [];

    const relatedCars = car
        ? (Array.isArray(products) ? products : [])
              .filter(
                  (item) =>
                      getProductId(item) !== getProductId(car) &&
                      item.type === "car" &&
                      item.status !== "sold" &&
                      item.status !== "draft",
              )
              .map((item) => {
                  let score = 0;

                  if (item.brand === car.brand) {
                      score += 50;
                  }

                  if (item.brand === car.brand && item.model === car.model) {
                      score += 40;
                  }

                  const yearDifference = Math.abs(
                      Number(item.year) - Number(car.year),
                  );

                  if (
                      Number.isFinite(yearDifference) &&
                      item.year &&
                      car.year
                  ) {
                      if (yearDifference <= 2) {
                          score += 20;
                      } else if (yearDifference <= 5) {
                          score += 10;
                      }
                  }

                  const itemPrice = Number(item.price);
                  const carPrice = Number(car.price);

                  if (
                      itemPrice > 0 &&
                      carPrice > 0 &&
                      (item.currency || "AMD") === (car.currency || "AMD")
                  ) {
                      const difference =
                          Math.abs(itemPrice - carPrice) / carPrice;

                      if (difference <= 0.15) {
                          score += 20;
                      } else if (difference <= 0.3) {
                          score += 10;
                      }
                  }

                  if (
                      item.vehicleType &&
                      item.vehicleType === car.vehicleType
                  ) {
                      score += 10;
                  }

                  return { item, score };
              })
              .sort((a, b) => b.score - a.score)
              .slice(0, 4)
              .map(({ item }) => item)
        : [];

    return (
        <main className="details-page">
            <nav
                className="detail-breadcrumb"
                aria-label={textFor("breadcrumb", language)}
            >
                <Link to="/">{t("home")}</Link>
                <span>/</span>
                <Link to="/cars">{t("listings")}</Link>
            </nav>

            {loading ? (
                <p role="status">{t("loading")}</p>
            ) : failed || !car ? (
                <section className="detail-panel">
                    <h1>{t("listingUnavailable")}</h1>

                    {failed && <p role="alert">{t("error")}</p>}

                    <Link to="/cars">{t("listings")} →</Link>
                </section>
            ) : (
                <>
                    <div className="detail-heading">
                        <div />

                        <button
                            type="button"
                            className="detail-secondary"
                            onClick={share}
                        >
                            {t("copyLink")} ↗
                        </button>
                    </div>

                    {copied && <p role="status">{t("linkCopied")}</p>}

                    <div className="detail-layout">
                        <div>
                            <CarImageGallery
                                key={id}
                                images={images}
                                title={title}
                            />

                            <section className="detail-panel">
                                <h2>{t("details")}</h2>

                                <dl className="spec-grid">
                                    {specs
                                        .filter(([, value]) => hasValue(value))
                                        .map(([label, value]) => (
                                            <div key={label}>
                                                <dt>{label}</dt>
                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                </dl>
                            </section>

                            <ExtraSpecs car={car} language={language} />

                            <section className="detail-panel">
                                <h2>{t("description")}</h2>

                                <TranslatedDescription
                                    productId={getProductId(car)}
                                    description={car.description || ""}
                                />
                            </section>
                        </div>

                        <aside className="seller-panel">
                            <div className="listing-heading">
                                <h1>
                                    {title}
                                    {car.year ? `, ${car.year}` : ""}
                                </h1>

                                <button
                                    type="button"
                                    className="detail-favorite"
                                    onClick={handleFavorite}
                                    aria-pressed={Boolean(favorite)}
                                    aria-label={
                                        favorite
                                            ? t("removeFavorite")
                                            : t("addFavorite")
                                    }
                                >
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill={favorite ? "#e84967" : "none"}
                                        stroke={
                                            favorite
                                                ? "#e84967"
                                                : "currentColor"
                                        }
                                        strokeWidth="1.6"
                                        aria-hidden="true"
                                    >
                                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                                    </svg>
                                </button>
                            </div>

                            <strong className="detail-price">
                                {format(car.price, car.currency || "AMD")}
                            </strong>

                            <CurrencySelect />

                            {car.region && (
                                <p>{translateValue(car.region, language)}</p>
                            )}

                            {car.status === "sold" && (
                                <p className="detail-sold-label">{t("sold")}</p>
                            )}

                            <hr />

                            <div className="seller-identity">
                                <span
                                    className="seller-avatar"
                                    aria-hidden="true"
                                >
                                    {(car.brand || "A")
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </span>

                                <div>
                                    <h2>{t("contactSeller")}</h2>

                                    {sellerId && (
                                        <Link
                                            to={`/sellers/${encodeURIComponent(
                                                sellerId,
                                            )}`}
                                            className="seller-profile-link"
                                        >
                                            {t("sellerPage")} →
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <SellerContact car={car} />

                            <button
                                type="button"
                                className="detail-primary"
                                disabled={
                                    purchaseStatus === "loading" ||
                                    purchaseStatus === "success" ||
                                    car.status === "sold"
                                }
                                onClick={sendPurchaseRequest}
                            >
                                {car.status === "sold"
                                    ? t("sold")
                                    : purchaseStatus === "loading"
                                      ? t("processing")
                                      : t("writeSeller")}
                            </button>

                            {purchaseStatus === "success" && (
                                <p role="status">
                                    {textFor("purchaseSuccess", language)}
                                </p>
                            )}

                            {purchaseStatus === "error" && (
                                <p role="alert" className="form-error">
                                    {textFor("purchaseError", language)}
                                </p>
                            )}

                            <ReportProduct
                                key={getProductId(car)}
                                productId={getProductId(car)}
                            />
                        </aside>
                    </div>

                    <CarDetailsAd />

                    {relatedCars.length > 0 && (
                        <section className="related-cars">
                            <h2>{t("relatedCars")}</h2>

                            <div className="products-grid">
                                {relatedCars.map((item) => (
                                    <ProductCard
                                        key={getProductId(item)}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
