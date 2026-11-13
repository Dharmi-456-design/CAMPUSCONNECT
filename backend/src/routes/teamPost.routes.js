const express = require('express');
const router = express.Router();
const {
  createTeamPost,
  getTeamPosts,
  getTeamPostById,
  createTeamRequest,
  respondToTeamRequest
} = require('../controllers/teamPost.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createTeamPostSchema, teamRequestStatusSchema } = require('../validators/teamPost.validator');

router.route('/')
  .get(getTeamPosts)
  .post(protect, validate(createTeamPostSchema), createTeamPost);

router.get('/:id', getTeamPostById);
router.post('/:id/requests', protect, createTeamRequest);
router.patch('/requests/:id', protect, validate(teamRequestStatusSchema), respondToTeamRequest);

module.exports = router;
