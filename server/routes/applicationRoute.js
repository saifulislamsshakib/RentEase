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

router.get(
  "/my-applications",
  isAuthenticated,
  authorizeRoles("tenant"),
  getMyApplications,
);

router.get(
  "/property/:propertyId",
  isAuthenticated,
  authorizeRoles("owner"),
  getPropertyApplications,
);

router.get(
  "/owner/applications",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerApplications,
);

router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createApplication,
);

router.put(
  "/:applicationId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateApplicationStatus,
);

router.put(
  "/:applicationId/cancel",
  isAuthenticated,
  authorizeRoles("tenant"),
  cancelApplication,
);

router.get(
  "/admin/applications",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllApplications,
);

export default router;
