import { Router } from "express";
import { verifyJWT } from "../auth/auth.middleware.js";
import { taskAccess } from "../tasks/task.middlewares.js";
import { authorizeWorkspaceRole } from "../../middleware/rbac.middleware.js";
import {
    uploadAvatar as multerAvatar,
    uploadAttachments as multerAttachments,
    handleMulterError,
} from "./upload.middleware.js";
import {
    uploadAvatar,
    uploadTaskAttachments,
    deleteTaskAttachment,
} from "./upload.controller.js";

/*
|--------------------------------------------------------------------------
| UPLOAD ROUTER
|--------------------------------------------------------------------------
|
| Base Route:
|   /api/v1/uploads
|
| Responsibilities:
|   - Avatar image upload
|   - Task file attachment upload & deletion
|
| All routes require authentication (verifyJWT applied globally).
|
*/

const router = Router();

router.use(verifyJWT);

/*
|--------------------------------------------------------------------------
| AVATAR UPLOAD
|--------------------------------------------------------------------------
|
| POST /api/v1/uploads/avatar
|
| Middleware chain:
|   1. verifyJWT           → user is authenticated
|   2. multerAvatar        → parse multipart, validate type & size (single file, field "avatar")
|   3. handleMulterError   → translate MulterError → ApiError
|   4. uploadAvatar        → upload to Cloudinary, update User.avatar in MongoDB
|
*/
router.post(
    "/avatar",
    multerAvatar,
    handleMulterError,
    uploadAvatar
);

/*
|--------------------------------------------------------------------------
| TASK ATTACHMENT UPLOAD
|--------------------------------------------------------------------------
|
| POST /api/v1/uploads/tasks/:taskId/attachments
|
| Middleware chain:
|   1. verifyJWT                    → authenticated
|   2. taskAccess                   → loads task, resolves workspace, verifies membership
|   3. authorizeWorkspaceRole       → must be admin or member
|   4. multerAttachments            → parse up to 5 files, field "attachments"
|   5. handleMulterError            → error translation
|   6. uploadTaskAttachments        → upload to Cloudinary, save metadata to Task.attachments
|
*/
router.post(
    "/tasks/:taskId/attachments",
    taskAccess,
    authorizeWorkspaceRole("admin", "member"),
    multerAttachments,
    handleMulterError,
    uploadTaskAttachments
);

/*
|--------------------------------------------------------------------------
| TASK ATTACHMENT DELETE
|--------------------------------------------------------------------------
|
| DELETE /api/v1/uploads/tasks/:taskId/attachments/:attachmentId
|
| Middleware chain:
|   1. verifyJWT                    → authenticated
|   2. taskAccess                   → loads task, resolves workspace
|   3. authorizeWorkspaceRole       → admin or member
|   4. deleteTaskAttachment         → remove from Cloudinary + MongoDB
|
*/
router.delete(
    "/tasks/:taskId/attachments/:attachmentId",
    taskAccess,
    authorizeWorkspaceRole("admin", "member"),
    deleteTaskAttachment
);

export default router;
