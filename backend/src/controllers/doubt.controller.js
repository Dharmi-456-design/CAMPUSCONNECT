const Doubt = require('../models/Doubt');
const Answer = require('../models/Answer');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// @desc    Create new doubt
// @route   POST /api/doubts
// @access  Private
const createDoubt = asyncHandler(async (req, res) => {
  const { title, description, subject } = req.body;

  let imageUrl = '';
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'campusconnect/doubts');
      imageUrl = result.secure_url;
    } catch (err) {
      return ApiResponse.error(res, 'Failed to upload image', [err.message], 500);
    }
  }

  const doubt = await Doubt.create({
    title,
    description,
    subject,
    imageUrl,
    student: req.user._id
  });

  // 🔔 Broadcast to ALL app users — someone needs help!
  try {
    const { sendBroadcastPush } = require('../services/pushNotification.service');
    await sendBroadcastPush(
      '❓ New Doubt Posted!',
      `${req.user.name} asked: "${title}" (${subject})`,
      { tab: 'doubts', doubtId: doubt._id.toString() }
    );
  } catch (pushErr) {
    console.error('[Doubt Post Push] Failed:', pushErr.message);
  }

  return ApiResponse.success(res, 'Doubt posted successfully', { doubt }, 201);
});

// @desc    Get all doubts (paginated, subject/search filter)
// @route   GET /api/doubts
// @access  Public
const getDoubts = asyncHandler(async (req, res) => {
  const { subject, status, search, page = 1, limit = 10 } = req.query;

  const query = {};
  if (subject && subject !== 'All') {
    const escaped = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.subject = new RegExp(escaped, 'i');
  }
  if (status) query.status = status;
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: new RegExp(escaped, 'i') },
      { description: new RegExp(escaped, 'i') },
      { subject: new RegExp(escaped, 'i') }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const doubts = await Doubt.find(query)
    .populate('student', 'name college branch photoUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const doubtIds = doubts.map((d) => d._id);
  const answers = await Answer.find({ doubt: { $in: doubtIds } })
    .populate('author', 'name college branch photoUrl')
    .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 })
    .lean();

  const doubtsWithAnswers = doubts.map((d) => ({
    ...d,
    answers: answers.filter((a) => a.doubt.toString() === d._id.toString())
  }));

  const total = await Doubt.countDocuments(query);

  return ApiResponse.success(res, 'Doubts retrieved successfully', {
    doubts: doubtsWithAnswers,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single doubt detail with populated answers
// @route   GET /api/doubts/:id
// @access  Public
const getDoubtById = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id).populate('student', 'name college branch photoUrl');

  if (!doubt) {
    return ApiResponse.error(res, 'Doubt not found', [], 404);
  }

  const answers = await Answer.find({ doubt: req.params.id })
    .populate('author', 'name college branch photoUrl')
    .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 });

  return ApiResponse.success(res, 'Doubt details retrieved', { doubt, answers });
});

const { sendNotification } = require('../sockets/notification.socket');

// @desc    Post answer to doubt
// @route   POST /api/doubts/:id/answers
// @access  Private
const createAnswer = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id);

  if (!doubt) {
    return ApiResponse.error(res, 'Doubt not found', [], 404);
  }

  const answer = await Answer.create({
    doubt: req.params.id,
    author: req.user._id,
    text: req.body.text
  });

  const populatedAnswer = await Answer.findById(answer._id).populate('author', 'name college branch photoUrl');

  // Trigger notification to doubt author if answer author is different
  if (doubt.student.toString() !== req.user._id.toString()) {
    const io = req.app.get('io');
    await sendNotification(io, {
      userId: doubt.student,
      type: 'doubt_answer',
      message: `${req.user.name} answered your doubt "${doubt.title}"`,
      relatedId: doubt._id
    });

    // Send real push notification to doubt owner
    try {
      const User = require('../models/User');
      const { sendExpoPush } = require('../services/pushNotification.service');
      const doubtOwner = await User.findById(doubt.student).select('expoPushToken').lean();
      if (doubtOwner?.expoPushToken) {
        await sendExpoPush(
          doubtOwner.expoPushToken,
          '💡 Your Doubt Got an Answer!',
          `${req.user.name} answered: "${doubt.title}"`,
          { tab: 'doubts', doubtId: doubt._id.toString() }
        );
      }
    } catch (pushErr) {
      console.error('[Doubt Answer Push] Failed:', pushErr.message);
    }
  }

  return ApiResponse.success(res, 'Answer posted successfully', { answer: populatedAnswer }, 201);
});

// @desc    Upvote answer
// @route   PATCH /api/answers/:id/upvote
// @access  Private
const upvoteAnswer = asyncHandler(async (req, res) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return ApiResponse.error(res, 'Answer not found', [], 404);
  }

  const hasUpvoted = answer.upvotes.includes(req.user._id);

  if (hasUpvoted) {
    answer.upvotes.pull(req.user._id);
  } else {
    answer.upvotes.push(req.user._id);
  }

  await answer.save();

  return ApiResponse.success(
    res,
    hasUpvoted ? 'Upvote removed' : 'Answer upvoted',
    { upvotesCount: answer.upvotes.length, hasUpvoted: !hasUpvoted }
  );
});

// @desc    Accept answer (only doubt owner)
// @route   PATCH /api/answers/:id/accept
// @access  Private (Doubt Owner Only)
const acceptAnswer = asyncHandler(async (req, res) => {
  const answer = await Answer.findById(req.params.id);

  if (!answer) {
    return ApiResponse.error(res, 'Answer not found', [], 404);
  }

  const doubt = await Doubt.findById(answer.doubt);
  if (!doubt) {
    return ApiResponse.error(res, 'Associated doubt not found', [], 404);
  }

  if (doubt.student.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Only the doubt author can mark an answer as accepted', [], 403);
  }

  // Unset any previously accepted answer for this doubt
  await Answer.updateMany({ doubt: doubt._id }, { isAccepted: false });

  answer.isAccepted = true;
  await answer.save();

  doubt.status = 'resolved';
  await doubt.save();

  return ApiResponse.success(res, 'Answer marked as accepted', { answer, doubt });
});

module.exports = {
  createDoubt,
  getDoubts,
  getDoubtById,
  createAnswer,
  upvoteAnswer,
  acceptAnswer
};
