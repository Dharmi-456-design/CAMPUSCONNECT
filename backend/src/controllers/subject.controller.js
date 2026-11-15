const Subject = require('../models/Subject');
const Note = require('../models/Note');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Default starter subjects matching student reference screens
const DEFAULT_STARTER_SUBJECTS = [
  { code: 'BUS 138', name: 'Coding', credits: 1, semester: 6, grade: 'A', color: '#F59E0B', category: 'my_subjects', department: 'Computer Science' },
  { code: 'SOC100A', name: 'World History A', credits: 1, semester: 6, grade: 'A', color: '#EF4444', category: 'my_subjects', department: 'Social Sciences' },
  { code: 'SCI102A', name: 'Agri Biology A', credits: 1, semester: 6, grade: 'A', color: '#EAB308', category: 'my_subjects', department: 'Agricultural Sciences' },
  { code: 'PE166', name: 'Health', credits: 1, semester: 6, grade: '87.5%', color: '#84CC16', category: 'my_subjects', department: 'Physical Education' },
  { code: 'MTH101', name: 'Math 101', credits: 1, semester: 6, grade: 'B+', color: '#EAB308', category: 'main_hub', department: 'Mathematics' },
  { code: 'GEO436', name: 'Geometry 436', credits: 1, semester: 6, grade: 'A-', color: '#3B82F6', category: 'main_hub', department: 'Mathematics' },
  { code: 'HIS576', name: 'History 567', credits: 1, semester: 6, grade: 'A', color: '#84CC16', category: 'main_hub', department: 'History' }
];

// @desc    Create a new subject
// @route   POST /api/v1/subjects
// @access  Private
const createSubject = asyncHandler(async (req, res) => {
  const { code, name, credits, semester, department, instructor, grade, color, category, description } = req.body;

  const normalizedCode = (code || '').trim().toUpperCase();

  // Check if subject already exists for this user
  const existing = await Subject.findOne({ user: req.user._id, code: normalizedCode });
  if (existing) {
    return ApiResponse.error(res, `A subject with code '${normalizedCode}' already exists in your academic list.`, [], 400);
  }

  const subject = await Subject.create({
    user: req.user._id,
    code: normalizedCode,
    name: name.trim(),
    credits: Number(credits) || 3,
    semester: Number(semester) || 1,
    department: department ? department.trim() : 'Computer Science & Engineering',
    instructor: instructor ? instructor.trim() : '',
    grade: grade ? grade.trim() : 'A',
    color: color || '#10B981',
    category: category || 'my_subjects',
    description: description ? description.trim() : ''
  });

  return ApiResponse.success(res, 'Subject created successfully', { subject }, 201);
});

// @desc    Get all subjects for the authenticated user with search & pagination
// @route   GET /api/v1/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const { search, category, semester, department, page = 1, limit = 20 } = req.query;

  const filter = { user: req.user._id };

  if (category) {
    filter.category = category;
  }

  if (semester) {
    filter.semester = Number(semester);
  }

  if (department) {
    filter.department = new RegExp(department.trim(), 'i');
  }

  if (search && search.trim()) {
    const term = search.trim();
    const searchRegex = new RegExp(term, 'i');
    filter.$or = [
      { name: searchRegex },
      { code: searchRegex },
      { instructor: searchRegex },
      { department: searchRegex }
    ];
  }

  let total = await Subject.countDocuments(filter);

  // If user has zero subjects and didn't filter with search, seed default starter subjects
  if (total === 0 && !search && !category) {
    const starterDocs = DEFAULT_STARTER_SUBJECTS.map((s) => ({
      ...s,
      user: req.user._id
    }));
    await Subject.insertMany(starterDocs);
    total = starterDocs.length;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const subjects = await Subject.find(filter)
    .sort({ category: 1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Calculate live GPA approximation from grades
  let totalGradePoints = 0;
  let totalCredits = 0;
  subjects.forEach((s) => {
    let gp = 4.0;
    const g = (s.grade || 'A').toUpperCase();
    if (g.startsWith('A+')) gp = 4.0;
    else if (g.startsWith('A-')) gp = 3.7;
    else if (g.startsWith('A')) gp = 4.0;
    else if (g.startsWith('B+')) gp = 3.3;
    else if (g.startsWith('B')) gp = 3.0;
    else if (g.startsWith('C')) gp = 2.0;
    else if (g.includes('%')) {
      const num = parseFloat(g);
      gp = Math.min(4.0, (num / 100) * 4.0);
    }
    const cred = s.credits || 1;
    totalGradePoints += gp * cred;
    totalCredits += cred;
  });

  const calculatedGpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '3.67';

  return ApiResponse.success(
    res,
    'Subjects retrieved successfully',
    {
      subjects,
      gpa: calculatedGpa,
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

// @desc    Get single subject by ID
// @route   GET /api/v1/subjects/:id
// @access  Private
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

  if (!subject) {
    return ApiResponse.error(res, 'Subject not found or you do not have permission to view it', [], 404);
  }

  // Get notes associated with this subject
  const notesCount = await Note.countDocuments({ user: req.user._id, subject: subject._id });

  return ApiResponse.success(
    res,
    'Subject details retrieved successfully',
    {
      subject,
      notesCount
    },
    200
  );
});

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

  if (!subject) {
    return ApiResponse.error(res, 'Subject not found or you are not authorized to update it', [], 404);
  }

  const { code, name, credits, semester, department, instructor, grade, color, category, description } = req.body;

  if (code) {
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode !== subject.code) {
      const existing = await Subject.findOne({
        user: req.user._id,
        code: normalizedCode,
        _id: { $ne: subject._id }
      });
      if (existing) {
        return ApiResponse.error(res, `Another subject with code '${normalizedCode}' already exists.`, [], 400);
      }
      subject.code = normalizedCode;
    }
  }

  if (name !== undefined) subject.name = name.trim();
  if (credits !== undefined) subject.credits = Number(credits);
  if (semester !== undefined) subject.semester = Number(semester);
  if (department !== undefined) subject.department = department.trim();
  if (instructor !== undefined) subject.instructor = instructor.trim();
  if (grade !== undefined) subject.grade = grade.trim();
  if (color !== undefined) subject.color = color.trim();
  if (category !== undefined) subject.category = category;
  if (description !== undefined) subject.description = description.trim();

  await subject.save();

  // Keep notes synchronized if subject name changed
  if (name !== undefined) {
    await Note.updateMany(
      { user: req.user._id, subject: subject._id },
      { $set: { subjectName: subject.name } }
    );
  }

  return ApiResponse.success(res, 'Subject updated successfully', { subject }, 200);
});

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

  if (!subject) {
    return ApiResponse.error(res, 'Subject not found or you are not authorized to delete it', [], 404);
  }

  await Subject.deleteOne({ _id: subject._id });

  // Unlink associated notes so they are not orphaned
  await Note.updateMany(
    { user: req.user._id, subject: subject._id },
    { $set: { subject: null, subjectName: 'General' } }
  );

  return ApiResponse.success(res, 'Subject deleted successfully', { deletedId: subject._id }, 200);
});

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
};
