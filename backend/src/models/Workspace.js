import mongoose from "mongoose";

const workspacememberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
    },

    joinedAt: {
        type: Date,
        default: Date.now,

    },


},
    {
        _id: false,
        timestamps: true,

    }

);

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "workspace name is required"],
        trim: true,
        minlength: [2, "name must be atlast 2 characters"],
        maxlength: [50, "name cannot be more than 50 characters"],

    },
    slug: {
        type: String,

    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [250, "description cannot be more than 250 characters"],
        default: "",
    },
    members: [workspacememberSchema],
    default: [],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },

},
    {
        timestamps: true,
        versionKey: false,

    }
);

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ "members.user": 1 });

workspaceSchema.methods.isMember = function (userId) {
    return this.members.some((member) => member.user.toString() === userId.toString());
};

workspaceSchema.methods.getMemberRole = function (userId) {
    const member = this.members.find((member) => member.user.toString() === userId.toString());
    return member?.role;
};



const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;
