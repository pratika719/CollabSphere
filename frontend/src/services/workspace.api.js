import api from "../api/axios.js";

/*
|--------------------------------------------------------------------------
| WORKSPACE API SERVICE
|--------------------------------------------------------------------------
|
| Maps 1-to-1 with backend workspace routes.
| Every function returns the unwrapped Axios `response.data` (ApiResponse).
|
| Route prefix: /workspaces
|
*/

/**
 * Fetch all workspaces the authenticated user belongs to.
 * GET /workspaces
 */
export const getWorkspaces = async () => {
    const response = await api.get("/workspaces");
    return response.data;
};

/**
 * Fetch a single workspace by its ID.
 * GET /workspaces/:workspaceId
 *
 * @param {string} workspaceId
 */
export const getWorkspaceById = async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
};

/**
 * Create a new workspace.
 * POST /workspaces
 *
 * @param {Object} data - { name: string, description?: string }
 */
export const createWorkspace = async (data) => {
    const response = await api.post("/workspaces", data);
    return response.data;
};

/**
 * Update a workspace's name or description.
 * PUT /workspaces/:workspaceId
 *
 * @param {string} workspaceId
 * @param {Object} updateData - Fields to update { name?, description? }
 */
export const updateWorkspace = async (workspaceId, updateData) => {
    const response = await api.put(`/workspaces/${workspaceId}`, { updateData });
    return response.data;
};

/**
 * Archive (soft-delete) a workspace.
 * DELETE /workspaces/:workspaceId
 *
 * @param {string} workspaceId
 */
export const archiveWorkspace = async (workspaceId) => {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data;
};

/*
|--------------------------------------------------------------------------
| MEMBER MANAGEMENT
|--------------------------------------------------------------------------
*/

/**
 * Invite a user to a workspace by email.
 * POST /workspaces/:workspaceId/members/invite
 *
 * @param {string} workspaceId
 * @param {Object} data - { email: string, role?: "admin" | "member" }
 */
export const inviteMember = async (workspaceId, data) => {
    const response = await api.post(`/workspaces/${workspaceId}/members/invite`, data);
    return response.data;
};

/**
 * Remove a member from a workspace.
 * DELETE /workspaces/:workspaceId/members/:memberId
 *
 * @param {string} workspaceId
 * @param {string} memberId
 */
export const removeMember = async (workspaceId, memberId) => {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    return response.data;
};

/**
 * Update a member's role within a workspace.
 * PUT /workspaces/:workspaceId/members/:memberId
 *
 * @param {string} workspaceId
 * @param {string} memberId
 * @param {string} role - "admin" | "member"
 */
export const updateMemberRole = async (workspaceId, memberId, role) => {
    const response = await api.put(`/workspaces/${workspaceId}/members/${memberId}`, { role });
    return response.data;
};

/**
 * List all members in a workspace.
 * GET /workspaces/:workspaceId/members
 *
 * @param {string} workspaceId
 */
export const listMembers = async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
};
