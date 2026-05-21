import api from "../api/axios.js";

/**
 * Fetch all boards for a workspace
 * @param {string} workspaceId
 */
export const getWorkspaceBoards = async (workspaceId) => {
    const response = await api.get(`/boards/workspaces/${workspaceId}/boards`);
    return response.data;
};

/**
 * Fetch a single board by ID
 * @param {string} boardId
 */
export const getBoardById = async (boardId) => {
    const response = await api.get(`/boards/boards/${boardId}`);
    return response.data;
};

/**
 * Create a new board in a workspace
 * @param {string} workspaceId
 * @param {Object} data - { title }
 */
export const createBoard = async (workspaceId, data) => {
    const response = await api.post(`/boards/workspaces/${workspaceId}/boards`, data);
    return response.data;
};

/**
 * Update a board
 * @param {string} boardId
 * @param {Object} updateData
 */
export const updateBoard = async (boardId, updateData) => {
    const response = await api.put(`/boards/boards/${boardId}`, updateData);
    return response.data;
};

/**
 * Archive (soft-delete) a board
 * @param {string} boardId
 */
export const archiveBoard = async (boardId) => {
    const response = await api.delete(`/boards/boards/${boardId}`);
    return response.data;
};
