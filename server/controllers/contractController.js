import Contract from "../models/contractModel.js";
import Property from "../models/propertyModel.js";
import Application from "../models/applicationModel.js";
import Payment from "../models/paymentModel.js";
import { createNotification } from "./notificationController.js";

// =====================================================
// CREATE CONTRACT - OWNER
// =====================================================

export const createContract = async (req, res) => {
  try {
    const {
      tenant,
      property,
      application,
      booking,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit,
      dueDate,
      termsAndConditions,
    } = req.body;

    // -------------------------------------------------
    // Validate required information
    // -------------------------------------------------

    if (
      !tenant ||
      !property ||
      !startDate ||
      !endDate ||
      !monthlyRent ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required contract information",
      });
    }

    // -------------------------------------------------
    // Find property
    // -------------------------------------------------

    const propertyData = await Property.findById(property);

    if (!propertyData) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // -------------------------------------------------
    // Check property owner
    // -------------------------------------------------

    if (propertyData.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create a contract for this property",
      });
    }

    // -------------------------------------------------
    // Check approved application
    // -------------------------------------------------

    if (!application) {
      return res.status(400).json({
        success: false,
        message: "An approved application is required to create a contract",
      });
    }

    const applicationData = await Application.findById(application);

    if (!applicationData) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // -------------------------------------------------
    // Application must be approved
    // -------------------------------------------------

    if (applicationData.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved applications can be used to create a contract",
      });
    }

    // -------------------------------------------------
    // Verify application belongs to property
    // -------------------------------------------------

    if (applicationData.property.toString() !== property.toString()) {
      return res.status(400).json({
        success: false,
        message: "Application does not belong to this property",
      });
    }

    // -------------------------------------------------
    // Verify application belongs to tenant
    // -------------------------------------------------

    if (applicationData.tenant.toString() !== tenant.toString()) {
      return res.status(400).json({
        success: false,
        message: "Application does not belong to this tenant",
      });
    }

    // -------------------------------------------------
    // Check active/pending contract
    // -------------------------------------------------

    const existingContract = await Contract.findOne({
      tenant,
      property,
      status: {
        $in: ["Pending Deposit", "Active"],
      },
    });

    if (existingContract) {
      return res.status(400).json({
        success: false,
        message: "A pending or active contract already exists for this tenant",
      });
    }

    // -------------------------------------------------
    // Validate dates
    // -------------------------------------------------

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid contract dates",
      });
    }

    if (parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // -------------------------------------------------
    // Validate monthly rent
    // -------------------------------------------------

    if (Number(monthlyRent) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Monthly rent must be greater than zero",
      });
    }

    // -------------------------------------------------
    // Security deposit
    // -------------------------------------------------

    const deposit = Number(securityDeposit || 0);

    if (deposit < 0) {
      return res.status(400).json({
        success: false,
        message: "Security deposit cannot be negative",
      });
    }

    // -------------------------------------------------
    // Create contract
    // -------------------------------------------------

    /*
      Contract is NOT Active immediately.

      If security deposit > 0:
        status = Pending Deposit

      If security deposit = 0:
        status = Active
    */

    const contractStatus = deposit > 0 ? "Pending Deposit" : "Active";

    // -------------------------------------------------
    // Property becomes unavailable
    // -------------------------------------------------

    propertyData.isAvailable = false;
    await propertyData.save();

    const contract = await Contract.create({
      tenant,

      owner: req.user._id,

      property,

      application: application || null,

      booking: booking || null,

      startDate: parsedStartDate,

      endDate: parsedEndDate,

      monthlyRent: Number(monthlyRent),

      securityDeposit: deposit,

      dueDate: Number(dueDate),

      termsAndConditions: termsAndConditions || "",

      status: contractStatus,
    });

    // -------------------------------------------------
    // If security deposit required,
    // automatically create pending deposit payment
    // -------------------------------------------------

    if (deposit > 0) {
      await Payment.create({
        contract: contract._id,

        property: propertyData._id,

        tenant,

        owner: req.user._id,

        type: "security_deposit",

        amount: deposit,

        /*
          Security deposit should be paid
          before rental start date.
        */

        dueDate: parsedStartDate,

        paymentMethod: "other",

        reference: "",

        note: "Security deposit required before contract activation.",

        status: "pending",

        paidDate: null,
      });
    }

    // -------------------------------------------------
    // Populate contract
    // -------------------------------------------------

    await contract.populate([
      {
        path: "tenant",
        select: "name email",
      },

      {
        path: "owner",
        select: "name email",
      },

      {
        path: "property",
        select: "title address city rent",
      },

      {
        path: "application",
      },
    ]);

    // -------------------------------------------------
    // Notify tenant
    // -------------------------------------------------

    try {
      await createNotification({
        recipient: tenant,

        sender: req.user._id,

        type: "contract_created",

        message:
          deposit > 0
            ? `A rental contract has been created for ${propertyData.title}. Please pay the security deposit of ${deposit} before the contract becomes active.`
            : `A rental contract has been created for ${propertyData.title}.`,

        property,
      });
    } catch (notificationError) {
      console.log("Contract notification error:", notificationError.message);
    }

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        deposit > 0
          ? "Rental contract created. Waiting for security deposit payment."
          : "Rental contract created successfully.",

      contract,
    });
  } catch (error) {
    console.log("Create contract error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET MY CONTRACTS - TENANT
// =====================================================

export const getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      tenant: req.user._id,
    })
      .populate("owner", "name email")
      .populate("property", "title address city images rent")
      .populate("application")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      contracts,
    });
  } catch (error) {
    console.log("Get tenant contracts error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET OWNER CONTRACTS
// =====================================================

export const getOwnerContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      owner: req.user._id,
    })
      .populate("tenant", "name email")
      .populate("property", "title address city images rent")
      .populate("application")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      contracts,
    });
  } catch (error) {
    console.log("Get owner contracts error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE CONTRACT
// =====================================================

export const getSingleContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId)
      .populate("tenant", "name email phone")
      .populate("owner", "name email phone")
      .populate("property", "title address city images rent")
      .populate("application")
      .populate("booking");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    const userId = req.user._id.toString();

    if (
      contract.tenant._id.toString() !== userId &&
      contract.owner._id.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this contract",
      });
    }

    return res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    console.log("Get single contract error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE CONTRACT STATUS - OWNER
// =====================================================

export const updateContractStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending Deposit",
      "Active",
      "Expired",
      "Renewed",
      "Terminated",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contract status",
      });
    }

    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // -------------------------------------------------
    // Owner authorization
    // -------------------------------------------------

    if (contract.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this contract",
      });
    }

    // -------------------------------------------------
    // Prevent manual activation before deposit
    // -------------------------------------------------

    if (status === "Active" && contract.securityDeposit > 0) {
      const depositPayment = await Payment.findOne({
        contract: contract._id,

        type: "security_deposit",

        status: "paid",
      });

      if (!depositPayment) {
        return res.status(400).json({
          success: false,
          message:
            "Security deposit must be paid and confirmed before the contract can become Active.",
        });
      }
    }

    // -------------------------------------------------
    // Update contract status
    // -------------------------------------------------

    contract.status = status;

    await contract.save();

    // -------------------------------------------------
    // IMPORTANT:
    // If contract is Terminated,
    // property becomes available again.
    // -------------------------------------------------

    if (status === "Terminated") {
      await Property.findByIdAndUpdate(contract.property, {
        isAvailable: true,
      });
    }

    // -------------------------------------------------
    // Notify tenant
    // -------------------------------------------------

    try {
      await createNotification({
        recipient: contract.tenant,

        sender: req.user._id,

        type: "contract_created",

        message: `Your rental contract status has been updated to ${status}.`,

        property: contract.property,
      });
    } catch (notificationError) {
      console.log(
        "Contract status notification error:",
        notificationError.message,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Contract status updated successfully",
      contract,
    });
  } catch (error) {
    console.log("Update contract status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE CONTRACT
// =====================================================

export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // -------------------------------------------------
    // Owner authorization
    // -------------------------------------------------

    if (contract.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this contract",
      });
    }

    // -------------------------------------------------
    // Delete related payments
    // -------------------------------------------------

    await Payment.deleteMany({
      contract: contract._id,
    });

    // -------------------------------------------------
    // Delete contract
    // -------------------------------------------------

    await contract.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Contract deleted successfully",
    });
  } catch (error) {
    console.log("Delete contract error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
