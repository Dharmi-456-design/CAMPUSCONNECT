const express = require('express');
const router = express.Router();
const { createReport, blockUser, unblockUser } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createReportSchema, blockUserSchema } = require('../validators/report.validator');

router.post('/reports', protect, validate(createReportSchema), createReport);
router.post('/blocks', protect, validate(blockUserSchema), blockUser);
router.delete('/blocks/:userId', protect, unblockUser);

module.exports = router;
