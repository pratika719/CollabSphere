const mapStatusToCode = (statusCode) => {
    switch (statusCode) {
        case 400: return "BAD_REQUEST";
        case 401: return "UNAUTHORIZED";
        case 403: return "FORBIDDEN";
        case 404: return "NOT_FOUND";
        case 409: return "CONFLICT";
        case 422: return "VALIDATION_ERROR";
        case 429: return "TOO_MANY_REQUESTS";
        default: return "INTERNAL_SERVER_ERROR";
    }
};

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = "",
        errorCode = null
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        this.errorCode = errorCode || mapStatusToCode(statusCode);

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
