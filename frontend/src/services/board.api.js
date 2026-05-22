import api from "../api/axios.js";

/*
|--------------------------------------------------------------------------
| BOARD API SERVICE
|--------------------------------------------------------------------------
|
| Maps 1-to-1 with backend board routes.
| Route prefix: /boards
|
*/

/**
 * Fetch all boards for a workspace.
 * GET /boards/workspaces/:workspaceId/boards
 *
 * @param {string} workspaceId
 */
export const getWorkspaceBoards = async (workspaceId) => {
    const response = await api.get(`/boards/workspaces/${workspaceId}/boards`);
    return response.data;
};

/**
 * Fetch a single board by its ID.
 * GET /boards/boards/:boardId
 *
 * @param {string} boardId
 */
export const getBoardById = async (boardId) => {
    const response = await api.get(`/boards/boards/${boardId}`);
    return response.data;
};

/**
 * Create a new board inside a workspace.
 * POST /boards/workspaces/:workspaceId/boards
 *
 * @param {string} workspaceId
 * @param {Object} data - { title: string }
 */
export const createBoard = async (workspaceId, data) => {
    const response = await api.post(`/boards/workspaces/${workspaceId}/boards`, data);
    return response.data;
};

/**
 * Update a board (title, color, etc.).
 * PUT /boards/boards/:boardId
 *
 * @param {string} boardId
 * @param {Object} updateData - Fields to update
 */
export const updateBoard = async (boardId, updateData) => {
    const response = await api.put(`/boards/boards/${boardId}`, updateData);
    return response.data;
};

/**
 * Archive (soft-delete) a board.
 * DELETE /boards/boards/:boardId
 *
 * @param {string} boardId
 */
export const archiveBoard = async (boardId) => {
    const response = await api.delete(`/boards/boards/${boardId}`);
    return response.data;
};

/**
 * Reorder boards within a workspace.
 * PATCH /boards/workspaces/:workspaceId/boards/reorder
 *
 * @param {string} workspaceId
 * @param {Array} boards - Ordered array of board IDs
 */
export const reorderBoards = async (workspaceId, boards) => {
    const response = await api.patch(
        `/boards/workspaces/${workspaceId}/boards/reorder`,
        { boards }
    );
    return response.data;
};
