import useRemote from "../../utils/useRemote";
import "./PublicationNotice.css";

export default function PublicationNotice() {
    const { data, loading, error } = useRemote("/monetization/plans");

    if (loading) {
        return (
            <div className="publication-notice">
                Հրապարակման պայմանների ստուգում...
            </div>
        );
    }

    if (error) {
        return (
            <div className="publication-notice">
                Սահմանաչափի տվյալներն անհասանելի են։
                {error}
            </div>
        );
    }

    const remaining = Math.max(0, (data?.freeLimit || 5) - (data?.used || 0));

    return (
        <div className="publication-notice">
            <b>
                {remaining > 0
                    ? `Մնացել է ${remaining} անվճար հայտարարություն`
                    : "Նոր հայտարարություն՝ 100 ֏"}
            </b>

            <p>
                {remaining > 0
                    ? "Առաջին 5 հրապարակումներն անվճար են։ Հաջորդ յուրաքանչյուրի համար՝ 100 դրամ։"
                    : "Հրապարակելիս կստեղծվի 100 դրամի վճարման հայտ։ Հայտարարությունը կհրապարակվի միայն վճարման հաստատումից հետո։"}
            </p>
        </div>
    );
}
