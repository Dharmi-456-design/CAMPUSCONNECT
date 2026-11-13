const express = require('express');
const router = express.Router();
const {
  createNote,
  quickUploadNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  approveNote,
  toggleBookmark,
  rateNote
} = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/adminOnly.middleware');
const validate = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createNoteSchema, updateNoteSchema, rateNoteSchema } = require('../validators/note.validator');

router.route('/')
  .get(getNotes)
  .post(protect, upload.single('file'), validate(createNoteSchema), createNote);

// Quick JSON-based upload (no Cloudinary, fileUrl provided as string)
router.post('/quick-upload', protect, quickUploadNote);

router.route('/:id')
  .get(getNoteById)
  .put(protect, validate(updateNoteSchema), updateNote)
  .delete(protect, deleteNote);

router.patch('/:id/approve', protect, adminOnly, approveNote);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/rate', protect, validate(rateNoteSchema), rateNote);

module.exports = router;
