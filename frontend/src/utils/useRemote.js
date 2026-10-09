import { useEffect, useState } from "react";
import { apiRequest } from "./api";
export default function useRemote(path, revision = 0) {
    const [state, setState] = useState({ data: null, loading: true, error: "" });
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            setState(previous => ({ ...previous, loading: true, error: "" }));
            try { const data = await apiRequest(path, { signal: controller.signal }); setState({ data, loading: false, error: "" }); }
            catch (error) { if (!controller.signal.aborted) setState({ data: null, loading: false, error: error.message }); }
        }
        load();
        return () => controller.abort();
    }, [path, revision]);
    return state;
}
