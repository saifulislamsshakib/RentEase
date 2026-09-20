import Complaint from "../models/complaintModel.js";
import Contract from "../models/contractModel.js";
import Property from "../models/propertyModel.js";
import { createNotification } from "./notificationController.js";

export const createComplaint = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const { subject, description, complaintDate, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const contract = await Contract.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: "Active",
    }).populate("owner", "name email");

    if (!contract) {
      return res.status(403).json({
        success: false,
        message:
          "You need an active rental contract for this property to submit a complaint",
      });
    }

    const complaint = await Complaint.create({
      property: propertyId,
      contract: contract._id,
      tenant: req.user._id,
      owner: contract.owner._id,
      subject,
      description,
      complaintDate: complaintDate || new Date(),
      priority: priority || "Medium",
      status: "Pending",
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .populate("owner", "name email");

    try {
      await createNotification({
        recipient: contract.owner._id,
        sender: req.user._id,
        type: "complaint_created",
        message: `New complaint submitted: ${subject}`,
        property: propertyId,
      });
    } catch (notificationError) {
      console.error("Complaint notification error:", notificationError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: populatedComplaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      tenant: req.user._id,
    })
      .populate("property")
      .populate("contract")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Get my complaints error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      owner: req.user._id,
    })
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Get owner complaints error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Get all complaints error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const { status, ownerNote } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Resolved", "Closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const isOwner = complaint.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this complaint",
      });
    }

    complaint.status = status;

    if (ownerNote !== undefined) {
      complaint.ownerNote = ownerNote;
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .populate("owner", "name email");

    try {
      await createNotification({
        recipient: complaint.tenant,
        sender: req.user._id,
        type: "complaint_updated",
        message: `Your complaint "${complaint.subject}" is now ${status}.`,
        property: complaint.property,
      });
    } catch (notificationError) {
      console.error(
        "Complaint update notification error:",
        notificationError.message,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error("Update complaint error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
