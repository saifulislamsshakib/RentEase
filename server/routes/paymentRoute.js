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

router.get("/my", isAuthenticated, authorizeRoles("tenant"), getMyPayments);

router.post(
  "/security-deposit/:contractId",
  isAuthenticated,
  authorizeRoles("tenant"),
  submitSecurityDeposit,
);

router.get(
  "/owner",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerPayments,
);

router.post(
  "/create/:contractId",
  isAuthenticated,
  authorizeRoles("owner"),
  createPayment,
);

router.put(
  "/:paymentId",
  isAuthenticated,
  authorizeRoles("owner"),
  updatePayment,
);

router.get("/admin", isAuthenticated, authorizeRoles("admin"), getAllPayments);

export default router;
