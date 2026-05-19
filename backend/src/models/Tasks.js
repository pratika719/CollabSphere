import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Title must be atleast 2 characters"],
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot be more than 500 characters"],
        default: "",
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true,
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        required: true,
        index: true,
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },

    status: {
        type: String,
        enum: ["todo", "in-progress", "completed"],
        default: "todo",
    },
    dueDate: {
        type: Date,
        default: null,
    },
    position: {
        type: Number,
        required: true,
    },
    attachments: [
        {
            type: String,

        }
    ],

    labels: [
        {
            type: String,
            trim: true,
        },
    ],

    isArchived: {
        type: Boolean,
        default: false,
    },

    completedAt: {
        type: Date,
        default: null,
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
)
taskSchema.index({
    workspace: 1,
    board: 1,
});



taskSchema.index({
    status: 1,
});

taskSchema.index({
    priority: 1,
});

taskSchema.index({
    dueDate: 1,
});



taskSchema.pre("save", function () {
    if (
        this.isModified("status") &&
        this.status === "completed"
    ) {
        this.completedAt = new Date();
    }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;