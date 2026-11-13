const TeamPost = require('../models/TeamPost');
const TeamRequest = require('../models/TeamRequest');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new team post
// @route   POST /api/team-posts
// @access  Private
const createTeamPost = asyncHandler(async (req, res) => {
  const { title, description, department, requiredSkills, teamSizeMax, deadline } = req.body;

  const parsedSkills = Array.isArray(requiredSkills)
    ? requiredSkills
    : typeof requiredSkills === 'string'
    ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const post = await TeamPost.create({
    title,
    description,
    department: department || 'Faculty of Engineering (SSIT)',
    requiredSkills: parsedSkills.length > 0 ? parsedSkills : ['General Collaboration'],
    teamSizeMax: Number(teamSizeMax) || 4,
    currentTeamSize: 1,
    deadline: deadline ? new Date(deadline) : undefined,
    owner: req.user._id,
    status: 'open'
  });

  const populatedPost = await TeamPost.findById(post._id).populate('owner', 'name college branch photoUrl');

  // 🔔 Broadcast to ALL users — a new team is looking for members!
  try {
    const { sendBroadcastPush } = require('../services/pushNotification.service');
    const skillStr = parsedSkills.slice(0, 2).join(', ');
    await sendBroadcastPush(
      '👥 New Squad Looking for Members!',
      `${req.user.name} created: "${post.title}" — Skills: ${skillStr || 'Open to all'}`,
      { tab: 'team', postId: post._id.toString() }
    );
  } catch (pushErr) {
    console.error('[Team Post Push] Failed:', pushErr.message);
  }

  return ApiResponse.success(res, 'Team post created successfully', { post: populatedPost }, 201);
});

