import Application from "../models/applicationModel.js";
import Property from "../models/propertyModel.js";
import { createNotification } from "./notificationController.js";

export const createApplication = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const { preferredStartDate, rentalDuration, message } = req.body;

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

    const startDate = new Date(preferredStartDate);

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred start date",
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

    const existingApplication = await Application.findOne({
      property: propertyId,
      tenant: req.user._id,
    });

    if (
      existingApplication &&
      ["pending", "approved"].includes(existingApplication.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "You already have an active application for this property",
      });
    }

    if (
      existingApplication &&
      ["cancelled", "rejected"].includes(existingApplication.status)
    ) {
      existingApplication.status = "pending";
      existingApplication.preferredStartDate = startDate;
      existingApplication.rentalDuration = duration;
      existingApplication.message = message?.trim() || "";

      await existingApplication.save();

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

    const application = await Application.create({
      property: propertyId,
      tenant: req.user._id,
      preferredStartDate: startDate,
      rentalDuration: duration,
      message: message?.trim() || "",
    });

    await createNotification({
      recipient: property.owner,
      sender: req.user._id,
      type: "application_submitted",
      message: `A tenant submitted an application for your property: ${property.title}`,
      property: property._id,
      application: application._id,
    });

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

export const getPropertyApplications = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view applications for your own property",
      });
    }

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

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

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

export const getOwnerApplications = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user._id,
    });

    const propertyIds = properties.map((property) => property._id);

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

export const cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own application",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be cancelled",
      });
    }

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
