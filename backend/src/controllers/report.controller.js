const Report = require('../models/Report');
const Block = require('../models/Block');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a content or user report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason
  });

  return ApiResponse.success(res, 'Report submitted successfully for admin review', { report }, 201);
});

// @desc    Block a user
// @route   POST /api/blocks
// @access  Private
const blockUser = asyncHandler(async (req, res) => {
  const { blockedUserId } = req.body;

  if (blockedUserId.toString() === req.user._id.toString()) {
    return ApiResponse.error(res, 'You cannot block yourself', [], 400);
  }

  const existingBlock = await Block.findOne({ blocker: req.user._id, blocked: blockedUserId });

  if (existingBlock) {
    return ApiResponse.success(res, 'User is already blocked', { isBlocked: true });
  }

  await Block.create({
    blocker: req.user._id,
    blocked: blockedUserId
  });

  return ApiResponse.success(res, 'User blocked successfully', { isBlocked: true }, 201);
});

// @desc    Unblock a user
// @route   DELETE /api/blocks/:userId
// @access  Private
const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const block = await Block.findOneAndDelete({ blocker: req.user._id, blocked: userId });

  if (!block) {
    return ApiResponse.error(res, 'Block record not found', [], 404);
  }

  return ApiResponse.success(res, 'User unblocked successfully', { isBlocked: false });
});

module.exports = {
  createReport,
  blockUser,
  unblockUser
};
