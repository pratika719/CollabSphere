import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWorkspaceBoards,
    getBoardById,
    createBoard,
    updateBoard,
    archiveBoard,
} from "../services/board.api.js";

/*
|--------------------------------------------------------------------------
| BOARD QUERY HOOKS
|--------------------------------------------------------------------------
*/

/**
 * Fetch all boards for a workspace.
 * Cache key: ["boards", workspaceId]
 *
 * @param {string} workspaceId — skipped when falsy
 */
export function useBoards(workspaceId) {
    return useQuery({
        queryKey: ["boards", workspaceId],
        queryFn: () => getWorkspaceBoards(workspaceId),
        enabled: !!workspaceId,
    });
}

/**
 * Fetch a single board by ID.
 * Cache key: ["board", boardId]
 *
 * @param {string} boardId — skipped when falsy
 */
export function useBoard(boardId) {
    return useQuery({
        queryKey: ["board", boardId],
        queryFn: () => getBoardById(boardId),
        enabled: !!boardId,
    });
}

/*
|--------------------------------------------------------------------------
| BOARD MUTATION HOOKS
|--------------------------------------------------------------------------
*/

/**
 * Create a new board in a workspace.
 * Invalidates: ["boards", workspaceId]
 */
export function useCreateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, title }) =>
            createBoard(workspaceId, { title }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["boards", variables.workspaceId],
            });
        },
    });
}

/**
 * Update a board's title or color.
 * Invalidates: ["boards", workspaceId], ["board", boardId]
 */
export function useUpdateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, updateData }) =>
            updateBoard(boardId, updateData),
        onSuccess: (_data, variables) => {
            // Invalidate the workspace boards list
            if (variables.workspaceId) {
                queryClient.invalidateQueries({
                    queryKey: ["boards", variables.workspaceId],
                });
            }
            queryClient.invalidateQueries({
                queryKey: ["board", variables.boardId],
            });
        },
    });
}

/**
 * Archive (soft-delete) a board.
 * Invalidates: ["boards", workspaceId]
 */
export function useArchiveBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId }) => archiveBoard(boardId),
        onSuccess: (_data, variables) => {
            if (variables.workspaceId) {
                queryClient.invalidateQueries({
                    queryKey: ["boards", variables.workspaceId],
                });
            }
        },
    });
}
