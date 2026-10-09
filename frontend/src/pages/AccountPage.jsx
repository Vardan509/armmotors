import { useState } from "react";
import Header from "../components/header/Header";
import GoogleSignIn from "../components/GoogleSignIn";
import useRemote from "../utils/useRemote";
import useCurrency from "../utils/useCurrency";
import { apiRequest } from "../utils/api";
import "./Account.css";
export default function AccountPage() {
    const me = useRemote("/auth/me"),
        [revision, setRevision] = useState(0),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false);
    const orders = useRemote("/orders", revision),
        { format } = useCurrency();
    async function cancel(id) {
        setBusy(true);
        setError("");
        try {
            await apiRequest(`/orders/${id}/cancel`, { method: "PATCH" });
            setRevision((value) => value + 1);
        } catch (error) {
            setError(error.message);
        } finally {
            setBusy(false);
        }
    }
    const statuses = {
        pending: "Սպասում է հաստատման",
        completed: "Հաստատված գնում",
        cancelled: "Չեղարկված",
    };
    return (
        <>
            <Header />
            <main className="account-page">
                <h1>Իմ հաշիվը</h1>
                {me.loading ? (
                    <p>Բեռնվում է…</p>
                ) : me.error ? (
                    <p role="alert">
                        {me.error}{" "}
                        <a href="/login?next=/account">Մուտք գործել →</a>
                    </p>
                ) : (
                    <>
                        <section className="account-profile">
                            <h2>
                                {me.data.name} {me.data.surname}
                            </h2>
                            <p>{me.data.email}</p>
                            <p>{me.data.phone || "Հեռախոսը նշված չէ"}</p>
                            <a href="/favorites"> նախընտրելի</a>
                            <h3>Կապակցել Google հաշիվը</h3>
                            <p>Օգտագործեք նույն email-ով Google հաշիվը։</p>
                            <GoogleSignIn link />
                        </section>
                        <h2>Իմ գնման հայտերը</h2>
                        <p>
                            Հայտերը հաստատվում են ադմինի կողմից՝ գործարքն ու
                            վճարումը ստուգելուց հետո։
                        </p>
                        {(orders.error || error) && (
                            <p className="form-error" role="alert">
                                {orders.error || error}
                            </p>
                        )}
                        <div className="account-orders">
                            {orders.data?.map((order) => (
                                <article
                                    className="account-order"
                                    key={order._id}
                                >
                                    <div>
                                        <a href={`/cars/${order.product}`}>
                                            {order.title}
                                        </a>
                                        <p>
                                            {format(order.amount)} ·{" "}
                                            {statuses[order.status]}
                                        </p>
                                        <small>
                                            {new Date(
                                                order.createdAt,
                                            ).toLocaleDateString("hy-AM")}
                                        </small>
                                    </div>
                                    {order.status === "pending" && (
                                        <button
                                            disabled={busy}
                                            onClick={() => cancel(order._id)}
                                        >
                                            Չեղարկել հայտը
                                        </button>
                                    )}
                                </article>
                            ))}
                            {orders.data?.length === 0 && (
                                <p>Գնման հայտեր դեռ չկան։</p>
                            )}
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
