import Maintenance from "../models/maintenanceModel.js";
import Contract from "../models/contractModel.js";
import Property from "../models/propertyModel.js";
import cloudinary from "../config/cloudinary.js";
import { createNotification } from "./notificationController.js";

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "rentease/maintenance",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(file.buffer);
  });
};

export const createMaintenance = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const { category, title, description, requestDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
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
          "You need an active rental contract for this property to submit a maintenance request",
      });
    }

    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadImageToCloudinary(file);

        imageUrls.push(imageUrl);
      }
    }

    const maintenance = await Maintenance.create({
      property: propertyId,
      contract: contract._id,
      tenant: req.user._id,
      owner: contract.owner._id,
      category: category || "other",
      title,
      description,
      requestDate: requestDate || new Date(),
      images: imageUrls,
      status: "Pending",
    });

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .populate("owner", "name email");

    try {
      await createNotification({
        recipient: contract.owner._id,
        sender: req.user._id,
        type: "maintenance_created",
        message: `New maintenance request: ${title}`,
        property: propertyId,
      });
    } catch (notificationError) {
      console.error(
        "Maintenance notification error:",
        notificationError.message,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Maintenance request submitted successfully",
      maintenance: populatedMaintenance,
    });
  } catch (error) {
    console.error("Create maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({
      tenant: req.user._id,
    })
      .populate("property")
      .populate("contract")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    console.error("Get my maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOwnerMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({
      owner: req.user._id,
    })
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    console.error("Get owner maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find()
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    console.error("Get all maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { maintenanceId } = req.params;

    const { status, ownerNote } = req.body;

    const allowedStatuses = ["Pending", "In Progress", "Resolved", "Closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance status",
      });
    }

    const maintenance = await Maintenance.findById(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    if (maintenance.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this request",
      });
    }

    maintenance.status = status;

    if (ownerNote !== undefined) {
      maintenance.ownerNote = ownerNote;
    }

    await maintenance.save();

    const updatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate("property")
      .populate("contract")
      .populate("tenant", "name email")
      .populate("owner", "name email");

    try {
      await createNotification({
        recipient: maintenance.tenant,
        sender: req.user._id,
        type: "maintenance_updated",
        message: `Your maintenance request "${maintenance.title}" is now ${status}.`,
        property: maintenance.property,
      });
    } catch (notificationError) {
      console.error(
        "Maintenance update notification error:",
        notificationError.message,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Maintenance request updated successfully",
      maintenance: updatedMaintenance,
    });
  } catch (error) {
    console.error("Update maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
