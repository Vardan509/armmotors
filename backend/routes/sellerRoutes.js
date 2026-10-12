import express from "express";
import mongoose from "mongoose";
import User from "../models/user.js";
import Product from "../models/product.js";

const router = express.Router();

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: "Վաճառողի ID-ն սխալ է։",
            });
        }

        const seller = await User.findOne({
            _id: id,
            banned: { $ne: true },
        }).select("name surname createdAt");

        if (!seller) {
            return res.status(404).json({
                message: "Վաճառողը չի գտնվել։",
            });
        }

        const products = await Product.find({
            owner: seller._id,
            status: "active",
        })
            .select(
                "title type brand model year price currency images region views createdAt",
            )
            .sort({ createdAt: -1 })
            .lean();

        const carCount = products.filter((item) => item.type === "car").length;

        const partCount = products.filter(
            (item) => item.type === "part",
        ).length;

        return res.json({
            seller: {
                id: seller._id,
                name: seller.name,
                surname: seller.surname,
                joinedAt: seller.createdAt,
            },
            statistics: {
                total: products.length,
                cars: carCount,
                parts: partCount,
            },
            products,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
