const mongoose = require('mongoose');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Bookmark = require('../models/Bookmark');
const Rating = require('../models/Rating');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// Default initial notes matching the reference screenshot (media_1794714942597_29fca6f3.png)
const DEFAULT_STARTER_NOTES = [
  {
    title: 'Yessir',
    content: 'Class discussion notes on algorithm complexity and Big-O notation. Review for next quiz.',
    description: 'Locked Note',
    subjectName: 'Coding',
    tags: ['Coding', 'Algorithms'],
    category: 'Computer Science',
    isPinned: true,
    isLocked: true,
    color: '#F59E0B'
  },
  {
    title: 'Hey',
    content: '',
    description: 'No additional text',
    subjectName: 'General',
    tags: ['Quick'],
    category: 'General',
    isPinned: false,
    isLocked: false,
    color: '#16A36A'
  },
  {
    title: 'Very cool',
    content: 'This note is very cool. Key takeaways from Agricultural Biology session on plant genetics and respiration cycle.',
    description: 'This note is very cool.',
    subjectName: 'Agri Biology A',
    tags: ['Biology', 'Lecture'],
    category: 'Science',
    isPinned: false,
    isLocked: false,
    color: '#EAB308'
  },
  {
    title: 'Important Stuff',
    content: 'Exam dates, project milestone deadlines, and final submission repository guidelines.',
    description: 'Locked Note',
    subjectName: 'Math 101',
    tags: ['Important', 'Deadlines'],
    category: 'Mathematics',
    isPinned: false,
    isLocked: true,
    color: '#3B82F6'
  },
  {
    title: 'Neu.',
    content: '',
    description: 'No additional text',
    subjectName: 'General',
    tags: [],
    category: 'General',
    isPinned: false,
    isLocked: false,
    color: '#84CC16'
  },
  {
    title: 'heyyyy.',
    content: '',
    description: 'No additional text',
    subjectName: 'Health',
    tags: ['PE'],
    category: 'Health',
    isPinned: false,
    isLocked: false,
    color: '#10B981'
  }
];

// @desc    Create a new private note
// @route   POST /api/v1/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const {
    title,
    content = '',
    description = '',
    subject,
    subjectName,
    tags,
    category = 'General',
    isPinned = false,
    isLocked = false,
    color = '#16A36A',
    branch = 'General',
    semester = 1,
    fileUrl = '',
    fileType = 'text'
  } = req.body;

  // Handle uploaded file via multipart/form-data if provided
  let uploadedFileUrl = fileUrl;
  let detectedFileType = fileType;
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'campusconnect/notes');
      uploadedFileUrl = uploadResult.secure_url;
      detectedFileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
    } catch (err) {
      // Fallback: proceed without Cloudinary
    }
  }

  // Parse tags
  const parsedTags = Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean)
    : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  let resolvedSubjectId = null;
  let resolvedSubjectName = subjectName ? subjectName.trim() : 'General';

  // If a subject ID or code was provided, verify subject ownership
  if (subject) {
    if (mongoose.Types.ObjectId.isValid(subject)) {
      const subjectDoc = await Subject.findOne({ _id: subject, user: req.user._id });
      if (subjectDoc) {
        resolvedSubjectId = subjectDoc._id;
        resolvedSubjectName = subjectDoc.name;
      }
    } else {
      // If code was passed instead of ObjectId
      const subjectDoc = await Subject.findOne({
        user: req.user._id,
        $or: [{ code: subject.toUpperCase() }, { name: subject }]
      });
      if (subjectDoc) {
        resolvedSubjectId = subjectDoc._id;
        resolvedSubjectName = subjectDoc.name;
      } else {
        resolvedSubjectName = subject;
      }
    }
  }

  const note = await Note.create({
    user: req.user._id,
    uploader: req.user._id,
    title: title.trim(),
    content: content || '',
    description: description || (content ? content.slice(0, 160) : 'No additional text'),
    subject: resolvedSubjectId,
    subjectName: resolvedSubjectName,
    tags: parsedTags,
    category: category || 'General',
    isPinned: Boolean(isPinned),
    isLocked: Boolean(isLocked),
    color: color || '#16A36A',
    characterCount: (content || '').length,
    branch: branch || 'General',
    semester: Number(semester) || 1,
    fileUrl: uploadedFileUrl || '',
    fileType: detectedFileType || 'text',
    approvalStatus: 'approved'
  });

  return ApiResponse.success(res, 'Note created successfully', { note }, 201);
});

