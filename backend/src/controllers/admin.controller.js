const Report = require('../models/Report');
const User = require('../models/User');
const Note = require('../models/Note');
const Doubt = require('../models/Doubt');
const MarketplaceListing = require('../models/MarketplaceListing');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get reports queue for admin
// @route   GET /api/admin/reports
// @access  Private (Admin Only)
const getAdminReports = asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const reports = await Report.find({ status })
    .populate('reporter', 'name email college branch')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Report.countDocuments({ status });

  return ApiResponse.success(res, 'Admin reports queue retrieved', {
    reports,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit)
    }
  });
});

// @desc    Update report status (reviewed/dismissed)
// @route   PATCH /api/admin/reports/:id
// @access  Private (Admin Only)
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!report) {
    return ApiResponse.error(res, 'Report not found', [], 404);
  }

  return ApiResponse.success(res, `Report status updated to ${status}`, { report });
});

// @desc    Real MongoDB Aggregation Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin Only)
const getAdminAnalytics = asyncHandler(async (req, res) => {
  // 1. Total counts via MongoDB countDocuments
  const totalUsers = await User.countDocuments();
  const totalNotes = await Note.countDocuments();
  const totalDoubts = await Doubt.countDocuments();
  const totalListings = await MarketplaceListing.countDocuments();
  const pendingReportsCount = await Report.countDocuments({ status: 'pending' });

  // 2. Top downloaded notes aggregation
  const topDownloadedNotes = await Note.aggregate([
    { $match: { approvalStatus: 'approved' } },
    { $sort: { downloadCount: -1 } },
    { $limit: 5 },
    { $project: { title: 1, subject: 1, downloadCount: 1, avgRating: 1 } }
  ]);

  // 3. Popular subjects aggregation
  const popularSubjects = await Note.aggregate([
    { $group: { _id: '$subject', noteCount: { $sum: 1 }, totalDownloads: { $sum: '$downloadCount' } } },
    { $sort: { noteCount: -1 } },
    { $limit: 5 }
  ]);

  // 4. Marketplace breakdown by status
  const marketplaceStats = await MarketplaceListing.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  return ApiResponse.success(res, 'Real-time MongoDB analytics generated', {
    counts: {
      totalUsers,
      totalNotes,
      totalDoubts,
      totalListings,
      pendingReports: pendingReportsCount
    },
    topDownloadedNotes,
    popularSubjects,
    marketplaceStats
  });
});

module.exports = {
  getAdminReports,
  updateReportStatus,
  getAdminAnalytics
};
