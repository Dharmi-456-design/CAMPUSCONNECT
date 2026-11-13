const Notification = require('../models/Notification');

/**
 * Creates a DB Notification record and pushes live socket event if recipient is online
 */
const sendNotification = async (io, { userId, type, message, relatedId }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      relatedId
    });

    if (io) {
      io.to(`user:${userId}`).emit('notification_received', notification);
    }

    return notification;
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

module.exports = { sendNotification };
