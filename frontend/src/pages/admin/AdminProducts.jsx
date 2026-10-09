import { useState } from "react";
import { apiRequest } from "../../utils/api";
import useRemote from "../../utils/useRemote";
import useCurrency from "../../utils/useCurrency";
import { Notice, Pagination } from "./AdminPage";
const EMPTY = { type: "car", title: "", price: "", status: "active", vehicleType: "passenger", brand: "", model: "", year: "", mileage: "", fuel: "petrol", steering: "left", color: "", region: "Երևան", vin: "", condition: "Օգտագործված", description: "", phone: "", images: "" };
export default function AdminProducts() {
    const [page, setPage] = useState(1), [query, setQuery] = useState(""), [search, setSearch] = useState(""), [revision, setRevision] = useState(0);
    const [form, setForm] = useState(null), [editId, setEditId] = useState(null), [remove, setRemove] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
    const state = useRemote(`/admin/products?page=${page}&search=${encodeURIComponent(query)}`, revision);
    const { format } = useCurrency();
    function open(product) {
        setEditId(product?._id || null); setError("");
        setForm(product ? { ...EMPTY, ...product, images: (product.images || []).join("\n") } : { ...EMPTY });
    }
    function change(event) { setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); }
    async function save(event) {
        event.preventDefault(); setBusy(true); setError("");
        const body = { ...form, price: Number(form.price), images: form.images.split(/\r?\n/).map(value => value.trim()).filter(Boolean) };
        for (const key of ["year", "mileage"]) { if (form.type === "car") body[key] = Number(form[key]); else delete body[key]; }
        try { await apiRequest(`/admin/products${editId ? `/${editId}` : ""}`, { method: editId ? "PATCH" : "POST", body: JSON.stringify(body) }); setForm(null); setRevision(value => value + 1); }
        catch (error) { setError(error.message); } finally { setBusy(false); }
    }
    async function deleteProduct() { setBusy(true); setError(""); try { await apiRequest(`/admin/products/${remove._id}`, { method: "DELETE" }); setRemove(null); setRevision(value => value + 1); } catch (error) { setError(error.message); } finally { setBusy(false); } }
    const textField = (name, label, options = {}) => <label key={name}>{label}<input name={name} value={form[name]} onChange={change} {...options} /></label>;
    const select = (name, label, choices) => <label key={name}>{label}<select name={name} value={form[name]} onChange={change}>{choices.map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label>;
    return <><form className="admin-toolbar" onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search); }}><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Որոնել ապրանք" aria-label="Ապրանքի որոնում" /><button>Որոնել</button><button type="button" className="admin-primary" onClick={() => open()}>＋ Ավելացնել ապրանք</button></form><Notice state={state} />
        <div className="admin-table-wrap"><table><thead><tr><th>Ապրանք</th><th>Գին</th><th>Հեղինակ</th><th>Կարգավիճակ</th><th>Գործողություններ</th></tr></thead><tbody>{state.data?.items.map(product => <tr key={product._id}><td><div className="admin-product-cell">{product.images?.[0] && <img src={product.images[0]} alt="" />}<a href={`/cars/${product._id}`}>{product.title}</a></div></td><td>{format(product.price)}</td><td>{product.owner?.email || "Հաշիվը ջնջված է"}</td><td><span className="admin-status">{{ active: "Ակտիվ", draft: "Սևագիր", sold: "Վաճառված" }[product.status] || "Ակտիվ"}</span></td><td><div className="admin-row-actions"><button onClick={() => open(product)}>Խմբագրել</button><button className="danger-text" onClick={() => { setError(""); setRemove(product); }}>Ջնջել</button></div></td></tr>)}</tbody></table>{state.data?.total === 0 && <p className="admin-empty">Ապրանքներ դեռ չկան։ Ավելացրեք առաջինը։</p>}</div><Pagination page={page} setPage={setPage} total={state.data?.total || 0} />
        {form && <div className="admin-modal-backdrop"><section className="admin-modal admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-editor-title"><div className="admin-panel-heading"><h2 id="product-editor-title">{editId ? "Խմբագրել ապրանքը" : "Նոր ապրանք"}</h2><button type="button" disabled={busy} onClick={() => setForm(null)} aria-label="Փակել">×</button></div><form className="admin-edit-form" onSubmit={save}>
            <div className="admin-form-grid">{select("type", "Բաժին", [["car", "Մեքենա"], ["part", "Պահեստամաս"]])}{select("status", "Կարգավիճակ", [["active", "Ակտիվ"], ["draft", "Սևագիր"], ["sold", "Վաճառված"]])}{textField("title", "Վերնագիր", { required: true, minLength: 2, maxLength: 120 })}{textField("price", "Գին՝ AMD", { required: true, type: "number", min: 0, step: "any" })}
            {form.type === "car" && <>{select("vehicleType", "Տեսակ", [["passenger", "Մարդատար"], ["truck", "Բեռնատար"]])}{textField("brand", "Մակնիշ", { required: true, maxLength: 60 })}{textField("model", "Մոդել", { required: true, maxLength: 60 })}{textField("year", "Տարեթիվ", { required: true, type: "number", min: 1886, max: new Date().getFullYear() + 1 })}{textField("mileage", "Վազք՝ կմ", { required: true, type: "number", min: 0 })}{select("fuel", "Վառելիք", [["petrol", "Բենզին"], ["diesel", "Դիզել"], ["gas", "Գազ"], ["electric", "Էլեկտրական"], ["hybrid", "Հիբրիդ"]])}{select("steering", "Ղեկ", [["left", "Ձախ"], ["right", "Աջ"]])}{textField("color", "Գույն", { maxLength: 40 })}{textField("vin", "VIN", { maxLength: 17 })}</>}
            {textField("region", "Տարածաշրջան", { required: true, maxLength: 60 })}{select("condition", "Վիճակ", [["Նոր", "Նոր"], ["Օգտագործված", "Օգտագործված"]])}{textField("phone", "Հեռախոս", { required: true, type: "tel" })}</div><label>Նկարների HTTP/HTTPS հղումները՝ առանձին տողով<textarea name="images" value={form.images} onChange={change} rows={3} placeholder="https://..." /></label><label>Նկարագրություն<textarea name="description" value={form.description} onChange={change} rows={4} maxLength={5000} /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-primary" disabled={busy}>{busy ? "Պահպանվում է…" : "Պահպանել"}</button></form></section></div>}
        {remove && <div className="admin-modal-backdrop"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="remove-product-title"><h2 id="remove-product-title">Ջնջե՞լ ապրանքը</h2><p>{remove.title}</p><p>Ապրանքը կհեռացվի նաև օգտատերերի Favorites ցանկերից։</p>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-row-actions"><button disabled={busy} onClick={() => setRemove(null)}>Չեղարկել</button><button className="admin-primary" disabled={busy} onClick={deleteProduct}>Ջնջել</button></div></section></div>}
    </>;
}
