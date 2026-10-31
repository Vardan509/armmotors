import {
    getAllProduct,
    getMyProducts,
    getProductById,
    addProduct,
    updateById,
    deleteProduct,
} from "../services/productService.js";

function sendError(res, error) {
    console.error("Product controller error:", error);

    const status =
        error.name === "ValidationError" || error.name === "CastError"
            ? 400
            : Number.isInteger(error.status) &&
                error.status >= 400 &&
                error.status <= 599
              ? error.status
              : 500;

    return res.status(status).json({
        message: status >= 500 ? "Սերվերի սխալ։" : error.message,
    });
}

export async function getAllProductController(req, res) {
    try {
        const products = await getAllProduct(req.query);

        return res.json(products);
    } catch (error) {
        return sendError(res, error);
    }
}

export async function getMyProductsController(req, res) {
    try {
        return res.json(await getMyProducts(req.userId));
    } catch (error) {
        return sendError(res, error);
    }
}

export async function getProductByController(req, res) {
    try {
        return res.json(await getProductById(req.params.id));
    } catch (error) {
        return sendError(res, error);
    }
}

export async function controllerAddProduct(req, res) {
    try {
        const product = await addProduct(req.body, req.userId);

        return res.status(201).json(product);
    } catch (error) {
        return sendError(res, error);
    }
}

export async function updateAllProductController(req, res) {
    try {
        const product = await updateById(req.params.id, req.body, req.userId);

        return res.json(product);
    } catch (error) {
        return sendError(res, error);
    }
}

export async function controllerDeleteProduct(req, res) {
    try {
        await deleteProduct(req.params.id, req.userId);

        return res.status(204).end();
    } catch (error) {
        return sendError(res, error);
    }
}
