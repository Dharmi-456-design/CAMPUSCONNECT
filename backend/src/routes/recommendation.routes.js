const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getRecommendationsForUser } = require('../services/recommendation.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', protect, asyncHandler(async (req, res) => {
  const recommendations = await getRecommendationsForUser(req.user);
  return ApiResponse.success(res, 'Recommendations retrieved successfully', recommendations);
}));

module.exports = router;
