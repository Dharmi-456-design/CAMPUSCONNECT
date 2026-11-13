const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || '402286075226-a65ogtb4kjl5ee62v71l8cvnemfeqp7q.apps.googleusercontent.com'
);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, branch, semester, year, role } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return ApiResponse.error(res, 'User with this email already exists', [], 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    college: college || '',
    branch: branch || '',
    semester: semester || 1,
    year: year || 1,
    role: role || 'student'
  });

  const token = generateToken(user._id, user.role);

  return ApiResponse.success(
    res,
    'User registered successfully',
    {
      user: user.toJSON(),
      token
    },
    201
  );
});

// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    return ApiResponse.error(res, 'Invalid credentials', [], 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return ApiResponse.error(res, 'Invalid credentials', [], 401);
  }

  const token = generateToken(user._id, user.role);

  return ApiResponse.success(
    res,
    'Login successful',
    {
      user: user.toJSON(),
      token
    },
    200
  );
});

// @desc    Google Sign-In / Sign-Up
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential, idToken, userInfo } = req.body;
  const tokenToVerify = credential || idToken;

  let payload = null;

  if (tokenToVerify) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: [
          process.env.GOOGLE_CLIENT_ID || '402286075226-a65ogtb4kjl5ee62v71l8cvnemfeqp7q.apps.googleusercontent.com',
          '402286075226-a65ogtb4kjl5ee62v71l8cvnemfeqp7q.apps.googleusercontent.com'
        ]
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      try {
        const fetchRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
        if (fetchRes.ok) {
          payload = await fetchRes.json();
        }
      } catch (err) {
        // fallback
      }
    }
  }

  // If userInfo was directly passed from an authorized client popup
  if (!payload && userInfo && userInfo.email) {
    payload = userInfo;
  }

  if (!payload || !payload.email) {
    return ApiResponse.error(res, 'Unable to authenticate with Google. Invalid token.', [], 401);
  }

  const email = payload.email.toLowerCase();
  const name = payload.name || payload.given_name || email.split('@')[0];
  const photoUrl = payload.picture || payload.photoUrl || '';
  const googleId = payload.sub || payload.id || '';

  let user = await User.findOne({ email });

  if (user) {
    let updated = false;
    if (!user.googleId && googleId) {
      user.googleId = googleId;
      updated = true;
    }
    if (!user.photoUrl && photoUrl) {
      user.photoUrl = photoUrl;
      updated = true;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      photoUrl,
      googleId,
      authProvider: 'google',
      isVerified: true,
      college: 'Institute of Technology',
      branch: 'Computer Science',
      semester: 1,
      year: 1,
      role: 'student'
    });
  }

  const token = generateToken(user._id, user.role);

  return ApiResponse.success(
    res,
    'Google authentication successful',
    {
      user: user.toJSON(),
      token
    },
    200
  );
});

module.exports = {
  register,
  login,
  googleAuth
};

