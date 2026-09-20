import Booking from "../models/bookingModel.js";
import Property from "../models/propertyModel.js";
import { createNotification } from "./notificationController.js";

export const createBooking = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { visitDate, message } = req.body;

    if (!visitDate) {
      return res.status(400).json({
        success: false,
        message: "Visit date is required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This property is not available",
      });
    }

    const selectedDate = new Date(visitDate);

    if (selectedDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Visit date must be in the future",
      });
    }

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

    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user._id,
      visitDate: selectedDate,
      message,
    });

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

export const getOwnerBookings = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user._id,
    });

    const propertyIds = properties.map((property) => property._id);

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

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const property = await Property.findById(booking.property);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update bookings for your own property",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be approved or rejected",
      });
    }

    booking.status = status;
    await booking.save();

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

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be cancelled",
      });
    }

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
