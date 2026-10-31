import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import ImageUploader from "../components/uploads/ImageUploader";
import LocationFields from "../components/add-product/LocationFields";
import PublicationNotice from "../components/monetization/PublicationNotice";

import {
    CAR_BRANDS,
    CAR_MODELS,
    CAR_COLORS,
    CAR_YEARS,
} from "../components/add-product/vehicleData";

import { apiRequest } from "../utils/api";
import { useI18n } from "../utils/i18n";

import "./AddProductPage.css";
import "./AddProductSuccess.css";

import SearchableSelect from "../components/common/SearchableSelect";

/* =========================================
   OPTIONS
========================================= */

const COMFORT_OPTIONS = [
    ["airConditioning", "Օդորակիչ", "Кондиционер", "Air conditioning"],
    ["climateControl", "Կլիմատ-կոնտրոլ", "Климат-контроль", "Climate control"],
    ["heatedSeats", "Նստատեղերի տաքացում", "Подогрев сидений", "Heated seats"],
    [
        "ventilatedSeats",
        "Նստատեղերի օդափոխություն",
        "Вентиляция сидений",
        "Ventilated seats",
    ],
    [
        "heatedSteering",
        "Ղեկի տաքացում",
        "Подогрев руля",
        "Heated steering wheel",
    ],
    [
        "heatedWindshield",
        "Դիմապակու տաքացում",
        "Обогрев лобового стекла",
        "Heated windshield",
    ],
    ["cruiseControl", "Կրուիզ-կոնտրոլ", "Круиз-контроль", "Cruise control"],
    [
        "adaptiveCruise",
        "Ադապտիվ կրուիզ-կոնտրոլ",
        "Адаптивный круиз-контроль",
        "Adaptive cruise",
    ],
    ["parkingSensors", "Կայանման սենսորներ", "Парктроники", "Parking sensors"],
    ["rearCamera", "Հետևի տեսախցիկ", "Камера заднего вида", "Rear camera"],
    ["camera360", "360° տեսախցիկ", "Камера 360°", "360° camera"],
    [
        "keylessEntry",
        "Առանց բանալիի մուտք",
        "Бесключевой доступ",
        "Keyless entry",
    ],
    [
        "startStop",
        "Start/Stop համակարգ",
        "Система Start/Stop",
        "Start/Stop system",
    ],
    [
        "electricSeats",
        "Էլեկտրական նստատեղեր",
        "Электрорегулировка сидений",
        "Electric seats",
    ],
    [
        "memorySeats",
        "Նստատեղերի հիշողություն",
        "Память сидений",
        "Memory seats",
    ],
    ["navigation", "Նավիգացիա", "Навигация", "Navigation"],
    ["bluetooth", "Bluetooth", "Bluetooth", "Bluetooth"],
    ["appleCarplay", "Apple CarPlay", "Apple CarPlay", "Apple CarPlay"],
    ["androidAuto", "Android Auto", "Android Auto", "Android Auto"],
];

const HEADLIGHT_OPTIONS = [
    ["halogen", "Հալոգեն", "Галогенные", "Halogen"],
    ["xenon", "Քսենոն", "Ксеноновые", "Xenon"],
    ["led", "LED", "Светодиодные", "LED"],
];

const WHEEL_OPTIONS = Array.from({ length: 12 }, (_, index) => {
    const value = `R${index + 13}`;
    return [value, value];
});

const INITIAL_FORM = {
    type: "car",
    title: "",
    price: "",
    currency: "AMD",
    condition: "Օգտագործված",

    vehicleType: "passenger",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "petrol",
    steering: "left",
    color: "",
    vin: "",

    customsCleared: "",
    paintCondition: "",
    gasEquipment: "",
    gasCylinderReplaced: "",
    wheelSize: "",
    interiorMaterial: "",
    sunroof: "",
    headlights: [],
    comfort: [],

    description: "",
    phone: "",
};

const INITIAL_LOCATION = {
    regionId: "",
    communityId: "",
    settlementId: "",
    region: "",
    community: "",
    settlement: "",
};

/* =========================================
   TRANSLATIONS
========================================= */

