import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderTasks } from "../services/task.api.js";

/*
|--------------------------------------------------------------------------
| useReorderTasksDnd — Optimistic within-column reorder
|--------------------------------------------------------------------------
|
| When a user drags Task A above Task B within the SAME column,
| we optimistically reorder the cache and then persist the
| new positions to the backend.
|
| Backend endpoint: PATCH /tasks/boards/:boardId/tasks/reorder
| Body: { tasks: ["id3", "id1", "id2"] }  ← ordered array of IDs
| Effect: Sets each task's `position` to its array index.
|
*/

export function useReorderTasksDnd() {
    const queryClient = useQueryClient();

    return useMutation({
        // The actual API call — sends the ordered ID array
        mutationFn: ({ boardId, tasks }) =>
            reorderTasks(boardId, tasks),

        // ① onMutate: optimistically reorder the cache
        onMutate: async ({ boardId, reorderedTasks }) => {
            await queryClient.cancelQueries({
                queryKey: ["tasks", boardId],
            });

            const previousTasks = queryClient.getQueryData(["tasks", boardId]);

            // Optimistically replace the tasks in this column
            // with the reordered version (+ updated positions)
            queryClient.setQueryData(["tasks", boardId], (old) => {
                if (!old?.data) return old;

                // Build a Set of IDs in the reordered column
                // so we can quickly check membership
                const reorderedIds = new Set(
                    reorderedTasks.map((t) => t._id)
                );

                // Keep tasks from OTHER columns untouched,
                // replace tasks in THIS column with the reordered version
                const otherTasks = old.data.filter(
                    (t) => !reorderedIds.has(t._id)
                );

                // Update positions on the reordered tasks
                const withPositions = reorderedTasks.map((t, index) => ({
                    ...t,
                    position: index,
                }));

                return {
                    ...old,
                    data: [...otherTasks, ...withPositions],
                };
            });

            return { previousTasks };
        },

        // ② onError: roll back
        onError: (_error, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ["tasks", variables.boardId],
                    context.previousTasks
                );
            }
        },

        // ③ onSettled: always refetch
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["tasks", variables.boardId],
            });
        },
    });
}
