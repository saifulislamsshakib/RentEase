import express from "express";

import {
  createReview,
  deleteReview,
  getPropertyReviews,
  updateReview,
} from "../controllers/reviewController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Reviews for Property
router.get("/property/:propertyId", getPropertyReviews);

// Create Review - Tenant
router.post(
  "/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createReview,
);
// Update Own Review - Tenant

router.put(
  "/:reviewId",
  isAuthenticated,
  authorizeRoles("tenant"),
  updateReview,
);
// Delete Own Review - Tenant

router.delete(
  "/:reviewId",
  isAuthenticated,
  authorizeRoles("tenant"),
  deleteReview,
);

export default router;
