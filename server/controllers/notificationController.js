import Notification from "../models/notificationModel.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  message,
  property = null,
  application = null,
  booking = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      property,
      application,
      booking,
    });

    return notification;
  } catch (error) {
    console.log("Create notification error:", error.message);

    throw error;
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name email")
      .populate("property", "title address city")
      .populate("application", "status")
      .populate("booking", "visitDate status")
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.log("Get notifications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own notifications",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log("Mark notification as read error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("Mark all notifications as read error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
