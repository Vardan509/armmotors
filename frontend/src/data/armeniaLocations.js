const BASE = import.meta.env.BASE_URL;

function localName(item) {
    return item?.name?.local || item?.name?.en || "";
}

function parentId(item) {
    return item?.parent?.id || "";
}

function uniqueOptions(items) {
    const seen = new Set();

    return items
        .filter((item) => {
            const key = item.value;

            if (!key || seen.has(key)) return false;

            seen.add(key);
            return true;
        })
        .sort((a, b) => a.label.localeCompare(b.label, "hy"));
}

export async function loadArmeniaLocations() {
    const files = [
        "all-region.json",
        "all-community.json",
        "all-settlement.json",
    ];

    const data = await Promise.all(
        files.map(async (file) => {
            const response = await fetch(`${BASE}data/${file}`);

            if (!response.ok) {
                throw new Error(`Չհաջողվեց բեռնել ${file}`);
            }

            return response.json();
        }),
    );

    const [regions, communities, settlements] = data;

    return {
        regions,
        communities,
        settlements,
    };
}

export function getRegions(data) {
    return uniqueOptions(
        (data?.regions || []).map((item) => ({
            value: localName(item),
            label: localName(item),
            id: item.id,
        })),
    );
}

export function getCommunities(data, regionName) {
    const region = data?.regions?.find(
        (item) => localName(item) === regionName,
    );

    if (!region) return [];

    return uniqueOptions(
        (data?.communities || [])
            .filter((item) => parentId(item) === region.id)
            .map((item) => ({
                value: localName(item),
                label: localName(item),
                id: item.id,
            })),
    );
}

export function getSettlements(data, regionName, communityName) {
    const region = data?.regions?.find(
        (item) => localName(item) === regionName,
    );

    const community = data?.communities?.find(
        (item) =>
            localName(item) === communityName && parentId(item) === region?.id,
    );

    if (!community) return [];

    return uniqueOptions(
        (data?.settlements || [])
            .filter((item) => {
                const ancestors = item.ancestors || [];

                return (
                    parentId(item) === community.id ||
                    ancestors.some((ancestor) => ancestor.id === community.id)
                );
            })
            .map((item) => ({
                value: localName(item),
                label: localName(item),
            })),
    );
}
