const express = require('express');
const router = express.Router();
const { getMe, updateProfile, changePassword, savePushToken } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileSchema, changePasswordSchema } = require('../validators/auth.validator');
const { upload } = require('../middleware/upload.middleware');

// Profile Endpoints
router.get('/profile', protect, getMe);
router.get('/me', protect, getMe);

router.put('/profile', protect, upload.single('photo'), validate(updateProfileSchema), updateProfile);
router.put('/me', protect, upload.single('photo'), validate(updateProfileSchema), updateProfile);

// Password Change Endpoint
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

// Device Push Token
router.post('/push-token', protect, savePushToken);

module.exports = router;
