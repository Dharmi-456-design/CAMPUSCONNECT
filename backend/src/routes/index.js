const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const noteRoutes = require('./note.routes');
const doubtRoutes = require('./doubt.routes');
const teamPostRoutes = require('./teamPost.routes');
const recommendationRoutes = require('./recommendation.routes');
const marketplaceRoutes = require('./marketplace.routes');
const chatRoutes = require('./chat.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');
const eventsRoutes = require('./events.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);
router.use('/doubts', doubtRoutes);
router.use('/team-posts', teamPostRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/events', eventsRoutes);
router.use('/', reportRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusConnect API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
