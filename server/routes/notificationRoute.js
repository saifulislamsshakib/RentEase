import express from "express";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get My Notifications
router.get("/", isAuthenticated, getMyNotifications);
// Mark All Notifications as Read
router.put("/read-all", isAuthenticated, markAllNotificationsAsRead);

// Mark Notification as Read
router.put("/:notificationId/read", isAuthenticated, markNotificationAsRead);

export default router;
