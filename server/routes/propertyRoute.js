import express from "express";

import {
  createProperty,
  deleteProperty,
  deletePropertyImage,
  getAllProperties,
  getAllPropertiesAdmin,
  getMyProperties,
  getSingleProperty,
  updateProperty,
} from "../controllers/propertyController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create Property With Images - Owner
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("owner"),
  upload.array("images", 5),
  createProperty,
);

// Get All Properties - Public
router.get("/", getAllProperties);

// Get All Properties - Admin
router.get(
  "/admin/all",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllPropertiesAdmin,
);

// Get My Properties - Owner
router.get(
  "/my-properties",
  isAuthenticated,
  authorizeRoles("owner"),
  getMyProperties,
);

// Get Single Property - Public
router.get("/:id", getSingleProperty);

// Update Property With Images - Owner
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("owner"),
  upload.array("images", 5),
  updateProperty,
);

// Delete Property Image - Owner
router.delete(
  "/:id/image",
  isAuthenticated,
  authorizeRoles("owner"),
  deletePropertyImage,
);

// Delete Property - Owner
router.delete("/:id", isAuthenticated, authorizeRoles("owner"), deleteProperty);

export default router;
