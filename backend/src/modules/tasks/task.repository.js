import Task from "../../models/Tasks.js";

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
    const task = await Task.create({
        workspace: workspaceId,
        board: boardId,
        title,
        description,
        assignee,
        createdBy,
        position,
        dueDate,
        labels,
        priority
    });

    return await Task.findById(task._id)
        .populate("assignee", "name email avatar")
        .populate("createdBy", "name email avatar")
        .populate("board", "name")
        .populate("workspace", "name");
}


export const updateTask = async ({
    taskId,
    updateData,
}) => {
    return await Task.findByIdAndUpdate(
        taskId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    )
    .populate("assignee", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("board", "name")
    .populate("workspace", "name");
}

export const getTaskById = async (taskId) => {
    return await Task.findOne({ _id: taskId, isArchived: false })
        .populate("board", "name")
        .populate("workspace", "name")
        .populate("assignee", "name email avatar")
        .populate("createdBy", "name email avatar");
}

export const getTasksByBoard = async ({ boardId }) => {
    return await Task.find({ board: boardId, isArchived: false })
        .sort({ position: 1 })
        .populate("board", "name")
        .populate("assignee", "name email avatar")
        .populate("createdBy", "name email avatar");
}

export const findTaskByIdRaw = async (taskId) => {
    return await Task.findOne({
        _id: taskId,
        isArchived: false,
    });
};

export const archiveTask = async ({ taskId }) => {
    return await Task.findByIdAndUpdate(
        taskId,
        { isArchived: true },
        { new: true }
    );
};

export const updateTaskPosition = async (taskId, position, boardId) => {
    const update = { position };
    if (boardId) {
        update.board = boardId;
    }
    return await Task.findByIdAndUpdate(
        taskId,
        update,
        {
            new: true,
            runValidators: true,
        }
    );
}

export const bulkUpdateTaskPositions = async (updates) => {
    const bulkOperations = updates.map((task) => ({
        updateOne: {
            filter: { _id: task.taskId },
            update: { position: task.position },
        },
    }));

    return await Task.bulkWrite(bulkOperations);
}

export const updateTaskAssignee = async ({ taskId, assignee }) => {
    return await Task.findByIdAndUpdate(
        taskId,
        { assignee },
        {
            new: true,
            runValidators: true,
        }
    );
}

export const updateTaskLabels = async ({ taskId, labels }) => {
    return await Task.findByIdAndUpdate(
        taskId,
        { labels },
        {
            new: true,
            runValidators: true,
        }
    );
}

export const updateTaskPriority = async (taskId, priority) => {
    return await Task.findByIdAndUpdate(
        taskId,
        { priority },
        {
            new: true,
            runValidators: true,
        }
    );
}

export const countTasksInBoard = async (boardId) => {
    return await Task.countDocuments({ board: boardId, isArchived: false });
}

export const findTasksWithFIlters = async ({
    filters,
    skip = 0,
    limit = 10,
    sort = { createdAt: -1 }
}) => {
    return await Task.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("board", "name")
        .populate("workspace", "name")
        .populate("assignee", "name email avatar")
        .populate("createdBy", "name email avatar");
}

export const countFilteredTasks = async (filters) => {
    return await Task.countDocuments(filters);
}

export const deleteTaskPermanently = async (taskId) => {
    return await Task.findByIdAndDelete(taskId);
};
