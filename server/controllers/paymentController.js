import Payment from "../models/paymentModel.js";
import Contract from "../models/contractModel.js";

import { createNotification } from "./notificationController.js";

// =====================================================
// CREATE PAYMENT - OWNER
// Used mainly for monthly rent records
// =====================================================

export const createPayment = async (req, res) => {
  try {
    const { contractId } = req.params;

    const {
      amount,
      dueDate,
      paymentMethod,
      reference,
      note,
      status,
      paidDate,
      type,
    } = req.body;

    // -------------------------------------------------
    // Find contract
    // -------------------------------------------------

    const contract = await Contract.findById(contractId)
      .populate("tenant", "name email")
      .populate("owner", "name email")
      .populate("property", "title address");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // -------------------------------------------------
    // Only owner can create normal payment record
    // -------------------------------------------------

    if (contract.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create payment for this contract",
      });
    }

    // -------------------------------------------------
    // Validate amount
    // -------------------------------------------------

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid payment amount is required",
      });
    }

    // -------------------------------------------------
    // Validate due date
    // -------------------------------------------------

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date is required",
      });
    }

    // -------------------------------------------------
    // Payment type
    // -------------------------------------------------

    const paymentType =
      type === "security_deposit" ? "security_deposit" : "rent";

    // -------------------------------------------------
    // Create payment
    // -------------------------------------------------

    const payment = await Payment.create({
      contract: contract._id,
      property: contract.property._id,
      tenant: contract.tenant._id,
      owner: contract.owner._id,

      type: paymentType,

      amount: Number(amount),
      dueDate,

      paymentMethod: paymentMethod || "other",
      reference: reference || "",
      note: note || "",

      status: status || "pending",

      paidDate: status === "paid" ? paidDate || new Date() : null,
    });

    // -------------------------------------------------
    // Populate
    // -------------------------------------------------

    const populatedPayment = await Payment.findById(payment._id)
      .populate("contract")
      .populate("property")
      .populate("tenant", "name email")
      .populate("owner", "name email phone paymentInformation");

    // -------------------------------------------------
    // Notification
    // -------------------------------------------------

    try {
      await createNotification({
        recipient: contract.tenant._id,

        sender: req.user._id,

        type: "payment_recorded",

        message:
          paymentType === "security_deposit"
            ? `A security deposit payment of ${amount} has been recorded for ${contract.property.title}.`
            : `A rent payment of ${amount} has been recorded.`,

        property: contract.property._id,
      });
    } catch (notificationError) {
      console.error("Payment notification error:", notificationError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TENANT SUBMITS SECURITY DEPOSIT
// =====================================================
// =====================================================
// TENANT SUBMITS SECURITY DEPOSIT
// =====================================================

export const submitSecurityDeposit = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { paymentMethod, reference, note } = req.body;

    // -------------------------------------------------
    // Find contract
    // -------------------------------------------------

    const contract = await Contract.findById(contractId)
      .populate("tenant", "name email")
      .populate("owner", "name email")
      .populate("property", "title address");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // -------------------------------------------------
    // Check tenant
    // -------------------------------------------------

    if (contract.tenant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to make payment for this contract",
      });
    }

    // -------------------------------------------------
    // Security deposit required
    // -------------------------------------------------

    if (!contract.securityDeposit || Number(contract.securityDeposit) <= 0) {
      return res.status(400).json({
        success: false,
        message: "No security deposit is required for this contract",
      });
    }

    // -------------------------------------------------
    // Find the payment already created with contract
    // -------------------------------------------------

    const payment = await Payment.findOne({
      contract: contract._id,
      type: "security_deposit",
      status: {
        $in: ["pending", "overdue"],
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Security deposit payment record not found",
      });
    }

    // -------------------------------------------------
    // Update tenant payment information
    // -------------------------------------------------

    payment.paymentMethod = paymentMethod || "other";
    payment.reference = reference || "";
    payment.note = note || "";

    // Keep pending until owner verifies it
    payment.status = "pending";
    payment.paidDate = null;

    await payment.save();

    // -------------------------------------------------
    // Notify owner
    // -------------------------------------------------

    try {
      await createNotification({
        recipient: contract.owner._id,
        sender: req.user._id,
        type: "payment_recorded",
        message: `Tenant ${contract.tenant.name} has submitted the security deposit of ${contract.securityDeposit} for ${contract.property.title}. Please verify the payment.`,
        property: contract.property._id,
      });
    } catch (notificationError) {
      console.error(
        "Security deposit notification error:",
        notificationError.message,
      );
    }

    // -------------------------------------------------
    // Get updated payment
    // -------------------------------------------------

    const updatedPayment = await Payment.findById(payment._id)
      .populate("contract")
      .populate("property")
      .populate("tenant", "name email")
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      message:
        "Security deposit submitted successfully. Waiting for owner confirmation.",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Submit security deposit error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================================
// GET TENANT PAYMENTS
// =====================================================

