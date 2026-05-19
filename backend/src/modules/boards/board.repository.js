import Board from "../../models/Board.js";

export const findBoardById = async (boardId) => {
    return await Board.findById(boardId);
};

export const findBoardByIdRaw = async (boardId) => {
    return await Board.findById(boardId);
};

export const findBoardByworkspace = async (workspaceId) => {
    return await Board.find({
        workspace: workspaceId,
        isArchived: false,
    }).sort({
        position: 1,
    }).populate({
        path: "createdBy",
        select: "name avatar"
    });
};

export const findBoardsByWorkspace = async (workspaceId) => {
    return await Board.find({
        workspace: workspaceId,
        isArchived: false,
    }).sort({
        position: 1,
    });
};

export const createBoard = async (boardData) => {
    return await Board.create(boardData);
};

export const updateBoard = async (boardId, updateData) => {
    return await Board.findByIdAndUpdate(
        boardId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    ).populate("workspace", "name");
};

export const countBoardsInWorkspace = async (workspaceId) => {
    return await Board.countDocuments({
        workspace: workspaceId,
        isArchived: false,
    });
};

export const updateBoardPosition = async (boardId, position) => {
    return await Board.findByIdAndUpdate(
        boardId,
        {
            position,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};

export const bulkUpdateBoardPositions = async (updates) => {
    const bulkOperations = updates.map((board) => ({
        updateOne: {
            filter: {
                _id: board.boardId,
            },
            update: {
                $set: {
                    position: board.position,
                },
            },
        },
    }));

    return await Board.bulkWrite(bulkOperations);
};

export const deleteBoardPermanently = async (boardId) => {
    return await Board.findByIdAndDelete(boardId);
};
