import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
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

    // security_deposit or rent
    type: {
      type: String,
      enum: ["security_deposit", "rent"],
      default: "rent",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    paidDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "mobile_banking", "card", "other"],
      default: "other",
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================
// INDEXES
// =====================================================

paymentSchema.index({
  contract: 1,
  dueDate: 1,
});

paymentSchema.index({
  tenant: 1,
  status: 1,
});

paymentSchema.index({
  owner: 1,
  status: 1,
});

paymentSchema.index({
  contract: 1,
  type: 1,
});

// =====================================================
// MODEL
// =====================================================

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
