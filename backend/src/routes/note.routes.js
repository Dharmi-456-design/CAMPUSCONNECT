const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  quickUploadNote,
  approveNote,
  toggleBookmark,
  rateNote
} = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/adminOnly.middleware');
const validate = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  createNoteSchema,
  updateNoteSchema,
  rateNoteSchema
} = require('../validators/note.validator');

// All note routes require authenticated student
router.use(protect);

router
  .route('/')
  .get(getNotes)
  .post(upload.single('file'), validate(createNoteSchema), createNote);

// Quick JSON upload endpoint
router.post('/quick-upload', quickUploadNote);

router
  .route('/:id')
  .get(getNoteById)
  .put(validate(updateNoteSchema), updateNote)
  .delete(deleteNote);

router.patch('/:id/approve', adminOnly, approveNote);
router.post('/:id/bookmark', toggleBookmark);
router.post('/:id/rate', validate(rateNoteSchema), rateNote);

module.exports = router;
