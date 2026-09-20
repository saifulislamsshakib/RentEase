import express from "express";

import {
  getAdminDashboardStats,
  getOwnerDashboardStats,
  getTenantDashboardStats,
} from "../controllers/dashboardController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminDashboardStats,
);

router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerDashboardStats,
);

router.get(
  "/tenant",
  isAuthenticated,
  authorizeRoles("tenant"),
  getTenantDashboardStats,
);

export default router;
