import api from "../api/axios.js";

/**
 * Fetch all workspaces for the authenticated user
 */
export const getWorkspaces = async () => {
    const response = await api.get("/workspaces");
    return response.data;
};

/**
 * Fetch a single workspace by ID
 * @param {string} workspaceId
 */
export const getWorkspaceById = async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
};

/**
 * Create a new workspace
 * @param {Object} data - { name, description }
 */
export const createWorkspace = async (data) => {
    const response = await api.post("/workspaces", data);
    return response.data;
};

/**
 * Update a workspace
 * @param {string} workspaceId
 * @param {Object} updateData
 */
export const updateWorkspace = async (workspaceId, updateData) => {
    const response = await api.put(`/workspaces/${workspaceId}`, { updateData });
    return response.data;
};

/**
 * Archive (soft-delete) a workspace
 * @param {string} workspaceId
 */
export const archiveWorkspace = async (workspaceId) => {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data;
};
