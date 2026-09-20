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

router.get(
  "/my-contracts",
  isAuthenticated,
  authorizeRoles("tenant"),
  getMyContracts,
);

// Get owner's contracts
router.get(
  "/owner/contracts",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerContracts,
);

router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("owner"),
  createContract,
);

router.put(
  "/:contractId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateContractStatus,
);

router.delete(
  "/:contractId",
  isAuthenticated,
  authorizeRoles("owner"),
  deleteContract,
);

router.get("/:contractId", isAuthenticated, getSingleContract);

export default router;
