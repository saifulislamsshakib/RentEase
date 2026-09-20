import express from "express";

import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my-bookings",
  isAuthenticated,
  authorizeRoles("tenant"),
  getMyBookings,
);

router.get(
  "/owner/bookings",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerBookings,
);

router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createBooking,
);

router.put(
  "/:bookingId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateBookingStatus,
);

router.put(
  "/:bookingId/cancel",
  isAuthenticated,
  authorizeRoles("tenant"),
  cancelBooking,
);

router.get(
  "/admin/bookings",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllBookings,
);
export default router;
