import Application from "../models/applicationModel.js";
import Property from "../models/propertyModel.js";
import { createNotification } from "./notificationController.js";

// =====================================================
// CREATE APPLICATION - TENANT
// =====================================================

export const createApplication = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const { preferredStartDate, rentalDuration, message } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (!preferredStartDate) {
      return res.status(400).json({
        success: false,
        message: "Preferred start date is required",
      });
    }

    if (!rentalDuration) {
      return res.status(400).json({
        success: false,
        message: "Rental duration is required",
      });
    }

    const duration = Number(rentalDuration);

    if (!Number.isInteger(duration) || duration < 1 || duration > 120) {
      return res.status(400).json({
        success: false,
        message: "Rental duration must be between 1 and 120 months",
      });
    }

    // -------------------------------------------------
    // Validate date
    // -------------------------------------------------

    const startDate = new Date(preferredStartDate);

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred start date",
      });
    }

    // -------------------------------------------------
    // Check property exists
    // -------------------------------------------------

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // -------------------------------------------------
    // Check property availability
    // -------------------------------------------------

    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This property is not available",
      });
    }

    // -------------------------------------------------
    // Check existing application
    // -------------------------------------------------

    const existingApplication = await Application.findOne({
      property: propertyId,
      tenant: req.user._id,
    });

    // -------------------------------------------------
    // Pending or approved application already exists
    // -------------------------------------------------

    if (
      existingApplication &&
      ["pending", "approved"].includes(existingApplication.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "You already have an active application for this property",
      });
    }

    // -------------------------------------------------
    // Reuse rejected/cancelled application
    // -------------------------------------------------

    if (
      existingApplication &&
      ["cancelled", "rejected"].includes(existingApplication.status)
    ) {
      existingApplication.status = "pending";
      existingApplication.preferredStartDate = startDate;
      existingApplication.rentalDuration = duration;
      existingApplication.message = message?.trim() || "";

      await existingApplication.save();

      // Notify owner
      await createNotification({
        recipient: property.owner,
        sender: req.user._id,
        type: "application_submitted",
        message: `A tenant submitted an application for your property: ${property.title}`,
        property: property._id,
        application: existingApplication._id,
      });

      return res.status(200).json({
        success: true,
        message: "Application submitted successfully",
        application: existingApplication,
      });
    }

    // -------------------------------------------------
    // Create new application
    // -------------------------------------------------

    const application = await Application.create({
      property: propertyId,
      tenant: req.user._id,
      preferredStartDate: startDate,
      rentalDuration: duration,
      message: message?.trim() || "",
    });

    // -------------------------------------------------
    // Notify property owner
    // -------------------------------------------------

    await createNotification({
      recipient: property.owner,
      sender: req.user._id,
      type: "application_submitted",
      message: `A tenant submitted an application for your property: ${property.title}`,
      property: property._id,
      application: application._id,
    });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.log("Create application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET MY APPLICATIONS - TENANT
// =====================================================

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      tenant: req.user._id,
    })
      .populate(
        "property",
        "title description propertyType address city rent bedrooms bathrooms images isAvailable",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.log("Get my applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET APPLICATIONS FOR A PROPERTY - OWNER
// =====================================================

export const getPropertyApplications = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find property
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own property",
      });
    }

    // Get applications
    const applications = await Application.find({
      property: propertyId,
    })
      .populate("tenant", "name email phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.log("Get property applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE APPLICATION STATUS - OWNER
// =====================================================

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    // Find application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Find property
    const property = await Property.findById(application.property);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own property",
      });
    }

    // Only pending applications
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be approved or rejected",
      });
    }

    // Update application
    application.status = status;

    await application.save();

    // -------------------------------------------------
    // Notify tenant
    // -------------------------------------------------

    await createNotification({
      recipient: application.tenant,
      sender: req.user._id,
      type:
        status === "approved" ? "application_approved" : "application_rejected",
      message:
        status === "approved"
          ? `Your application for ${property.title} has been approved.`
          : `Your application for ${property.title} has been rejected.`,
      property: property._id,
      application: application._id,
    });

    // -------------------------------------------------
    // If approved
    // -------------------------------------------------

    if (status === "approved") {
      // Property becomes unavailable
      property.isAvailable = false;

      await property.save();

      // Reject other pending applications
      const otherApplications = await Application.find({
        property: property._id,
        _id: { $ne: application._id },
        status: "pending",
      });

      for (const otherApplication of otherApplications) {
        otherApplication.status = "rejected";

        await otherApplication.save();

        await createNotification({
          recipient: otherApplication.tenant,
          sender: req.user._id,
          type: "application_rejected",
          message: `Your application for ${property.title} has been rejected because another application was approved.`,
          property: property._id,
          application: otherApplication._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application,
    });
  } catch (error) {
    console.log("Update application status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET OWNER APPLICATIONS
// =====================================================

export const getOwnerApplications = async (req, res) => {
  try {
    // Find owner's properties
    const properties = await Property.find({
      owner: req.user._id,
    });

    // Property IDs
    const propertyIds = properties.map((property) => property._id);

    // Find applications
    const applications = await Application.find({
      property: { $in: propertyIds },
    })
      .populate("property", "title address city rent isAvailable")
      .populate("tenant", "name email phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.log("Get owner applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// CANCEL APPLICATION - TENANT
// =====================================================

export const cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Check tenant
    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own application",
      });
    }

    // Only pending applications
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be cancelled",
      });
    }

    // Cancel
    application.status = "cancelled";

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application cancelled successfully",
      application,
    });
  } catch (error) {
    console.log("Cancel application error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET ALL APPLICATIONS - ADMIN
// =====================================================

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("property", "title address city rent isAvailable")
      .populate("tenant", "name email phone address")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.log("Get all applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
