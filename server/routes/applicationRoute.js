import express from "express";

import {
  cancelApplication,
  createApplication,
  getAllApplications,
  getMyApplications,
  getOwnerApplications,
  getPropertyApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get My Applications - Tenant
router.get(
  "/my-applications",
  isAuthenticated,
  authorizeRoles("tenant"),
  getMyApplications,
);

// Get Property Applications - Owner
router.get(
  "/property/:propertyId",
  isAuthenticated,
  authorizeRoles("owner"),
  getPropertyApplications,
);

// Get All Applications for Owner's Properties
router.get(
  "/owner/applications",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerApplications,
);

// Apply for Property - Tenant
router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createApplication,
);

// Approve or Reject Application - Owner
router.put(
  "/:applicationId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateApplicationStatus,
);

// Cancel Application - Tenant
router.put(
  "/:applicationId/cancel",
  isAuthenticated,
  authorizeRoles("tenant"),
  cancelApplication,
);
// Get All Applications - Admin
router.get(
  "/admin/applications",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllApplications,
);

export default router;
