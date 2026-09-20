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

router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  upload.array("images", 5),
  createMaintenance,
);

router.get("/my", isAuthenticated, authorizeRoles("tenant"), getMyMaintenance);

router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerMaintenance,
);

router.put(
  "/:maintenanceId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateMaintenanceStatus,
);

router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllMaintenance,
);

export default router;
