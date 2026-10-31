import { useEffect, useMemo, useState } from "react";

import { useI18n } from "../../utils/i18n";
import { localizeListingValue } from "../../utils/localizeListing";

const DATA_PATH = `${import.meta.env.BASE_URL}data`;

const TEXTS = {
    hy: {
        region: "Մարզ / Երևան",
        district: "Վարչական շրջան",
        community: "Համայնք",
        settlement: "Բնակավայր",
        chooseRegion: "Ընտրեք մարզը",
        chooseCommunity: "Ընտրեք համայնքը",
        chooseDistrict: "Ընտրեք վարչական շրջանը",
        chooseSettlement: "Ընտրեք բնակավայրը",
        loading: "Բեռնվում է...",
        selectedAddress: "Ընտրված հասցե",
        error: "Բնակավայրերի ցանկը բեռնել չհաջողվեց։",
        retry: "Կրկին փորձել",
    },

    ru: {
        region: "Область / Ереван",
        district: "Административный район",
        community: "Община",
        settlement: "Населённый пункт",
        chooseRegion: "Выберите область",
        chooseCommunity: "Выберите общину",
        chooseDistrict: "Выберите район",
        chooseSettlement: "Выберите населённый пункт",
        loading: "Загрузка...",
        selectedAddress: "Выбранный адрес",
        error: "Не удалось загрузить список населённых пунктов.",
        retry: "Повторить",
    },

    en: {
        region: "Region / Yerevan",
        district: "Administrative district",
        community: "Community",
        settlement: "Settlement",
        chooseRegion: "Choose a region",
        chooseCommunity: "Choose a community",
        chooseDistrict: "Choose a district",
        chooseSettlement: "Choose a settlement",
        loading: "Loading...",
        selectedAddress: "Selected address",
        error: "Could not load the location list.",
        retry: "Try again",
    },
};

const DISTRICTS = {
    Ajapnyak: ["Աջափնյակ", "Ачапняк", "Ajapnyak"],
    Arabkir: ["Արաբկիր", "Арабкир", "Arabkir"],
    Avan: ["Ավան", "Аван", "Avan"],
    Davtashen: ["Դավթաշեն", "Давташен", "Davtashen"],
    Erebuni: ["Էրեբունի", "Эребуни", "Erebuni"],
    "Kanaker-Zeytun": ["Քանաքեռ-Զեյթուն", "Канакер-Зейтун", "Kanaker-Zeytun"],
    Kentron: ["Կենտրոն", "Кентрон", "Kentron"],
    "Malatia-Sebastia": [
        "Մալաթիա-Սեբաստիա",
        "Малатия-Себастия",
        "Malatia-Sebastia",
    ],
    "Nork-Marash": ["Նորք-Մարաշ", "Норк-Мараш", "Nork-Marash"],
    "Nor Nork": ["Նոր Նորք", "Нор Норк", "Nor Nork"],
    Nubarashen: ["Նուբարաշեն", "Нубарашен", "Nubarashen"],
    Shengavit: ["Շենգավիթ", "Шенгавит", "Shengavit"],
};

function sameId(first, second) {
    return String(first ?? "") === String(second ?? "");
}

function districtNames(item) {
    const names = [item?.name?.local, item?.name?.en];

    for (const name of names) {
        if (DISTRICTS[name]) {
            return DISTRICTS[name];
        }

        const match = Object.values(DISTRICTS).find((translations) =>
            translations.includes(name),
        );

        if (match) return match;
    }

    return null;
}

/*
 * Backend-ին ուղարկվող անունը չի կախված
 * օգտագործողի ընտրած միջերեսի լեզվից։
 */
function storedName(item) {
    const district = districtNames(item);

    return district?.[0] || item?.name?.local || item?.name?.en || "";
}

function displayName(item, language) {
    if (!item) return "";

    const index = language === "ru" ? 1 : language === "en" ? 2 : 0;

    const district = districtNames(item);

    if (district) {
        return district[index];
    }

    if (language === "hy") {
        return item.name?.hy || storedName(item);
    }

    const explicitTranslation = item.name?.[language];

    if (typeof explicitTranslation === "string" && explicitTranslation.trim()) {
        return explicitTranslation;
    }

    const original = storedName(item);

    const translated = localizeListingValue(original, language, "location");

    if (translated && translated !== original) {
        return translated;
    }

    return original;
}

function LocationSelect({
    label,
    value,
    onChange,
    options,
    placeholder,
    language,
    disabled = false,
}) {
    return (
        <label className="ap-field">
            <span className="ap-field-label">
                {label} <em>*</em>
            </span>

            <select
                value={value || ""}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                required
            >
                <option value="">{placeholder}</option>

                {options.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                        {displayName(item, language)}
                    </option>
                ))}
            </select>
        </label>
    );
}

