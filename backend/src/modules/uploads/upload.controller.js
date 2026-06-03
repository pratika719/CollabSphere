import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { uploadToCloudinary, deleteFromCloudinary } from "./upload.service.js";
import { AVATAR_CONFIG, ATTACHMENT_CONFIG } from "./upload.config.js";
import * as authRepository from "../auth/auth.repository.js";
import * as taskRepository from "../tasks/task.repository.js";

// ---------------------------------------------------------------------------
// Upload Controller
// ---------------------------------------------------------------------------

/**
 * Upload user avatar.
 *
 * POST /api/v1/uploads/avatar
 *
 * Flow:
 *   1. Multer has already parsed the file → req.file
 *   2. If user has an old avatar on Cloudinary, delete it
 *   3. Upload new avatar with face-aware crop transformations
 *   4. Save the CDN URL + publicId to the User document
 *   5. Return the new avatar URL
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file provided. Send a file with field name 'avatar'.");
    }

    // Fetch user with avatarPublicId (which is select:false by default)
    const currentUser = await authRepository.findUserWithAvatar(req.user._id);

    // Clean up previous avatar from Cloudinary if one exists
    if (currentUser?.avatarPublicId) {
        await deleteFromCloudinary(currentUser.avatarPublicId);
    }

    // Upload to Cloudinary with avatar-specific settings
    // NOTE: We use `eager` (not `transformation`) because upload_stream
    // doesn't support top-level `transformation`.  `eager` tells Cloudinary
    // to create a transformed version during upload and return its URL.
    const result = await uploadToCloudinary(req.file.buffer, {
        folder: AVATAR_CONFIG.cloudinaryFolder,
        eager: [AVATAR_CONFIG.transformation],
        public_id: `avatar_${req.user._id}`, // deterministic → easy replacement
        overwrite: true,
    });

    // Use the eager-transformed URL if available, otherwise fall back to original
    const avatarUrl = result.eager?.[0]?.secure_url || result.url;

    // Persist avatar URL + publicId in MongoDB
    const updatedUser = await authRepository.updateUserAvatar(
        req.user._id,
        avatarUrl,
        result.publicId
    );

    return res.status(200).json(
        new ApiResponse(200, {
            avatar: updatedUser.avatar,
        }, "Avatar uploaded successfully")
    );
});

/**
 * Upload task attachments (1–5 files).
 *
 * POST /api/v1/uploads/tasks/:taskId/attachments
 *
 * Flow:
 *   1. Multer has already parsed files → req.files[]
 *   2. Verify the task exists and check attachment count limit
 *   3. Upload all files to Cloudinary in parallel
 *   4. Build attachment metadata subdocuments
 *   5. $push them into Task.attachments
 */
export const uploadTaskAttachments = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No files provided. Send files with field name 'attachments'.");
    }

    // Fetch the task (taskAccess middleware already verified access)
    const task = await taskRepository.getTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Enforce per-task attachment limit
    const currentCount = task.attachments?.length || 0;
    if (currentCount + req.files.length > ATTACHMENT_CONFIG.maxFilesPerTask) {
        throw new ApiError(
            400,
            `Task can have at most ${ATTACHMENT_CONFIG.maxFilesPerTask} attachments. ` +
            `Currently has ${currentCount}. You tried to add ${req.files.length}.`
        );
    }

    // Upload all files concurrently
    const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, {
            folder: `${ATTACHMENT_CONFIG.cloudinaryFolder}/${taskId}`,
            resource_type: "auto",
        })
    );
    const results = await Promise.all(uploadPromises);

    // Build attachment subdocuments with rich metadata
    const newAttachments = results.map((result, index) => ({
        url: result.url,
        publicId: result.publicId,
        filename: req.files[index].originalname,
        mimetype: req.files[index].mimetype,
        size: req.files[index].size,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
    }));

    // Atomically push into the task document
    const updatedTask = await taskRepository.addAttachments(taskId, newAttachments);

    return res.status(200).json(
        new ApiResponse(200, updatedTask.attachments, "Attachments uploaded successfully")
    );
});

/**
 * Delete a single task attachment.
 *
 * DELETE /api/v1/uploads/tasks/:taskId/attachments/:attachmentId
 *
 * Flow:
 *   1. Find the attachment subdocument within the task
 *   2. Delete file from Cloudinary
 *   3. $pull the subdocument from Task.attachments
 */
export const deleteTaskAttachment = asyncHandler(async (req, res) => {
    const { taskId, attachmentId } = req.params;

    const task = await taskRepository.getTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Find the specific attachment subdocument
    const attachment = task.attachments?.id(attachmentId);
    if (!attachment) {
        throw new ApiError(404, "Attachment not found");
    }

    // Determine Cloudinary resource_type from MIME
    const resourceType = attachment.mimetype?.startsWith("image/") ? "image" : "raw";
    await deleteFromCloudinary(attachment.publicId, resourceType);

    // Remove from MongoDB
    const updatedTask = await taskRepository.removeAttachment(taskId, attachmentId);

    return res.status(200).json(
        new ApiResponse(200, updatedTask.attachments, "Attachment deleted successfully")
    );
});
