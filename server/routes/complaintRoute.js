import express from "express";

import {
  createComplaint,
  getMyComplaints,
  getOwnerComplaints,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaintController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Tenant - create complaint
router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createComplaint,
);

// Tenant - my complaints
router.get("/my", isAuthenticated, authorizeRoles("tenant"), getMyComplaints);

// Owner - complaints
router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerComplaints,
);

// Owner/Admin - update complaint status
router.put(
  "/:complaintId/status",
  isAuthenticated,
  authorizeRoles("owner", "admin"),
  updateComplaintStatus,
);

// Admin - all complaints
router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllComplaints,
);

export default router;
