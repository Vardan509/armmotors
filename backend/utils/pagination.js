export function getPagination(query = {}) {
    const rawPage = Number.parseInt(query.page, 10);
    const rawLimit = Number.parseInt(query.limit, 10);

    const page = Number.isFinite(rawPage)
        ? Math.max(1, Math.min(rawPage, 100000))
        : 1;

    const limit = Number.isFinite(rawLimit)
        ? Math.max(1, Math.min(rawLimit, 50))
        : 12;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
}
