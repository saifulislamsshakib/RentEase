import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },

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

    category: {
      type: String,
      enum: [
        "plumbing",
        "electrical",
        "appliance",
        "heating_cooling",
        "structural",
        "cleaning",
        "other",
      ],
      default: "other",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    images: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },

    ownerNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

maintenanceSchema.index({
  property: 1,
  status: 1,
});

maintenanceSchema.index({
  tenant: 1,
  status: 1,
});

maintenanceSchema.index({
  owner: 1,
  status: 1,
});

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;
