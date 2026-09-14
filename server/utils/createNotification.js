import Notification from "../models/notificationModel.js";

const createNotification = async ({
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
    return null;
  }
};

export default createNotification;
