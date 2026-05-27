import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import * as notificationService from "./notification.service.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getMyNotifications({
        userId: req.user._id,
        query: req.query,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

export const markNotificationRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markNotificationRead({
        notificationId: req.params.notificationId,
        userId: req.user._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, notification, "Notification marked as read"));
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllNotificationsRead(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Notifications marked as read"));
});
