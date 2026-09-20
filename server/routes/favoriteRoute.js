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

router.post(
  "/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  addFavorite,
);

router.get("/", isAuthenticated, authorizeRoles("tenant"), getMyFavorites);

router.delete(
  "/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  removeFavorite,
);

export default router;
