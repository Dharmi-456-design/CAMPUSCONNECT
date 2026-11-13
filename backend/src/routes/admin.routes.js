const express = require('express');
const router = express.Router();
const {
  getAdminReports,
  updateReportStatus,
  getAdminAnalytics
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/adminOnly.middleware');

router.use(protect, adminOnly);

router.get('/reports', getAdminReports);
router.patch('/reports/:id', updateReportStatus);
router.get('/analytics', getAdminAnalytics);

module.exports = router;
