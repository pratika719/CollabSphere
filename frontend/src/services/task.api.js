import api from "../api/axios.js";

/**
 * Fetch all tasks for a board
 * @param {string} boardId
 */
export const getTasksByBoard = async (boardId) => {
    const response = await api.get(`/tasks/boards/${boardId}/tasks`);
    return response.data;
};

/**
 * Fetch filtered tasks for a workspace
 * @param {string} workspaceId
 * @param {Object} query - Filter params (priority, assignedTo, search, page, limit, sortBy)
 */
export const getFilteredTasks = async (workspaceId, query = {}) => {
    const response = await api.get(`/tasks/workspaces/${workspaceId}/tasks`, { params: query });
    return response.data;
};

/**
 * Fetch a single task by ID
 * @param {string} taskId
 */
export const getTaskById = async (taskId) => {
    const response = await api.get(`/tasks/tasks/${taskId}`);
    return response.data;
};

/**
 * Create a new task in a board
 * @param {string} boardId
 * @param {Object} taskData - { title, description, assignee, dueDate, labels, priority, position }
 */
export const createTask = async (boardId, taskData) => {
    const response = await api.post(`/tasks/boards/${boardId}/tasks`, taskData);
    return response.data;
};

/**
 * Update a task
 * @param {string} taskId
 * @param {Object} updateData
 */
export const updateTask = async (taskId, updateData) => {
    const response = await api.put(`/tasks/tasks/${taskId}`, updateData);
    return response.data;
};

/**
 * Archive (soft-delete) a task
 * @param {string} taskId
 */
export const archiveTask = async (taskId) => {
    const response = await api.delete(`/tasks/tasks/${taskId}`);
    return response.data;
};

/**
 * Move a task to another board
 * @param {string} taskId
 * @param {Object} data - { boardId, position }
 */
export const moveTask = async (taskId, data) => {
    const response = await api.patch(`/tasks/tasks/${taskId}/move`, data);
    return response.data;
};
