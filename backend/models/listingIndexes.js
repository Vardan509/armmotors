
import Product from "./product.js";

export function registerListingIndexes() {
    const schema = Product.schema;

    schema.index({
        status: 1,
        createdAt: -1,
    });

    schema.index({
        status: 1,
        type: 1,
        createdAt: -1,
    });

    schema.index({
        status: 1,
        brand: 1,
        createdAt: -1,
    });

    schema.index({
        status: 1,
        price: 1,
    });

    schema.index({
        owner: 1,
        createdAt: -1,
    });
}
