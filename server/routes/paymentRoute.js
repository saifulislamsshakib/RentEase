import express from "express";

import {
  createPayment,
  submitSecurityDeposit,
  getMyPayments,
  getOwnerPayments,
  getAllPayments,
  updatePayment,
} from "../controllers/paymentController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================================
// TENANT
// =====================================================

// Get my payments
router.get("/my", isAuthenticated, authorizeRoles("tenant"), getMyPayments);

// Submit security deposit
router.post(
  "/security-deposit/:contractId",
  isAuthenticated,
  authorizeRoles("tenant"),
  submitSecurityDeposit,
);

// =====================================================
// OWNER
// =====================================================

// Get owner payments
router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerPayments,
);

// Create normal rent payment
router.post(
  "/create/:contractId",
  isAuthenticated,
  authorizeRoles("owner"),
  createPayment,
);

// Update payment / confirm security deposit
router.put(
  "/:paymentId",
  isAuthenticated,
  authorizeRoles("owner"),
  updatePayment,
);

// =====================================================
// ADMIN
// =====================================================

router.get("/admin", isAuthenticated, authorizeRoles("admin"), getAllPayments);

export default router;
