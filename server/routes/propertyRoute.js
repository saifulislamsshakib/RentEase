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

router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("owner"),
  upload.array("images", 5),
  createProperty,
);

router.get("/", getAllProperties);

router.get(
  "/admin/all",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllPropertiesAdmin,
);

router.get(
  "/my-properties",
  isAuthenticated,
  authorizeRoles("owner"),
  getMyProperties,
);

router.get("/:id", getSingleProperty);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("owner"),
  upload.array("images", 5),
  updateProperty,
);

router.delete(
  "/:id/image",
  isAuthenticated,
  authorizeRoles("owner"),
  deletePropertyImage,
);

router.delete("/:id", isAuthenticated, authorizeRoles("owner"), deleteProperty);

export default router;
