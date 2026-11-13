const express = require('express');
const router = express.Router();
const { getEventsAndNotices, createEventNotice } = require('../controllers/events.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getEventsAndNotices);
router.post('/', protect, createEventNotice);

module.exports = router;
