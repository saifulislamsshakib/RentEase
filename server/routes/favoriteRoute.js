import express from "express";

import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../controllers/favoriteController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Add Property to Favorites - Tenant
router.post(
  "/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  addFavorite,
);
// Get My Favorites - Tenant
router.get("/", isAuthenticated, authorizeRoles("tenant"), getMyFavorites);

// Remove Favorite - Tenant
router.delete(
  "/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  removeFavorite,
);

export default router;
