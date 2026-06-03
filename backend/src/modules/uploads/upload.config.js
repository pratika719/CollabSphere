// ---------------------------------------------------------------------------
// Upload Configuration Constants
// ---------------------------------------------------------------------------
// Centralised limits & allowed types for every upload use-case.
// When requirements change ("increase avatar to 5 MB"), update ONE file.
// ---------------------------------------------------------------------------

export const AVATAR_CONFIG = {
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
    ],
    cloudinaryFolder: "collabsphere/avatars",
    // Cloudinary transformation applied on upload:
    //   - crop to 400×400 using face-detection gravity
    //   - auto-quality + webp output (≈30 % smaller than JPEG)
    transformation: {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto",
        format: "webp",
    },
};

export const ATTACHMENT_CONFIG = {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB per file
    maxFilesPerTask: 5,
    allowedMimeTypes: [
        // Images
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        // Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // Spreadsheets
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        // Plain text
        "text/plain",
    ],
    cloudinaryFolder: "collabsphere/attachments",
};