// @desc    Get all private notes for authenticated user with search, filter, and pagination
// @route   GET /api/v1/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const {
    search,
    subject,
    category,
    isPinned,
    isLocked,
    tag,
    page = 1,
    limit = 20
  } = req.query;

  // Strict User Ownership: a student only accesses their own private notes
  const filter = { user: req.user._id };

  if (subject) {
    if (mongoose.Types.ObjectId.isValid(subject)) {
      filter.subject = subject;
    } else {
      filter.subjectName = new RegExp(subject.trim(), 'i');
    }
  }

  if (category) {
    filter.category = new RegExp(category.trim(), 'i');
  }

  if (isPinned !== undefined) {
    filter.isPinned = isPinned === 'true' || isPinned === true;
  }

  if (isLocked !== undefined) {
    filter.isLocked = isLocked === 'true' || isLocked === true;
  }

  if (tag) {
    filter.tags = tag.trim();
  }

  if (search && search.trim()) {
    const term = search.trim();
    const regex = new RegExp(term, 'i');
    filter.$or = [
      { title: regex },
      { content: regex },
      { description: regex },
      { tags: regex },
      { subjectName: regex },
      { category: regex }
    ];
  }

  let total = await Note.countDocuments(filter);

  // Auto-seed starter notes if brand new student account has 0 notes
  if (total === 0 && !search && !subject && !category && !tag) {
    const starterDocs = DEFAULT_STARTER_NOTES.map((n) => ({
      ...n,
      user: req.user._id,
      uploader: req.user._id,
      characterCount: (n.content || '').length,
      approvalStatus: 'approved'
    }));
    await Note.insertMany(starterDocs);
    total = starterDocs.length;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const notes = await Note.find(filter)
    .populate('subject', 'name code color credits')
    .sort({ isPinned: -1, updatedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.success(
    res,
    'Notes retrieved successfully',
    {
      notes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    },
    200
  );
});

// @desc    Get single note by ID (user ownership verified)
// @route   GET /api/v1/notes/:id
// @access  Private
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).populate('subject', 'name code color credits');

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  // Strict ownership check: ensure student only accesses their own note
  if (note.user && note.user.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Access denied: You can only view your own private notes', [], 403);
  }

  return ApiResponse.success(res, 'Note details retrieved successfully', { note }, 200);
});

// @desc    Update note (user ownership verified)
// @route   PUT /api/v1/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  // Strict ownership check
  if (note.user && note.user.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Access denied: You can only modify your own private notes', [], 403);
  }

  const {
    title,
    content,
    description,
    subject,
    subjectName,
    tags,
    category,
    isPinned,
    isLocked,
    color,
    fileUrl,
    fileType
  } = req.body;

  if (title !== undefined) note.title = title.trim();
  if (content !== undefined) {
    note.content = content;
    note.characterCount = (content || '').length;
    if (description === undefined && !note.description) {
      note.description = content ? content.slice(0, 160) : 'No additional text';
    }
  }
  if (description !== undefined) note.description = description.trim();

  if (subject !== undefined) {
    if (subject && mongoose.Types.ObjectId.isValid(subject)) {
      const subjectDoc = await Subject.findOne({ _id: subject, user: req.user._id });
      if (subjectDoc) {
        note.subject = subjectDoc._id;
        note.subjectName = subjectDoc.name;
      }
    } else if (!subject) {
      note.subject = null;
    }
  }

  if (subjectName !== undefined) note.subjectName = subjectName.trim();

  if (tags !== undefined) {
    note.tags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
  }

  if (category !== undefined) note.category = category.trim();
  if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
  if (isLocked !== undefined) note.isLocked = Boolean(isLocked);
  if (color !== undefined) note.color = color.trim();
  if (fileUrl !== undefined) note.fileUrl = fileUrl.trim();
  if (fileType !== undefined) note.fileType = fileType.trim();

  await note.save();

  const populatedNote = await Note.findById(note._id).populate('subject', 'name code color credits');

  return ApiResponse.success(res, 'Note updated successfully', { note: populatedNote }, 200);
});

