import ApiError from "../utils/ApiError.js";
import multer from "multer";

const errorMiddleware = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
    let errors = err.errors || [];

    // --- Multer file-upload errors (size, count, field name) ---
    if (err instanceof multer.MulterError) {
        statusCode = 400;
        const messages = {
            LIMIT_FILE_SIZE: "File is too large",
            LIMIT_FILE_COUNT: "Too many files uploaded",
            LIMIT_UNEXPECTED_FILE: "Unexpected file field name",
        };
        message = messages[err.code] || err.message;
        errorCode = "UPLOAD_LIMIT_EXCEEDED";
    }
    // --- API Custom Errors ---
    else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errorCode = err.errorCode;
        errors = err.errors;
    }
    // --- Mongoose validation error ---
    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
        errorCode = "VALIDATION_ERROR";
        errors = Object.values(err.errors).map((e) => e.message);
    }
    // --- Mongoose Cast error ---
    else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errorCode = "CAST_ERROR";
    }
    // --- MongoDB Duplicate Key error ---
    else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue).join(", ");
        message = `Duplicate value for: ${field}`;
        errorCode = "DUPLICATE_KEY";
    }
    // --- JWT Invalid Token error ---
    else if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
        errorCode = "INVALID_TOKEN";
    }
    // --- JWT Expired Token error ---
    else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
        errorCode = "TOKEN_EXPIRED";
    }

    const response = {
        success: false,
        message,
        errorCode,
        errors,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    };

    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};

export default errorMiddleware;