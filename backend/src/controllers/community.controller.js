const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// Seed sample starter community posts if empty
const seedStarterCommunityData = async (userId) => {
  const count = await CommunityPost.countDocuments();
  if (count > 0) return;

  const starterPosts = [
    {
      title: 'How to calculate Time Complexity for Nested Loops with logarithmic increments?',
      content:
        'In my ADA tutorial test, there was a loop where i multiplies by 2 each iteration while j increases by 1. How do we derive the exact Big-O master theorem equation for this?',
      category: 'Question',
      subject: 'Analysis & Design of Algorithms',
      helpType: 'community',
      tags: ['ADA', 'Algorithms', 'Big-O', 'ExamPrep'],
      upvoteCount: 18,
      commentCount: 2,
      status: 'solved',
      author: userId,
    },
    {
      title: 'Looking for 2 React Native + Node.js devs for SIH Hackathon 2026!',
      content:
        'Hey everyone! We are building an AI-powered diagnostic app for rural healthcare workers for Smart India Hackathon. We already have ML models ready in Python and need fullstack mobile devs to integrate APIs and smooth UI.',
      category: 'Hackathon Squad',
      subject: 'Mobile & AI Dev',
      helpType: 'community',
      tags: ['Hackathon', 'ReactNative', 'AI', 'NodeJS'],
      upvoteCount: 24,
      commentCount: 1,
      status: 'open',
      author: userId,
    },
    {
      title: 'Noyes-Whitney equation for Dissolution Rate calculations in Pharmaceutics',
      content:
        'Can someone explain how boundary layer thickness (h) affects dissolution rate in solid dosage form testing under sink conditions?',
      category: 'Question',
      subject: 'Physical Pharmaceutics',
      helpType: 'tutor',
      tags: ['Pharmaceutics', 'Formulation', 'Chemistry'],
      upvoteCount: 12,
      commentCount: 1,
      status: 'open',
      author: userId,
    },
  ];

  try {
    const created = await CommunityPost.insertMany(starterPosts);
    // Add sample comments to first post
    if (created && created[0]) {
      await Comment.create([
        {
          post: created[0]._id,
          author: userId,
          content:
            'Since i doubles every iteration (i = i * 2), the outer loop runs log₂(N) times. The inner loop running N times gives total time complexity O(N log N)!',
          isSolution: true,
        },
        {
          post: created[0]._id,
          author: userId,
          content: 'Thanks! That matches Prof. Harsh Patel’s slide 14 derivation perfectly.',
          isSolution: false,
        },
      ]);
    }
  } catch (err) {
    // ignore
  }
};

/**
 * @desc    Create new community post
 * @route   POST /api/v1/community/posts
 * @access  Private
 */
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, subject, helpType, tags, imageUrl } = req.body;

  const post = await CommunityPost.create({
    title: title.trim(),
    content: content.trim(),
    category: category || 'General',
    subject: subject ? subject.trim() : '',
    helpType: helpType || 'community',
    tags: Array.isArray(tags) ? tags : [],
    imageUrl: imageUrl || '',
    author: req.user._id,
  });

  const populated = await CommunityPost.findById(post._id).populate(
    'author',
    'name email avatar role department branch'
  );

  return ApiResponse.created(res, 'Post created successfully', populated);
});

/**
 * @desc    Get all community posts with search, category, subject filter, and pagination
 * @route   GET /api/v1/community/posts
 * @access  Private / Public
 */
const getPosts = asyncHandler(async (req, res) => {
  if (req.user) {
    await seedStarterCommunityData(req.user._id);
  }

  const { search, category, subject, helpType, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (subject && subject !== 'All Subjects') {
    filter.subject = { $regex: subject, $options: 'i' };
  }

  if (helpType) {
    filter.helpType = helpType;
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { content: { $regex: s, $options: 'i' } },
      { subject: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await CommunityPost.countDocuments(filter);
  const posts = await CommunityPost.find(filter)
    .populate('author', 'name email avatar role department branch')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.success(res, 'Community posts retrieved successfully', {
    posts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasMore: skip + posts.length < total,
    },
  });
});

/**
 * @desc    Get single community post by ID with comments
 * @route   GET /api/v1/community/posts/:id
 * @access  Private / Public
 */
const getPostById = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id).populate(
    'author',
    'name email avatar role department branch'
  );

  if (!post) {
    return ApiResponse.notFound(res, 'Community post not found');
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', 'name email avatar role department branch')
    .sort({ createdAt: 1 });

  return ApiResponse.success(res, 'Community post retrieved successfully', {
    post,
    comments,
  });
});

/**
 * @desc    Update community post (Author only)
 * @route   PUT /api/v1/community/posts/:id
 * @access  Private
 */
const updatePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return ApiResponse.notFound(res, 'Community post not found');
  }

  const isAuthor = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return ApiResponse.forbidden(res, 'You are not authorized to update this post');
  }

  const updated = await CommunityPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('author', 'name email avatar role department branch');

  return ApiResponse.success(res, 'Post updated successfully', updated);
});

/**
 * @desc    Delete community post (Author only)
 * @route   DELETE /api/v1/community/posts/:id
 * @access  Private
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return ApiResponse.notFound(res, 'Community post not found');
  }

  const isAuthor = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return ApiResponse.forbidden(res, 'You are not authorized to delete this post');
  }

  // Delete all linked comments
  await Comment.deleteMany({ post: post._id });
  await CommunityPost.findByIdAndDelete(req.params.id);

  return ApiResponse.success(res, 'Post and associated comments deleted successfully', null);
});

/**
 * @desc    Add comment to community post
 * @route   POST /api/v1/community/posts/:id/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return ApiResponse.notFound(res, 'Community post not found');
  }

  const { content } = req.body;

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content: content.trim(),
  });

  // Increment comment count on post
  await CommunityPost.findByIdAndUpdate(post._id, {
    $inc: { commentCount: 1 },
  });

  const populated = await Comment.findById(comment._id).populate(
    'author',
    'name email avatar role department branch'
  );

  return ApiResponse.created(res, 'Comment posted successfully', populated);
});

/**
 * @desc    Get comments for a community post
 * @route   GET /api/v1/community/posts/:id/comments
 * @access  Private / Public
 */
const getComments = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return ApiResponse.notFound(res, 'Community post not found');
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', 'name email avatar role department branch')
    .sort({ createdAt: 1 });

  return ApiResponse.success(res, 'Comments retrieved successfully', comments);
});

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  getComments,
};