// @desc    Delete note (user ownership verified)
// @route   DELETE /api/v1/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  // Strict ownership check
  if (note.user && note.user.toString() !== req.user._id.toString()) {
    return ApiResponse.error(res, 'Access denied: You can only delete your own private notes', [], 403);
  }

  await Note.deleteOne({ _id: note._id });

  return ApiResponse.success(res, 'Note deleted successfully', { deletedId: note._id }, 200);
});

// @desc    Quick JSON-based note upload (fileUrl as string)
// @route   POST /api/notes/quick-upload
// @access  Private
const quickUploadNote = asyncHandler(async (req, res) => {
  const { title, description, subject, branch, semester, tags, fileUrl, fileType } = req.body;

  if (!title) {
    return ApiResponse.error(res, 'Title is required', [], 400);
  }

  const parsedTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim())
      : [];

  const note = await Note.create({
    user: req.user._id,
    uploader: req.user._id,
    title,
    content: description || '',
    description: description || '',
    subjectName: subject || 'General',
    branch: branch || 'General',
    semester: Number(semester) || 1,
    tags: parsedTags,
    fileUrl: fileUrl || '',
    fileType: fileType || 'pdf',
    approvalStatus: 'approved',
    downloadCount: 0,
    avgRating: 5.0
  });

  return ApiResponse.success(res, 'Note uploaded successfully', { note }, 201);
});

// @desc    Admin approve or reject note
// @route   PATCH /api/notes/:id/approve
// @access  Private/Admin
const approveNote = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return ApiResponse.error(res, 'Status must be either approved or rejected', [], 400);
  }

  const note = await Note.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
  if (!note) {
    return ApiResponse.error(res, 'Note not found', [], 404);
  }

  return ApiResponse.success(res, `Note ${status} successfully`, { note }, 200);
});

// @desc    Toggle bookmark for a note
// @route   POST /api/notes/:id/bookmark
// @access  Private
const toggleBookmark = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const existingBookmark = await Bookmark.findOne({ user: req.user._id, note: noteId });

  if (existingBookmark) {
    await Bookmark.deleteOne({ _id: existingBookmark._id });
    return ApiResponse.success(res, 'Bookmark removed', { isBookmarked: false }, 200);
  }

  await Bookmark.create({ user: req.user._id, note: noteId });
  return ApiResponse.success(res, 'Note bookmarked', { isBookmarked: true }, 200);
});

// @desc    Rate a note
// @route   POST /api/notes/:id/rate
// @access  Private
const rateNote = asyncHandler(async (req, res) => {
  const { score } = req.body;
  const noteId = req.params.id;

  await Rating.findOneAndUpdate(
    { user: req.user._id, note: noteId },
    { score },
    { upsert: true, new: true }
  );

  const ratings = await Rating.find({ note: noteId });
  const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  await Note.findByIdAndUpdate(noteId, { avgRating: Number(avg.toFixed(1)) });

  return ApiResponse.success(res, 'Rating submitted', { avgRating: avg.toFixed(1) }, 200);
});

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  quickUploadNote,
  approveNote,
  toggleBookmark,
  rateNote
};
