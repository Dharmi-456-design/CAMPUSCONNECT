const express = require('express');
const router = express.Router();
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/notice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createNoticeSchema,
  updateNoticeSchema
} = require('../validators/notice.validator');

router
  .route('/')
  .get(getNotices)
  .post(protect, authorize('admin', 'faculty'), validate(createNoticeSchema), createNotice);

router
  .route('/:id')
  .get(getNoticeById)
  .put(protect, authorize('admin', 'faculty'), validate(updateNoticeSchema), updateNotice)
  .delete(protect, authorize('admin', 'faculty'), deleteNotice);

module.exports = router;
