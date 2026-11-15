const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createSubjectSchema,
  updateSubjectSchema
} = require('../validators/subject.validator');

// All subject routes are protected and strictly scoped to authenticated student
router.use(protect);

router
  .route('/')
  .post(validate(createSubjectSchema), createSubject)
  .get(getSubjects);

router
  .route('/:id')
  .get(getSubjectById)
  .put(validate(updateSubjectSchema), updateSubject)
  .delete(deleteSubject);

module.exports = router;
