const express = require('express');
const router = express.Router();
const { getMe, updateProfile, savePushToken } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validators/auth.validator');
const { upload } = require('../middleware/upload.middleware');

router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('photo'), validate(updateProfileSchema), updateProfile);
router.post('/push-token', protect, savePushToken);

module.exports = router;
