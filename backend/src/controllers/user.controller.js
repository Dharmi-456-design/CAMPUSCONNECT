const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], 404);
  }
  return ApiResponse.success(res, 'Profile retrieved successfully', { user: user.toJSON() }, 200);
});

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

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
  );

  return ApiResponse.success(res, 'Profile updated successfully', { user: updatedUser.toJSON() }, 200);
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
  savePushToken
};
