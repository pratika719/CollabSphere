import api from "../api/axios.js";

/*
|--------------------------------------------------------------------------
| TASK API SERVICE
|--------------------------------------------------------------------------
|
| Maps 1-to-1 with backend task routes.
| Route prefix: /tasks
|
*/

/**
 * Fetch all tasks for a board (sorted by position).
 * GET /tasks/boards/:boardId/tasks
 *
 * @param {string} boardId
 */
export const getTasksByBoard = async (boardId) => {
    const response = await api.get(`/tasks/boards/${boardId}/tasks`);
    return response.data;
};

/**
 * Fetch filtered & paginated tasks for a workspace.
 * GET /tasks/workspaces/:workspaceId/tasks
 *
 * @param {string} workspaceId
 * @param {Object} query - { priority?, assignee?, search?, page?, limit?, sortBy?, order? }
 */
export const getFilteredTasks = async (workspaceId, query = {}) => {
    const response = await api.get(`/tasks/workspaces/${workspaceId}/tasks`, { params: query });
    return response.data;
};

/**
 * Fetch a single task by its ID.
 * GET /tasks/tasks/:taskId
 *
 * @param {string} taskId
 */
export const getTaskById = async (taskId) => {
    const response = await api.get(`/tasks/tasks/${taskId}`);
    return response.data;
};

/**
 * Create a new task in a board.
 * POST /tasks/boards/:boardId/tasks
 *
 * @param {string} boardId
 * @param {Object} taskData - { title, description?, assignee?, dueDate?, labels?, priority?, position?, status? }
 */
export const createTask = async (boardId, taskData) => {
    const response = await api.post(`/tasks/boards/${boardId}/tasks`, taskData);
    return response.data;
};

/**
 * Update a task's fields.
 * PUT /tasks/tasks/:taskId
 *
 * @param {string} taskId
 * @param {Object} updateData - Any task fields to update
 */
export const updateTask = async (taskId, updateData) => {
    const response = await api.put(`/tasks/tasks/${taskId}`, updateData);
    return response.data;
};

/**
 * Archive (soft-delete) a task.
 * DELETE /tasks/tasks/:taskId
 *
 * @param {string} taskId
 */
export const archiveTask = async (taskId) => {
    const response = await api.delete(`/tasks/tasks/${taskId}`);
    return response.data;
};

/**
 * Move a task to a different board and/or position.
 * PATCH /tasks/tasks/:taskId/move
 *
 * @param {string} taskId
 * @param {Object} data - { boardId: string, position: number }
 */
export const moveTask = async (taskId, data) => {
    const response = await api.patch(`/tasks/tasks/${taskId}/move`, data);
    return response.data;
};

/**
 * Reorder tasks within a board.
 * PATCH /tasks/boards/:boardId/tasks/reorder
 *
 * @param {string} boardId
 * @param {Array} tasks - Ordered array of task IDs
 */
export const reorderTasks = async (boardId, tasks) => {
    const response = await api.patch(
        `/tasks/boards/${boardId}/tasks/reorder`,
        { tasks }
    );
    return response.data;
};
