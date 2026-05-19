const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        if (typeof next === "function") {
            next(err);
        } else {
            console.error("[asyncHandler] next is not a function, responding with error:", err.message);
            res.status(err.statusCode || 500).json({
                success: false,
                message: err.message
            });
        }
    });
};

export default asyncHandler;
