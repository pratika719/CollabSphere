import { isValidObjectId } from "mongoose";
import * as taskRepository from "./task.repository.js";
import { findBoardById } from "../boards/board.repository.js";
import { findworkspacebyid } from "../workspaces/workspace.repository.js";
import ApiError from "../../utils/ApiError.js";

export const createTask = async ({
    workspaceId,
    boardId,
    title,
    description,
    assignee,
    createdBy,
    position,
    dueDate,
    labels = [],
    priority = "medium"
}) => {
    if (!boardId || !workspaceId || !title) {
        throw new ApiError(400, "Board id, workspace id and title are required");
    }

    if (dueDate && new Date(dueDate) < Date.now()) {
        throw new ApiError(400, "Due date cannot be in the past");
    }

    const board = await findBoardById(boardId);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    if (board.workspace.toString() !== workspaceId.toString()) {
        throw new ApiError(400, "Board not found in the workspace");
    }

    const workspace = await findworkspacebyid(workspaceId);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    const isCreatorMember = workspace.members.some(
        m => (m.user._id || m.user).toString() === createdBy.toString()
    );
    if (!isCreatorMember) {
        throw new ApiError(403, "User not found in the workspace");
    }

    if (assignee) {
        if (!isValidObjectId(assignee)) {
            throw new ApiError(400, "Invalid assignee id");
        }
        const isAssigneeMember = workspace.members.some(
            m => (m.user._id || m.user).toString() === assignee.toString()
        );
        if (!isAssigneeMember) {
            throw new ApiError(400, "Assignee not found in the workspace");
        }
    }

    if (position === undefined || position === null) {
        position = await taskRepository.countTasksInBoard(boardId);
    }

    return await taskRepository.createTask({
        workspaceId,
        boardId,
        title,
        description,
        assignee,
        createdBy,
        position,
        dueDate,
        labels,
        priority
    });
}

export const updateTask = async ({
    taskId,
    updateData,
}) => {
    return await taskRepository.updateTask({
        taskId,
        updateData,
    });
}

export const getTaskById = async (taskId) => {
    if (!isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }
    const task = await taskRepository.getTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    return task;
}

export const getTasksByBoard = async ({ boardId }) => {
    return await taskRepository.getTasksByBoard({ boardId });
}

export const archiveTask = async ({ taskId }) => {
    return await taskRepository.archiveTask({ taskId });
}

export const moveTask = async ({ taskId, boardId, position }) => {
    return await taskRepository.updateTaskPosition(taskId, position, boardId);
}

export const reorderTasks = async ({ boardId, tasks }) => {
    const updates = tasks.map((task, index) => ({
        taskId: task._id || task,
        position: index,
    }));
    return await taskRepository.bulkUpdateTaskPositions(updates);
}

export const findTasksWithFIlters = async ({ workspaceId, query }) => {
    const {
        priority,
        assignee,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc"
    } = query;

    const filters = {
        workspace: workspaceId,
        isArchived: false,
    }

    if (priority) {
        filters.priority = priority;
    }
    if (assignee) {
        filters.assignee = assignee;
    }
    if (search) {
        filters.title = { $regex: search, $options: "i" };
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const sort = {
        [sortBy]: order === "asc" ? 1 : -1,
        createdAt: 1
    }

    const tasks = await taskRepository.findTasksWithFIlters({
        filters,
        skip,
        limit: limitNumber,
        sort
    });

    const total = await taskRepository.countFilteredTasks(filters);

    return {
        tasks,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    }
}

export const countFilteredTasks = async ({ workspaceId, query }) => {
    const { priority, assignee, search } = query;

    const filters = {
        workspace: workspaceId,
        isArchived: false
    }

    if (priority) {
        filters.priority = priority
    }
    if (assignee) {
        filters.assignee = assignee
    }
    if (search) {
        filters.title = { $regex: search, $options: "i" };
    }

    const total = await taskRepository.countFilteredTasks(filters);
    return { total };
}
