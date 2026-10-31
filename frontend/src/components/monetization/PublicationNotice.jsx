import useRemote from "../../utils/useRemote";
import useInterfaceText from "../../utils/interfaceText";

import "./PublicationNotice.css";

export default function PublicationNotice() {
    const { tr, locale } = useInterfaceText();

    const { data, loading, error } = useRemote("/monetization/plans");

    if (loading) {
        return (
            <div className="publication-notice" role="status">
                {tr("loading")}
            </div>
        );
    }

    if (error) {
        return (
            <div className="publication-notice" role="alert">
                {tr("loadError")}
            </div>
        );
    }

    const limit = Number(data?.freeLimit ?? 5);
    const used = Number(data?.used ?? 0);
    const remaining = Math.max(0, limit - used);
    const price = `${Number(100).toLocaleString(locale)} ֏`;

    return (
        <div className="publication-notice">
            <b>
                {remaining > 0
                    ? tr("remaining", { count: remaining })
                    : tr("publicationPaid", { price })}
            </b>

            <p>
                {remaining > 0
                    ? tr("publicationRules", { limit, price })
                    : tr("publicationPending")}
            </p>
        </div>
    );
}
