
import { rateLimit } from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        message:
            "Չափազանց շատ հարցումներ։ Փորձեք կրկին 15 րոպե անց։",
    },
});

export default authLimiter;
