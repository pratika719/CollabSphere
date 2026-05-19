import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import * as boardRepository from "./board.repository.js";
import * as workspaceRepository from "../workspaces/workspace.repository.js";

export const createBoard = async ({
    workspaceId,
    title,
    createdBy,
}) => {
    const workspace = await workspaceRepository.findWorkspaceByIdRaw(workspaceId);

    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    if (workspace.isArchived) {
        throw new ApiError(400, "Workspace is archived");
    }

    const boardCount = await boardRepository.countBoardsInWorkspace(workspaceId);

    const board = await boardRepository.createBoard({
        workspace: workspaceId,
        title: title.trim(),
        createdBy,
        position: boardCount + 1,
    });

    return await boardRepository.findBoardById(board._id);
};

export const getWorkspaceBoards = async (workspaceId) => {
    const workspace = await workspaceRepository.findWorkspaceByIdRaw(workspaceId);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }
    if (workspace.isArchived) {
        throw new ApiError(400, "Workspace is archived");
    }
    return await boardRepository.findBoardByworkspace(workspaceId);
};

export const getBoardById = async (boardId) => {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
        throw new ApiError(400, "Invalid board ID");
    }
    const board = await boardRepository.findBoardById(boardId);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }
    return board;
};

export const updateBoard = async (boardId, updateData) => {
    const board = await boardRepository.findBoardById(boardId);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }
    if (board.isArchived) {
        throw new ApiError(400, "Board is archived");
    }

    delete updateData.workspace;
    delete updateData.createdBy;
    delete updateData.position;

    if (updateData.title) {
        updateData.title = updateData.title.trim();
    }
    return await boardRepository.updateBoard(boardId, updateData);
};

export const archiveBoard = async (boardId) => {
    const board = await boardRepository.findBoardById(boardId);
    if (!board) {
        throw new ApiError(404, "Board not found");
    }
    if (board.isArchived) {
        throw new ApiError(400, "Board is archived");
    }
    return await boardRepository.updateBoard(boardId, { isArchived: true });
};

export const reorderBoards = async ({
    workspaceId,
    boards,
}) => {
    if (!Array.isArray(boards)) {
        throw new ApiError(400, "Boards array is required");
    }

    for (const board of boards) {
        if (!board.boardId || board.position === undefined) {
            throw new ApiError(400, "boardId and position are required");
        }

        if (!mongoose.Types.ObjectId.isValid(board.boardId)) {
            throw new ApiError(400, "Invalid board ID");
        }

        const existingBoard = await boardRepository.findBoardByIdRaw(board.boardId);

        if (!existingBoard) {
            throw new ApiError(404, "Board not found");
        }

        if (existingBoard.workspace.toString() !== workspaceId.toString()) {
            throw new ApiError(403, "Board does not belong to this workspace");
        }
    }

    await boardRepository.bulkUpdateBoardPositions(boards);

    return await boardRepository.findBoardsByWorkspace(workspaceId);
};
