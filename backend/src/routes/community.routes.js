const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  getComments,
} = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
} = require('../validators/community.validator');

// Post routes
router
  .route('/posts')
  .post(protect, validate(createPostSchema), createPost)
  .get(protect, getPosts);

router
  .route('/posts/:id')
  .get(protect, getPostById)
  .put(protect, validate(updatePostSchema), updatePost)
  .delete(protect, deletePost);

// Comment routes
router
  .route('/posts/:id/comments')
  .post(protect, validate(createCommentSchema), addComment)
  .get(protect, getComments);

module.exports = router;
