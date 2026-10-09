import { useEffect, useSyncExternalStore } from "react";
import { apiRequest } from "./api";
const listeners = new Set();
const pending = new Set();
let token = localStorage.getItem("token"), hydrated = false, generation = 0;
function guest() { try { const ids = JSON.parse(localStorage.getItem("armmotors-favorites") || "[]"); return Array.isArray(ids) ? ids.filter(id => typeof id === "string") : []; } catch { return []; } }
let state = { ids: token ? [] : guest(), loading: false, error: "" };
function publish(next) { state = { ...state, ...next }; listeners.forEach(listener => listener()); }
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
function reset() { token = localStorage.getItem("token"); generation++; hydrated = false; pending.clear(); publish({ ids: token ? [] : guest(), loading: false, error: "" }); }
window.addEventListener("session-changed", reset);
window.addEventListener("storage", reset);
async function hydrate() {
    if (token !== localStorage.getItem("token")) reset();
    if (!token || hydrated) return;
    hydrated = true; const current = generation;
    publish({ loading: true, error: "" });
    try {
        const local = guest().filter(id => /^[a-f0-9]{24}$/i.test(id));
        for (const id of local) { try { await apiRequest(`/favorites/${id}`, { method: "PUT" }); } catch (error) { if (error.status !== 404) throw error; } }
        const data = await apiRequest("/favorites");
        if (current !== generation) return;
        localStorage.removeItem("armmotors-favorites");
        publish({ ids: data.ids, loading: false });
    } catch (error) { if (current === generation) { hydrated = false; publish({ loading: false, error: error.message }); } }
}
export function useFavorites() {
    const saved = useSyncExternalStore(subscribe, () => state);
    useEffect(() => { void hydrate(); }, []);
    return saved;
}
export default function useFavorite(id) {
    const saved = useFavorites();
    return [saved.ids.includes(id), async () => {
        if (pending.has(id) || state.loading) return;
        const remove = state.ids.includes(id), previous = state.ids, current = generation;
        pending.add(id);
        publish({ ids: remove ? previous.filter(value => value !== id) : [...previous, id], error: "" });
        try {
            if (token) await apiRequest(`/favorites/${encodeURIComponent(id)}`, { method: remove ? "DELETE" : "PUT" });
            else localStorage.setItem("armmotors-favorites", JSON.stringify(state.ids));
        } catch (error) { if (current === generation) publish({ ids: remove ? [...new Set([...state.ids, id])] : state.ids.filter(value => value !== id), error: error.message }); }
        finally { pending.delete(id); }
    }];
}
