export default function errorHandler(err, req, res, next) {
    console.error("API ERROR:", err);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Տվյալները սխալ են լրացված։",
            errors: Object.values(err.errors).map((error) => error.message),
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Սխալ ID։",
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            message: "Այս տվյալներով գրառում արդեն գոյություն ունի։",
        });
    }

    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            message: "Անվավեր մուտքի տվյալներ։",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            message: "Մուտքի ժամկետը լրացել է։",
        });
    }

    const status =
        Number.isInteger(err.status) && err.status >= 400 && err.status < 600
            ? err.status
            : 500;

    return res.status(status).json({
        message:
            status === 500
                ? "Սերվերի ներքին սխալ։"
                : err.message || "Տեղի ունեցավ սխալ։",
    });
}
