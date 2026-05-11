import mongoose from "mongoose";

const boardMemberSchema = new mongoose.Schema({

    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Title must be atleast 2 characters"],
        maxlength: [100, "Title cannot be more than 100 characters"],
    },
    position: {
        type: Number,
        required: true,
        default: 0,
    },
    color: {
        type: String,
        default: "#FFFFFF",
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true,
        versionKey: false,
    }
)




boardSchema.index({
    workspace: 1,
    position: 1,
});

const Board = mongoose.model("Board", boardSchema);

export default Board;