const TEXT = {
    hy: {
        steps: [
            "Հիմնական տվյալներ",
            "Մեքենայի տվյալներ",
            "Նկարներ և կապ",
            "Հրապարակում",
        ],
        add: "Տեղադրել հայտարարություն",
        edit: "Խմբագրել հայտարարությունը",
        help: "Լրացրեք տվյալները և հրապարակեք Ձեր հայտարարությունը։",
        home: "Գլխավոր էջ",
        mine: "Իմ հայտարարությունները",
        step: "Քայլ",
        basic: "Հիմնական տվյալներ",
        carDetails: "Մեքենայի տվյալներ",
        partDetails: "Պահեստամասի տվյալներ",
        contact: "Նկարներ և կապ",
        review: "Ստուգեք տվյալները",
        category: "Բաժին",
        car: "Մեքենա",
        part: "Պահեստամաս",
        condition: "Վիճակ",
        new: "Նոր",
        used: "Օգտագործված",
        partTitle: "Պահեստամասի անվանում",
        price: "Գին",
        currency: "Արժույթ",
        location: "Գտնվելու վայր",
        currentLocation: "Ընթացիկ վայր",
        vehicleType: "Մեքենայի տեսակ",
        passenger: "Մարդատար",
        truck: "Բեռնատար",
        brand: "Մակնիշ",
        model: "Մոդել",
        year: "Տարեթիվ",
        mileage: "Վազք (կմ)",
        fuel: "Վառելիք",
        steering: "Ղեկ",
        color: "Գույն",
        petrol: "Բենզին",
        diesel: "Դիզել",
        gas: "Գազ",
        hybrid: "Հիբրիդ",
        electric: "Էլեկտրական",
        left: "Ձախ",
        right: "Աջ",
        optional: "Ըստ ցանկության",
        choose: "Ընտրել",
        technical: "Լրացուցիչ տեխնիկական տվյալներ",
        interior: "Սրահ և հարմարավետություն",
        exterior: "Արտաքին տվյալներ",
        customsCleared: "Մաքսազերծված է",
        paintCondition: "Ներկի վիճակ",
        gasEquipment: "Գազի սարքավորում",
        gasCylinderReplaced: "Գազի բալոնը փոխված է",
        wheelSize: "Անվահեծերի չափ",
        interiorMaterial: "Սրահի նյութ",
        sunroof: "Լյուկ",
        headlights: "Լուսարձակներ",
        comfort: "Կոմֆորտ և հնարավորություններ",
        yes: "Այո",
        no: "Ոչ",
        original: "Գործարանային ներկ",
        repainted: "Վերաներկված",
        installed: "Տեղադրված է",
        notInstalled: "Տեղադրված չէ",
        fabric: "Կտոր",
        leather: "Կաշի",
        artificial: "Արհեստական կաշի",
        alcantara: "Ալկանտարա",
        other: "Այլ",
        standard: "Սովորական լյուկ",
        panoramic: "Պանորամային լյուկ",
        none: "Չկա",
        selected: "Ընտրված է",
        phone: "Հեռախոսահամար",
        description: "Նկարագրություն",
        descriptionPlaceholder: "Նկարագրեք մեքենան կամ պահեստամասը...",
        photos: "Լուսանկարներ",
        photosHelp: "Առավելագույնը 12 նկար։ Առաջինը կլինի գլխավոր։",
        main: "Գլխավոր",
        remove: "Հեռացնել",
        previous: "Նախորդ քայլ",
        next: "Շարունակել",
        publish: "Հրապարակել հայտարարությունը",
        save: "Պահպանել փոփոխությունները",
        saving: "Պահպանվում է...",
        loading: "Տվյալները բեռնվում են...",
        invalidTitle: "Լրացրեք պահեստամասի անվանումը։",
        invalidPrice: "Նշեք ճիշտ գին։",
        invalidLocation: "Ընտրեք գտնվելու վայրը։",
        invalidVehicle: "Լրացրեք մակնիշը, մոդելը և տարեթիվը։",
        invalidMileage: "Նշեք ճիշտ վազքը։",
        invalidColor: "Ընտրեք մեքենայի գույնը։",
        invalidVin: "VIN-ը պետք է ունենա 17 ճիշտ նիշ։",
        invalidPhone: "Նշեք ճիշտ հեռախոսահամար։",
        invalidImages: "Ավելացրեք առնվազն մեկ նկար։",
        tooManyImages: "Առավելագույնը 12 նկար։",
        notFound: "Հայտարարությունը չի գտնվել։",
        paymentPending: "Վճարման սպասող հայտարարությունը դեռ չի խմբագրվում։",
        saveError: "Տվյալները պահպանել չհաջողվեց։",
        successCreate: "Հայտարարությունը հրապարակված է",
        successEdit: "Փոփոխությունները պահպանված են",
        view: "Դիտել հայտարարությունը",
        packages: "Դիտել TOP փաթեթները",
        close: "Փակել",
        paymentCreate:
            "Առաջին 5 հայտարարությունն անվճար է, հաջորդները՝ 100 դրամ։",
        paymentEdit: "Խմբագրման համար նոր վճար չի պահանջվում։",
    },

    ru: {
        steps: [
            "Основные данные",
            "Данные автомобиля",
            "Фото и контакты",
            "Публикация",
        ],
        add: "Разместить объявление",
        edit: "Редактировать объявление",
        help: "Заполните данные и опубликуйте объявление.",
        home: "Главная",
        mine: "Мои объявления",
        step: "Шаг",
        basic: "Основные данные",
        carDetails: "Данные автомобиля",
        partDetails: "Данные запчасти",
        contact: "Фото и контакты",
        review: "Проверьте данные",
        category: "Категория",
        car: "Автомобиль",
        part: "Запчасть",
        condition: "Состояние",
        new: "Новое",
        used: "Б/у",
        partTitle: "Название запчасти",
        price: "Цена",
        currency: "Валюта",
        location: "Местоположение",
        currentLocation: "Текущее местоположение",
        vehicleType: "Тип автомобиля",
        passenger: "Легковой",
        truck: "Грузовой",
        brand: "Марка",
        model: "Модель",
        year: "Год",
        mileage: "Пробег (км)",
        fuel: "Топливо",
        steering: "Руль",
        color: "Цвет",
        petrol: "Бензин",
        diesel: "Дизель",
        gas: "Газ",
        hybrid: "Гибрид",
        electric: "Электро",
        left: "Левый",
        right: "Правый",
        optional: "Необязательно",
        choose: "Выбрать",
        technical: "Дополнительные характеристики",
        interior: "Салон и комфорт",
        exterior: "Внешние характеристики",
        customsCleared: "Растаможен",
        paintCondition: "Состояние краски",
        gasEquipment: "Газовое оборудование",
        gasCylinderReplaced: "Газовый баллон заменён",
        wheelSize: "Размер дисков",
        interiorMaterial: "Материал салона",
        sunroof: "Люк",
        headlights: "Фары",
        comfort: "Комфорт и оснащение",
        yes: "Да",
        no: "Нет",
        original: "Заводская краска",
        repainted: "Перекрашен",
        installed: "Установлено",
        notInstalled: "Не установлено",
        fabric: "Ткань",
        leather: "Кожа",
        artificial: "Искусственная кожа",
        alcantara: "Алькантара",
        other: "Другое",
        standard: "Обычный люк",
        panoramic: "Панорамный люк",
        none: "Нет",
        selected: "Выбрано",
        phone: "Номер телефона",
        description: "Описание",
        descriptionPlaceholder: "Опишите автомобиль или запчасть...",
        photos: "Фотографии",
        photosHelp: "До 12 фотографий. Первая будет главной.",
        main: "Главное",
        remove: "Удалить",
        previous: "Назад",
        next: "Продолжить",
        publish: "Опубликовать объявление",
        save: "Сохранить изменения",
        saving: "Сохранение...",
        loading: "Загрузка данных...",
        invalidTitle: "Укажите название запчасти.",
        invalidPrice: "Укажите корректную цену.",
        invalidLocation: "Выберите местоположение.",
        invalidVehicle: "Укажите марку, модель и год.",
        invalidMileage: "Укажите корректный пробег.",
        invalidColor: "Выберите цвет автомобиля.",
        invalidVin: "VIN должен содержать 17 допустимых символов.",
        invalidPhone: "Укажите корректный номер телефона.",
        invalidImages: "Добавьте хотя бы одну фотографию.",
        tooManyImages: "Максимум 12 фотографий.",
        notFound: "Объявление не найдено.",
        paymentPending: "Объявление ожидает оплаты.",
        saveError: "Не удалось сохранить данные.",
        successCreate: "Объявление опубликовано",
        successEdit: "Изменения сохранены",
        view: "Посмотреть объявление",
        packages: "Посмотреть TOP-пакеты",
        close: "Закрыть",
        paymentCreate:
            "Первые 5 объявлений бесплатные, следующие — 100 драмов.",
        paymentEdit: "За редактирование повторная оплата не требуется.",
    },

    en: {
        steps: [
            "Basic information",
            "Vehicle details",
            "Photos and contact",
            "Publish",
        ],
        add: "Add listing",
        edit: "Edit listing",
        help: "Enter the details and publish your listing.",
        home: "Home",
        mine: "My listings",
        step: "Step",
        basic: "Basic information",
        carDetails: "Vehicle details",
        partDetails: "Spare part details",
        contact: "Photos and contact",
        review: "Review your listing",
        category: "Category",
        car: "Car",
        part: "Spare part",
        condition: "Condition",
        new: "New",
        used: "Used",
        partTitle: "Spare part title",
        price: "Price",
        currency: "Currency",
        location: "Location",
        currentLocation: "Current location",
        vehicleType: "Vehicle type",
        passenger: "Passenger car",
        truck: "Truck",
        brand: "Brand",
        model: "Model",
        year: "Year",
        mileage: "Mileage (km)",
        fuel: "Fuel",
        steering: "Steering",
        color: "Color",
        petrol: "Petrol",
        diesel: "Diesel",
        gas: "Gas",
        hybrid: "Hybrid",
        electric: "Electric",
        left: "Left",
        right: "Right",
        optional: "Optional",
        choose: "Select",
        technical: "Additional specifications",
        interior: "Interior and comfort",
        exterior: "Exterior features",
        customsCleared: "Customs cleared",
        paintCondition: "Paint condition",
        gasEquipment: "Gas equipment",
        gasCylinderReplaced: "Gas cylinder replaced",
        wheelSize: "Wheel size",
        interiorMaterial: "Interior material",
        sunroof: "Sunroof",
        headlights: "Headlights",
        comfort: "Comfort and features",
        yes: "Yes",
        no: "No",
        original: "Original paint",
        repainted: "Repainted",
        installed: "Installed",
        notInstalled: "Not installed",
        fabric: "Fabric",
        leather: "Leather",
        artificial: "Artificial leather",
        alcantara: "Alcantara",
        other: "Other",
        standard: "Standard sunroof",
        panoramic: "Panoramic sunroof",
        none: "None",
        selected: "Selected",
        phone: "Phone number",
        description: "Description",
        descriptionPlaceholder: "Describe the car or spare part...",
        photos: "Photos",
        photosHelp: "Maximum 12 photos. The first is the cover.",
        main: "Cover",
        remove: "Remove",
        previous: "Previous",
        next: "Continue",
        publish: "Publish listing",
        save: "Save changes",
        saving: "Saving...",
        loading: "Loading data...",
        invalidTitle: "Enter a spare part title.",
        invalidPrice: "Enter a valid price.",
        invalidLocation: "Select a location.",
        invalidVehicle: "Select a brand, model and year.",
        invalidMileage: "Enter valid mileage.",
        invalidColor: "Select a vehicle color.",
        invalidVin: "VIN must contain 17 valid characters.",
        invalidPhone: "Enter a valid phone number.",
        invalidImages: "Add at least one photo.",
        tooManyImages: "Maximum 12 photos.",
        notFound: "Listing not found.",
        paymentPending: "Listing is awaiting payment.",
        saveError: "Unable to save the listing.",
        successCreate: "Listing published",
        successEdit: "Changes saved",
        view: "View listing",
        packages: "View TOP packages",
        close: "Close",
        paymentCreate:
            "The first 5 listings are free. Additional listings cost AMD 100.",
        paymentEdit: "Editing does not require another payment.",
    },
};

