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

router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createComplaint,
);

router.get("/my", isAuthenticated, authorizeRoles("tenant"), getMyComplaints);

router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerComplaints,
);

router.put(
  "/:complaintId/status",
  isAuthenticated,
  authorizeRoles("owner", "admin"),
  updateComplaintStatus,
);

router.get(
  "/admin",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllComplaints,
);

export default router;
