import express from "express";
import requireAuth from "../middleware/requireAuth.js";

import {
    getAllProductController,
    getProductByController,
    controllerAddProduct,
    updateAllProductController,
    controllerDeleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProductController);
router.get("/:id", getProductByController);

router.post("/", requireAuth, controllerAddProduct);
router.patch("/:id", requireAuth, updateAllProductController);
router.delete("/:id", requireAuth, controllerDeleteProduct);

export default router;
