import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getTasksByBoard,
    createTask,
} from "../services/task.api.js";

/**
 * Fetch all tasks for a board
 * @param {string} boardId
 */
export function useTasks(boardId) {
    return useQuery({
        queryKey: ["tasks", boardId],
        queryFn: () => getTasksByBoard(boardId),
        enabled: !!boardId,
    });
}

/**
 * Mutation: create a new task in a board
 * Invalidates the tasks cache for that board after success
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, ...taskData }) => createTask(boardId, taskData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["tasks", variables.boardId] });
        },
    });
}
