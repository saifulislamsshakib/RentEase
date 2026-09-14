import express from "express";

import {
  createContract,
  getMyContracts,
  getOwnerContracts,
  getSingleContract,
  updateContractStatus,
  deleteContract,
} from "../controllers/contractController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// TENANT
// ==========================================

// Get logged-in tenant's contracts
router.get(
  "/my-contracts",
  isAuthenticated,
  authorizeRoles("tenant"),
  getMyContracts,
);

// ==========================================
// OWNER
// ==========================================

// Get owner's contracts
router.get(
  "/owner/contracts",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerContracts,
);

// ==========================================
// CREATE CONTRACT
// ==========================================

router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("owner"),
  createContract,
);

// ==========================================
// UPDATE CONTRACT STATUS
// ==========================================

router.put(
  "/:contractId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateContractStatus,
);

// ==========================================
// DELETE CONTRACT
// ==========================================

router.delete(
  "/:contractId",
  isAuthenticated,
  authorizeRoles("owner"),
  deleteContract,
);

// ==========================================
// GET SINGLE CONTRACT
// IMPORTANT: Keep this route LAST
// ==========================================

router.get("/:contractId", isAuthenticated, getSingleContract);

export default router;
