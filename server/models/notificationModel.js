import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "application_submitted",
        "application_approved",
        "application_rejected",
        "application_cancelled",
        "booking_created",
        "booking_approved",
        "booking_rejected",
        "booking_cancelled",
      ],
      required: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Related property
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    // Related application
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    // Related booking
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
