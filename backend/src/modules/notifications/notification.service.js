import ApiError from "../../utils/ApiError.js";
import { emitNotificationNew } from "../../realtime/socket.emitters.js";
import * as notificationRepository from "./notification.repository.js";

const toId = (value) => value?.toString();

export const notifyUser = async ({
    userId,
    type,
    message,
    relatedTask = null,
    relatedWorkspace = null,
    triggeredBy = null,
}) => {
    if (!userId || !type || !message) {
        throw new ApiError(400,"Notification user, type and message are required");
    }

    if (triggeredBy && toId(userId) === toId(triggeredBy)) {
        return null;
    }

    const notification = await notificationRepository.createNotification({
        user: userId,
        type,
        message,
        relatedTask,
        relatedWorkspace,
        triggeredBy,
    });

    emitNotificationNew({
        userId,
        notification,
    });

    return notification;
};

export const getMyNotifications = async ({ userId, query }) => {
    const limit = Math.min(Number(query.limit) || 20, 50);
    const unreadOnly = query.unreadOnly === "true";

    const [notifications, unreadCount] = await Promise.all([
        notificationRepository.findNotificationsByUser({
            userId,
            limit,
            unreadOnly,
        }),
        notificationRepository.countUnreadByUser(userId),
    ]);

    return {
        notifications,
        unreadCount,
    };
};

export const markNotificationRead = async ({ notificationId, userId }) => {
    const notification = await notificationRepository.markNotificationAsRead({
        notificationId,
        userId,
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return notification;
};

export const markAllNotificationsRead = async (userId) => {
    await notificationRepository.markAllNotificationsAsRead(userId);

    return {
        success: true,
    };
};
