import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import * as boardRepository from "./board.repository.js";
import * as workspaceRepository from "../workspaces/workspace.repository.js";

import asyncHandler from "../../utils/asyncHandler.js";

export const boardAccess = asyncHandler(async (req, res, next) => {
    const { boardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
        throw new ApiError(400, "Invalid board ID");
    }

    const board = await boardRepository.findBoardByIdRaw(boardId);

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    // To authorize board access, we must check membership in its parent workspace
    const workspace = await workspaceRepository.findWorkspaceByIdRaw(board.workspace);

    if (!workspace) {
        throw new ApiError(404, "Parent workspace not found");
    }

    const member = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
        throw new ApiError(403, "You are not a member of the workspace containing this board");
    }

    // Attach both to request for downstream use (like RBAC)
    req.board = board;
    req.workspace = workspace;
    req.workspaceMember = member;
    next();
});
