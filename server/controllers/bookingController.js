import Booking from "../models/bookingModel.js";
import Property from "../models/propertyModel.js";
import { createNotification } from "./notificationController.js";

// Create Property Visit Booking - Tenant
export const createBooking = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { visitDate, message } = req.body;

    // Check visit date
    if (!visitDate) {
      return res.status(400).json({
        success: false,
        message: "Visit date is required",
      });
    }

    // Check property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check property availability
    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This property is not available",
      });
    }

    // Check if visit date is in the past
    const selectedDate = new Date(visitDate);

    if (selectedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Visit date must be in the future",
      });
    }

    // Check duplicate pending booking
    const existingBooking = await Booking.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: "pending",
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending booking for this property",
      });
    }

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user._id,
      visitDate: selectedDate,
      message,
    });
    // Notify property owner
    await createNotification({
      recipient: property.owner,
      sender: req.user._id,
      type: "booking_created",
      message: `A tenant requested a visit for your property: ${property.title}`,
      property: property._id,
      booking: booking._id,
    });
    res.status(201).json({
      success: true,
      message: "Property visit booking created successfully",
      booking,
    });
  } catch (error) {
    console.log("Create booking error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get My Bookings - Tenant

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      tenant: req.user._id,
    })
      .populate(
        "property",
        "title description propertyType address city rent bedrooms bathrooms images isAvailable",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log("Get my bookings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get All Bookings for Owner

export const getOwnerBookings = async (req, res) => {
  try {
    // Find all properties of logged-in owner
    const properties = await Property.find({
      owner: req.user._id,
    });

    // Get property IDs
    const propertyIds = properties.map((property) => property._id);

    // Find bookings for owner's properties
    const bookings = await Booking.find({
      property: { $in: propertyIds },
    })
      .populate("property", "title address city rent images isAvailable")
      .populate("tenant", "name email phone address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log("Get owner bookings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Update Booking Status - Owner

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Find property
    const property = await Property.findById(booking.property);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check property owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update bookings for your own property",
      });
    }

    // Only pending booking can be updated
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be approved or rejected",
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Notify tenant
    await createNotification({
      recipient: booking.tenant,
      sender: req.user._id,
      type: status === "approved" ? "booking_approved" : "booking_rejected",
      message:
        status === "approved"
          ? `Your visit booking for ${property.title} has been approved.`
          : `Your visit booking for ${property.title} has been rejected.`,
      property: property._id,
      booking: booking._id,
    });

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    console.log("Update booking status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cancel Booking - Tenant

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check booking belongs to logged-in tenant
    if (booking.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own booking",
      });
    }

    // Only pending bookings can be cancelled
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled",
      });
    }

    // Cancel booking
    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.log("Cancel booking error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get All Bookings - Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("property", "title address city rent images isAvailable")
      .populate("tenant", "name email phone address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log("Get all bookings error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
