import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";
import requireAuth from "../middleware/requireAuth.js";
import { objectId, httpError } from "../utils/http.js";
const router = express.Router();
router.use(requireAuth);
router.get("/", async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("favorites");
        const products = await Product.find({
            _id: { $in: user.favorites },
            status: { $ne: "draft" },
        }).select("-__v");
        res.json({ ids: user.favorites.map(String), products });
    } catch (error) {
        next(error);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const id = objectId(req.params.id);
        if (!(await Product.exists({ _id: id, status: { $ne: "draft" } })))
            throw httpError(404, "Ապրանքը չի գտնվել։");
        await User.updateOne(
            { _id: req.userId },
            { $addToSet: { favorites: id } },
        );
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        await User.updateOne(
            { _id: req.userId },
            { $pull: { favorites: objectId(req.params.id) } },
        );
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});
export default router;
