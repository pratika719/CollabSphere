import multer from "multer";
import ApiError from "../../utils/ApiError.js";
import { AVATAR_CONFIG, ATTACHMENT_CONFIG } from "./upload.config.js";

// ---------------------------------------------------------------------------
// Multer Configuration
// ---------------------------------------------------------------------------
//
// WHY memory storage?
//   We never save files to our server's disk — they stream straight to
//   Cloudinary.  memoryStorage() keeps the raw bytes in req.file.buffer
//   until we pipe them to the Cloudinary upload_stream.
//
// WHY a file-filter factory?
//   Each upload type has different allowed MIME types.  A factory lets us
//   create reusable filters from a simple array of allowed types.
//
// ---------------------------------------------------------------------------

const storage = multer.memoryStorage();

/**
 * Factory: creates a Multer `fileFilter` that accepts only the listed MIME types.
 *
 * @param {string[]} allowedMimeTypes
 * @returns {Function} Multer-compatible fileFilter callback
 */
const createFileFilter = (allowedMimeTypes) => (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // accept
    } else {
        cb(
            new ApiError(
                400,
                `Invalid file type: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(", ")}`
            ),
            false
        );
    }
};

// ---------------------------------------------------------------------------
// Pre-configured Multer instances (one per use-case)
// ---------------------------------------------------------------------------

/**
 * Avatar upload — single file, form field "avatar".
 */
export const uploadAvatar = multer({
    storage,
    limits: { fileSize: AVATAR_CONFIG.maxSizeBytes },
    fileFilter: createFileFilter(AVATAR_CONFIG.allowedMimeTypes),
}).single("avatar");

/**
 * Task attachments — up to N files, form field "attachments".
 */
export const uploadAttachments = multer({
    storage,
    limits: { fileSize: ATTACHMENT_CONFIG.maxSizeBytes },
    fileFilter: createFileFilter(ATTACHMENT_CONFIG.allowedMimeTypes),
}).array("attachments", ATTACHMENT_CONFIG.maxFilesPerTask);

// ---------------------------------------------------------------------------
// Multer Error Translator
// ---------------------------------------------------------------------------
//
// Multer throws its own MulterError class that our global error middleware
// doesn't recognise.  This middleware translates it to our ApiError format
// so the client receives a consistent JSON error response.
//
// ---------------------------------------------------------------------------

export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const messages = {
            LIMIT_FILE_SIZE: "File is too large",
            LIMIT_FILE_COUNT: `Too many files. Maximum is ${ATTACHMENT_CONFIG.maxFilesPerTask}`,
            LIMIT_UNEXPECTED_FILE: "Unexpected file field name",
        };
        return next(new ApiError(400, messages[err.code] || err.message));
    }

    // Not a MulterError — pass to the next error handler
    next(err);
};
