import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "TASK_ASSIGNED",
                "TASK_UPDATED",
                "COMMENT_ADDED",
                "WORKSPACE_INVITE",
                "TASK_COMPLETED",
            ],
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: [300, "Message too long"],
        },

        relatedTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null,
        },

        relatedWorkspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            default: null,
        },

        triggeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);



notificationSchema.index({
    user: 1,
    isRead: 1,
});

notificationSchema.index({
    createdAt: -1,
});




notificationSchema.methods.markAsRead =
    async function () {
        this.isRead = true;
        this.readAt = new Date();

        return await this.save();
    };

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;