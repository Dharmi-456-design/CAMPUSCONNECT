const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Default starter notices matching university board
const DEFAULT_CAMPUS_NOTICES = [
  {
    title: 'Alur Yudisium Dan Wisuda Agustus 2026',
    content: 'Pendaftaran berkas yudisium program sarjana dan diploma dibuka mulai tanggal 19 Juli hingga 5 Agustus 2026 melalui portal akademik terpadu.',
    category: 'Academic',
    isImportant: true,
    department: 'All Departments'
  },
  {
    title: 'Pendaftaran Program Magang Bersertifikat DIKTI Batch 2',
    content: 'Mahasiswa semester 5 dan 7 yang memenuhi syarat IPK minimal 3.00 dapat mendaftarkan diri pada program Magang dan Studi Independen Bersertifikat.',
    category: 'Administration',
    isImportant: false,
    department: 'Career Center'
  },
  {
    title: 'Mid-Semester Examination Schedule Announcement',
    content: 'The official schedule for Odd Semester Mid-Term Examinations is now released. Students must bring their verified examination hall ticket and college ID.',
    category: 'Examination',
    isImportant: true,
    department: 'Examination Bureau'
  },
  {
    title: 'Campus Central Library Extended Study Hours During Finals',
    content: 'Starting next Monday, the Central Library reading rooms and digital learning labs will remain open 24/7 with complimentary high-speed Wi-Fi.',
    category: 'Campus',
    isImportant: false,
    department: 'Library Services'
  }
];

// @desc    Get all notices with filtering, search, and pagination
// @route   GET /api/v1/notices
// @access  Public / Authenticated
const getNotices = asyncHandler(async (req, res) => {
  const { category, isImportant, department, search, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (category && category !== 'All' && category !== 'all') {
    filter.category = category;
  }

  if (isImportant !== undefined) {
    filter.isImportant = isImportant === 'true' || isImportant === true;
  }

  if (department && department !== 'All Departments') {
    filter.department = new RegExp(department.trim(), 'i');
  }

  if (search && search.trim()) {
    const term = search.trim();
    const regex = new RegExp(term, 'i');
    filter.$or = [
      { title: regex },
      { content: regex },
      { department: regex },
      { category: regex }
    ];
  }

  let total = await Notice.countDocuments(filter);

  // Auto-seed starter notices if none exist
  if (total === 0 && !search && !category) {
    const defaultAuthor = req.user?._id || new mongoose.Types.ObjectId();
    const starterDocs = DEFAULT_CAMPUS_NOTICES.map((n) => ({
      ...n,
      publishedBy: defaultAuthor
    }));
    await Notice.insertMany(starterDocs);
    total = starterDocs.length;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const notices = await Notice.find(filter)
    .populate('publishedBy', 'name email role')
    .sort({ isImportant: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return ApiResponse.success(
    res,
    'Notices retrieved successfully',
    {
      notices,
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

// @desc    Get single notice by ID
// @route   GET /api/v1/notices/:id
// @access  Public / Authenticated
const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('publishedBy', 'name email role');

  if (!notice) {
    return ApiResponse.error(res, 'Notice not found', [], 404);
  }

  return ApiResponse.success(res, 'Notice details retrieved', { notice }, 200);
});

// @desc    Create a new notice
// @route   POST /api/v1/notices
// @access  Private/Admin or Faculty
const createNotice = asyncHandler(async (req, res) => {
  const { title, content, category, isImportant, department } = req.body;

  const notice = await Notice.create({
    title: title.trim(),
    content: content.trim(),
    category: category || 'Campus',
    isImportant: Boolean(isImportant),
    department: department ? department.trim() : 'All Departments',
    publishedBy: req.user._id
  });

  return ApiResponse.success(res, 'Notice published successfully', { notice }, 201);
});

// @desc    Update an existing notice
// @route   PUT /api/v1/notices/:id
// @access  Private/Admin or Faculty
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return ApiResponse.error(res, 'Notice not found', [], 404);
  }

  const allowedUpdates = ['title', 'content', 'category', 'isImportant', 'department'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      notice[field] = req.body[field];
    }
  });

  await notice.save();

  return ApiResponse.success(res, 'Notice updated successfully', { notice }, 200);
});

// @desc    Delete a notice
// @route   DELETE /api/v1/notices/:id
// @access  Private/Admin or Faculty
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    return ApiResponse.error(res, 'Notice not found', [], 404);
  }

  await Notice.deleteOne({ _id: notice._id });

  return ApiResponse.success(res, 'Notice deleted successfully', { deletedId: notice._id }, 200);
});

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
};
