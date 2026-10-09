import {
    getAllProduct,
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
        const products = await getAllProduct();

        res.json(products);
    } catch (error) {
        sendError(res, error);
    }
}

export async function getProductByController(req, res) {
    try {
        const product = await getProductById(req.params.id);

        res.json(product);
    } catch (error) {
        sendError(res, error);
    }
}

export async function controllerAddProduct(req, res) {
    try {
        const product = await addProduct(req.body, req.userId);

        res.status(201).json(product);
    } catch (error) {
        sendError(res, error);
    }
}

export async function updateAllProductController(req, res) {
    try {
        const product = await updateById(req.params.id, req.body, req.userId);

        res.json(product);
    } catch (error) {
        sendError(res, error);
    }
}

export async function controllerDeleteProduct(req, res) {
    try {
        await deleteProduct(req.params.id, req.userId);

        res.status(204).end();
    } catch (error) {
        sendError(res, error);
    }
}
