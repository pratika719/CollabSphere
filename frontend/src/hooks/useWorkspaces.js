import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWorkspaces,
    getWorkspaceById,
    createWorkspace,
} from "../services/workspace.api.js";

/**
 * Fetch all workspaces for the authenticated user
 */
export function useWorkspaces() {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: getWorkspaces,
    });
}

/**
 * Fetch a single workspace by ID
 * @param {string} workspaceId
 */
export function useWorkspace(workspaceId) {
    return useQuery({
        queryKey: ["workspaces", workspaceId],
        queryFn: () => getWorkspaceById(workspaceId),
        enabled: !!workspaceId,
    });
}

/**
 * Mutation: create a new workspace
 * Invalidates the workspace list cache after success
 */
export function useCreateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWorkspace,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });
}
