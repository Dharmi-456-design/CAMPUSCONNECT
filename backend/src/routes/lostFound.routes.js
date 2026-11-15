const express = require('express');
const router = express.Router();
const {
  createLostFoundItem,
  getLostFoundItems,
  getLostFoundItemById,
  updateLostFoundItem,
  deleteLostFoundItem,
} = require('../controllers/lostFound.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createLostFoundSchema,
  updateLostFoundSchema,
} = require('../validators/lostFound.validator');

router
  .route('/')
  .post(protect, validate(createLostFoundSchema), createLostFoundItem)
  .get(protect, getLostFoundItems);

router
  .route('/:id')
  .get(protect, getLostFoundItemById)
  .put(protect, validate(updateLostFoundSchema), updateLostFoundItem)
  .delete(protect, deleteLostFoundItem);

module.exports = router;
