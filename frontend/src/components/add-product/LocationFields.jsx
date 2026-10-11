
import { useEffect, useMemo, useState } from "react";

const DATA_PATH = `${import.meta.env.BASE_URL}data`;

const ARMENIAN_NAMES = {
    Ajapnyak: "Աջափնյակ",
    Arabkir: "Արաբկիր",
    Avan: "Ավան",
    Davtashen: "Դավթաշեն",
    Erebuni: "Էրեբունի",
    "Kanaker-Zeytun": "Քանաքեռ-Զեյթուն",
    Kentron: "Կենտրոն",
    "Malatia-Sebastia": "Մալաթիա-Սեբաստիա",
    "Nork-Marash": "Նորք-Մարաշ",
    "Nor Nork": "Նոր Նորք",
    Nubarashen: "Նուբարաշեն",
    Shengavit: "Շենգավիթ",
};

function displayName(item) {
    const name = item?.name?.local || item?.name?.en || "";

    return ARMENIAN_NAMES[name] || name;
}

function LocationSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
}) {
    return (
        <label className="ap-field">
            <span className="ap-field-label">
                {label} <em>*</em>
            </span>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                required
            >
                <option value="">{placeholder}</option>

                {options.map((item) => (
                    <option key={item.id} value={item.id}>
                        {displayName(item)}
                    </option>
                ))}
            </select>
        </label>
    );
}

export default function LocationFields({
    value,
    onChange,
}) {
    const [data, setData] = useState({
        regions: [],
        communities: [],
        settlements: [],
    });

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadLocations() {
            try {
                setLoading(true);
                setLoadError("");

                const names = [
                    "all-region.json",
                    "all-community.json",
                    "all-settlement.json",
                ];

                const responses = await Promise.all(
                    names.map((name) =>
                        fetch(`${DATA_PATH}/${name}`, {
                            signal: controller.signal,
                        })
                    )
                );

                if (responses.some((response) => !response.ok)) {
                    throw new Error(
                        "Բնակավայրերի տվյալները չեն գտնվել։"
                    );
                }

                const [regions, communities, settlements] =
                    await Promise.all(
                        responses.map((response) =>
                            response.json()
                        )
                    );

                if (
                    !Array.isArray(regions) ||
                    !Array.isArray(communities) ||
                    !Array.isArray(settlements)
                ) {
                    throw new Error("Տվյալների սխալ ձևաչափ։");
                }

                if (!controller.signal.aborted) {
                    setData({
                        regions,
                        communities,
                        settlements,
                    });
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setLoadError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadLocations();

        return () => controller.abort();
    }, []);

    const communities = useMemo(
        () =>
            data.communities.filter(
                (item) => item.parent?.id === value.regionId
            ),
        [data.communities, value.regionId]
    );

    const settlements = useMemo(
        () =>
            data.settlements.filter(
                (item) => item.parent?.id === value.communityId
            ),
        [data.settlements, value.communityId]
    );

    const selectedRegion = data.regions.find(
        (item) => item.id === value.regionId
    );

    const selectedCommunity = communities.find(
        (item) => item.id === value.communityId
    );

    const selectedSettlement = settlements.find(
        (item) => item.id === value.settlementId
    );

    function changeRegion(regionId) {
        const selected = data.regions.find(
            (item) => item.id === regionId
        );

        onChange({
            regionId,
            communityId: "",
            settlementId: "",
            region: selected ? displayName(selected) : "",
            community: "",
            settlement: "",
        });
    }

    function changeCommunity(communityId) {
        const selected = communities.find(
            (item) => item.id === communityId
        );

        onChange({
            ...value,
            communityId,
            settlementId: "",
            community: selected ? displayName(selected) : "",
            settlement: "",
        });
    }

    function changeSettlement(settlementId) {
        const selected = settlements.find(
            (item) => item.id === settlementId
        );

        onChange({
            ...value,
            settlementId,
            settlement: selected ? displayName(selected) : "",
        });
    }

    if (loadError) {
        return (
            <div className="ap-error" role="alert">
                {loadError} Ստուգեք public/data պանակը։
            </div>
        );
    }

    const hasSettlements = settlements.length > 0;

    return (
        <>
            <LocationSelect
                label="Մարզ / Երևան"
                value={value.regionId}
                onChange={changeRegion}
                options={data.regions}
                placeholder={
                    loading
                        ? "Բեռնվում է..."
                        : "Ընտրեք մարզը"
                }
                disabled={loading}
            />

            <LocationSelect
                label={
                    value.region === "Երևան"
                        ? "Վարչական շրջան"
                        : "Համայնք"
                }
                value={value.communityId}
                onChange={changeCommunity}
                options={communities}
                placeholder="Ընտրեք համայնքը"
                disabled={!value.regionId || loading}
            />

            {hasSettlements && (
                <LocationSelect
                    label="Բնակավայր"
                    value={value.settlementId}
                    onChange={changeSettlement}
                    options={settlements}
                    placeholder="Ընտրեք բնակավայրը"
                    disabled={!value.communityId || loading}
                />
            )}

            {selectedRegion && selectedCommunity && (
                <div className="ap-full">
                    <div className="ap-info-box">
                        Ընտրված հասցե՝{" "}
                        <strong>
                            {displayName(selectedRegion)}
                            {" / "}
                            {displayName(selectedCommunity)}
                            {selectedSettlement
                                ? ` / ${displayName(selectedSettlement)}`
                                : ""}
                        </strong>
                    </div>
                </div>
            )}
        </>
    );
}