// @desc    Get team posts (filtered by skills, department, search)
// @route   GET /api/team-posts
// @access  Public
const getTeamPosts = asyncHandler(async (req, res) => {
  const { department, skill, search, status = 'open', page = 1, limit = 10 } = req.query;

  const query = { status };
  if (department && department !== 'All') {
    const escaped = department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.department = new RegExp(escaped, 'i');
  }
  if (skill) query.requiredSkills = skill;
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: new RegExp(escaped, 'i') },
      { description: new RegExp(escaped, 'i') },
      { department: new RegExp(escaped, 'i') },
      { requiredSkills: new RegExp(escaped, 'i') }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const posts = await TeamPost.find(query)
    .populate('owner', 'name college branch photoUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await TeamPost.countDocuments(query);

  return ApiResponse.success(res, 'Team posts retrieved successfully', {
    posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single team post detail with requests (if owner)
// @route   GET /api/team-posts/:id
// @access  Public
const getTeamPostById = asyncHandler(async (req, res) => {
  const post = await TeamPost.findById(req.params.id).populate('owner', 'name college branch photoUrl');

  if (!post) {
    return ApiResponse.error(res, 'Team post not found', [], 404);
  }

  let requests = [];
  if (req.user && post.owner._id.toString() === req.user._id.toString()) {
    requests = await TeamRequest.find({ teamPost: req.params.id }).populate('requester', 'name college branch skills photoUrl');
  }

  return ApiResponse.success(res, 'Team post details retrieved', { post, requests });
});

// @desc    Request to join team
// @route   POST /api/team-posts/:id/requests
// @access  Private
const createTeamRequest = asyncHandler(async (req, res) => {
  const post = await TeamPost.findById(req.params.id);

  if (!post) {
    return ApiResponse.error(res, 'Team post not found', [], 404);
  }

  if (post.status !== 'open') {
    return ApiResponse.error(res, 'This team post is closed or full', [], 400);
  }

  if (post.owner.toString() === req.user._id.toString()) {
    return ApiResponse.error(res, 'Owner cannot send a join request to their own team post', [], 400);
  }

  const existingRequest = await TeamRequest.findOne({ teamPost: post._id, requester: req.user._id });
  if (existingRequest) {
    return ApiResponse.error(res, 'You have already submitted a join request for this post', [], 400);
  }

  const teamRequest = await TeamRequest.create({
    teamPost: post._id,
    requester: req.user._id,
    message: req.body.message || `Hi, I would love to join your team for "${post.title}"!`
  });

  // Create persistent notification for team owner
  const Notification = require('../models/Notification');
  await Notification.create({
    user: post.owner,
    type: 'team_request',
    message: `🚀 ${req.user.name} applied to join your team "${post.title}"!`,
    relatedId: post._id,
    isRead: false
  });

  const { sendNotification } = require('../sockets/notification.socket');
  const io = req.app.get('io');
  if (io) {
    await sendNotification(io, {
      userId: post.owner,
      type: 'team_request',
      message: `🚀 ${req.user.name} applied to join your team "${post.title}"!`,
      relatedId: post._id
    });
  }

  // Send real push notification to team post owner
  try {
    const User = require('../models/User');
    const { sendExpoPush } = require('../services/pushNotification.service');
    const teamOwner = await User.findById(post.owner).select('expoPushToken').lean();
    if (teamOwner?.expoPushToken) {
      await sendExpoPush(
        teamOwner.expoPushToken,
        '👥 New Squad Join Request!',
        `${req.user.name} wants to join your team "${post.title}"`,
        { tab: 'team', postId: post._id.toString() }
      );
    }
  } catch (pushErr) {
    console.error('[Team Request Push] Failed:', pushErr.message);
  }

  return ApiResponse.success(res, 'Team join request submitted successfully', { teamRequest }, 201);
});

// @desc    Respond to team join request (accept/reject)
// @route   PATCH /api/team-posts/requests/:id
// @access  Private (Post Owner Only)
const respondToTeamRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'

  const teamRequest = await TeamRequest.findById(req.params.id).populate('teamPost');
  if (!teamRequest) {
    return ApiResponse.error(res, 'Team request not found', [], 404);
  }

  const post = await TeamPost.findById(teamRequest.teamPost._id);
  if (!post) {
    return ApiResponse.error(res, 'Associated team post not found', [], 404);
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Only the team post owner can respond to requests', [], 403);
  }

  teamRequest.status = status;
  await teamRequest.save();

  if (status === 'accepted') {
    post.currentTeamSize = (post.currentTeamSize || 1) + 1;
    if (post.currentTeamSize >= post.teamSizeMax) {
      post.status = 'closed';
    }
    await post.save();
  }

  // Create persistent notification for requester
  const Notification = require('../models/Notification');
  await Notification.create({
    user: teamRequest.requester,
    type: 'team_request',
    message:
      status === 'accepted'
        ? `🎉 SUCCESS! Your request to join "${post.title}" has been ACCEPTED by ${req.user.name}! You are now an official team member.`
        : `Your join request for "${post.title}" was not accepted. Keep looking for teams!`,
    relatedId: post._id,
    isRead: false
  });

  const { sendNotification } = require('../sockets/notification.socket');
  const io = req.app.get('io');
  if (io) {
    await sendNotification(io, {
      userId: teamRequest.requester,
      type: 'team_request',
      message:
        status === 'accepted'
          ? `🎉 SUCCESS! Your request to join "${post.title}" was ACCEPTED!`
          : `Your join request for "${post.title}" was declined.`,
      relatedId: post._id
    });
  }

  // Send real push notification to requester
  try {
    const User = require('../models/User');
    const { sendExpoPush } = require('../services/pushNotification.service');
    const requesterUser = await User.findById(teamRequest.requester).select('expoPushToken').lean();
    if (requesterUser?.expoPushToken) {
      await sendExpoPush(
        requesterUser.expoPushToken,
        status === 'accepted' ? '🚀 Squad Request Accepted!' : '❌ Squad Request Update',
        status === 'accepted'
          ? `You are now part of the team "${post.title}"! Welcome aboard!`
          : `Your request to join "${post.title}" was not accepted this time.`,
        { tab: 'team', postId: post._id.toString() }
      );
    }
  } catch (pushErr) {
    console.error('[Team Accept Push] Failed:', pushErr.message);
  }

  return ApiResponse.success(res, `Team request ${status} successfully`, { teamRequest, post });
});

module.exports = {
  createTeamPost,
  getTeamPosts,
  getTeamPostById,
  createTeamRequest,
  respondToTeamRequest
};
