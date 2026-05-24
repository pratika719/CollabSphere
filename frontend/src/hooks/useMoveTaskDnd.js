import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../services/task.api.js";

/*
|--------------------------------------------------------------------------
| useMoveTaskDnd — Optimistic drag-and-drop mutation
|--------------------------------------------------------------------------
|
| This hook performs an optimistic update on the React Query cache
| so the UI reflects the status change IMMEDIATELY, before the
| server responds.
|
| React Query mutation lifecycle:
|
|   onMutate  → fires BEFORE the API call (we update cache here)
|   mutationFn → the actual API call
|   onError   → fires if mutationFn throws (we roll back here)
|   onSettled → fires ALWAYS after success or error (we refetch here)
|
*/

export function useMoveTaskDnd() {
    const queryClient = useQueryClient();

    return useMutation({
        // The actual API call
        mutationFn: ({ taskId, updateData }) =>
            updateTask(taskId, updateData),

        // ① onMutate: runs BEFORE the API call
        //    Return value becomes the `context` in onError/onSettled
        onMutate: async ({ taskId, boardId, updateData }) => {
            // 1a. Cancel any in-flight refetches for this board's tasks
            //     Why? If a refetch completes while we're mid-mutation,
            //     it would overwrite our optimistic update with stale data
            await queryClient.cancelQueries({
                queryKey: ["tasks", boardId],
            });

            // 1b. Snapshot the current cache value (for rollback)
            const previousTasks = queryClient.getQueryData(["tasks", boardId]);

            // 1c. Optimistically update the cache
            //     We clone the task data and set the new status
            queryClient.setQueryData(["tasks", boardId], (old) => {
                if (!old?.data) return old;

                return {
                    ...old,
                    data: old.data.map((task) =>
                        task._id === taskId
                            ? { ...task, ...updateData }
                            : task
                    ),
                };
            });

            // 1d. Return the snapshot so we can roll back in onError
            return { previousTasks };
        },

        // ② onError: API call failed — roll back to the snapshot
        onError: (_error, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ["tasks", variables.boardId],
                    context.previousTasks
                );
            }
        },

        // ③ onSettled: runs after BOTH success and error
        //    Always refetch to ensure cache matches server state
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["tasks", variables.boardId],
            });
            queryClient.invalidateQueries({
                queryKey: ["filtered-tasks"],
            });
        },
    });
}
