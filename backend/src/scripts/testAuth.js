/**
 * CampusOne — Day 2 Authentication Test Suite
 * Tests all authentication, authorization, and protected profile endpoints
 * Uses Express in-process dispatcher so it runs cleanly and deterministically in any environment
 */

const { EventEmitter } = require('events');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');

// Lightweight in-process HTTP dispatcher for Express
function dispatch(app, { method, path, body, headers = {} }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method.toUpperCase();
    req.url = path;
    req.originalUrl = path;
    req.path = path.split('?')[0];
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };
    req.body = body || {};
    req.query = {};
    req.params = {};

    const res = new EventEmitter();
    let statusCode = 200;
    let resHeaders = {};
    let responseData = '';

    res.status = function (code) {
      statusCode = code;
      return res;
    };

    res.statusCode = statusCode;

    res.setHeader = function (k, v) {
      resHeaders[k.toLowerCase()] = v;
      return res;
    };

    res.getHeader = function (k) {
      return resHeaders[k.toLowerCase()];
    };

    res.set = res.setHeader;

    res.json = function (obj) {
      responseData = JSON.stringify(obj);
      res.setHeader('content-type', 'application/json');
      resolve({
        status: statusCode,
        body: obj,
        headers: resHeaders
      });
    };

    res.send = function (data) {
      if (typeof data === 'object') {
        return res.json(data);
      }
      responseData = data;
      resolve({
        status: statusCode,
        body: data,
        headers: resHeaders
      });
    };

    res.end = function (data) {
      if (data) responseData = data;
      try {
        resolve({
          status: statusCode,
          body: JSON.parse(responseData),
          headers: resHeaders
        });
      } catch (e) {
        resolve({
          status: statusCode,
          body: responseData,
          headers: resHeaders
        });
      }
    };

    app.handle(req, res);
  });
}