export const getMyPayments = async (req, res) => {
  try {
    const today = new Date();

    // -------------------------------------------------
    // Mark overdue
    // -------------------------------------------------

    await Payment.updateMany(
      {
        tenant: req.user._id,

        status: "pending",

        dueDate: {
          $lt: today,
        },
      },
      {
        $set: {
          status: "overdue",
        },
      },
    );

    // -------------------------------------------------
    // Get payments
    // -------------------------------------------------

    const payments = await Payment.find({
      tenant: req.user._id,
    })
      .populate("contract")
      .populate("property")
      .populate("owner", "name email phone paymentInformation")
      .sort({
        dueDate: -1,
      });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get my payments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET OWNER PAYMENTS
// =====================================================

export const getOwnerPayments = async (req, res) => {
  try {
    const today = new Date();

    // -------------------------------------------------
    // Mark overdue
    // -------------------------------------------------

    await Payment.updateMany(
      {
        owner: req.user._id,

        status: "pending",

        dueDate: {
          $lt: today,
        },
      },
      {
        $set: {
          status: "overdue",
        },
      },
    );

    // -------------------------------------------------
    // Get payments
    // -------------------------------------------------

    const payments = await Payment.find({
      owner: req.user._id,
    })
      .populate("contract")
      .populate("property")
      .populate("tenant", "name email")
      .sort({
        dueDate: -1,
      });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get owner payments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL PAYMENTS - ADMIN
// =====================================================

export const getAllPayments = async (req, res) => {
  try {
    const today = new Date();

    await Payment.updateMany(
      {
        status: "pending",

        dueDate: {
          $lt: today,
        },
      },
      {
        $set: {
          status: "overdue",
        },
      },
    );

    const payments = await Payment.find()
      .populate("contract")
      .populate("property")
      .populate("tenant", "name email")
      .populate("owner", "name email")
      .sort({
        dueDate: -1,
      });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get all payments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PAYMENT - OWNER
// =====================================================

export const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // -------------------------------------------------
    // Find payment
    // -------------------------------------------------

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // -------------------------------------------------
    // Only owner can update
    // -------------------------------------------------

    if (payment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this payment",
      });
    }

    const {
      amount,
      dueDate,
      paymentMethod,
      reference,
      note,
      status,
      paidDate,
    } = req.body;

    // -------------------------------------------------
    // Update amount
    // -------------------------------------------------

    if (amount !== undefined) {
      if (Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Payment amount must be greater than zero",
        });
      }

      payment.amount = Number(amount);
    }

    // -------------------------------------------------
    // Update due date
    // -------------------------------------------------

    if (dueDate !== undefined) {
      payment.dueDate = dueDate;
    }

    // -------------------------------------------------
    // Update payment method
    // -------------------------------------------------

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    // -------------------------------------------------
    // Update reference
    // -------------------------------------------------

    if (reference !== undefined) {
      payment.reference = reference;
    }

    // -------------------------------------------------
    // Update note
    // -------------------------------------------------

    if (note !== undefined) {
      payment.note = note;
    }

    // -------------------------------------------------
    // Update status
    // -------------------------------------------------

    if (status !== undefined) {
      const allowedStatuses = ["pending", "paid", "overdue", "cancelled"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      payment.status = status;

      if (status === "paid") {
        payment.paidDate = paidDate || new Date();
      } else {
        payment.paidDate = null;
      }
    }

    // -------------------------------------------------
    // Save payment
    // -------------------------------------------------

    await payment.save();

    // =====================================================
    // SECURITY DEPOSIT CONFIRMED
    // Automatically activate contract
    // =====================================================

    if (payment.type === "security_deposit" && payment.status === "paid") {
      const contract = await Contract.findById(payment.contract);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: "Payment updated, but associated contract was not found",
        });
      }

      // -------------------------------------------------
      // Activate contract
      // -------------------------------------------------

      contract.status = "Active";

      await contract.save();

      // -------------------------------------------------
      // Notify tenant
      // -------------------------------------------------

      try {
        await createNotification({
          recipient: payment.tenant,

          sender: req.user._id,

          type: "payment_recorded",

          message:
            "Your security deposit has been confirmed by the property owner. Your rental contract is now Active.",

          property: payment.property,
        });
      } catch (notificationError) {
        console.error("Deposit notification error:", notificationError.message);
      }
    } else {
      // =================================================
      // NORMAL PAYMENT NOTIFICATION
      // =================================================

      try {
        await createNotification({
          recipient: payment.tenant,

          sender: req.user._id,

          type: "payment_recorded",

          message: `Your ${
            payment.type === "security_deposit"
              ? "security deposit"
              : "rent payment"
          } status has been updated to ${payment.status}.`,

          property: payment.property,
        });
      } catch (notificationError) {
        console.error("Payment notification error:", notificationError.message);
      }
    }

    // -------------------------------------------------
    // Get updated payment
    // -------------------------------------------------

    const updatedPayment = await Payment.findById(payment._id)
      .populate("contract")
      .populate("property")
      .populate("tenant", "name email")
      .populate("owner", "name email phone paymentInformation");

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Update payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
