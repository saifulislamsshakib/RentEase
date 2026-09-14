import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueDate: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    termsAndConditions: {
      type: String,
      default: "",
    },

    status: {
      type: String,

      enum: ["Pending Deposit", "Active", "Expired", "Renewed", "Terminated"],

      default: "Pending Deposit",
    },
  },

  {
    timestamps: true,
  },
);

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