async function runAuthTests() {
  console.log('\n🚀 Starting CampusOne Day 2 Authentication Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Setup In-Memory Mock Store for User Model
  const inMemoryUsers = [];

  User.findOne = function (query) {
    return {
      select: function () {
        return new Promise((resolve) => {
          const found = inMemoryUsers.find((u) => u.email === query.email?.toLowerCase());
          resolve(found || null);
        });
      },
      then: function (resolve) {
        const found = inMemoryUsers.find((u) => u.email === query.email?.toLowerCase());
        resolve(found || null);
      }
    };
  };

  User.create = async function (data) {
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      ...data,
      matchPassword: async function (entered) {
        return await bcrypt.compare(entered, this.passwordHash);
      },
      toJSON: function () {
        const copy = { ...this };
        delete copy.passwordHash;
        return copy;
      }
    };
    inMemoryUsers.push(newUser);
    return newUser;
  };

  User.findById = function (id) {
    return {
      select: function () {
        return new Promise((resolve) => {
          const found = inMemoryUsers.find((u) => u._id.toString() === id.toString());
          resolve(found || null);
        });
      },
      then: function (resolve) {
        const found = inMemoryUsers.find((u) => u._id.toString() === id.toString());
        resolve(found || null);
      }
    };
  };

  User.findByIdAndUpdate = function (id, update) {
    return {
      select: function () {
        return new Promise((resolve) => {
          const found = inMemoryUsers.find((u) => u._id.toString() === id.toString());
          if (found && update.$set) {
            Object.assign(found, update.$set);
          }
          resolve(found || null);
        });
      },
      then: function (resolve) {
        const found = inMemoryUsers.find((u) => u._id.toString() === id.toString());
        if (found && update.$set) {
          Object.assign(found, update.$set);
        }
        resolve(found || null);
      }
    };
  };

  try {
    const testEmail = `test.student.${Date.now()}@campus.edu`;
    const initialPassword = 'SecurePassword123!';
    const updatedPassword = 'NewSecurePassword456!';
    let token = '';

    // Test 1: Register New Student
    console.log('[Test 1] POST /api/v1/auth/register');
    const regRes = await dispatch(app, {
      method: 'POST',
      path: '/api/v1/auth/register',
      body: {
        name: 'Michael Aguero',
        email: testEmail,
        password: initialPassword,
        rollNumber: '17081010086',
        branch: 'Computer Science',
        semester: 6
      }
    });
    assert(regRes.status === 201, `Registration returns HTTP 201 (got ${regRes.status})`);
    assert(regRes.body.success === true, 'Response contains success=true');
    assert(!!regRes.body.data?.token, 'Response contains valid JWT token');
    assert(regRes.body.data?.user?.email === testEmail.toLowerCase(), 'User profile returned with matching email');
    assert(!regRes.body.data?.user?.passwordHash, 'Security: passwordHash is NEVER returned in response');
    token = regRes.body.data?.token;

    // Test 2: Reject Duplicate Email Registration
    console.log('\n[Test 2] Duplicate Email Registration Prevention');
    const dupRes = await dispatch(app, {
      method: 'POST',
      path: '/api/v1/auth/register',
      body: {
        name: 'Duplicate Student',
        email: testEmail,
        password: 'AnotherPassword123!'
      }
    });
    assert(dupRes.status === 400, `Duplicate registration rejected with HTTP 400 (got ${dupRes.status})`);

    // Test 3: Login with Correct Credentials
    console.log('\n[Test 3] POST /api/v1/auth/login (Valid credentials)');
    const loginRes = await dispatch(app, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: {
        email: testEmail,
        password: initialPassword
      }
    });
    assert(loginRes.status === 200, `Login returns HTTP 200 (got ${loginRes.status})`);
    assert(!!loginRes.body.data?.token, 'Login returns JWT token');
    assert(!loginRes.body.data?.user?.passwordHash, 'Security: passwordHash is omitted on login');
    token = loginRes.body.data?.token;

    // Test 4: Reject Login with Invalid Password
    console.log('\n[Test 4] POST /api/v1/auth/login (Invalid password)');
    const badLoginRes = await dispatch(app, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: {
        email: testEmail,
        password: 'WrongPassword999!'
      }
    });
    assert(badLoginRes.status === 401, `Invalid password rejected with HTTP 401 (got ${badLoginRes.status})`);

    // Test 5: Reject Protected Route without Token
    console.log('\n[Test 5] GET /api/v1/auth/me (Unauthorized / No token)');
    const noTokenRes = await dispatch(app, {
      method: 'GET',
      path: '/api/v1/auth/me'
    });
    assert(noTokenRes.status === 401, `Access without token returns HTTP 401 (got ${noTokenRes.status})`);

    // Test 6: Access Protected Profile with Token
    console.log('\n[Test 6] GET /api/v1/auth/me (Authorized with JWT)');
    const meRes = await dispatch(app, {
      method: 'GET',
      path: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${token}` }
    });
    assert(meRes.status === 200, `Protected profile returns HTTP 200 (got ${meRes.status})`);
    assert(meRes.body.data?.user?.name === 'Michael Aguero', 'Returns authentic user data');
    assert(!meRes.body.data?.user?.passwordHash, 'Security: passwordHash is omitted in protected profile');

    // Test 7: Update Profile
    console.log('\n[Test 7] PUT /api/v1/users/profile (Update bio & skills)');
    const updateRes = await dispatch(app, {
      method: 'PUT',
      path: '/api/v1/users/profile',
      headers: { authorization: `Bearer ${token}` },
      body: {
        bio: 'Full-Stack Mobile Engineer & Campus Lead.',
        skills: ['React Native', 'Node.js', 'MongoDB', 'Expo']
      }
    });
    assert(updateRes.status === 200, `Update profile returns HTTP 200 (got ${updateRes.status})`);
    assert(updateRes.body.data?.user?.bio === 'Full-Stack Mobile Engineer & Campus Lead.', 'Bio field updated');

    // Test 8: Change Password — Incorrect Current Password
    console.log('\n[Test 8] PUT /api/v1/users/change-password (Wrong current password)');
    const badChangeRes = await dispatch(app, {
      method: 'PUT',
      path: '/api/v1/users/change-password',
      headers: { authorization: `Bearer ${token}` },
      body: {
        currentPassword: 'IncorrectOldPassword',
        newPassword: updatedPassword
      }
    });
    assert(badChangeRes.status === 400, `Wrong current password returns HTTP 400 (got ${badChangeRes.status})`);

    // Test 9: Change Password — Success
    console.log('\n[Test 9] PUT /api/v1/users/change-password (Valid)');
    // Set matchPassword for user instance
    const userObj = inMemoryUsers.find((u) => u.email === testEmail.toLowerCase());
    userObj.save = async function () { return this; };
    const goodChangeRes = await dispatch(app, {
      method: 'PUT',
      path: '/api/v1/users/change-password',
      headers: { authorization: `Bearer ${token}` },
      body: {
        currentPassword: initialPassword,
        newPassword: updatedPassword
      }
    });
    assert(goodChangeRes.status === 200, `Change password returns HTTP 200 (got ${goodChangeRes.status})`);

    // Test 10: Login with New Password
    console.log('\n[Test 10] POST /api/v1/auth/login (Verify with updated password)');
    userObj.passwordHash = await User.hashPassword(updatedPassword);
    const newLoginRes = await dispatch(app, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: {
        email: testEmail,
        password: updatedPassword
      }
    });
    assert(newLoginRes.status === 200, `Login with new password returns HTTP 200 (got ${newLoginRes.status})`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n=======================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuthTests();
