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

// Get My Bookings - Tenant
router.get(
  "/my-bookings",
  isAuthenticated,
  authorizeRoles("tenant"),
  getMyBookings,
);

// Get All Bookings for Owner
router.get(
  "/owner/bookings",
  isAuthenticated,
  authorizeRoles("owner"),
  getOwnerBookings,
);

// Create Property Visit Booking - Tenant
router.post(
  "/create/:propertyId",
  isAuthenticated,
  authorizeRoles("tenant"),
  createBooking,
);
// Approve or Reject Booking - Owner

router.put(
  "/:bookingId/status",
  isAuthenticated,
  authorizeRoles("owner"),
  updateBookingStatus,
);
// Cancel Booking - Tenant

router.put(
  "/:bookingId/cancel",
  isAuthenticated,
  authorizeRoles("tenant"),
  cancelBooking,
);
// Get All Bookings - Admin
router.get(
  "/admin/bookings",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllBookings,
);
export default router;
