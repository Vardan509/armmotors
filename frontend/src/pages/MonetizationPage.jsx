import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import "./MonetizationPage.css";

const BASE = import.meta.env.BASE_URL;

const DRAM = (value) => `${Number(value).toLocaleString("en-US")} ֏`;

const KINDS = {
    publication: "6-րդ և հաջորդ հայտարարություն",
    top7: "TOP — 7 օր",
    top30: "TOP — 30 օր",
    auto7: "Ավտոթարմացում — 7 օր",
};

export default function MonetizationPage({ admin = false }) {
    const token = localStorage.getItem("token");

    const [plans, setPlans] = useState(null);
    const [payments, setPayments] = useState([]);
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [revision, setRevision] = useState(0);
    const [reference, setReference] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!token) return;

        let active = true;

        async function run() {
            try {
                const [pricing, list] = await Promise.all([
                    apiRequest("/monetization/plans"),
                    apiRequest(
                        admin
                            ? "/monetization/admin/payments"
                            : "/monetization/payments",
                    ),
                ]);

                if (!active) return;

                setPlans(pricing);
                setPayments(Array.isArray(list) ? list : []);
                setError("");
                setIsAdmin(admin);
            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            }
        }

        void run();

        return () => {
            active = false;
        };
    }, [token, admin, revision]);

    async function approve(id, action) {
        try {
            setBusy(id);
            setError("");

            if (action === "approve" && !String(reference[id] || "").trim()) {
                throw new Error("Նշեք իրական վճարման հաստատման համարը։");
            }

            await apiRequest(`/monetization/admin/payments/${id}/${action}`, {
                method: "POST",
                body: JSON.stringify({
                    paymentReference: String(reference[id] || "").trim(),
                }),
            });

            setNotice("Կարգավիճակը թարմացվեց։");
            setRevision((n) => n + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    }

    return (
        <main className="money-page">
            <div className="money-container">
                <h1>{admin ? "Վճարումների հաստատում" : ""}</h1>

                <p className="money-lead">
                    {admin
                        ? "Հաստատեք միայն բանկային կամ վճարային ծառայությունում իսկապես ստացված գումարները։"
                        : " "}
                </p>

                {error && (
                    <p className="money-error" role="alert">
                        {error}
                    </p>
                )}

                {notice && (
                    <p className="money-notice" role="status">
                        {notice}
                    </p>
                )}

                {!token && (
                    <p>
                        Նախ{" "}
                        <a href={`${BASE}login?next=/monetization`}>
                            մուտք գործեք
                        </a>
                        ։
                    </p>
                )}

                {!admin && plans && (
                    <>
                        <section className="money-quota">
                            <strong>{Math.min(5, plans.used)} / 5</strong>

                            <div>
                                <b>Անվճար հրապարակումներ</b>

                                <p>
                                    {Math.max(0, 5 - plans.used)} անվճար տեղ
                                    մնացել է։ 6-րդից սկսած ամեն նոր
                                    հրապարակումը՝ 100 ֏։
                                </p>
                            </div>
                        </section>

                        <h2>Առավելությունների փաթեթներ</h2>

                        <div className="money-grid">
                            <article className="money-plan">
                                <span>TOP START</span>

                                <h3>200 ֏</h3>

                                <b>7 օր</b>

                                <p>
                                    Ոսկեգույն TOP նշան՝ մեքենայի նկարին,
                                    առաջնահերթ ցուցադրում և ավելի մեծ
                                    տեսանելիություն։
                                </p>
                            </article>

                            <article className="money-plan featured">
                                <span>TOP MONTH</span>

                                <h3>600 ֏</h3>

                                <b>30 օր</b>

                                <p>
                                    TOP նշան և ցուցակի վերին հատվածում
                                    առաջնահերթություն ամբողջ ամսվա ընթացքում։
                                </p>
                            </article>

                            <article className="money-plan">
                                <span>AUTO REFRESH</span>

                                <h3>100 ֏</h3>

                                <b>7 օր</b>

                                <p>
                                    Ամեն օր ավտոմատ թարմացում. սովորական ձեռքով
                                    թարմացումը հասանելի է 4 օրը մեկ։
                                </p>
                            </article>
                        </div>

                        <p className="money-explain">
                            Փաթեթ ընտրելու համար բացեք{" "}
                            <a href={`${BASE}account`}>
                                ձեր հայտարարությունների կառավարումը
                            </a>
                            ։ Հաստատված TOP հայտարարությունները հայտնվում են
                            ցուցակի վերևում։
                        </p>

                        <p className="money-warning">
                            Վճարային համակարգ դեռ միացված չէ։ Հայտերն այստեղ
                            գրանցվում են «սպասող» կարգավիճակով և կարող են
                            ակտիվացվել միայն ադմինի կողմից՝ իրական վճարումը
                            ստուգելուց հետո։
                        </p>
                    </>
                )}

                {token && (
                    <section className="money-history">
                        <h2>
                            {admin
                                ? "Սպասող վճարման հայտեր"
                                : "Իմ վճարման հայտերը"}
                        </h2>

                        {payments.length === 0 ? (
                            <p>Հայտեր դեռ չկան։</p>
                        ) : (
                            <div className="money-list">
                                {payments.map((payment) => (
                                    <article
                                        key={payment._id}
                                        className="money-transaction"
                                    >
                                        <div>
                                            <strong>
                                                {KINDS[payment.kind] ||
                                                    payment.kind}
                                            </strong>

                                            <small>
                                                {new Date(
                                                    payment.createdAt,
                                                ).toLocaleDateString("hy-AM")}
                                            </small>

                                            {admin && (
                                                <small>
                                                    {payment.user?.email || ""}{" "}
                                                    ·{" "}
                                                    {payment.product?.title ||
                                                        ""}
                                                </small>
                                            )}
                                        </div>

                                        <strong>{DRAM(payment.amount)}</strong>

                                        <span
                                            className={`money-status ${payment.status}`}
                                        >
                                            {payment.status === "paid"
                                                ? "Հաստատված"
                                                : payment.status === "rejected"
                                                  ? "Մերժված"
                                                  : "Սպասող"}
                                        </span>

                                        {isAdmin && (
                                            <div className="money-admin-actions">
                                                <input
                                                    aria-label="Վճարման հաստատման համար"
                                                    placeholder="Վճարման ստուգված համարը"
                                                    value={
                                                        reference[
                                                            payment._id
                                                        ] || ""
                                                    }
                                                    onChange={(event) =>
                                                        setReference((old) => ({
                                                            ...old,
                                                            [payment._id]:
                                                                event.target
                                                                    .value,
                                                        }))
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    disabled={Boolean(busy)}
                                                    onClick={() =>
                                                        approve(
                                                            payment._id,
                                                            "approve",
                                                        )
                                                    }
                                                >
                                                    Հաստատել
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={Boolean(busy)}
                                                    onClick={() =>
                                                        approve(
                                                            payment._id,
                                                            "reject",
                                                        )
                                                    }
                                                >
                                                    Մերժել
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
