import express from "express";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getMyNotifications);

router.put("/read-all", isAuthenticated, markAllNotificationsAsRead);

router.put("/:notificationId/read", isAuthenticated, markNotificationAsRead);

export default router;