/* =========================================
   FORM COMPONENTS
========================================= */

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    min,
    maxLength,
}) {
    return (
        <label className="ap-field">
            <span className="ap-field-label">
                {label}
                {required && <em>*</em>}
            </span>

            <input
                type={type}
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                min={min}
                maxLength={maxLength}
            />
        </label>
    );
}

function Select({
    label,
    value,
    onChange,
    options,
    placeholder,
    required = false,
    disabled = false,
}) {
    return (
        <SearchableSelect
            label={label}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
        />
    );
}

function SectionHeading({ number, title, description }) {
    return (
        <div className="ap-section-title">
            <div>
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
        </div>
    );
}

function Summary({ label, value }) {
    return (
        <div className="ap-summary-item">
            <span>{label}</span>
            <strong>{value || "—"}</strong>
        </div>
    );
}

function MultiSelect({
    label,
    options,
    values,
    onChange,
    language,
    selectedLabel,
}) {
    const languageIndex = language === "ru" ? 2 : language === "en" ? 3 : 1;

    function toggle(value) {
        if (values.includes(value)) {
            onChange(values.filter((item) => item !== value));
        } else {
            onChange([...values, value]);
        }
    }

    return (
        <div className="ap-extra-group">
            <div className="ap-extra-group-heading">
                <h3>{label}</h3>
                <span>{/* {selectedLabel}: {values.length} */}</span>
            </div>

            <div className="ap-extra-options">
                {options.map((option) => {
                    const [value] = option;
                    const checked = values.includes(value);

                    return (
                        <label
                            key={value}
                            className={`ap-extra-option ${
                                checked ? "is-selected" : ""
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggle(value)}
                            />

                            <span className="ap-extra-check">
                                {checked ? "✓" : ""}
                            </span>

                            <span>{option[languageIndex]}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

function PublicationSuccess({ productId, editing, onClose, t }) {
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleEscape(event) {
            if (event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div className="ap-success-overlay">
            <section
                className="ap-success-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ap-success-title"
            >
                <button
                    ref={closeRef}
                    type="button"
                    className="ap-success-close"
                    onClick={onClose}
                    aria-label={t.close}
                >
                    ×
                </button>

                <div className="ap-success-icon">
                    <svg
                        width="37"
                        height="37"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m7.5 12 3 3 6-6" />
                    </svg>
                </div>

                <span className="ap-success-eyebrow">ARMMOTORS</span>

                <h2 id="ap-success-title">
                    {editing ? t.successEdit : t.successCreate}
                </h2>

                <p className="ap-success-description">
                    {editing ? t.successEdit : t.successCreate}
                </p>

                {productId && (
                    <Link
                        className="ap-success-primary"
                        to={`/cars/${encodeURIComponent(productId)}`}
                    >
                        {t.view} →
                    </Link>
                )}

                <div className="ap-success-actions">
                    {productId && (
                        <Link
                            to={`/add-product?edit=${encodeURIComponent(
                                productId,
                            )}`}
                        >
                            {t.edit}
                        </Link>
                    )}

                    <Link to="/account">{t.mine}</Link>
                </div>

                <Link className="ap-success-plans" to="/monetization">
                    {t.packages} ↗
                </Link>
            </section>
        </div>
    );
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
}

/* =========================================
   MAIN PAGE
========================================= */

export default function AddProductPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { language } = useI18n();

    const lang = ["hy", "ru", "en"].includes(language) ? language : "hy";

    const t = TEXT[lang];

    const editId = params.get("edit") || "";
    const isEditing = Boolean(editId);

    const [form, setForm] = useState(INITIAL_FORM);
    const [location, setLocation] = useState(INITIAL_LOCATION);
    const [savedRegion, setSavedRegion] = useState("");
    const [images, setImages] = useState([]);
    const [step, setStep] = useState(0);

    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(isEditing);
    const [error, setError] = useState("");

    const [successProductId, setSuccessProductId] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const token = localStorage.getItem("token");
    const isCar = form.type === "car";

    const modelList = form.brand ? CAR_MODELS[form.brand] || [] : [];

    const modelOptions = modelList.map((model) => [model, model]);

    const title = isCar
        ? [form.brand, form.model, form.year].filter(Boolean).join(" ")
        : form.title.trim();

    const effectiveRegion = location.region || savedRegion;

    const locationText = [
        location.region,
        location.community,
        location.settlement,
    ]
        .filter(Boolean)
        .join(", ");

    const fuelOptions = [
        ["petrol", t.petrol],
        ["diesel", t.diesel],
        ["gas", t.gas],
        ["hybrid", t.hybrid],
        ["electric", t.electric],
    ];

    const steeringOptions = [
        ["left", t.left],
        ["right", t.right],
    ];

    const yesNoOptions = [
        ["yes", t.yes],
        ["no", t.no],
    ];

    const paintOptions = [
        ["original", t.original],
        ["repainted", t.repainted],
    ];

    const gasOptions = [
        ["installed", t.installed],
        ["notInstalled", t.notInstalled],
    ];

    const interiorOptions = [
        ["fabric", t.fabric],
        ["leather", t.leather],
        ["artificial", t.artificial],
        ["alcantara", t.alcantara],
        ["other", t.other],
    ];

    const sunroofOptions = [
        ["standard", t.standard],
        ["panoramic", t.panoramic],
        ["none", t.none],
    ];

    function update(name, value) {
        setForm((old) => ({
            ...old,
            [name]: value,
        }));

        setError("");
    }

    function changeType(type) {
        setForm((old) => ({
            ...INITIAL_FORM,
            type,
            price: old.price,
            currency: old.currency,
            phone: old.phone,
        }));

        setError("");
    }

    function changeBrand(brand) {
        setForm((old) => ({
            ...old,
            brand,
            model: "",
        }));

        setError("");
    }

    function renderSelect(label, name, options, extra = {}) {
        return (
            <Select
                label={label}
                value={form[name]}
                onChange={(value) => update(name, value)}
                options={options}
                placeholder={t.choose}
                {...extra}
            />
        );
    }

    /* =====================================
       AUTH
    ===================================== */

    useEffect(() => {
        if (!token) {
            const next = isEditing
                ? `/add-product?edit=${editId}`
                : "/add-product";

            navigate(`/login?next=${encodeURIComponent(next)}`, {
                replace: true,
            });
        }
    }, [token, isEditing, editId, navigate]);

    /* =====================================
       LOAD EDITING PRODUCT
    ===================================== */

    useEffect(() => {
        if (!isEditing || !token) {
            setLoadingProduct(false);
            return;
        }

        let cancelled = false;

        async function loadProduct() {
            setLoadingProduct(true);
            setError("");

            try {
                const result = await apiRequest("/products/mine");

                const products = Array.isArray(result)
                    ? result
                    : Array.isArray(result?.items)
                      ? result.items
                      : [];

                const product = products.find(
                    (item) => String(item._id || item.id) === String(editId),
                );

                if (!product) {
                    throw new Error(t.notFound);
                }

                if (product.paymentPending) {
                    throw new Error(t.paymentPending);
                }

                if (cancelled) return;

                setForm({
                    ...INITIAL_FORM,

                    type: product.type || "car",
                    title: product.title || "",
                    price:
                        product.price !== undefined
                            ? String(product.price)
                            : "",
                    currency: product.currency || "AMD",
                    condition: product.condition || "Օգտագործված",

                    vehicleType: product.vehicleType || "passenger",
                    brand: product.brand || "",
                    model: product.model || "",
                    year: product.year != null ? String(product.year) : "",
                    mileage:
                        product.mileage != null ? String(product.mileage) : "",
                    fuel: product.fuel || "petrol",
                    steering: product.steering || "left",
                    color: product.color || "",
                    vin: product.vin || "",

                    customsCleared: product.customsCleared || "",
                    paintCondition: product.paintCondition || "",
                    gasEquipment: product.gasEquipment || "",
                    gasCylinderReplaced: product.gasCylinderReplaced || "",
                    wheelSize: product.wheelSize || "",
                    interiorMaterial: product.interiorMaterial || "",
                    sunroof: product.sunroof || "",

                    headlights: Array.isArray(product.headlights)
                        ? product.headlights
                        : [],

                    comfort: Array.isArray(product.comfort)
                        ? product.comfort
                        : [],

                    description: product.description || "",
                    phone: product.phone || "",
                });

                setImages(Array.isArray(product.images) ? product.images : []);

                setSavedRegion(product.region || "");
                setLocation({
                    ...INITIAL_LOCATION,
                    region: product.region || "",
                    community: product.community || "",
                    settlement: product.settlement || "",
                });

                setStep(0);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || t.saveError);
                }
            } finally {
                if (!cancelled) {
                    setLoadingProduct(false);
                }
            }
        }

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [editId, isEditing, token]);

    /* =====================================
       IMAGES
    ===================================== */

    function handleUploaded(result) {
        const raw = Array.isArray(result)
            ? result
            : result?.urls || result?.images || [];

        const urls = raw
            .map((item) =>
                typeof item === "string" ? item : item?.url || item?.secure_url,
            )
            .filter(
                (url) => typeof url === "string" && /^https?:\/\//i.test(url),
            );

        setImages((old) => {
            const next = [...new Set([...old, ...urls])];

            if (next.length > 12) {
                setError(t.tooManyImages);
                return old;
            }

            setError("");
            return next;
        });
    }

    function removeImage(url) {
        setImages((old) => old.filter((image) => image !== url));
    }

    function makeMainImage(url) {
        setImages((old) => [url, ...old.filter((image) => image !== url)]);
    }

    /* =====================================
       VALIDATION
    ===================================== */

    function validate(index) {
        if (index === 0) {
            if (!isCar && !title) {
                return t.invalidTitle;
            }

            if (
                form.price === "" ||
                !Number.isFinite(Number(form.price)) ||
                Number(form.price) < 0
            ) {
                return t.invalidPrice;
            }

            if (
                !effectiveRegion ||
                (!isEditing && (!location.regionId || !location.communityId))
            ) {
                return t.invalidLocation;
            }
        }

        if (index === 1 && isCar) {
            if (!form.brand || !form.model || !form.year) {
                return t.invalidVehicle;
            }

            if (
                form.mileage === "" ||
                !Number.isFinite(Number(form.mileage)) ||
                Number(form.mileage) < 0
            ) {
                return t.invalidMileage;
            }

            if (!form.color) {
                return t.invalidColor;
            }

            if (
                form.vin.trim() &&
                !/^[A-HJ-NPR-Z0-9]{17}$/i.test(form.vin.trim())
            ) {
                return t.invalidVin;
            }
        }

        if (index === 2) {
            const phone = form.phone.replace(/[\s()-]/g, "");

            if (!/^\+?[0-9]{8,15}$/.test(phone)) {
                return t.invalidPhone;
            }

            if (images.length === 0) {
                return t.invalidImages;
            }
        }

        return "";
    }

    function nextStep() {
        const message = validate(step);

        if (message) {
            setError(message);
            return;
        }

        setError("");
        setStep((old) => Math.min(old + 1, 3));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function previousStep() {
        setError("");
        setStep((old) => Math.max(old - 1, 0));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* =====================================
       DESCRIPTION
    ===================================== */

    function createDescription() {
        if (form.description.trim()) {
            return form.description.trim();
        }

        if (!isCar) {
            return `${t.part}: ${title}. ${t.location}: ${effectiveRegion}.`;
        }

        return [
            `${t.car}: ${title}.`,
            `${t.mileage}: ${formatNumber(form.mileage)} km.`,
            `${t.fuel}: ${form.fuel}.`,
            `${t.color}: ${form.color}.`,
            `${t.location}: ${effectiveRegion}.`,
        ].join(" ");
    }

    /* =====================================
       SAVE PRODUCT
    ===================================== */

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading || step !== 3) return;

        for (let i = 0; i < 3; i++) {
            const message = validate(i);

            if (message) {
                setError(message);
                setStep(i);
                return;
            }
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                type: form.type,
                title,
                price: Number(form.price),
                currency: form.currency,
                condition: form.condition,

                region: effectiveRegion,
                community: location.community || (isEditing ? undefined : ""),
                settlement: location.settlement || (isEditing ? undefined : ""),

                description: createDescription(),
                phone: form.phone.replace(/[\s()-]/g, ""),
                images,
            };

            if (isCar) {
                Object.assign(payload, {
                    vehicleType: form.vehicleType,
                    brand: form.brand,
                    model: form.model,
                    year: Number(form.year),
                    mileage: Number(form.mileage),
                    fuel: form.fuel,
                    steering: form.steering,
                    color: form.color,
                    vin: form.vin.trim().toUpperCase(),

                    customsCleared: form.customsCleared,
                    paintCondition: form.paintCondition,
                    gasEquipment: form.gasEquipment,
                    gasCylinderReplaced: form.gasCylinderReplaced,
                    wheelSize: form.wheelSize,
                    interiorMaterial: form.interiorMaterial,
                    sunroof: form.sunroof,
                    headlights: form.headlights,
                    comfort: form.comfort,
                });
            } else if (isEditing) {
                Object.assign(payload, {
                    vehicleType: null,
                    brand: "",
                    model: "",
                    year: null,
                    mileage: null,
                    fuel: null,
                    steering: null,
                    color: "",
                    vin: "",

                    customsCleared: "",
                    paintCondition: "",
                    gasEquipment: "",
                    gasCylinderReplaced: "",
                    wheelSize: "",
                    interiorMaterial: "",
                    sunroof: "",
                    headlights: [],
                    comfort: [],
                });
            }

            let result;

            if (isEditing) {
                result = await apiRequest(
                    `/products/${encodeURIComponent(editId)}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    },
                );
            } else {
                result = await apiRequest("/products", {
                    method: "POST",
                    body: JSON.stringify(payload),
                    timeoutMs: 30000,
                });
            }

            if (!isEditing && result?.requiresPayment) {
                navigate("/monetization");
                return;
            }

            const productId =
                result?.product?._id ||
                result?.product?.id ||
                result?._id ||
                result?.id ||
                editId;

            setSuccessProductId(String(productId || ""));
            setShowSuccess(true);
        } catch (err) {
            if (err.status === 401) {
                const next = isEditing
                    ? `/add-product?edit=${editId}`
                    : "/add-product";

                navigate(`/login?next=${encodeURIComponent(next)}`, {
                    replace: true,
                });

                return;
            }

            setError(err.message || t.saveError);
        } finally {
            setLoading(false);
        }
    }

    /* =====================================
       PAGE
    ===================================== */

    if (!token) return null;

    if (loadingProduct) {
        return (
            <main className="ap-page">
                <div className="ap-container">
                    <p>{t.loading}</p>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="ap-page">
                <div className="ap-container">
                    <Link
                        to={isEditing ? "/account" : "/"}
                        className="ap-back-link"
                    >
                        ← {isEditing ? t.mine : t.home}
                    </Link>

                    <div className="ap-heading">
                        <div>
                            <h1>{isEditing ? t.edit : t.add}</h1>

                            <p>{t.help}</p>
                        </div>
                    </div>

                    {/* PROGRESS */}

                    <div className="ap-progress">
                        {t.steps.map((name, index) => (
                            <div
                                key={index}
                                className={[
                                    "ap-progress-step",
                                    index === step ? "is-active" : "",
                                    index < step ? "is-completed" : "",
                                ].join(" ")}
                            >
                                <span className="ap-progress-line" />

                                <span className="ap-progress-label">
                                    {name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <form
                        className="ap-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {/* =========================
                            STEP 1 — BASIC
                        ========================= */}

                        {step === 0 && (
                            <section className="ap-section">
                                <SectionHeading
                                    number="01"
                                    title={t.basic}
                                    description={t.help}
                                />

                                <div className="ap-grid">
                                    <Select
                                        label={t.category}
                                        value={form.type}
                                        onChange={changeType}
                                        options={[
                                            ["car", t.car],
                                            ["part", t.part],
                                        ]}
                                        placeholder={t.choose}
                                    />

                                    <Select
                                        label={t.condition}
                                        value={form.condition}
                                        onChange={(value) =>
                                            update("condition", value)
                                        }
                                        options={[
                                            ["Նոր", t.new],
                                            ["Օգտագործված", t.used],
                                        ]}
                                        placeholder={t.choose}
                                    />

                                    {!isCar && (
                                        <div className="ap-full">
                                            <Field
                                                label={t.partTitle}
                                                value={form.title}
                                                onChange={(value) =>
                                                    update("title", value)
                                                }
                                                required
                                            />
                                        </div>
                                    )}

                                    <Field
                                        label={t.price}
                                        type="number"
                                        min="0"
                                        value={form.price}
                                        onChange={(value) =>
                                            update("price", value)
                                        }
                                        required
                                    />

                                    {renderSelect(t.currency, "currency", [
                                        ["AMD", "AMD"],
                                        ["USD", "USD"],
                                        ["RUB", "RUB"],
                                    ])}

                                    <div className="ap-full">
                                        <h3 className="ap-location-heading">
                                            {t.location}
                                        </h3>

                                        {isEditing && savedRegion && (
                                            <p className="ap-existing-location">
                                                {t.currentLocation}:{" "}
                                                <strong>{savedRegion}</strong>
                                            </p>
                                        )}
                                    </div>

                                    <LocationFields
                                        value={location}
                                        onChange={(value) => {
                                            setLocation(value);
                                            setError("");
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* =========================
                            STEP 2 — VEHICLE
                        ========================= */}

                        {step === 1 && (
                            <section className="ap-section">
                                <SectionHeading
                                    number="02"
                                    title={isCar ? t.carDetails : t.partDetails}
                                    description={t.help}
                                />

                                {isCar ? (
                                    <>
                                        {/* MAIN VEHICLE DATA */}

                                        <div className="ap-grid">
                                            {renderSelect(
                                                t.vehicleType,
                                                "vehicleType",
                                                [
                                                    ["passenger", t.passenger],
                                                    ["truck", t.truck],
                                                ],
                                            )}

                                            <Select
                                                label={t.brand}
                                                value={form.brand}
                                                onChange={changeBrand}
                                                options={CAR_BRANDS}
                                                placeholder={t.choose}
                                                required
                                            />

                                            {renderSelect(
                                                t.model,
                                                "model",
                                                modelOptions,
                                                {
                                                    disabled: !form.brand,
                                                    required: true,
                                                },
                                            )}

                                            {renderSelect(
                                                t.year,
                                                "year",
                                                CAR_YEARS.map((year) => [
                                                    String(year),
                                                    String(year),
                                                ]),
                                                { required: true },
                                            )}

                                            <Field
                                                label={t.mileage}
                                                type="number"
                                                min="0"
                                                value={form.mileage}
                                                onChange={(value) =>
                                                    update("mileage", value)
                                                }
                                                required
                                            />

                                            {renderSelect(
                                                t.fuel,
                                                "fuel",
                                                fuelOptions,
                                            )}

                                            {renderSelect(
                                                t.steering,
                                                "steering",
                                                steeringOptions,
                                            )}

                                            {renderSelect(
                                                t.color,
                                                "color",
                                                CAR_COLORS,
                                                { required: true },
                                            )}

                                            <Field
                                                label="VIN"
                                                value={form.vin}
                                                onChange={(value) =>
                                                    update(
                                                        "vin",
                                                        value.toUpperCase(),
                                                    )
                                                }
                                                maxLength={17}
                                                placeholder={t.optional}
                                            />
                                        </div>

                                        {/* TECHNICAL DETAILS */}

                                        <div className="ap-extra-section">
                                            <div className="ap-extra-heading">
                                                <h3>{t.technical}</h3>
                                            </div>

                                            <div className="ap-grid">
                                                {renderSelect(
                                                    t.customsCleared,
                                                    "customsCleared",
                                                    yesNoOptions,
                                                )}

                                                {renderSelect(
                                                    t.paintCondition,
                                                    "paintCondition",
                                                    paintOptions,
                                                )}

                                                {renderSelect(
                                                    t.gasEquipment,
                                                    "gasEquipment",
                                                    gasOptions,
                                                )}

                                                {form.gasEquipment ===
                                                    "installed" &&
                                                    renderSelect(
                                                        t.gasCylinderReplaced,
                                                        "gasCylinderReplaced",
                                                        yesNoOptions,
                                                    )}

                                                {renderSelect(
                                                    t.wheelSize,
                                                    "wheelSize",
                                                    WHEEL_OPTIONS,
                                                )}
                                            </div>
                                        </div>

                                        {/* INTERIOR */}

                                        <div className="ap-extra-section">
                                            <div className="ap-extra-heading">
                                                <h3>{t.interior}</h3>
                                            </div>

                                            <div className="ap-grid">
                                                {renderSelect(
                                                    t.interiorMaterial,
                                                    "interiorMaterial",
                                                    interiorOptions,
                                                )}

                                                {renderSelect(
                                                    t.sunroof,
                                                    "sunroof",
                                                    sunroofOptions,
                                                )}
                                            </div>

                                            <MultiSelect
                                                label={t.comfort}
                                                options={COMFORT_OPTIONS}
                                                values={form.comfort}
                                                onChange={(values) =>
                                                    update("comfort", values)
                                                }
                                                language={lang}
                                                selectedLabel={t.selected}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="ap-info-box">
                                        {t.partDetails}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* =========================
                            STEP 3 — PHOTOS
                        ========================= */}

                        {step === 2 && (
                            <section className="ap-section">
                                <SectionHeading
                                    number="03"
                                    title={t.contact}
                                    description={t.photosHelp}
                                />

                                <div className="ap-grid">
                                    <Field
                                        label={t.phone}
                                        value={form.phone}
                                        onChange={(value) =>
                                            update("phone", value)
                                        }
                                        placeholder="+374XXXXXXXX"
                                        required
                                    />

                                    <label className="ap-field ap-full">
                                        <span className="ap-field-label">
                                            {t.description}
                                        </span>

                                        <textarea
                                            value={form.description}
                                            onChange={(event) =>
                                                update(
                                                    "description",
                                                    event.target.value,
                                                )
                                            }
                                            maxLength={7000}
                                            placeholder={
                                                t.descriptionPlaceholder
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="ap-upload-section">
                                    <div className="ap-upload-heading">
                                        <div>
                                            <h3>{t.photos}</h3>
                                            <p>{t.photosHelp}</p>
                                        </div>

                                        <span className="ap-image-count">
                                            {images.length} / 12
                                        </span>
                                    </div>

                                    {images.length < 12 && (
                                        <div className="ap-uploader">
                                            <ImageUploader
                                                onUploaded={handleUploaded}
                                                disabled={loading}
                                            />
                                        </div>
                                    )}

                                    {images.length > 0 && (
                                        <div className="ap-images-grid">
                                            {images.map((url, index) => (
                                                <div
                                                    className="ap-image-item"
                                                    key={url}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`${t.photos} ${
                                                            index + 1
                                                        }`}
                                                    />

                                                    {index === 0 && (
                                                        <span className="ap-main-image-badge">
                                                            {t.main}
                                                        </span>
                                                    )}

                                                    <div className="ap-image-actions">
                                                        {index !== 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    makeMainImage(
                                                                        url,
                                                                    )
                                                                }
                                                            >
                                                                {t.main}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="ap-remove-image"
                                                            onClick={() =>
                                                                removeImage(url)
                                                            }
                                                        >
                                                            {t.remove}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* =========================
                            STEP 4 — REVIEW
                        ========================= */}

                        {step === 3 && (
                            <>
                                {!isEditing && <PublicationNotice />}

                                <section className="ap-section">
                                    <SectionHeading
                                        number="04"
                                        title={t.review}
                                        description={t.help}
                                    />

                                    {images[0] && (
                                        <div className="ap-review-cover">
                                            <img src={images[0]} alt={t.main} />
                                        </div>
                                    )}

                                    <div className="ap-review-title">
                                        <h2>{title}</h2>

                                        <strong>
                                            {formatNumber(form.price)}{" "}
                                            {form.currency}
                                        </strong>
                                    </div>

                                    <div className="ap-summary-grid">
                                        <Summary
                                            label={t.category}
                                            value={isCar ? t.car : t.part}
                                        />

                                        <Summary
                                            label={t.condition}
                                            value={
                                                form.condition === "Նոր"
                                                    ? t.new
                                                    : t.used
                                            }
                                        />

                                        <Summary
                                            label={t.location}
                                            value={locationText || savedRegion}
                                        />

                                        <Summary
                                            label={t.phone}
                                            value={form.phone}
                                        />

                                        {isCar && (
                                            <>
                                                <Summary
                                                    label={t.brand}
                                                    value={form.brand}
                                                />

                                                <Summary
                                                    label={t.model}
                                                    value={form.model}
                                                />

                                                <Summary
                                                    label={t.year}
                                                    value={form.year}
                                                />

                                                <Summary
                                                    label={t.mileage}
                                                    value={`${formatNumber(
                                                        form.mileage,
                                                    )} km`}
                                                />

                                                <Summary
                                                    label={t.fuel}
                                                    value={
                                                        fuelOptions.find(
                                                            ([value]) =>
                                                                value ===
                                                                form.fuel,
                                                        )?.[1]
                                                    }
                                                />

                                                <Summary
                                                    label={t.color}
                                                    value={form.color}
                                                />

                                                <Summary
                                                    label={t.wheelSize}
                                                    value={form.wheelSize}
                                                />

                                                <Summary
                                                    label={t.interiorMaterial}
                                                    value={
                                                        interiorOptions.find(
                                                            ([value]) =>
                                                                value ===
                                                                form.interiorMaterial,
                                                        )?.[1]
                                                    }
                                                />

                                                <Summary
                                                    label={t.sunroof}
                                                    value={
                                                        sunroofOptions.find(
                                                            ([value]) =>
                                                                value ===
                                                                form.sunroof,
                                                        )?.[1]
                                                    }
                                                />

                                                <Summary
                                                    label={t.comfort}
                                                    value={String(
                                                        form.comfort.length,
                                                    )}
                                                />

                                                <Summary
                                                    label={t.headlights}
                                                    value={String(
                                                        form.headlights.length,
                                                    )}
                                                />
                                            </>
                                        )}

                                        <Summary
                                            label={t.photos}
                                            value={String(images.length)}
                                        />
                                    </div>

                                    <div className="ap-review-description">
                                        <h3>{t.description}</h3>
                                        <p>{createDescription()}</p>
                                    </div>

                                    <div className="ap-info-box">
                                        {isEditing
                                            ? t.paymentEdit
                                            : t.paymentCreate}
                                    </div>
                                </section>
                            </>
                        )}

                        {/* ERROR */}

                        {error && (
                            <div className="ap-error" role="alert">
                                {error}
                            </div>
                        )}

                        {/* FOOTER */}

                        <div className="ap-form-footer">
                            <div className="ap-footer-left">
                                {step > 0 && (
                                    <button
                                        type="button"
                                        className="ap-back-button"
                                        onClick={previousStep}
                                        disabled={loading}
                                    >
                                        ← {t.previous}
                                    </button>
                                )}
                            </div>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    className="ap-next-button"
                                    onClick={nextStep}
                                >
                                    {t.next} →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="ap-next-button"
                                    disabled={loading}
                                >
                                    {loading
                                        ? t.saving
                                        : isEditing
                                          ? t.save
                                          : t.publish}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>

            {showSuccess && (
                <PublicationSuccess
                    productId={successProductId}
                    editing={isEditing}
                    t={t}
                    onClose={() => setShowSuccess(false)}
                />
            )}
        </>
    );
}
