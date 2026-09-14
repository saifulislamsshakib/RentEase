import express from "express";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updateUserStatus,
} from "../controllers/userController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";
import { deleteUser } from "../controllers/adminController.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get Profile
router.get("/profile", isAuthenticated, getProfile);

// Update Profile
router.put("/profile", isAuthenticated, updateProfile);
// Change Password
router.put("/change-password", isAuthenticated, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
// Block / Unblock User - Admin
router.put(
  "/:userId/status",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserStatus,
);
// Delete User - Admin

router.delete("/:userId", isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
