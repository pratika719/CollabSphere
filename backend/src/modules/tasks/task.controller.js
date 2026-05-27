import * as taskServices from "./task.services.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
    emitTaskArchived,
    emitTaskCreated,
    emitTaskMoved,
    emitTaskReordered,
    emitTaskUpdated,
} from "../../realtime/socket.emitters.js";
import { notifyUser } from "../notifications/notification.service.js";

const toId = (value) => value?.toString();

const taskTitle = (task) => task?.title || "a task";

const maybeNotifyTaskAssignee = async ({
    assignee,
    type,
    message,
    task,
    workspaceId,
    actor,
}) => {
    const assigneeId = typeof assignee === "object" ? assignee?._id : assignee;

    if (!assigneeId || toId(assigneeId) === toId(actor._id)) {
        return;
    }

    await notifyUser({
        userId: assigneeId,
        type,
        message,
        relatedTask: task._id,
        relatedWorkspace: workspaceId,
        triggeredBy: actor._id,
    });
};

export const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignee, dueDate, labels, priority, position } = req.body;
    const { boardId } = req.params;
    const workspaceId = req.workspace?._id;
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
        position,
    });

    if (!task) {
        throw new ApiError(500, "Failed to create task");
    }

    emitTaskCreated({
        workspaceId,
        task,
        actor: req.user,
    });

    await maybeNotifyTaskAssignee({
        assignee,
        type: "TASK_ASSIGNED",
        message: `${req.user.name} assigned you "${taskTitle(task)}"`,
        task,
        workspaceId,
        actor: req.user,
    });

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
    const previousAssignee = req.task?.assignee;
    const previousStatus = req.task?.status;

    if (!taskId) {
        throw new ApiError(400, "Task id is required");
    }

    const task = await taskServices.updateTask({ taskId, updateData });

    if (!task) {
        throw new ApiError(404, "Failed to update task");
    }

    emitTaskUpdated({
        workspaceId: req.workspace._id,
        task,
        actor: req.user,
    });

    const nextAssignee = task.assignee?._id || task.assignee;
    const assigneeChanged =
        Object.prototype.hasOwnProperty.call(updateData, "assignee") &&
        toId(previousAssignee) !== toId(nextAssignee);

    if (assigneeChanged) {
        await maybeNotifyTaskAssignee({
            assignee: nextAssignee,
            type: "TASK_ASSIGNED",
            message: `${req.user.name} assigned you "${taskTitle(task)}"`,
            task,
            workspaceId: req.workspace._id,
            actor: req.user,
        });
    } else if (previousStatus !== "completed" && task.status === "completed") {
        await maybeNotifyTaskAssignee({
            assignee: nextAssignee,
            type: "TASK_COMPLETED",
            message: `${req.user.name} completed "${taskTitle(task)}"`,
            task,
            workspaceId: req.workspace._id,
            actor: req.user,
        });
    } else {
        await maybeNotifyTaskAssignee({
            assignee: nextAssignee,
            type: "TASK_UPDATED",
            message: `${req.user.name} updated "${taskTitle(task)}"`,
            task,
            workspaceId: req.workspace._id,
            actor: req.user,
        });
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

    emitTaskArchived({
        workspaceId: req.workspace._id,
        task,
        actor: req.user,
    });

    await maybeNotifyTaskAssignee({
        assignee: task.assignee,
        type: "TASK_ARCHIVED",
        message: `${req.user.name} archived task "${taskTitle(task)}"`,
        task,
        workspaceId: req.workspace._id,
        actor: req.user,
    });

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

    emitTaskMoved({
        workspaceId: req.workspace._id,
        task,
        actor: req.user,
    });

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

    emitTaskReordered({
        workspaceId: req.workspace._id,
        boardId,
        tasks: result,
        actor: req.user,
    });

    return res.status(200).json(new ApiResponse(200, result, "Tasks reordered successfully"));
});

export const getFilteredTasks = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const tasks = await taskServices.findTasksWithFIlters({
        workspaceId,
        query: req.query,
    });

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const countFilteredTasks = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const total = await taskServices.countFilteredTasks({
        workspaceId,
        query: req.query,
    });

    return res.status(200).json(new ApiResponse(200, total, "Tasks counted successfully"));
});
