const express = require('express');
const router = express.Router();
const {
  createDoubt,
  getDoubts,
  getDoubtById,
  createAnswer,
  upvoteAnswer,
  acceptAnswer
} = require('../controllers/doubt.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createDoubtSchema, createAnswerSchema } = require('../validators/doubt.validator');

// Optional file upload middleware (handles both multipart and json smoothly)
const optionalUpload = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  next();
};

router.route('/')
  .get(getDoubts)
  .post(protect, optionalUpload, validate(createDoubtSchema), createDoubt);

router.get('/:id', getDoubtById);
router.post('/:id/answers', protect, validate(createAnswerSchema), createAnswer);
router.patch('/answers/:id/upvote', protect, upvoteAnswer);
router.patch('/answers/:id/accept', protect, acceptAnswer);

module.exports = router;
