import Product from "../models/product.js";

import { autoRefreshDue, sortPublicPipeline } from "./monetizationService.js";

import { getPagination } from "../utils/pagination.js";

export async function findPublicListings(query = {}) {
    const { page, limit, skip } = getPagination(query);

    const filter = {
        status: "active",
    };

    // Հայտարարության տեսակ
    if (["car", "part"].includes(query.type)) {
        filter.type = query.type;
    }

    // Մակնիշ
    if (query.brand && typeof query.brand === "string") {
        filter.brand = query.brand.trim();
    }

    // Նվազագույն և առավելագույն գին
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);

    if (query.minPrice !== undefined && Number.isFinite(minPrice)) {
        filter.price = {
            ...filter.price,
            $gte: minPrice,
        };
    }

    if (query.maxPrice !== undefined && Number.isFinite(maxPrice)) {
        filter.price = {
            ...filter.price,
            $lte: maxPrice,
        };
    }

    // Սովորական դասավորություններ
    const sortOptions = {
        newest: {
            createdAt: -1,
            _id: -1,
        },

        priceAsc: {
            price: 1,
            _id: -1,
        },

        priceDesc: {
            price: -1,
            _id: -1,
        },
    };

    const sort = sortOptions[query.sort] || sortOptions.newest;

    // Ավտոթարմացման ստուգում
    await autoRefreshDue();

    // TOP առաջնահերթությունը գործում է
    // նորից հին դասավորման ժամանակ։
    const topSort = !query.sort || query.sort === "newest";

    const [items, total] = await Promise.all([
        topSort
            ? Product.aggregate([
                  ...sortPublicPipeline(filter),

                  {
                      $skip: skip,
                  },

                  {
                      $limit: limit,
                  },
              ])
            : Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),

        Product.countDocuments(filter),
    ]);

    return {
        items,

        pagination: {
            page,
            limit,
            total,

            pages: Math.ceil(total / limit),

            hasNextPage: skip + items.length < total,

            hasPreviousPage: page > 1,
        },
    };
}
