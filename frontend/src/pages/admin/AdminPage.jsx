import { useState } from "react";
import useRemote from "../../utils/useRemote";
import useCurrency from "../../utils/useCurrency";
import { apiRequest } from "../../utils/api";
import AdminProducts from "./AdminProducts";
import AdminBroadcasts from "./AdminBroadcasts";
import "./Admin.css";

const SECTIONS = [["", "Dashboard"], ["users", "Օգտատերեր"], ["products", "Ապրանքներ"], ["orders", "Գնումներ"], ["messages", "Հաղորդագրություններ"], ["broadcasts", "Broadcast"], ["audit", "Գործողությունների պատմություն"]];
const dateLabel = value => value ? new Date(value).toLocaleString("hy-AM", { timeZone: "Asia/Yerevan", dateStyle: "short", timeStyle: "short" }) : "—";
export function Notice({ state }) { return state.error ? <p className="admin-error" role="alert">{state.error}</p> : state.loading ? <p role="status">Բեռնվում է…</p> : null; }
export function Pagination({ page, setPage, total, limit = 20 }) {
    return <nav className="admin-pager" aria-label="Էջեր"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Նախորդ</button><span>{page} / {Math.max(1, Math.ceil(total / limit))}</span><button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>Հաջորդ →</button></nav>;
}
export default function AdminPage({ section = "" }) {
    const me = useRemote("/auth/me");
    if (me.loading) return <main className="admin-gate"><p>Բեռնվում է…</p></main>;
    if (me.error || !me.data?.isAdmin) return <main className="admin-gate"><img src="/logo.png" alt="ArmMotors" /><h1>Ադմինի մուտք</h1><p>{me.error || "Այս բաժինը միայն ադմինի համար է։"}</p><a href={`/login?next=${encodeURIComponent(`/admin${section ? `/${section}` : ""}`)}`}>Մուտք գործել</a><a href="/">Գլխավոր էջ</a></main>;
    const title = SECTIONS.find(([key]) => key === section)?.[1] || "Dashboard";
    return <div className="admin-layout">
        <aside className="admin-sidebar"><a href="/"><img src="/logo.png" alt="ArmMotors" /></a><small>ԿԱՌԱՎԱՐՄԱՆ ՎԱՀԱՆԱԿ</small><nav>{SECTIONS.map(([key, label]) => <a key={key} href={`/admin${key ? `/${key}` : ""}`} aria-current={key === section ? "page" : undefined}>{label}</a>)}</nav><div className="admin-account"><strong>{me.data.name}</strong><span>{me.data.email}</span><a href="/">← Դեպի կայք</a></div></aside>
        <main className="admin-main"><header className="admin-heading"><div><span>ArmMotors / Կառավարում</span><h1>{title}</h1></div><span className="admin-role">Ադմին</span></header>
            {section === "users" ? <Users /> : section === "products" ? <AdminProducts /> : section === "orders" ? <Orders /> : section === "messages" ? <Messages /> : section === "broadcasts" ? <AdminBroadcasts /> : section === "audit" ? <Audit /> : <Dashboard />}
        </main>
    </div>;
}
function Dashboard() {
    const [period, setPeriod] = useState("day");
    const state = useRemote(`/admin/dashboard?period=${period}`);
    const { format } = useCurrency();
    const data = state.data;
    const max = Math.max(1, ...(data?.sales || []).map(row => row.revenue));
    return <><Notice state={state} />{data && <><div className="admin-stat-grid">{[["Օգտատերեր", data.users], ["Ապրանքներ", data.products], ["Ակտիվ ապրանքներ", data.active], ["Հաստատված գնումներ", data.completedOrders], ["Ընդհանուր վաճառք", format(data.revenue)], ["Սպասող գնումներ", data.pendingOrders], ["Նոր հաղորդագրություններ", data.messages], ["Արգելափակված օգտատերեր", data.banned]].map(([label, value]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Հաստատված գնումների վիճակագրություն</h2><p>Գումարները հաշվվում են միայն հաստատված պատվերներից։ Ժամային գոտի՝ Երևան։</p></div><div className="admin-periods">{[["day", "Օր"], ["week", "Շաբաթ"], ["month", "Ամիս"]].map(([value, label]) => <button key={value} aria-pressed={period === value} onClick={() => setPeriod(value)}>{label}</button>)}</div></div>
            {data.sales.length ? <div className="admin-chart" role="img" aria-label="Հաստատված գնումների գումարները ըստ ժամանակահատվածի">{data.sales.map(row => <div className="admin-bar-column" key={row.date}><span>{format(row.revenue)}</span><div className="admin-bar" style={{ height: `${Math.max(4, row.revenue / max * 180)}px` }} title={`${row.orders} գնում · ${format(row.revenue)}`} /><small>{new Date(row.date).toLocaleDateString("hy-AM", { timeZone: "Asia/Yerevan" })}</small></div>)}</div> : <p className="admin-empty">Այս ժամանակահատվածում հաստատված գնումներ դեռ չկան։</p>}
        </section><section className="admin-panel"><h2>Վերջին գնման հայտերը</h2><OrderTable orders={data.recentOrders} /></section></>}</>;
}
function Users() {
    const [page, setPage] = useState(1), [search, setSearch] = useState(""), [query, setQuery] = useState(""), [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState(null), [reason, setReason] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
    const state = useRemote(`/admin/users?page=${page}&search=${encodeURIComponent(query)}`, revision);
    async function act() {
        setBusy(true); setError("");
        try { await apiRequest(`/admin/users/${selected.user._id}`, { method: selected.remove ? "DELETE" : "PATCH", ...(selected.remove ? {} : { body: JSON.stringify({ banned: !selected.user.banned, reason }) }) }); setSelected(null); setRevision(value => value + 1); }
        catch (error) { setError(error.message); } finally { setBusy(false); }
    }
    return <><form className="admin-toolbar" onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search); }}><input placeholder="Անուն կամ email" aria-label="Որոնել օգտատեր" value={search} onChange={event => setSearch(event.target.value)} /><button>Որոնել</button></form><Notice state={state} />
        <div className="admin-table-wrap"><table><thead><tr><th>Օգտատեր</th><th>Email / Հեռախոս</th><th>Գրանցում</th><th>Կարգավիճակ</th><th>Գործողություններ</th></tr></thead><tbody>{state.data?.items.map(user => <tr key={user._id}><td>{user.name} {user.surname}{user.isAdmin && <small className="admin-role">Ադմին</small>}</td><td>{user.email}<small>{user.phone || "—"}</small></td><td>{dateLabel(user.createdAt)}</td><td><span className={`admin-status ${user.banned ? "danger" : "success"}`}>{user.banned ? "Արգելափակված" : "Ակտիվ"}</span></td><td>{!user.isAdmin && <div className="admin-row-actions"><button onClick={() => { setError(""); setReason(""); setSelected({ user }); }}>{user.banned ? "Unban" : "Ban"}</button><button className="danger-text" onClick={() => { setError(""); setSelected({ user, remove: true }); }}>Ջնջել հաշիվը</button></div>}</td></tr>)}</tbody></table>{state.data?.total === 0 && <p className="admin-empty">Օգտատեր չի գտնվել։</p>}</div>
        <Pagination page={page} setPage={setPage} total={state.data?.total || 0} />
        {selected && <div className="admin-modal-backdrop"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="user-action-title"><h2 id="user-action-title">{selected.remove ? "Ջնջե՞լ օգտատիրոջ հաշիվը" : selected.user.banned ? "Հանել արգելափակումը" : "Արգելափակել օգտատիրոջը"}</h2><p>{selected.user.email}</p>{selected.remove ? <p>Հաշիվն ու նրա ապրանքները կջնջվեն։ Պատմական գնումների տվյալները կպահպանվեն։</p> : !selected.user.banned && <label>Պատճառ<textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} /></label>}{error && <p role="alert" className="admin-error">{error}</p>}<div className="admin-row-actions"><button disabled={busy} onClick={() => setSelected(null)}>Չեղարկել</button><button className="admin-primary" disabled={busy} onClick={act}>{busy ? "Պահպանվում է…" : "Հաստատել"}</button></div></section></div>}
    </>;
}
const STATUS = { pending: "Սպասում է", completed: "Հաստատված", cancelled: "Չեղարկված" };
function OrderTable({ orders = [], onAction, busy }) {
    const { format } = useCurrency();
    return <div className="admin-table-wrap"><table><thead><tr><th>Ապրանք</th><th>Գնորդ</th><th>Գումար</th><th>Ամսաթիվ</th><th>Կարգավիճակ</th>{onAction && <th>Գործողություններ</th>}</tr></thead><tbody>{orders.map(order => <tr key={order._id}><td>{order.title}<small>{order.note}</small></td><td>{order.buyer?.email || "Հաշիվը ջնջված է"}</td><td>{format(order.amount)}</td><td>{dateLabel(order.createdAt)}</td><td><span className="admin-status">{STATUS[order.status]}</span></td>{onAction && <td>{order.status === "pending" && <div className="admin-row-actions"><button disabled={busy} onClick={() => onAction(order, "completed")}>Հաստատել գնումը</button><button disabled={busy} onClick={() => onAction(order, "cancelled")}>Չեղարկել</button></div>}</td>}</tr>)}</tbody></table>{!orders.length && <p className="admin-empty">Գնումներ դեռ չկան։</p>}</div>;
}
function Orders() {
    const [page, setPage] = useState(1), [status, setStatus] = useState(""), [revision, setRevision] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState(""), [selected, setSelected] = useState(null);
    const state = useRemote(`/admin/orders?page=${page}&status=${status}`, revision);
    async function confirm() {
        setBusy(true); setError("");
        try { await apiRequest(`/admin/orders/${selected.order._id}`, { method: "PATCH", body: JSON.stringify({ status: selected.status }) }); setRevision(value => value + 1); setSelected(null); }
        catch (error) { setError(error.message); } finally { setBusy(false); }
    }
    return <><div className="admin-toolbar"><select value={status} onChange={event => { setPage(1); setStatus(event.target.value); }} aria-label="Պատվերի կարգավիճակ"><option value="">Բոլորը</option>{Object.entries(STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><p>Գնումը հաստատեք վճարումն ու գործարքը ստուգելուց հետո։ Սա առցանց վճարում չի գանձում։</p></div><Notice state={state} />{error && <p role="alert" className="admin-error">{error}</p>}<OrderTable orders={state.data?.items} busy={busy} onAction={(order, value) => { setError(""); setSelected({ order, status: value }); }} /><Pagination page={page} setPage={setPage} total={state.data?.total || 0} />{selected && <div className="admin-modal-backdrop"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="order-action-title"><h2 id="order-action-title">{selected.status === "completed" ? "Հաստատե՞լ ավարտված գնումը" : "Չեղարկե՞լ գնման հայտը"}</h2><p>{selected.order.title}</p><p>{selected.status === "completed" ? "Գումարը կավելանա վաճառքի հաշվետվությունում, ապրանքը կնշվի վաճառված։" : "Հայտը կդառնա չեղարկված։"}</p><div className="admin-row-actions"><button disabled={busy} onClick={() => setSelected(null)}>Փակել</button><button disabled={busy} className="admin-primary" onClick={confirm}>Հաստատել</button></div></section></div>}</>;
}
function Messages() {
    const [page, setPage] = useState(1), [revision, setRevision] = useState(0), [error, setError] = useState(""), [busy, setBusy] = useState(false);
    const state = useRemote(`/messages?page=${page}`, revision);
    async function update(message) { setBusy(true); setError(""); try { await apiRequest(`/messages/${message._id}`, { method: "PATCH", body: JSON.stringify({ status: message.status === "new" ? "resolved" : "new" }) }); setRevision(value => value + 1); } catch (error) { setError(error.message); } finally { setBusy(false); } }
    return <><Notice state={state} />{error && <p className="admin-error" role="alert">{error}</p>}{state.data?.messages.map(message => <article className="admin-panel" key={message._id}><div className="admin-panel-heading"><h2>{message.name}</h2><span className="admin-status">{message.status === "new" ? "Նոր" : "Մշակված"}</span></div><a href={`mailto:${message.email}`}>{message.email}</a><small>{dateLabel(message.createdAt)}</small><p className="admin-message-body">{message.text}</p>{message.listingId && <a href={`/cars/${encodeURIComponent(message.listingId)}`}>Բացել ապրանքը</a>}<div className="admin-row-actions"><a className="admin-button" href={`mailto:${message.email}?subject=${encodeURIComponent("ArmMotors — Ձեր հարցը")}`}>Պատասխանել</a><button disabled={busy} onClick={() => update(message)}>Նշել {message.status === "new" ? "մշակված" : "նոր"}</button></div></article>)}{state.data?.total === 0 && <p className="admin-empty">Հաղորդագրություններ չկան։</p>}<Pagination page={page} setPage={setPage} total={state.data?.total || 0} limit={30} /></>;
}
function Audit() {
    const [page, setPage] = useState(1);
    const state = useRemote(`/admin/audit?page=${page}`);
    return <><Notice state={state} /><div className="admin-table-wrap"><table><thead><tr><th>Ամսաթիվ</th><th>Ադմին</th><th>Գործողություն</th><th>ID</th></tr></thead><tbody>{state.data?.items.map(row => <tr key={row._id}><td>{dateLabel(row.createdAt)}</td><td>{row.actor?.email || "—"}</td><td>{row.action}<small>{row.details}</small></td><td>{row.target}</td></tr>)}</tbody></table></div><Pagination page={page} setPage={setPage} total={state.data?.total || 0} /></>;
}
