import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    getTasksByBoard,
    getTaskById,
    getFilteredTasks,
    createTask,
    updateTask,
    archiveTask,
    moveTask,
} from "../services/task.api.js";

/*
|--------------------------------------------------------------------------
| TASK QUERY HOOKS
|--------------------------------------------------------------------------
*/

/**
 * Fetch all tasks for a board (sorted by position).
 * Cache key: ["tasks", boardId]
 *
 * @param {string} boardId — skipped when falsy
 */
export function useTasks(boardId) {
    return useQuery({
        queryKey: ["tasks", boardId],
        queryFn: () => getTasksByBoard(boardId),
        enabled: !!boardId,
    });
}

/**
 * Fetch a single task by ID.
 * Cache key: ["task", taskId]
 *
 * @param {string} taskId — skipped when falsy
 */
export function useTask(taskId) {
    return useQuery({
        queryKey: ["task", taskId],
        queryFn: () => getTaskById(taskId),
        enabled: !!taskId,
    });
}

/**
 * Fetch filtered & paginated tasks for a workspace.
 * Cache key: ["filtered-tasks", workspaceId, filters]
 *
 * Uses `keepPreviousData` so pagination transitions are seamless —
 * the old page stays visible while the new one loads.
 *
 * @param {string} workspaceId — skipped when falsy
 * @param {Object} filters - { priority?, search?, page?, limit?, sortBy?, order? }
 */
export function useFilteredTasks(workspaceId, filters = {}) {
    return useQuery({
        queryKey: ["filtered-tasks", workspaceId, filters],
        queryFn: () => getFilteredTasks(workspaceId, filters),
        enabled: !!workspaceId,
        placeholderData: keepPreviousData,
    });
}

/*
|--------------------------------------------------------------------------
| TASK MUTATION HOOKS
|--------------------------------------------------------------------------
*/

/**
 * Create a new task in a board.
 * Invalidates: ["tasks", boardId], ["filtered-tasks"]
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, ...taskData }) =>
            createTask(boardId, taskData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["tasks", variables.boardId],
            });
            // Also invalidate workspace-wide filtered views
            queryClient.invalidateQueries({
                queryKey: ["filtered-tasks"],
            });
        },
    });
}

/**
 * Update a task's fields (title, description, priority, status, etc.).
 * Invalidates: ["tasks", boardId], ["task", taskId], ["filtered-tasks"]
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, updateData }) =>
            updateTask(taskId, updateData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["task", variables.taskId],
            });
            // Invalidate the board's task list if boardId is provided
            if (variables.boardId) {
                queryClient.invalidateQueries({
                    queryKey: ["tasks", variables.boardId],
                });
            }
            queryClient.invalidateQueries({
                queryKey: ["filtered-tasks"],
            });
        },
    });
}

/**
 * Archive (soft-delete) a task.
 * Invalidates: ["tasks", boardId], ["filtered-tasks"]
 */
export function useArchiveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId }) => archiveTask(taskId),
        onSuccess: (_data, variables) => {
            if (variables.boardId) {
                queryClient.invalidateQueries({
                    queryKey: ["tasks", variables.boardId],
                });
            }
            queryClient.invalidateQueries({
                queryKey: ["filtered-tasks"],
            });
        },
    });
}

/**
 * Move a task to a different board (and optionally set position).
 * Invalidates: source board, target board, and filtered views.
 */
export function useMoveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, boardId, position }) =>
            moveTask(taskId, { boardId, position }),
        onSuccess: (_data, variables) => {
            // Invalidate both source and target board task lists
            if (variables.sourceBoardId) {
                queryClient.invalidateQueries({
                    queryKey: ["tasks", variables.sourceBoardId],
                });
            }
            queryClient.invalidateQueries({
                queryKey: ["tasks", variables.boardId],
            });
            queryClient.invalidateQueries({
                queryKey: ["filtered-tasks"],
            });
        },
    });
}
