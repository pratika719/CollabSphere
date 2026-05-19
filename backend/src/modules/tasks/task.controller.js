import * as taskServices from "./task.services.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createTask = asyncHandler(async (req, res) => {


    const { title, description, assignee, dueDate, labels, priority, position } = req.body;
    const { boardId } = req.params;
    const workspaceId = req.workspace?._id; // Set by taskAccess or workspaceAccess middleware
    const createdBy = req.user._id;

    if (!boardId || !title) {
        throw new ApiError(400, "Board id and title are required");
    }

    if (!workspaceId) {
        throw new ApiError(400, "Workspace id is required");
    }

    const task = await taskServices.createTask({
        workspaceId,
        boardId,
        title,
        description,
        assignee,
        createdBy,
        dueDate,
        labels,
        priority,
        position
    });

    if (!task) {
        throw new ApiError(500, "Failed to create task");
    }


    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

export const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    if (!taskId) {
        throw new ApiError(400, "Task id is required");
    }

    const task = await taskServices.getTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const updateData = req.body;
    if (!taskId) {
        throw new ApiError(400, "Task id is required");
    }

    const task = await taskServices.updateTask({ taskId, updateData });
    if (!task) {
        throw new ApiError(404, "Failed to update task");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

export const archiveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    if (!taskId) {
        throw new ApiError(400, "Task id is required");
    }

    const task = await taskServices.archiveTask({ taskId });
    if (!task) {
        throw new ApiError(500, "Failed to archive task");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task archived successfully"));
});

export const getTasksByBoard = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    if (!boardId) {
        throw new ApiError(400, "Board id is required");
    }

    const tasks = await taskServices.getTasksByBoard({ boardId });
    if (!tasks) {
        throw new ApiError(500, "Failed to get tasks");
    }

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const moveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { boardId, position } = req.body;

    if (!taskId) {
        throw new ApiError(400, "Task id is required");
    }

    const task = await taskServices.moveTask({ taskId, boardId, position });
    if (!task) {
        throw new ApiError(500, "Failed to move task");
    }

    return res.status(200).json(new ApiResponse(200, task, "Task moved successfully"));
});

export const reorderTasks = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const { tasks } = req.body;

    if (!boardId) {
        throw new ApiError(400, "Board id is required");
    }

    if (!tasks || !Array.isArray(tasks)) {
        throw new ApiError(400, "Tasks array is required");
    }

    const result = await taskServices.reorderTasks({ boardId, tasks });
    if (!result) {
        throw new ApiError(500, "Failed to reorder tasks");
    }

    return res.status(200).json(new ApiResponse(200, result, "Tasks reordered successfully"));
});

export const getFilteredTasks = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const tasks = await taskServices.findTasksWithFIlters({
        workspaceId,
        query: req.query
    });

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const countFilteredTasks = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const total = await taskServices.countFilteredTasks({
        workspaceId,
        query: req.query
    });

    return res.status(200).json(new ApiResponse(200, total, "Tasks counted successfully"));
});
