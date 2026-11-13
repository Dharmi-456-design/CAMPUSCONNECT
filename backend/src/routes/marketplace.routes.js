const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListingStatus,
  toggleFavoriteListing
} = require('../controllers/marketplace.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createListingSchema, updateListingStatusSchema } = require('../validators/marketplace.validator');

router.route('/')
  .get(getListings)
  .post(protect, upload.array('images', 5), validate(createListingSchema), createListing);

router.get('/:id', getListingById);
router.patch('/:id/status', protect, validate(updateListingStatusSchema), updateListingStatus);
router.post('/:id/favorite', protect, toggleFavoriteListing);

module.exports = router;
