import express from "express";

import {
  getAllUsers,
  getSingleUser,
  toggleUserStatus,
  deleteUser,
  getAllPropertiesAdmin,
  getAllApplicationsAdmin,
  getAdminReports,
} from "../controllers/adminController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", isAuthenticated, authorizeRoles("admin"), getAllUsers);

router.get(
  "/users/:userId",
  isAuthenticated,
  authorizeRoles("admin"),
  getSingleUser,
);

router.put(
  "/users/:userId/status",
  isAuthenticated,
  authorizeRoles("admin"),
  toggleUserStatus,
);

router.delete(
  "/users/:userId",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser,
);

router.get(
  "/properties",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllPropertiesAdmin,
);

router.get(
  "/applications",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllApplicationsAdmin,
);

router.get(
  "/reports",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminReports,
);

export default router;
