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

router.get("/property/:propertyId", getPropertyReviews);

router.post(
  "/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createReview,
);

router.put(
  "/:reviewId",
  isAuthenticated,
  authorizeRoles("tenant"),
  updateReview,
);

router.delete(
  "/:reviewId",
  isAuthenticated,
  authorizeRoles("tenant"),
  deleteReview,
);

export default router;
