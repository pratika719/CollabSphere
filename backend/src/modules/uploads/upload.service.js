import cloudinary from "../../config/cloudinary.js";
import ApiError from "../../utils/ApiError.js";

// ---------------------------------------------------------------------------
// Upload Service — Cloudinary Interactions
// ---------------------------------------------------------------------------
//
// WHY upload_stream instead of upload?
//   cloudinary.uploader.upload()  expects a file PATH on disk.
//   cloudinary.uploader.upload_stream()  accepts a stream / buffer.
//
//   Since Multer gives us a Buffer (memoryStorage), we need upload_stream.
//   We wrap it in a Promise so the rest of our async/await code stays clean.
//
// ---------------------------------------------------------------------------

/**
 * Upload a single buffer to Cloudinary.
 *
 * @param {Buffer}  fileBuffer - raw bytes from multer (req.file.buffer)
 * @param {Object}  options    - Cloudinary upload options (folder, transformation, etc.)
 * @returns {Promise<{ url: string, publicId: string, format: string, bytes: number, originalFilename: string }>}
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto", // auto-detect: image | raw | video
                ...options,
            },
            (error, result) => {
                if (error) {
                    reject(new ApiError(500, `Upload failed: ${error.message}`));
                } else {
                    resolve({
                        url: result.secure_url,            // HTTPS CDN URL
                        publicId: result.public_id,        // used for deletion later
                        format: result.format,
                        bytes: result.bytes,
                        originalFilename: result.original_filename,
                    });
                }
            }
        );

        // Pipe the buffer into Cloudinary's writable stream
        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete a file from Cloudinary by its public_id.
 *
 * Deletion failures are logged but never thrown — a failed cleanup should
 * not block the user's current request.
 *
 * @param {string} publicId     - Cloudinary public ID
 * @param {string} resourceType - "image" | "raw" | "video"
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch (error) {
        console.error(`[Cloudinary] Failed to delete ${publicId}:`, error.message);
    }
};
