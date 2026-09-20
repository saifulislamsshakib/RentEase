import User from "../models/userModel.js";
import Property from "../models/propertyModel.js";
import Application from "../models/applicationModel.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalTenants,
      totalProperties,
      availableProperties,
      unavailableProperties,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      cancelledApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "tenant" }),

      Property.countDocuments(),
      Property.countDocuments({ isAvailable: true }),
      Property.countDocuments({ isAvailable: false }),

      Application.countDocuments(),
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments({ status: "rejected" }),
      Application.countDocuments({ status: "cancelled" }),
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          owners: totalOwners,
          tenants: totalTenants,
        },

        properties: {
          total: totalProperties,
          available: availableProperties,
          unavailable: unavailableProperties,
        },

        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
          cancelled: cancelledApplications,
        },
      },
    });
  } catch (error) {
    console.log("Admin dashboard stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOwnerDashboardStats = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user._id,
    }).select("_id isAvailable");

    const propertyIds = properties.map((property) => property._id);

    const totalProperties = properties.length;

    const availableProperties = properties.filter(
      (property) => property.isAvailable === true,
    ).length;

    const unavailableProperties = properties.filter(
      (property) => property.isAvailable === false,
    ).length;

    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      cancelledApplications,
    ] = await Promise.all([
      Application.countDocuments({
        property: { $in: propertyIds },
      }),

      Application.countDocuments({
        property: { $in: propertyIds },
        status: "pending",
      }),

      Application.countDocuments({
        property: { $in: propertyIds },
        status: "approved",
      }),

      Application.countDocuments({
        property: { $in: propertyIds },
        status: "rejected",
      }),

      Application.countDocuments({
        property: { $in: propertyIds },
        status: "cancelled",
      }),
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        properties: {
          total: totalProperties,
          available: availableProperties,
          unavailable: unavailableProperties,
        },

        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
          cancelled: cancelledApplications,
        },
      },
    });
  } catch (error) {
    console.log("Owner dashboard stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTenantDashboardStats = async (req, res) => {
  try {
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      cancelledApplications,
    ] = await Promise.all([
      Application.countDocuments({
        tenant: req.user._id,
      }),

      Application.countDocuments({
        tenant: req.user._id,
        status: "pending",
      }),

      Application.countDocuments({
        tenant: req.user._id,
        status: "approved",
      }),

      Application.countDocuments({
        tenant: req.user._id,
        status: "rejected",
      }),

      Application.countDocuments({
        tenant: req.user._id,
        status: "cancelled",
      }),
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
          cancelled: cancelledApplications,
        },
      },
    });
  } catch (error) {
    console.log("Tenant dashboard stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
