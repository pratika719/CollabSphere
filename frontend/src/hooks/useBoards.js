import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWorkspaceBoards,
    createBoard,
} from "../services/board.api.js";

/**
 * Fetch all boards for a workspace
 * @param {string} workspaceId
 */
export function useBoards(workspaceId) {
    return useQuery({
        queryKey: ["boards", workspaceId],
        queryFn: () => getWorkspaceBoards(workspaceId),
        enabled: !!workspaceId,
    });
}

/**
 * Mutation: create a new board in a workspace
 * Invalidates the boards list cache after success
 */
export function useCreateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, title }) => createBoard(workspaceId, { title }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["boards", variables.workspaceId] });
        },
    });
}
