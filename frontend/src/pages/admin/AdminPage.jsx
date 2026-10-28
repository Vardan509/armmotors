import { useState } from "react";
import { Link } from "react-router-dom";

import useRemote from "../../utils/useRemote";
import useCurrency from "../../utils/useCurrency";
import { apiRequest } from "../../utils/api";
import { useI18n } from "../../utils/i18n";
import { asset } from "../../utils/asset";

import AdminProducts from "./AdminProducts";
import AdminBroadcasts from "./AdminBroadcasts";

import "./Admin.css";

// ==========================================
// TRANSLATIONS
// ==========================================

const TRANSLATIONS = {
    hy: {
        dashboard: "Վահանակ",
        users: "Օգտատերեր",
        products: "Ապրանքներ",
        orders: "Գնումներ",
        messages: "Հաղորդագրություններ",
        broadcasts: "Նամակների ուղարկում",
        reports: "Բողոքներ",
        audit: "Գործողությունների պատմություն",
        controlPanel: "ԿԱՌԱՎԱՐՄԱՆ ՎԱՀԱՆԱԿ",
        management: "Կառավարում",
        admin: "Ադմին",
        loading: "Բեռնվում է…",
        adminLogin: "Ադմինի մուտք",
        accessDenied: "Այս բաժինը միայն ադմինի համար է։",
        login: "Մուտք գործել",
        home: "Գլխավոր էջ",
        backToSite: "Դեպի կայք",
        previous: "Նախորդ",
        next: "Հաջորդ",
        search: "Որոնել",
        searchUsers: "Անուն կամ email",
        user: "Օգտատեր",
        emailPhone: "Email / Հեռախոս",
        registered: "Գրանցում",
        status: "Կարգավիճակ",
        actions: "Գործողություններ",
        blocked: "Արգելափակված",
        active: "Ակտիվ",
        ban: "Արգելափակել",
        unban: "Հանել արգելափակումը",
        deleteAccount: "Ջնջել հաշիվը",
        noUsers: "Օգտատեր չի գտնվել։",
        deleteAccountQuestion: "Ջնջե՞լ օգտատիրոջ հաշիվը",
        deleteWarning:
            "Հաշիվն ու նրա ապրանքները կջնջվեն։ Պատմական գնումների տվյալները կպահպանվեն։",
        reason: "Պատճառ",
        cancel: "Չեղարկել",
        confirm: "Հաստատել",
        saving: "Պահպանվում է…",
        totalUsers: "Օգտատերեր",
        totalProducts: "Ապրանքներ",
        activeProducts: "Ակտիվ ապրանքներ",
        completedOrders: "Հաստատված գնումներ",
        totalRevenue: "Ընդհանուր վաճառք",
        pendingOrders: "Սպասող գնումներ",
        newMessages: "Նոր հաղորդագրություններ",
        bannedUsers: "Արգելափակված օգտատերեր",
        salesStatistics: "Հաստատված գնումների վիճակագրություն",
        salesDescription:
            "Գումարները հաշվվում են միայն հաստատված պատվերներից։ Ժամային գոտի՝ Երևան։",
        day: "Օր",
        week: "Շաբաթ",
        month: "Ամիս",
        noSales: "Այս ժամանակահատվածում հաստատված գնումներ դեռ չկան։",
        recentOrders: "Վերջին գնման հայտերը",
        product: "Ապրանք",
        buyer: "Գնորդ",
        amount: "Գումար",
        date: "Ամսաթիվ",
        pending: "Սպասում է",
        completed: "Հաստատված",
        cancelled: "Չեղարկված",
        deletedAccount: "Հաշիվը ջնջված է",
        confirmPurchase: "Հաստատել գնումը",
        noOrders: "Գնումներ դեռ չկան։",
        all: "Բոլորը",
        orderWarning:
            "Գնումը հաստատեք վճարումն ու գործարքը ստուգելուց հետո։ Սա առցանց վճարում չի գանձում։",
        completeQuestion: "Հաստատե՞լ ավարտված գնումը",
        cancelQuestion: "Չեղարկե՞լ գնման հայտը",
        completeDescription:
            "Գումարը կավելանա վաճառքի հաշվետվությունում, ապրանքը կնշվի վաճառված։",
        cancelDescription: "Հայտը կդառնա չեղարկված։",
        close: "Փակել",
        new: "Նոր",
        resolved: "Մշակված",
        openProduct: "Բացել ապրանքը",
        reply: "Պատասխանել",
        markResolved: "Նշել մշակված",
        markNew: "Նշել նոր",
        noMessages: "Հաղորդագրություններ չկան։",
        action: "Գործողություն",
    },

    ru: {
        dashboard: "Панель управления",
        users: "Пользователи",
        products: "Объявления",
        orders: "Покупки",
        messages: "Сообщения",
        broadcasts: "Рассылки",
        reports: "Жалобы",
        audit: "История действий",
        controlPanel: "ПАНЕЛЬ УПРАВЛЕНИЯ",
        management: "Управление",
        admin: "Администратор",
        loading: "Загрузка…",
        adminLogin: "Вход администратора",
        accessDenied: "Этот раздел доступен только администраторам.",
        login: "Войти",
        home: "Главная",
        backToSite: "Вернуться на сайт",
        previous: "Назад",
        next: "Далее",
        search: "Поиск",
        searchUsers: "Имя или email",
        user: "Пользователь",
        emailPhone: "Email / Телефон",
        registered: "Регистрация",
        status: "Статус",
        actions: "Действия",
        blocked: "Заблокирован",
        active: "Активен",
        ban: "Заблокировать",
        unban: "Разблокировать",
        deleteAccount: "Удалить аккаунт",
        noUsers: "Пользователи не найдены.",
        deleteAccountQuestion: "Удалить аккаунт пользователя?",
        deleteWarning:
            "Аккаунт и его объявления будут удалены. История покупок сохранится.",
        reason: "Причина",
        cancel: "Отмена",
        confirm: "Подтвердить",
        saving: "Сохранение…",
        totalUsers: "Пользователи",
        totalProducts: "Объявления",
        activeProducts: "Активные объявления",
        completedOrders: "Подтверждённые покупки",
        totalRevenue: "Общие продажи",
        pendingOrders: "Ожидающие покупки",
        newMessages: "Новые сообщения",
        bannedUsers: "Заблокированные пользователи",
        salesStatistics: "Статистика подтверждённых покупок",
        salesDescription:
            "Учитываются только подтверждённые заказы. Часовой пояс: Ереван.",
        day: "День",
        week: "Неделя",
        month: "Месяц",
        noSales: "В этом периоде нет подтверждённых покупок.",
        recentOrders: "Последние заявки на покупку",
        product: "Товар",
        buyer: "Покупатель",
        amount: "Сумма",
        date: "Дата",
        pending: "Ожидает",
        completed: "Подтверждено",
        cancelled: "Отменено",
        deletedAccount: "Аккаунт удалён",
        confirmPurchase: "Подтвердить покупку",
        noOrders: "Покупок пока нет.",
        all: "Все",
        orderWarning:
            "Подтверждайте покупку после проверки оплаты и сделки. Онлайн-оплата здесь не списывается.",
        completeQuestion: "Подтвердить покупку?",
        cancelQuestion: "Отменить заявку?",
        completeDescription:
            "Сумма попадёт в отчёт о продажах, товар получит статус «Продано».",
        cancelDescription: "Заявка будет отменена.",
        close: "Закрыть",
        new: "Новое",
        resolved: "Обработано",
        openProduct: "Открыть товар",
        reply: "Ответить",
        markResolved: "Отметить обработанным",
        markNew: "Отметить новым",
        noMessages: "Сообщений нет.",
        action: "Действие",
    },

    en: {
        dashboard: "Dashboard",
        users: "Users",
        products: "Listings",
        orders: "Orders",
        messages: "Messages",
        broadcasts: "Broadcasts",
        reports: "Reports",
        audit: "Activity history",
        controlPanel: "ADMIN DASHBOARD",
        management: "Management",
        admin: "Admin",
        loading: "Loading…",
        adminLogin: "Admin login",
        accessDenied: "This section is for administrators only.",
        login: "Log in",
        home: "Home",
        backToSite: "Back to website",
        previous: "Previous",
        next: "Next",
        search: "Search",
        searchUsers: "Name or email",
        user: "User",
        emailPhone: "Email / Phone",
        registered: "Registration",
        status: "Status",
        actions: "Actions",
        blocked: "Banned",
        active: "Active",
        ban: "Ban",
        unban: "Unban",
        deleteAccount: "Delete account",
        noUsers: "No users found.",
        deleteAccountQuestion: "Delete this user's account?",
        deleteWarning:
            "The account and its listings will be deleted. Historical purchase records will remain.",
        reason: "Reason",
        cancel: "Cancel",
        confirm: "Confirm",
        saving: "Saving…",
        totalUsers: "Users",
        totalProducts: "Listings",
        activeProducts: "Active listings",
        completedOrders: "Completed orders",
        totalRevenue: "Total sales",
        pendingOrders: "Pending orders",
        newMessages: "New messages",
        bannedUsers: "Banned users",
        salesStatistics: "Completed order statistics",
        salesDescription:
            "Only completed orders are counted. Time zone: Yerevan.",
        day: "Day",
        week: "Week",
        month: "Month",
        noSales: "No completed orders in this period.",
        recentOrders: "Recent purchase requests",
        product: "Product",
        buyer: "Buyer",
        amount: "Amount",
        date: "Date",
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled",
        deletedAccount: "Account deleted",
        confirmPurchase: "Confirm purchase",
        noOrders: "No orders yet.",
        all: "All",
        orderWarning:
            "Verify payment and the transaction before confirming. This does not charge an online payment.",
        completeQuestion: "Confirm this purchase?",
        cancelQuestion: "Cancel this purchase request?",
        completeDescription:
            "The amount will appear in sales reports and the product will be marked as sold.",
        cancelDescription: "The request will be cancelled.",
        close: "Close",
        new: "New",
        resolved: "Resolved",
        openProduct: "Open product",
        reply: "Reply",
        markResolved: "Mark resolved",
        markNew: "Mark new",
        noMessages: "No messages.",
        action: "Action",
    },
};

