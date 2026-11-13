const express = require('express');
const router = express.Router();
const {
  getConversations,
  createOrGetConversation,
  getMessages
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/conversations')
  .get(getConversations)
  .post(createOrGetConversation);

router.get('/conversations/:id/messages', getMessages);

module.exports = router;
