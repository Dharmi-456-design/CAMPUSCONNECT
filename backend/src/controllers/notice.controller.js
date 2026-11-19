const mongoose = require('mongoose');
const Notice = require('../models/Notice');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Real Swaminarayan University notices
const DEFAULT_CAMPUS_NOTICES = [
  {
    title: 'Swaminarayan University Convocation & Degree Award Ceremony 2026',
    content: 'Online registration for the Annual Convocation of Swaminarayan University, Kalol is now open. Eligible graduates must verify their academic credentials.',
    category: 'Academic',
    isImportant: true,
    department: 'Examination & Student Welfare'
  },
  {
    title: 'Campus Placement & Internship Drive — IT & Engineering Batch 2026',
    content: 'On-campus placement sessions for 6th and 8th Semester Computer Engineering students commence from next week. Register with your updated resume.',
    category: 'Administration',
    isImportant: true,
    department: 'Training & Placement Office (TPO)'
  },
  {
    title: 'Mid-Semester Examination Timetable & Seating Schedule',
    content: 'The official schedule for Odd Semester Mid-Term Examinations has been published. Reporting time is 10:15 AM at Examination Block C.',
    category: 'Examination',
    isImportant: true,
    department: 'Faculty of Engineering (SSIT)'
  },
  {
    title: 'Smart India Hackathon (SIH 2026) — College Internal Pitching Round',
    content: 'All shortlisted teams for SIH 2026 must present their prototypes and architectural diagrams in the Innovation Lab on Saturday.',
    category: 'Academic',
    isImportant: false,
    department: 'Computer Science & Engineering'
  },
  {
    title: 'Swaminarayan University Central Library 24/7 Reading Rooms Open',
    content: 'During mid-semester examinations, the central digital library and computer labs will remain open 24/7 with high-speed Wi-Fi access.',
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
