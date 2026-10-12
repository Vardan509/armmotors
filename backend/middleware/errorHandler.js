export default function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const name = error?.name || "Error";

    const mongoUnavailable = [
        "MongoNetworkError",
        "MongoServerSelectionError",
        "MongooseServerSelectionError",
    ].includes(name);

    const validationError = name === "ValidationError";
    const invalidId = name === "CastError";
    const duplicate = error?.code === 11000;

    const tokenError =
        name === "JsonWebTokenError" || name === "TokenExpiredError";

    const uploadTooLarge = error?.code === "LIMIT_FILE_SIZE";

    const uploadInvalid = name === "MulterError";

    const status = mongoUnavailable
        ? 503
        : uploadTooLarge
          ? 413
          : validationError || invalidId || uploadInvalid
            ? 400
            : duplicate
              ? 409
              : tokenError
                ? 401
                : Number.isInteger(error?.status) &&
                    error.status >= 400 &&
                    error.status < 600
                  ? error.status
                  : 500;

    if (status >= 500) {
        console.error(`[ArmMotors] ${req.method} ${req.originalUrl}: ${name}`);

        if (process.env.NODE_ENV !== "production") {
            console.error(
                error?.stack || error?.message || "Unknown server error",
            );
        }
    }

    const message = mongoUnavailable
        ? "MongoDB-ին միանալ չհաջողվեց։ Փորձեք ավելի ուշ։"
        : uploadTooLarge
          ? "Նկարի չափը գերազանցում է 5 ՄԲ-ը։"
          : validationError
            ? "Տվյալները սխալ են լրացված։"
            : invalidId
              ? "Սխալ ID։"
              : duplicate
                ? "Այս տվյալներով գրառում արդեն գոյություն ունի։"
                : tokenError
                  ? "Մուտքի տվյալները անվավեր են կամ ժամկետանց։"
                  : status >= 500
                    ? "Սերվերի ներքին սխալ։"
                    : error?.message || "Տեղի ունեցավ սխալ։";

    res.status(status).json({
        message,

        ...(mongoUnavailable ? { code: "DATABASE_UNAVAILABLE" } : {}),

        ...(validationError
            ? {
                  errors: Object.values(error.errors || {}).map(
                      (item) => item.message,
                  ),
              }
            : {}),
    });
}
