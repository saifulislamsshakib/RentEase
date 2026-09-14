import User from "../models/userModel.js";
import Property from "../models/propertyModel.js";
import Application from "../models/applicationModel.js";
import Contract from "../models/contractModel.js";
import Payment from "../models/paymentModel.js";
import Maintenance from "../models/maintenanceModel.js";
import Complaint from "../models/complaintModel.js";
// Get All Users - Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -verificationToken -resetPasswordToken")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log("Get all users error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Block or Unblock User - Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin cannot block/unblock another admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin user cannot be blocked",
      });
    }

    // Toggle status
    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive
        ? "User unblocked successfully"
        : "User blocked successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.log("Toggle user status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Single User - Admin
export const getSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-password -verificationToken -resetPasswordToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Get single user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete User - Admin
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting another admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin user cannot be deleted",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("Delete user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get All Properties - Admin
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.log("Get all properties admin error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get All Applications - Admin
export const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("property", "title address city rent isAvailable")
      .populate("tenant", "name email phone address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.log("Get all applications admin error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// =====================================================
// ADMIN REPORTS & ANALYTICS
// =====================================================

export const getAdminReports = async (req, res) => {
  try {
    // =========================
    // USERS
    // =========================
    const [totalUsers, activeUsers, inactiveUsers, owners, tenants, admins] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ role: "owner" }),
        User.countDocuments({ role: "tenant" }),
        User.countDocuments({ role: "admin" }),
      ]);

    // =========================
    // PROPERTIES
    // =========================
    const [totalProperties, availableProperties, occupiedProperties] =
      await Promise.all([
        Property.countDocuments(),
        Property.countDocuments({ isAvailable: true }),
        Property.countDocuments({ isAvailable: false }),
      ]);

    // =========================
    // APPLICATIONS
    // =========================
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      cancelledApplications,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: "pending" }),
      Application.countDocuments({ status: "approved" }),
      Application.countDocuments({ status: "rejected" }),
      Application.countDocuments({ status: "cancelled" }),
    ]);

    // =========================
    // CONTRACTS
    // =========================
    const [
      totalContracts,
      pendingDepositContracts,
      activeContracts,
      expiredContracts,
      renewedContracts,
      terminatedContracts,
    ] = await Promise.all([
      Contract.countDocuments(),
      Contract.countDocuments({ status: "Pending Deposit" }),
      Contract.countDocuments({ status: "Active" }),
      Contract.countDocuments({ status: "Expired" }),
      Contract.countDocuments({ status: "Renewed" }),
      Contract.countDocuments({ status: "Terminated" }),
    ]);

    // =========================
    // PAYMENTS
    // =========================
    const [
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      cancelledPayments,
      securityDepositPayments,
      rentPayments,
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: "paid" }),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "overdue" }),
      Payment.countDocuments({ status: "cancelled" }),
      Payment.countDocuments({ type: "security_deposit" }),
      Payment.countDocuments({ type: "rent" }),
    ]);

    // =========================
    // PAYMENT AMOUNTS
    // =========================
    const paymentAmountStats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const paidAmount =
      paymentAmountStats.find((item) => item._id === "paid")?.total || 0;

    const pendingAmount =
      paymentAmountStats.find((item) => item._id === "pending")?.total || 0;

    const overdueAmount =
      paymentAmountStats.find((item) => item._id === "overdue")?.total || 0;

    // =========================
    // MAINTENANCE
    // =========================
    const [
      totalMaintenance,
      pendingMaintenance,
      inProgressMaintenance,
      resolvedMaintenance,
      closedMaintenance,
    ] = await Promise.all([
      Maintenance.countDocuments(),
      Maintenance.countDocuments({ status: "Pending" }),
      Maintenance.countDocuments({ status: "In Progress" }),
      Maintenance.countDocuments({ status: "Resolved" }),
      Maintenance.countDocuments({ status: "Closed" }),
    ]);

    // =========================
    // COMPLAINTS
    // =========================
    const [
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      closedComplaints,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),
      Complaint.countDocuments({ status: "Closed" }),
    ]);

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({
      success: true,

      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        owners,
        tenants,
        admins,
      },

      properties: {
        total: totalProperties,
        available: availableProperties,
        occupied: occupiedProperties,
      },

      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        cancelled: cancelledApplications,
      },

      contracts: {
        total: totalContracts,
        pendingDeposit: pendingDepositContracts,
        active: activeContracts,
        expired: expiredContracts,
        renewed: renewedContracts,
        terminated: terminatedContracts,
      },

      payments: {
        total: totalPayments,
        paid: paidPayments,
        pending: pendingPayments,
        overdue: overduePayments,
        cancelled: cancelledPayments,
        securityDeposit: securityDepositPayments,
        rent: rentPayments,
        amounts: {
          paid: paidAmount,
          pending: pendingAmount,
          overdue: overdueAmount,
        },
      },

      maintenance: {
        total: totalMaintenance,
        pending: pendingMaintenance,
        inProgress: inProgressMaintenance,
        resolved: resolvedMaintenance,
        closed: closedMaintenance,
      },

      complaints: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        closed: closedComplaints,
      },
    });
  } catch (error) {
    console.log("Admin reports error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to generate admin reports",
    });
  }
};
