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

router.post("/register", register);

router.post("/login", login);

router.get("/profile", isAuthenticated, getProfile);

router.put("/profile", isAuthenticated, updateProfile);

router.put("/change-password", isAuthenticated, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.put(
  "/:userId/status",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserStatus,
);

router.delete("/:userId", isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
