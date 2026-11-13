const Note = require('../models/Note');
const Bookmark = require('../models/Bookmark');
const Rating = require('../models/Rating');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// @desc    Upload new note (defaults to pending approval)
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const { title, description, subject, branch, semester, tags } = req.body;

  if (!req.file) {
    return ApiResponse.error(res, 'File is required for note upload', [], 400);
  }

  let fileUrl = '';
  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'campusconnect/notes');
    fileUrl = uploadResult.secure_url;
  } catch (err) {
    return ApiResponse.error(res, 'Failed to upload note file to Cloudinary', [err.message], 500);
  }

  const parsedTags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [];

  const note = await Note.create({
    title,
    description: description || '',
    subject,
    branch,
    semester: Number(semester),
    tags: parsedTags,
    fileUrl,
    fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
    uploader: req.user._id,
    approvalStatus: 'pending'
  });

  return ApiResponse.success(res, 'Note uploaded successfully and is pending approval', { note }, 201);
});

// @desc    Quick JSON-based note upload (fileUrl as string, no Cloudinary needed)
// @route   POST /api/notes/quick-upload
// @access  Private
const quickUploadNote = asyncHandler(async (req, res) => {
  const { title, description, subject, branch, semester, tags, fileUrl, fileType } = req.body;

  if (!title || !subject || !fileUrl) {
    return ApiResponse.error(res, 'Title, subject and fileUrl are required', [], 400);
  }

  const parsedTags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [];

  const note = await Note.create({
    title,
    description: description || '',
    subject,
    branch: branch || 'General',
    semester: Number(semester) || 1,
    tags: parsedTags,
    fileUrl,
    fileType: fileType || 'pdf',
    uploader: req.user._id,
    approvalStatus: 'approved', // Auto-approve for student portal quick uploads
    downloadCount: 0,
    avgRating: 0
  });

  // 🔔 Broadcast push to ALL users who have the app installed
  try {
    const { sendBroadcastPush } = require('../services/pushNotification.service');
    const semStr = note.semester ? ` (Sem ${note.semester})` : '';
    const branchFilter = note.branch && note.branch !== 'General'
      ? { branch: new RegExp(note.branch, 'i') }
      : {};

    // Send to all users (or filter by branch if note has a specific branch)
    await sendBroadcastPush(
      '📚 New Notes Published!',
      `${note.title} — ${note.subject}${semStr} by ${req.user.name}`,
      { tab: 'notes', noteId: note._id.toString() },
      branchFilter
    );
  } catch (pushErr) {
    console.error('[Note Upload Push] Failed:', pushErr.message);
  }

  return ApiResponse.success(res, 'Note published successfully! Students can now view and download it.', { note }, 201);
});

// @desc    Get all notes (paginated, filtered, search)
// @route   GET /api/notes
// @access  Public
const getNotes = asyncHandler(async (req, res) => {
  const { subject, branch, semester, tag, search, page = 1, limit = 10 } = req.query;

  const query = { approvalStatus: 'approved' };

  if (subject) {
    const escaped = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.subject = new RegExp(escaped, 'i');
  }
  if (branch && branch !== 'All') {
    const cleanBranch = branch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.branch = new RegExp(cleanBranch, 'i');
  }
  if (semester) query.semester = Number(semester);
  if (tag) query.tags = tag;
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: new RegExp(escaped, 'i') },
      { subject: new RegExp(escaped, 'i') },
      { description: new RegExp(escaped, 'i') },
      { branch: new RegExp(escaped, 'i') },
      { tags: new RegExp(escaped, 'i') }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const notes = await Note.find(query)
    .populate('uploader', 'name college branch photoUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Note.countDocuments(query);

  return ApiResponse.success(res, 'Notes retrieved successfully', {
    notes,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get single note detail & increment downloadCount
// @route   GET /api/notes/:id
// @access  Public
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  ).populate('uploader', 'name college branch photoUrl');

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  return ApiResponse.success(res, 'Note retrieved successfully', { note });
});

// @desc    Update note (owner or admin)
// @route   PUT /api/notes/:id
// @access  Private (Owner/Admin)
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  if (note.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to edit this note', [], 403);
  }

  const updatedNote = await Note.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  return ApiResponse.success(res, 'Note updated successfully', { note: updatedNote });
});

// @desc    Delete note (owner or admin)
// @route   DELETE /api/notes/:id
// @access  Private (Owner/Admin)
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  if (note.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to delete this note', [], 403);
  }

  await note.deleteOne();

  return ApiResponse.success(res, 'Note deleted successfully', {});
});

const { sendNotification } = require('../sockets/notification.socket');

// @desc    Admin approve/reject note
// @route   PATCH /api/notes/:id/approve
// @access  Private (Admin Only)
const approveNote = asyncHandler(async (req, res) => {
  const { status = 'approved' } = req.body;
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { approvalStatus: status },
    { new: true }
  );

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  const User = require('../models/User');
  const { sendExpoPush } = require('../services/pushNotification.service');

  // Notify note uploader via socket
  const io = req.app.get('io');
  await sendNotification(io, {
    userId: note.uploader,
    type: 'note_approval',
    message: `Your note "${note.title}" has been ${status}`,
    relatedId: note._id
  });

  // If approved, send push to all users with same branch & semester
  if (status === 'approved') {
    try {
      const targetUsers = await User.find({
        branch: new RegExp(note.branch, 'i'),
        semester: note.semester,
        expoPushToken: { $ne: '' }
      }).select('expoPushToken').lean();

      const tokens = targetUsers.map((u) => u.expoPushToken).filter(Boolean);
      if (tokens.length > 0) {
        await sendExpoPush(
          tokens,
          '📚 New Notes Available!',
          `${note.title} — ${note.subject} (Sem ${note.semester})`,
          { tab: 'notes', noteId: note._id.toString() }
        );
      }
    } catch (pushErr) {
      console.error('[Note Approval Push] Failed:', pushErr.message);
    }
  }

  return ApiResponse.success(res, `Note approval status updated to ${status}`, { note });
});

// @desc    Toggle bookmark for note
// @route   POST /api/notes/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;

  const existing = await Bookmark.findOne({ user: userId, targetType: 'note', targetId: noteId });

  if (existing) {
    await existing.deleteOne();
    return ApiResponse.success(res, 'Bookmark removed', { isBookmarked: false });
  } else {
    await Bookmark.create({ user: userId, targetType: 'note', targetId: noteId });
    return ApiResponse.success(res, 'Bookmark added', { isBookmarked: true });
  }
});

// @desc    Rate a note & recalculate average rating
// @route   POST /api/notes/:id/rate
// @access  Private
const rateNote = asyncHandler(async (req, res) => {
  const { score } = req.body;
  const noteId = req.params.id;
  const userId = req.user._id;

  await Rating.findOneAndUpdate(
    { user: userId, targetType: 'note', targetId: noteId },
    { score },
    { upsert: true, new: true }
  );

  // Recalculate avgRating
  const ratings = await Rating.find({ targetType: 'note', targetId: noteId });
  const avg = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length;

  const updatedNote = await Note.findByIdAndUpdate(
    noteId,
    { avgRating: Number(avg.toFixed(1)) },
    { new: true }
  );

  return ApiResponse.success(res, 'Note rated successfully', { avgRating: updatedNote.avgRating });
});

module.exports = {
  createNote,
  quickUploadNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  approveNote,
  toggleBookmark,
  rateNote
};
