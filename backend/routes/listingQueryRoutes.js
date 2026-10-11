
import { Router } from "express";
import { findPublicListings } from "../services/listingQueryService.js";

const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const result = await findPublicListings(req.query);

        return res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
