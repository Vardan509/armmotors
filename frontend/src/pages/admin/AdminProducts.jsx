import { useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../utils/api";
import useRemote from "../../utils/useRemote";
import useCurrency from "../../utils/useCurrency";
import { useI18n } from "../../utils/i18n";

import { Notice, Pagination } from "./AdminPage";

const TEXT = {
    hy: {
        searchPlaceholder: "Որոնել ապրանք",
        search: "Որոնել",
        add: "Ավելացնել ապրանք",
        product: "Ապրանք",
        price: "Գին",
        owner: "Հեղինակ",
        status: "Կարգավիճակ",
        actions: "Գործողություններ",
        removedAccount: "Հաշիվը ջնջված է",
        active: "Ակտիվ",
        draft: "Սևագիր",
        sold: "Վաճառված",
        edit: "Խմբագրել",
        delete: "Ջնջել",
        empty: "Ապրանքներ դեռ չկան։ Ավելացրեք առաջինը։",
        editProduct: "Խմբագրել ապրանքը",
        newProduct: "Նոր ապրանք",
        close: "Փակել",
        category: "Բաժին",
        car: "Մեքենա",
        part: "Պահեստամաս",
        title: "Վերնագիր",
        priceAMD: "Գին՝ AMD",
        vehicleType: "Տեսակ",
        passenger: "Մարդատար",
        truck: "Բեռնատար",
        brand: "Մակնիշ",
        model: "Մոդել",
        year: "Տարեթիվ",
        mileage: "Վազք՝ կմ",
        fuel: "Վառելիք",
        petrol: "Բենզին",
        diesel: "Դիզել",
        gas: "Գազ",
        electric: "Էլեկտրական",
        hybrid: "Հիբրիդ",
        steering: "Ղեկ",
        left: "Ձախ",
        right: "Աջ",
        color: "Գույն",
        region: "Տարածաշրջան",
        condition: "Վիճակ",
        new: "Նոր",
        used: "Օգտագործված",
        phone: "Հեռախոս",
        imageLinks: "Նկարների HTTP/HTTPS հղումները՝ առանձին տողով",
        description: "Նկարագրություն",
        saving: "Պահպանվում է…",
        save: "Պահպանել",
        deleteQuestion: "Ջնջե՞լ ապրանքը",
        deleteWarning: "Ապրանքը կհեռացվի նաև օգտատերերի Favorites ցանկերից։",
        cancel: "Չեղարկել",
        error: "Տեղի ունեցավ սխալ։",
        invalidPrice: "Նշեք ճիշտ գին։",
        invalidImages: "Նկարների հղումները պետք է սկսվեն http:// կամ https://",
    },

    ru: {
        searchPlaceholder: "Поиск объявления",
        search: "Найти",
        add: "Добавить объявление",
        product: "Объявление",
        price: "Цена",
        owner: "Автор",
        status: "Статус",
        actions: "Действия",
        removedAccount: "Аккаунт удалён",
        active: "Активно",
        draft: "Черновик",
        sold: "Продано",
        edit: "Редактировать",
        delete: "Удалить",
        empty: "Объявлений пока нет. Добавьте первое.",
        editProduct: "Редактировать объявление",
        newProduct: "Новое объявление",
        close: "Закрыть",
        category: "Категория",
        car: "Автомобиль",
        part: "Запчасть",
        title: "Название",
        priceAMD: "Цена в AMD",
        vehicleType: "Тип",
        passenger: "Легковой",
        truck: "Грузовой",
        brand: "Марка",
        model: "Модель",
        year: "Год",
        mileage: "Пробег, км",
        fuel: "Топливо",
        petrol: "Бензин",
        diesel: "Дизель",
        gas: "Газ",
        electric: "Электро",
        hybrid: "Гибрид",
        steering: "Руль",
        left: "Левый",
        right: "Правый",
        color: "Цвет",
        region: "Регион",
        condition: "Состояние",
        new: "Новое",
        used: "Б/у",
        phone: "Телефон",
        imageLinks: "HTTP/HTTPS ссылки на фотографии, по одной в строке",
        description: "Описание",
        saving: "Сохранение…",
        save: "Сохранить",
        deleteQuestion: "Удалить объявление?",
        deleteWarning:
            "Объявление также будет удалено из избранного пользователей.",
        cancel: "Отмена",
        error: "Произошла ошибка.",
        invalidPrice: "Укажите корректную цену.",
        invalidImages: "Ссылки должны начинаться с http:// или https://",
    },

    en: {
        searchPlaceholder: "Search listings",
        search: "Search",
        add: "Add listing",
        product: "Listing",
        price: "Price",
        owner: "Owner",
        status: "Status",
        actions: "Actions",
        removedAccount: "Account deleted",
        active: "Active",
        draft: "Draft",
        sold: "Sold",
        edit: "Edit",
        delete: "Delete",
        empty: "No listings yet. Add the first one.",
        editProduct: "Edit listing",
        newProduct: "New listing",
        close: "Close",
        category: "Category",
        car: "Car",
        part: "Spare part",
        title: "Title",
        priceAMD: "Price in AMD",
        vehicleType: "Vehicle type",
        passenger: "Passenger",
        truck: "Truck",
        brand: "Brand",
        model: "Model",
        year: "Year",
        mileage: "Mileage, km",
        fuel: "Fuel",
        petrol: "Petrol",
        diesel: "Diesel",
        gas: "Gas",
        electric: "Electric",
        hybrid: "Hybrid",
        steering: "Steering",
        left: "Left",
        right: "Right",
        color: "Color",
        region: "Region",
        condition: "Condition",
        new: "New",
        used: "Used",
        phone: "Phone",
        imageLinks: "HTTP/HTTPS image URLs, one per line",
        description: "Description",
        saving: "Saving…",
        save: "Save",
        deleteQuestion: "Delete this listing?",
        deleteWarning:
            "The listing will also be removed from users' favorites.",
        cancel: "Cancel",
        error: "Something went wrong.",
        invalidPrice: "Enter a valid price.",
        invalidImages: "Image URLs must begin with http:// or https://",
    },
};

const EMPTY = {
    type: "car",
    title: "",
    price: "",
    status: "active",
    vehicleType: "passenger",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "petrol",
    steering: "left",
    color: "",
    region: "Երևան",
    vin: "",
    condition: "Օգտագործված",
    description: "",
    phone: "",
    images: "",
};

export default function AdminProducts() {
    const { language } = useI18n();
    const t = TEXT[language] || TEXT.hy;

    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [revision, setRevision] = useState(0);

    const [form, setForm] = useState(null);
    const [editId, setEditId] = useState(null);
    const [remove, setRemove] = useState(null);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const state = useRemote(
        `/admin/products?page=${page}&search=${encodeURIComponent(query)}`,
        revision,
    );

    const { format } = useCurrency();

    const statusLabels = {
        active: t.active,
        draft: t.draft,
        sold: t.sold,
    };

    function open(product = null) {
        setError("");
        setEditId(product?._id || null);

        setForm(
            product
                ? {
                      ...EMPTY,
                      ...product,
                      images: Array.isArray(product.images)
                          ? product.images.join("\n")
                          : "",
                  }
                : { ...EMPTY },
        );
    }

    function change(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    }

    async function save(event) {
        event.preventDefault();

        if (busy || !form) return;

        const images = form.images
            .split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean);

        if (
            form.price === "" ||
            !Number.isFinite(Number(form.price)) ||
            Number(form.price) < 0
        ) {
            setError(t.invalidPrice);
            return;
        }

        if (images.some((url) => !/^https?:\/\//i.test(url))) {
            setError(t.invalidImages);
            return;
        }

        const body = {
            ...form,
            price: Number(form.price),
            images,
        };

        delete body._id;
        delete body.id;
        delete body.owner;
        delete body.createdAt;
        delete body.updatedAt;
        delete body.__v;

        if (form.type === "car") {
            body.year = Number(form.year);
            body.mileage = Number(form.mileage);
        } else {
            delete body.year;
            delete body.mileage;
        }

        setBusy(true);
        setError("");

        try {
            await apiRequest(
                `/admin/products${editId ? `/${encodeURIComponent(editId)}` : ""}`,
                {
                    method: editId ? "PATCH" : "POST",
                    body: JSON.stringify(body),
                },
            );

            setForm(null);
            setRevision((value) => value + 1);
        } catch (requestError) {
            setError(requestError.message || t.error);
        } finally {
            setBusy(false);
        }
    }

    async function deleteProduct() {
        if (!remove || busy) return;

        setBusy(true);
        setError("");

        try {
            await apiRequest(
                `/admin/products/${encodeURIComponent(remove._id)}`,
                { method: "DELETE" },
            );

            setRemove(null);
            setRevision((value) => value + 1);
        } catch (requestError) {
            setError(requestError.message || t.error);
        } finally {
            setBusy(false);
        }
    }

    function textField(name, label, options = {}) {
        return (
            <label key={name}>
                {label}
                <input
                    name={name}
                    value={form[name] ?? ""}
                    onChange={change}
                    {...options}
                />
            </label>
        );
    }

    function selectField(name, label, choices) {
        return (
            <label key={name}>
                {label}
                <select name={name} value={form[name] ?? ""} onChange={change}>
                    {choices.map(([value, title]) => (
                        <option key={value} value={value}>
                            {title}
                        </option>
                    ))}
                </select>
            </label>
        );
    }

    return (
        <>
            <form
                className="admin-toolbar"
                onSubmit={(event) => {
                    event.preventDefault();
                    setPage(1);
                    setQuery(search);
                }}
            >
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                />

                <button type="submit">{t.search}</button>

                <button
                    type="button"
                    className="admin-primary"
                    onClick={() => open()}
                >
                    + {t.add}
                </button>
            </form>

            <Notice state={state} />

            <div className="admin-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>{t.product}</th>
                            <th>{t.price}</th>
                            <th>{t.owner}</th>
                            <th>{t.status}</th>
                            <th>{t.actions}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(state.data?.items || []).map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <div className="admin-product-cell">
                                        {product.images?.[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt=""
                                                loading="lazy"
                                            />
                                        )}

                                        <Link to={`/cars/${product._id}`}>
                                            {product.title}
                                        </Link>
                                    </div>
                                </td>

                                <td>{format(product.price)}</td>

                                <td>
                                    {product.owner?.email || t.removedAccount}
                                </td>

                                <td>
                                    <span className="admin-status">
                                        {statusLabels[product.status] ||
                                            product.status}
                                    </span>
                                </td>

                                <td>
                                    <div className="admin-row-actions">
                                        <button
                                            type="button"
                                            onClick={() => open(product)}
                                        >
                                            {t.edit}
                                        </button>

                                        <button
                                            type="button"
                                            className="danger-text"
                                            onClick={() => {
                                                setError("");
                                                setRemove(product);
                                            }}
                                        >
                                            {t.delete}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!state.loading && state.data?.total === 0 && (
                    <p className="admin-empty">{t.empty}</p>
                )}
            </div>

            <Pagination
                page={page}
                setPage={setPage}
                total={state.data?.total || 0}
            />

            {/* CREATE / EDIT */}

            {form && (
                <div className="admin-modal-backdrop">
                    <section
                        className="admin-modal admin-product-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-editor-title"
                    >
                        <div className="admin-panel-heading">
                            <h2 id="product-editor-title">
                                {editId ? t.editProduct : t.newProduct}
                            </h2>

                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setForm(null)}
                                aria-label={t.close}
                            >
                                ×
                            </button>
                        </div>

                        <form className="admin-edit-form" onSubmit={save}>
                            <div className="admin-form-grid">
                                {selectField("type", t.category, [
                                    ["car", t.car],
                                    ["part", t.part],
                                ])}

                                {selectField("status", t.status, [
                                    ["active", t.active],
                                    ["draft", t.draft],
                                    ["sold", t.sold],
                                ])}

                                {textField("title", t.title, {
                                    required: true,
                                    minLength: 2,
                                    maxLength: 120,
                                })}

                                {textField("price", t.priceAMD, {
                                    required: true,
                                    type: "number",
                                    min: 0,
                                    step: "any",
                                })}

                                {form.type === "car" && (
                                    <>
                                        {selectField(
                                            "vehicleType",
                                            t.vehicleType,
                                            [
                                                ["passenger", t.passenger],
                                                ["truck", t.truck],
                                            ],
                                        )}

                                        {textField("brand", t.brand, {
                                            required: true,
                                            maxLength: 60,
                                        })}

                                        {textField("model", t.model, {
                                            required: true,
                                            maxLength: 60,
                                        })}

                                        {textField("year", t.year, {
                                            required: true,
                                            type: "number",
                                            min: 1950,
                                            max: new Date().getFullYear() + 1,
                                        })}

                                        {textField("mileage", t.mileage, {
                                            required: true,
                                            type: "number",
                                            min: 0,
                                        })}

                                        {selectField("fuel", t.fuel, [
                                            ["petrol", t.petrol],
                                            ["diesel", t.diesel],
                                            ["gas", t.gas],
                                            ["electric", t.electric],
                                            ["hybrid", t.hybrid],
                                        ])}

                                        {selectField("steering", t.steering, [
                                            ["left", t.left],
                                            ["right", t.right],
                                        ])}

                                        {textField("color", t.color, {
                                            maxLength: 40,
                                        })}

                                        {textField("vin", "VIN", {
                                            maxLength: 17,
                                        })}
                                    </>
                                )}

                                {textField("region", t.region, {
                                    required: true,
                                    maxLength: 60,
                                })}

                                {selectField("condition", t.condition, [
                                    ["Նոր", t.new],
                                    ["Օգտագործված", t.used],
                                ])}

                                {textField("phone", t.phone, {
                                    required: true,
                                    type: "tel",
                                })}
                            </div>

                            <label>
                                {t.imageLinks}
                                <textarea
                                    name="images"
                                    value={form.images}
                                    onChange={change}
                                    rows={3}
                                    placeholder="https://..."
                                />
                            </label>

                            <label>
                                {t.description}
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={change}
                                    rows={4}
                                    maxLength={5000}
                                />
                            </label>

                            {error && (
                                <p className="admin-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="admin-primary"
                                disabled={busy}
                            >
                                {busy ? t.saving : t.save}
                            </button>
                        </form>
                    </section>
                </div>
            )}

            {/* DELETE CONFIRMATION */}

            {remove && (
                <div className="admin-modal-backdrop">
                    <section
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="remove-product-title"
                    >
                        <h2 id="remove-product-title">{t.deleteQuestion}</h2>

                        <p>{remove.title}</p>

                        <p>{t.deleteWarning}</p>

                        {error && (
                            <p className="admin-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="admin-row-actions">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setRemove(null)}
                            >
                                {t.cancel}
                            </button>

                            <button
                                type="button"
                                className="admin-primary"
                                disabled={busy}
                                onClick={deleteProduct}
                            >
                                {t.delete}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
