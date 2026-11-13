const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Block = require('../models/Block');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  let conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name college branch photoUrl')
    .sort({ 'lastMessage.createdAt': -1, updatedAt: -1 });

  // If user has no personal conversation yet, show active campus discussions
  if (conversations.length === 0) {
    conversations = await Conversation.find({})
      .populate('participants', 'name college branch photoUrl')
      .sort({ updatedAt: -1 })
      .limit(6);
  }

  return ApiResponse.success(res, 'Conversations retrieved', { conversations });
});

// @desc    Get or create conversation with target user
// @route   POST /api/chat/conversations
// @access  Private
const createOrGetConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;

  if (!recipientId) {
    return ApiResponse.error(res, 'Recipient ID is required', [], 400);
  }

  if (recipientId.toString() === req.user._id.toString()) {
    return ApiResponse.error(res, 'Cannot start a conversation with yourself', [], 400);
  }

  // Check if either user blocked the other
  const isBlocked = await Block.findOne({
    $or: [
      { blocker: req.user._id, blocked: recipientId },
      { blocker: recipientId, blocked: req.user._id }
    ]
  });

  if (isBlocked) {
    return ApiResponse.error(res, 'Cannot create conversation with blocked user', [], 403);
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] }
  }).populate('participants', 'name college branch photoUrl');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId]
    });
    conversation = await Conversation.findById(conversation._id).populate('participants', 'name college branch photoUrl');
  }

  return ApiResponse.success(res, 'Conversation ready', { conversation });
});

// @desc    Get paginated message history for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return ApiResponse.error(res, 'Conversation not found', [], 404);
  }

  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'name photoUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Message.countDocuments({ conversation: req.params.id });

  return ApiResponse.success(res, 'Message history retrieved', {
    messages: messages.reverse(),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit)
    }
  });
});

module.exports = {
  getConversations,
  createOrGetConversation,
  getMessages
};
