import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWorkspaces,
    getWorkspaceById,
    createWorkspace,
    updateWorkspace,
    archiveWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole,
    listMembers,
} from "../services/workspace.api.js";

/*
|--------------------------------------------------------------------------
| WORKSPACE QUERY HOOKS
|--------------------------------------------------------------------------
|
| Read operations — powered by React Query's useQuery.
| Each hook manages its own cache key, loading, and error state.
|
*/

/**
 * Fetch all workspaces for the authenticated user.
 * Cache key: ["workspaces"]
 */
export function useWorkspaces() {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: getWorkspaces,
    });
}

/**
 * Fetch a single workspace by ID.
 * Cache key: ["workspace", workspaceId]
 *
 * @param {string} workspaceId — skipped when falsy
 */
export function useWorkspace(workspaceId) {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: () => getWorkspaceById(workspaceId),
        enabled: !!workspaceId,
    });
}

/**
 * Fetch workspace members (uses the workspace detail endpoint).
 * Cache key: ["workspace-members", workspaceId]
 *
 * @param {string} workspaceId
 */
export function useWorkspaceMembers(workspaceId) {
    return useQuery({
        queryKey: ["workspace-members", workspaceId],
        queryFn: () => listMembers(workspaceId),
        enabled: !!workspaceId,
    });
}

/*
|--------------------------------------------------------------------------
| WORKSPACE MUTATION HOOKS
|--------------------------------------------------------------------------
|
| Write operations — each returns { mutate, mutateAsync, isPending, ... }.
| All invalidate the relevant query cache on success so lists stay fresh.
|
*/

/**
 * Create a new workspace.
 * Invalidates: ["workspaces"]
 */
export function useCreateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createWorkspace(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });
}

/**
 * Update an existing workspace.
 * Invalidates: ["workspaces"], ["workspace", workspaceId]
 */
export function useUpdateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, updateData }) =>
            updateWorkspace(workspaceId, updateData),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({
                queryKey: ["workspace", variables.workspaceId],
            });
        },
    });
}

/**
 * Archive (soft-delete) a workspace.
 * Invalidates: ["workspaces"]
 */
export function useArchiveWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId) => archiveWorkspace(workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });
}

/*
|--------------------------------------------------------------------------
| MEMBER MANAGEMENT MUTATION HOOKS
|--------------------------------------------------------------------------
*/

/**
 * Invite a member to a workspace by email.
 * Invalidates: ["workspace", workspaceId], ["workspace-members", workspaceId]
 */
export function useInviteMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, email, role }) =>
            inviteMember(workspaceId, { email, role }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["workspace", variables.workspaceId],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspace-members", variables.workspaceId],
            });
        },
    });
}

/**
 * Remove a member from a workspace.
 * Invalidates: ["workspace", workspaceId], ["workspace-members", workspaceId]
 */
export function useRemoveMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, memberId }) =>
            removeMember(workspaceId, memberId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["workspace", variables.workspaceId],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspace-members", variables.workspaceId],
            });
        },
    });
}

/**
 * Update a workspace member's role.
 * Invalidates: ["workspace", workspaceId], ["workspace-members", workspaceId]
 */
export function useUpdateMemberRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, memberId, role }) =>
            updateMemberRole(workspaceId, memberId, role),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["workspace", variables.workspaceId],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspace-members", variables.workspaceId],
            });
        },
    });
}
