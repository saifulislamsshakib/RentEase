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

// Admin Dashboard Statistics
router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminDashboardStats,
);
// Owner Dashboard Statistics

router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerDashboardStats,
);
// Tenant Dashboard Statistics
router.get(
  "/tenant",
  isAuthenticated,
  authorizeRoles("tenant"),
  getTenantDashboardStats,
);

export default router;
