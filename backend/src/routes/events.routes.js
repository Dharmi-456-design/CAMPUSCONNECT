const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/events.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createEventSchema,
  updateEventSchema
} = require('../validators/event.validator');

// Optional auth helper: identifies user if token is provided without failing if guest
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (e) {
      // Ignore invalid token on public routes
    }
  }
  next();
};

router
  .route('/')
  .get(optionalAuth, getEvents)
  .post(protect, authorize('admin', 'faculty'), validate(createEventSchema), createEvent);

router
  .route('/:id')
  .get(optionalAuth, getEventById)
  .put(protect, authorize('admin', 'faculty'), validate(updateEventSchema), updateEvent)
  .delete(protect, authorize('admin', 'faculty'), deleteEvent);

module.exports = router;
