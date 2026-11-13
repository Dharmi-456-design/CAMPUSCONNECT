const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  return ApiResponse.success(res, 'Notifications retrieved', { notifications, unreadCount });
});

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return ApiResponse.error(res, 'Notification not found', [], 404);
  }

  return ApiResponse.success(res, 'Notification marked as read', { notification });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return ApiResponse.success(res, 'All notifications marked as read', {});
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
