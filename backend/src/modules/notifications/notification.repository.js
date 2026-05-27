import Notification from "../../models/Notification.js";

export const createNotification = async (data) => {
    const notification = await Notification.create(data);

    return await Notification.findById(notification._id)
        .populate("triggeredBy", "name email avatar")
        .populate("relatedTask", "title status priority")
        .populate("relatedWorkspace", "name");
};

export const findNotificationsByUser = async ({ userId, limit = 20, unreadOnly = false }) => {
    const filters = {
        user: userId,
    };

    if (unreadOnly) {
        filters.isRead = false;
    }

    return await Notification.find(filters)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("triggeredBy", "name email avatar")
        .populate("relatedTask", "title status priority")
        .populate("relatedWorkspace", "name");
};

export const countUnreadByUser = async (userId) => {
    return await Notification.countDocuments({
        user: userId,
        isRead: false,
    });
};

export const markNotificationAsRead = async ({ notificationId, userId }) => {
    return await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            user: userId,
        },
        {
            isRead: true,
            readAt: new Date(),
        },
        {
            new: true,
        }
    )
        .populate("triggeredBy", "name email avatar")
        .populate("relatedTask", "title status priority")
        .populate("relatedWorkspace", "name");
};

export const markAllNotificationsAsRead = async (userId) => {
    return await Notification.updateMany(
        {
            user: userId,
            isRead: false,
        },
        {
            isRead: true,
            readAt: new Date(),
        }
    );
};