export default function LocationFields({ value = {}, onChange }) {
    const { language } = useI18n();
    const text = TEXTS[language] || TEXTS.hy;

    const [data, setData] = useState({
        regions: [],
        communities: [],
        settlements: [],
    });

    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);
        setFailed(false);

        async function loadLocations() {
            try {
                const filenames = [
                    "all-region.json",
                    "all-community.json",
                    "all-settlement.json",
                ];

                const result = await Promise.all(
                    filenames.map(async (filename) => {
                        const response = await fetch(
                            `${DATA_PATH}/${filename}`,
                            {
                                signal: controller.signal,
                            },
                        );

                        if (!response.ok) {
                            throw new Error("LOCATION_HTTP_ERROR");
                        }

                        const items = await response.json();

                        if (!Array.isArray(items)) {
                            throw new Error("LOCATION_FORMAT_ERROR");
                        }

                        return items;
                    }),
                );

                if (controller.signal.aborted) return;

                const [regions, communities, settlements] = result;

                setData({
                    regions,
                    communities,
                    settlements,
                });
            } catch {
                if (!controller.signal.aborted) {
                    setFailed(true);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadLocations();

        return () => controller.abort();
    }, [revision]);

    const communities = useMemo(() => {
        if (!value.regionId) return [];

        return data.communities.filter((item) =>
            sameId(item.parent?.id, value.regionId),
        );
    }, [data.communities, value.regionId]);

    const settlements = useMemo(() => {
        if (!value.communityId) return [];

        return data.settlements.filter(
            (item) =>
                sameId(item.parent?.id, value.communityId) ||
                (item.ancestors || []).some((ancestor) =>
                    sameId(ancestor.id, value.communityId),
                ),
        );
    }, [data.settlements, value.communityId]);

    const selectedRegion = data.regions.find((item) =>
        sameId(item.id, value.regionId),
    );

    const selectedCommunity = communities.find((item) =>
        sameId(item.id, value.communityId),
    );

    const selectedSettlement = settlements.find((item) =>
        sameId(item.id, value.settlementId),
    );

    const isYerevan =
        sameId(selectedRegion?.id, "AM01") ||
        ["Երևան", "Yerevan", "Ереван"].includes(
            storedName(selectedRegion) || value.region,
        );

    function changeRegion(regionId) {
        const selected = data.regions.find((item) => sameId(item.id, regionId));

        onChange({
            ...value,
            regionId,
            communityId: "",
            settlementId: "",
            region: selected ? storedName(selected) : "",
            community: "",
            settlement: "",
        });
    }

    function changeCommunity(communityId) {
        const selected = communities.find((item) =>
            sameId(item.id, communityId),
        );

        onChange({
            ...value,
            communityId,
            settlementId: "",
            community: selected ? storedName(selected) : "",
            settlement: "",
        });
    }

    function changeSettlement(settlementId) {
        const selected = settlements.find((item) =>
            sameId(item.id, settlementId),
        );

        onChange({
            ...value,
            settlementId,
            settlement: selected ? storedName(selected) : "",
        });
    }

    if (failed) {
        return (
            <div className="ap-full">
                <div className="ap-error" role="alert">
                    {text.error}
                </div>

                <button
                    type="button"
                    className="detail-secondary"
                    onClick={() => setRevision((current) => current + 1)}
                >
                    {text.retry}
                </button>
            </div>
        );
    }

    const address = [selectedRegion, selectedCommunity, selectedSettlement]
        .filter(Boolean)
        .map((item) => displayName(item, language))
        .join(" / ");

    return (
        <>
            <LocationSelect
                label={text.region}
                value={value.regionId}
                onChange={changeRegion}
                options={data.regions}
                placeholder={loading ? text.loading : text.chooseRegion}
                language={language}
                disabled={loading}
            />

            <LocationSelect
                label={isYerevan ? text.district : text.community}
                value={value.communityId}
                onChange={changeCommunity}
                options={communities}
                placeholder={
                    isYerevan ? text.chooseDistrict : text.chooseCommunity
                }
                language={language}
                disabled={!value.regionId || loading}
            />

            {settlements.length > 0 && (
                <LocationSelect
                    label={text.settlement}
                    value={value.settlementId}
                    onChange={changeSettlement}
                    options={settlements}
                    placeholder={text.chooseSettlement}
                    language={language}
                    disabled={!value.communityId || loading}
                />
            )}

            {selectedRegion && selectedCommunity && (
                <div className="ap-full">
                    <div className="ap-info-box">
                        {text.selectedAddress}: <strong>{address}</strong>
                    </div>
                </div>
            )}
        </>
    );
}
