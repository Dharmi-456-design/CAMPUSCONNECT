const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// @desc    Get current user profile
// @route   GET /api/v1/users/profile, GET /api/v1/auth/me, GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], 404);
  }
  return ApiResponse.success(res, 'Profile retrieved successfully', { user: user.toJSON() }, 200);
});

// @desc    Update current user profile
// @route   PUT /api/v1/users/profile, PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'rollNumber',
    'college',
    'branch',
    'semester',
    'year',
    'bio',
    'skills',
    'photoUrl',
    'gpa',
    'sks'
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Handle avatar/photo upload if file is attached
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'campusconnect/profiles');
      updates.photoUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      return ApiResponse.error(res, 'Failed to upload photo to Cloudinary', [uploadErr.message], 500);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!updatedUser) {
    return ApiResponse.error(res, 'User not found', [], 404);
  }

  return ApiResponse.success(res, 'Profile updated successfully', { user: updatedUser.toJSON() }, 200);
});

// @desc    Change password for authenticated user
// @route   PUT /api/v1/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return ApiResponse.error(res, 'Please provide both current and new passwords', [], 400);
  }

  if (newPassword.length < 6) {
    return ApiResponse.error(res, 'New password must be at least 6 characters long', [], 400);
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Incorrect current password', [], 400);
  }

  // Hash new password
  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  return ApiResponse.success(res, 'Password changed successfully', {}, 200);
});

// @desc    Save Expo push notification token for this device
// @route   POST /api/users/push-token
// @access  Private
const savePushToken = asyncHandler(async (req, res) => {
  const { expoPushToken } = req.body;

  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken[')) {
    return ApiResponse.error(res, 'Invalid Expo push token', [], 400);
  }

  await User.findByIdAndUpdate(req.user._id, { expoPushToken });

  return ApiResponse.success(res, 'Push token saved successfully', {});
});

module.exports = {
  getMe,
  updateProfile,
  changePassword,
  savePushToken
};
