import ApiError from "../../utils/ApiError.js";
import mongoose from "mongoose";
import * as taskRepository from "./task.repository.js";
import * as workspaceRepository from "../workspaces/workspace.repository.js";
import * as boardRepository from "../boards/board.repository.js";

import asyncHandler from "../../utils/asyncHandler.js";

export const taskAccess = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task id");
    }

    const task = await taskRepository.findTaskByIdRaw(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const workspace = await workspaceRepository.findWorkspaceByIdRaw(task.workspace);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    const board = await boardRepository.findBoardByIdRaw(task.board);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    const member = workspace.members.find(
        (m) => (m.user._id || m.user).toString() === req.user._id.toString()
    );

    if (!member) {
        throw new ApiError(403, "User not found in the workspace");
    }

    req.task = task;
    req.workspace = workspace;
    req.workspaceMember = member;
    req.workspaceRole = member.role;

    next();
});
