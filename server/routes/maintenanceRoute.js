import express from "express";

import {
  createMaintenance,
  getMyMaintenance,
  getOwnerMaintenance,
  getAllMaintenance,
  updateMaintenanceStatus,
} from "../controllers/maintenanceController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Tenant - create maintenance request
router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  upload.array("images", 5),
  createMaintenance,
);

// Tenant - my maintenance requests
router.get("/my", isAuthenticated, authorizeRoles("tenant"), getMyMaintenance);

// Owner - maintenance requests
router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerMaintenance,
);

// Owner - update maintenance status
router.put(
  "/:maintenanceId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateMaintenanceStatus,
);

// Admin - all maintenance requests
router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllMaintenance,
);

export default router;
