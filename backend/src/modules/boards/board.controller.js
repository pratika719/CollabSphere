import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import * as boardService from "./board.service.js";

export const createBoard = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const { title } = req.body;

    if (!title) {
        throw new ApiError(400, "Board title is required");
    }

    const board = await boardService.createBoard({
        workspaceId,
        title,
        createdBy: req.user._id,
    });

    return res.status(201).json(
        new ApiResponse(201, board, "Board created successfully")
    );
});

export const getWorkspaceBoards = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const boards = await boardService.getWorkspaceBoards(workspaceId);

    return res.status(200).json(
        new ApiResponse(200, boards, "Boards fetched successfully")
    );
});

export const getBoardById = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const board = await boardService.getBoardById(boardId);

    return res.status(200).json(
        new ApiResponse(200, board, "Board fetched successfully")
    );
});

export const updateBoard = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const board = await boardService.updateBoard(boardId, req.body);

    return res.status(200).json(
        new ApiResponse(200, board, "Board updated successfully")
    );
});

export const archiveBoard = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const board = await boardService.archiveBoard(boardId);

    return res.status(200).json(
        new ApiResponse(200, board, "Board archived successfully")
    );
});

export const reorderBoards = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const { boards } = req.body;

    const updatedBoards = await boardService.reorderBoards({
        workspaceId,
        boards,
    });

    return res.status(200).json(
        new ApiResponse(200, updatedBoards, "Boards reordered successfully")
    );
});
