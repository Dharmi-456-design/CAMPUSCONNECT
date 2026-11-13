const express = require('express');
const router = express.Router();
const { register, login, googleAuth } = require('../controllers/auth.controller');
const { getMe } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Authentication Endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);

// Protected Auth Profile Endpoint
router.get('/me', protect, getMe);

module.exports = router;
