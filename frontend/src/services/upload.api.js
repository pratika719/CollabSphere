import api from "../api/axios.js";

/*
|--------------------------------------------------------------------------
| UPLOAD API SERVICE
|--------------------------------------------------------------------------
|
| Maps 1-to-1 with backend upload routes.
| Route prefix: /uploads
|
| KEY LEARNING — FormData vs JSON:
|   Normal API calls send JSON.  File uploads use FormData, which encodes
|   data as multipart/form-data (the same format as HTML <form> with
|   enctype="multipart/form-data").
|
|   Axios auto-detects FormData and sets the correct Content-Type header
|   including the required "boundary" string.  We just need to override
|   the default "application/json" header we set globally in axios.js.
|
*/

/**
 * Upload user avatar.
 *
 * @param {File} file - The File object from an <input type="file"> element.
 * @returns {Promise<{ data: { avatar: string } }>}
 */
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file); // "avatar" must match multer's .single("avatar")

    // No manual Content-Type header needed!
    // The Axios request interceptor detects FormData and lets the browser
    // auto-generate "multipart/form-data; boundary=..." — the boundary
    // is required for the server to parse the file correctly.
    const response = await api.post("/uploads/avatar", formData);
    return response.data;
};

/**
 * Upload task attachments (multiple files).
 *
 * @param {string} taskId
 * @param {File[]} files - Array of File objects from <input type="file" multiple>
 * @returns {Promise<{ data: Array }>}
 */
export const uploadTaskAttachments = async (taskId, files) => {
    const formData = new FormData();
    // Append each file with the same field name — Multer collects them into req.files[]
    files.forEach((file) => {
        formData.append("attachments", file);
    });

    const response = await api.post(
        `/uploads/tasks/${taskId}/attachments`,
        formData
    );
    return response.data;
};

/**
 * Delete a single attachment from a task.
 *
 * @param {string} taskId
 * @param {string} attachmentId - The MongoDB subdocument _id
 * @returns {Promise<{ data: Array }>}
 */
export const deleteTaskAttachment = async (taskId, attachmentId) => {
    const response = await api.delete(
        `/uploads/tasks/${taskId}/attachments/${attachmentId}`
    );
    return response.data;
};
