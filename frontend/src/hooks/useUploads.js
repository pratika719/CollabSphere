import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    uploadAvatar,
    uploadTaskAttachments,
    deleteTaskAttachment,
} from "../services/upload.api.js";

/*
|--------------------------------------------------------------------------
| UPLOAD HOOKS
|--------------------------------------------------------------------------
|
| TanStack Query mutation hooks for file uploads.
|
| Pattern:  useMutation  →  on success, invalidate related caches
|           so the UI updates automatically.
|
| These follow the exact same pattern as useCreateTask / useUpdateTask
| from hooks/useTasks.js.
|
*/

/**
 * Upload avatar mutation.
 *
 * On success → invalidates auth-related queries so the new avatar
 * appears everywhere (sidebar, profile page, member lists).
 */
export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file) => uploadAvatar(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });
}

/**
 * Upload task attachments mutation.
 *
 * On success → invalidates the specific task and board queries so
 * the attachment list refreshes.
 *
 * Usage:
 *   const { mutate } = useUploadAttachments();
 *   mutate({ taskId: "...", files: [...], boardId: "..." });
 */
export function useUploadAttachments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, files }) =>
            uploadTaskAttachments(taskId, files),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["task", variables.taskId],
            });
            if (variables.boardId) {
                queryClient.invalidateQueries({
                    queryKey: ["tasks", variables.boardId],
                });
            }
        },
    });
}

/**
 * Delete task attachment mutation.
 *
 * Usage:
 *   const { mutate } = useDeleteAttachment();
 *   mutate({ taskId: "...", attachmentId: "..." });
 */
export function useDeleteAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, attachmentId }) =>
            deleteTaskAttachment(taskId, attachmentId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["task", variables.taskId],
            });
        },
    });
}