function useAdminText() {
    const { language } = useI18n();

    return {
        text: TRANSLATIONS[language] || TRANSLATIONS.hy,
        locale:
            language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "hy-AM",
    };
}

function dateLabel(value, locale = "hy-AM") {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString(locale, {
        timeZone: "Asia/Yerevan",
        dateStyle: "short",
        timeStyle: "short",
    });
}

// ==========================================
// REUSABLE COMPONENTS
// ==========================================

export function Notice({ state }) {
    const { text: t } = useAdminText();

    if (state.error) {
        return (
            <p className="admin-error" role="alert">
                {state.error}
            </p>
        );
    }

    if (state.loading) {
        return <p role="status">{t.loading}</p>;
    }

    return null;
}

export function Pagination({ page, setPage, total, limit = 20 }) {
    const { text: t } = useAdminText();

    const pageCount = Math.max(1, Math.ceil(total / limit));

    return (
        <nav className="admin-pager" aria-label={t.actions}>
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
            >
                ← {t.previous}
            </button>

            <span>
                {page} / {pageCount}
            </span>

            <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => value + 1)}
            >
                {t.next} →
            </button>
        </nav>
    );
}

// ==========================================
// MAIN ADMIN PAGE
// ==========================================

export default function AdminPage({ section = "" }) {
    const { text: t } = useAdminText();
    const me = useRemote("/auth/me");

    const sections = [
        ["", t.dashboard],
        ["users", t.users],
        ["products", t.products],
        ["orders", t.orders],
        ["messages", t.messages],
        ["broadcasts", t.broadcasts],
        ["reports", t.reports],
        ["audit", t.audit],
    ];

    if (me.loading) {
        return (
            <main className="admin-gate">
                <p>{t.loading}</p>
            </main>
        );
    }

    if (me.error || !me.data?.isAdmin) {
        return (
            <main className="admin-gate">
                <img src={asset("/logo.png")} alt="ArmMotors" />

                <h1>{t.adminLogin}</h1>

                <p>{me.error || t.accessDenied}</p>

                <Link
                    to={`/login?next=${encodeURIComponent(
                        `/admin${section ? `/${section}` : ""}`,
                    )}`}
                >
                    {t.login}
                </Link>

                <Link to="/">{t.home}</Link>
            </main>
        );
    }

    const title = sections.find(([key]) => key === section)?.[1] || t.dashboard;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Link to="/">
                    <img src={asset("/logo.png")} alt="ArmMotors" />
                </Link>

                <small>{t.controlPanel}</small>

                <nav>
                    {sections.map(([key, label]) => (
                        <Link
                            key={key}
                            to={`/admin${key ? `/${key}` : ""}`}
                            aria-current={key === section ? "page" : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="admin-account">
                    <strong>{me.data.name}</strong>

                    <span>{me.data.email}</span>

                    <Link to="/">← {t.backToSite}</Link>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-heading">
                    <div>
                        <span>ArmMotors / {t.management}</span>

                        <h1>{title}</h1>
                    </div>

                    <span className="admin-role">{t.admin}</span>
                </header>

                {section === "users" ? (
                    <Users />
                ) : section === "products" ? (
                    <AdminProducts />
                ) : section === "orders" ? (
                    <Orders />
                ) : section === "messages" ? (
                    <Messages />
                ) : section === "broadcasts" ? (
                    <AdminBroadcasts />
                ) : section === "audit" ? (
                    <Audit />
                ) : (
                    <Dashboard />
                )}
            </main>
        </div>
    );
}

// ==========================================
// DASHBOARD
// ==========================================

function Dashboard() {
    const { text: t, locale } = useAdminText();

    const [period, setPeriod] = useState("day");

    const state = useRemote(`/admin/dashboard?period=${period}`);

    const { format } = useCurrency();

    const data = state.data;

    const sales = Array.isArray(data?.sales) ? data.sales : [];

    const maximum = Math.max(
        1,
        ...sales.map((row) => Number(row.revenue || 0)),
    );

    const statistics = data
        ? [
              [t.totalUsers, data.users],
              [t.totalProducts, data.products],
              [t.activeProducts, data.active],
              [t.completedOrders, data.completedOrders],
              [t.totalRevenue, format(data.revenue)],
              [t.pendingOrders, data.pendingOrders],
              [t.newMessages, data.messages],
              [t.bannedUsers, data.banned],
          ]
        : [];

    return (
        <>
            <Notice state={state} />

            {data && (
                <>
                    <div className="admin-stat-grid">
                        {statistics.map(([label, value]) => (
                            <article className="admin-stat" key={label}>
                                <span>{label}</span>

                                <strong>{value ?? 0}</strong>
                            </article>
                        ))}
                    </div>

                    <section className="admin-panel">
                        <div className="admin-panel-heading">
                            <div>
                                <h2>{t.salesStatistics}</h2>

                                <p>{t.salesDescription}</p>
                            </div>

                            <div className="admin-periods">
                                {[
                                    ["day", t.day],
                                    ["week", t.week],
                                    ["month", t.month],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={period === value}
                                        onClick={() => setPeriod(value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {sales.length > 0 ? (
                            <div
                                className="admin-chart"
                                role="img"
                                aria-label={t.salesStatistics}
                            >
                                {sales.map((row) => {
                                    const revenue = Number(row.revenue || 0);

                                    return (
                                        <div
                                            className="admin-bar-column"
                                            key={row.date}
                                        >
                                            <span>{format(revenue)}</span>

                                            <div
                                                className="admin-bar"
                                                style={{
                                                    height: `${Math.max(
                                                        4,
                                                        (revenue / maximum) *
                                                            180,
                                                    )}px`,
                                                }}
                                                title={`${row.orders} · ${format(
                                                    revenue,
                                                )}`}
                                            />

                                            <small>
                                                {new Date(
                                                    row.date,
                                                ).toLocaleDateString(locale, {
                                                    timeZone: "Asia/Yerevan",
                                                })}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="admin-empty">{t.noSales}</p>
                        )}
                    </section>

                    <section className="admin-panel">
                        <h2>{t.recentOrders}</h2>

                        <OrderTable orders={data.recentOrders} />
                    </section>
                </>
            )}
        </>
    );
}

// ==========================================
// USERS
// ==========================================

function Users() {
    const { text: t, locale } = useAdminText();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [revision, setRevision] = useState(0);

    const [selected, setSelected] = useState(null);

    const [reason, setReason] = useState("");

    const [busy, setBusy] = useState(false);

    const [error, setError] = useState("");

    const state = useRemote(
        `/admin/users?page=${page}&search=${encodeURIComponent(query)}`,
        revision,
    );

    async function act() {
        if (!selected || busy) {
            return;
        }

        setBusy(true);
        setError("");

        try {
            const { user, remove } = selected;

            await apiRequest(`/admin/users/${user._id}`, {
                method: remove ? "DELETE" : "PATCH",

                ...(remove
                    ? {}
                    : {
                          body: JSON.stringify({
                              banned: !user.banned,
                              reason,
                          }),
                      }),
            });

            setSelected(null);
            setReason("");

            setRevision((value) => value + 1);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
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
                    placeholder={t.searchUsers}
                    aria-label={t.searchUsers}
                />

                <button type="submit">{t.search}</button>
            </form>

            <Notice state={state} />

            <div className="admin-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>{t.user}</th>
                            <th>{t.emailPhone}</th>
                            <th>{t.registered}</th>
                            <th>{t.status}</th>
                            <th>{t.actions}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(state.data?.items || []).map((user) => (
                            <tr key={user._id}>
                                <td>
                                    {user.name} {user.surname}
                                    {user.isAdmin && (
                                        <small className="admin-role">
                                            {t.admin}
                                        </small>
                                    )}
                                </td>

                                <td>
                                    {user.email}

                                    <small>{user.phone || "—"}</small>
                                </td>

                                <td>{dateLabel(user.createdAt, locale)}</td>

                                <td>
                                    <span
                                        className={`admin-status ${
                                            user.banned ? "danger" : "success"
                                        }`}
                                    >
                                        {user.banned ? t.blocked : t.active}
                                    </span>
                                </td>

                                <td>
                                    {!user.isAdmin && (
                                        <div className="admin-row-actions">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setError("");
                                                    setReason("");
                                                    setSelected({
                                                        user,
                                                    });
                                                }}
                                            >
                                                {user.banned ? t.unban : t.ban}
                                            </button>

                                            <button
                                                type="button"
                                                className="danger-text"
                                                onClick={() => {
                                                    setError("");
                                                    setSelected({
                                                        user,
                                                        remove: true,
                                                    });
                                                }}
                                            >
                                                {t.deleteAccount}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {state.data?.total === 0 && (
                    <p className="admin-empty">{t.noUsers}</p>
                )}
            </div>

            <Pagination
                page={page}
                setPage={setPage}
                total={state.data?.total || 0}
            />

            {selected && (
                <div className="admin-modal-backdrop">
                    <section
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="user-action-title"
                    >
                        <h2 id="user-action-title">
                            {selected.remove
                                ? t.deleteAccountQuestion
                                : selected.user.banned
                                  ? t.unban
                                  : t.ban}
                        </h2>

                        <p>{selected.user.email}</p>

                        {selected.remove ? (
                            <p>{t.deleteWarning}</p>
                        ) : (
                            !selected.user.banned && (
                                <label>
                                    {t.reason}

                                    <textarea
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                        maxLength={500}
                                    />
                                </label>
                            )
                        )}

                        {error && (
                            <p className="admin-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="admin-row-actions">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setSelected(null)}
                            >
                                {t.cancel}
                            </button>

                            <button
                                type="button"
                                className="admin-primary"
                                disabled={busy}
                                onClick={act}
                            >
                                {busy ? t.saving : t.confirm}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

// ==========================================
// ORDERS
// ==========================================

function OrderTable({ orders = [], onAction, busy = false }) {
    const { text: t, locale } = useAdminText();

    const { format } = useCurrency();

    const statusLabels = {
        pending: t.pending,
        completed: t.completed,
        cancelled: t.cancelled,
    };

    const items = Array.isArray(orders) ? orders : [];

    return (
        <div className="admin-table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>{t.product}</th>

                        <th>{t.buyer}</th>

                        <th>{t.amount}</th>

                        <th>{t.date}</th>

                        <th>{t.status}</th>

                        {onAction && <th>{t.actions}</th>}
                    </tr>
                </thead>

                <tbody>
                    {items.map((order) => (
                        <tr key={order._id}>
                            <td>
                                {order.title}

                                <small>{order.note}</small>
                            </td>

                            <td>{order.buyer?.email || t.deletedAccount}</td>

                            <td>{format(order.amount)}</td>

                            <td>{dateLabel(order.createdAt, locale)}</td>

                            <td>
                                <span className="admin-status">
                                    {statusLabels[order.status] || order.status}
                                </span>
                            </td>

                            {onAction && (
                                <td>
                                    {order.status === "pending" && (
                                        <div className="admin-row-actions">
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    onAction(order, "completed")
                                                }
                                            >
                                                {t.confirmPurchase}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    onAction(order, "cancelled")
                                                }
                                            >
                                                {t.cancel}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {!items.length && <p className="admin-empty">{t.noOrders}</p>}
        </div>
    );
}

function Orders() {
    const { text: t } = useAdminText();

    const [page, setPage] = useState(1);

    const [status, setStatus] = useState("");

    const [revision, setRevision] = useState(0);

    const [busy, setBusy] = useState(false);

    const [error, setError] = useState("");

    const [selected, setSelected] = useState(null);

    const state = useRemote(
        `/admin/orders?page=${page}&status=${status}`,
        revision,
    );

    const statusLabels = {
        pending: t.pending,
        completed: t.completed,
        cancelled: t.cancelled,
    };

    async function confirm() {
        if (!selected || busy) {
            return;
        }

        setBusy(true);
        setError("");

        try {
            await apiRequest(`/admin/orders/${selected.order._id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: selected.status,
                }),
            });

            setRevision((value) => value + 1);

            setSelected(null);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <div className="admin-toolbar">
                <select
                    value={status}
                    onChange={(event) => {
                        setPage(1);
                        setStatus(event.target.value);
                    }}
                    aria-label={t.status}
                >
                    <option value="">{t.all}</option>

                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <p>{t.orderWarning}</p>
            </div>

            <Notice state={state} />

            {error && (
                <p role="alert" className="admin-error">
                    {error}
                </p>
            )}

            <OrderTable
                orders={state.data?.items}
                busy={busy}
                onAction={(order, value) => {
                    setError("");
                    setSelected({
                        order,
                        status: value,
                    });
                }}
            />

            <Pagination
                page={page}
                setPage={setPage}
                total={state.data?.total || 0}
            />

            {selected && (
                <div className="admin-modal-backdrop">
                    <section
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="order-action-title"
                    >
                        <h2 id="order-action-title">
                            {selected.status === "completed"
                                ? t.completeQuestion
                                : t.cancelQuestion}
                        </h2>

                        <p>{selected.order.title}</p>

                        <p>
                            {selected.status === "completed"
                                ? t.completeDescription
                                : t.cancelDescription}
                        </p>

                        {error && (
                            <p className="admin-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="admin-row-actions">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => setSelected(null)}
                            >
                                {t.close}
                            </button>

                            <button
                                type="button"
                                disabled={busy}
                                className="admin-primary"
                                onClick={confirm}
                            >
                                {busy ? t.saving : t.confirm}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}

// ==========================================
// MESSAGES
// ==========================================

function Messages() {
    const { text: t, locale } = useAdminText();

    const [page, setPage] = useState(1);

    const [revision, setRevision] = useState(0);

    const [error, setError] = useState("");

    const [busy, setBusy] = useState(false);

    const state = useRemote(`/messages?page=${page}`, revision);

    async function update(message) {
        if (busy) return;

        setBusy(true);
        setError("");

        try {
            await apiRequest(`/messages/${message._id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: message.status === "new" ? "resolved" : "new",
                }),
            });

            setRevision((value) => value + 1);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Notice state={state} />

            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}

            {(state.data?.messages || []).map((message) => (
                <article className="admin-panel" key={message._id}>
                    <div className="admin-panel-heading">
                        <h2>{message.name}</h2>

                        <span className="admin-status">
                            {message.status === "new" ? t.new : t.resolved}
                        </span>
                    </div>

                    <a href={`mailto:${message.email}`}>{message.email}</a>

                    <small>{dateLabel(message.createdAt, locale)}</small>

                    <p className="admin-message-body">{message.text}</p>

                    {message.listingId && (
                        <Link
                            to={`/cars/${encodeURIComponent(
                                message.listingId,
                            )}`}
                        >
                            {t.openProduct}
                        </Link>
                    )}

                    <div className="admin-row-actions">
                        <a
                            className="admin-button"
                            href={`mailto:${message.email}?subject=${encodeURIComponent(
                                "ArmMotors",
                            )}`}
                        >
                            {t.reply}
                        </a>

                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => update(message)}
                        >
                            {message.status === "new"
                                ? t.markResolved
                                : t.markNew}
                        </button>
                    </div>
                </article>
            ))}

            {state.data?.total === 0 && (
                <p className="admin-empty">{t.noMessages}</p>
            )}

            <Pagination
                page={page}
                setPage={setPage}
                total={state.data?.total || 0}
                limit={30}
            />
        </>
    );
}

// ==========================================
// AUDIT
// ==========================================

function Audit() {
    const { text: t, locale } = useAdminText();

    const [page, setPage] = useState(1);

    const state = useRemote(`/admin/audit?page=${page}`);

    return (
        <>
            <Notice state={state} />

            <div className="admin-table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>{t.date}</th>

                            <th>{t.admin}</th>

                            <th>{t.action}</th>

                            <th>ID</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(state.data?.items || []).map((row) => (
                            <tr key={row._id}>
                                <td>{dateLabel(row.createdAt, locale)}</td>

                                <td>{row.actor?.email || "—"}</td>

                                <td>
                                    {row.action}

                                    <small>{row.details}</small>
                                </td>

                                <td>{row.target}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                setPage={setPage}
                total={state.data?.total || 0}
            />
        </>
    );
}
