import { Router } from "express";
import { verifyJWT } from "../auth/auth.middleware.js";
import {
    getMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "./notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:notificationId/read", markNotificationRead);

export default router;
