/**
 * testAuth.js — Integration tests for authentication and protected routes
 * Uses supertest to fire real HTTP requests through the Express app.
 * MongoDB is mocked in-memory so no network connection is needed.
 *
 * Run: node src/scripts/testAuth.js
 */

'use strict';

// ─── 1. Prevent real MongoDB connection before anything is required ───────────
process.env.MONGODB_URI = '';
process.env.JWT_SECRET = 'test_jwt_secret_campusconnect_2026';
process.env.NODE_ENV = 'test';

// ─── 2. Mock mongoose BEFORE requiring app/models ─────────────────────────────
const mongoose = require('mongoose');

// Stub connect so it resolves immediately without hitting Atlas
mongoose.connect = () => Promise.resolve();

// ─── 3. Build in-memory user store & mock User model ─────────────────────────
const bcrypt = require('bcryptjs');

let _users = [];
let _idCounter = 1;

function makeId() {
  return String(_idCounter++).padStart(24, '0');
}

// Minimal mongoose ObjectId-like wrapper
class FakeUser {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) this._id = makeId();
  }

  async matchPassword(plain) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(plain, this.passwordHash);
  }

  async save() {
    const idx = _users.findIndex(u => String(u._id) === String(this._id));
    if (idx !== -1) _users[idx] = this;
    else _users.push(this);
    return this;
  }

  toJSON() {
    const obj = { ...this };
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
  }
}

// Chainable query helper
function makeQuery(user) {
  const q = { _user: user };
  q.select = function (fields) {
    if (typeof fields === 'string' && fields.includes('-passwordHash')) {
      if (this._user) delete this._user.passwordHash;
    }
    return Promise.resolve(this._user ? new FakeUser(this._user) : null);
  };
  return q;
}

// Patch the User model that will be loaded by controllers
const UserModule = require('../models/User');

// Override static & instance methods on the already-compiled model
UserModule.findOne = async (query) => {
  const key = Object.keys(query)[0];
  const val = Object.values(query)[0];
  const found = _users.find(u => u[key] === val);
  if (!found) return null;
  const u = new FakeUser({ ...found });
  // Return a chainable query that also has .select()
  const q = { _user: found };
  q.select = function (fields) {
    // If +passwordHash is requested keep it, else strip
    if (typeof fields === 'string' && fields.startsWith('+')) {
      return Promise.resolve(new FakeUser({ ...found })); // keep hash
    }
    const copy = { ...found };
    delete copy.passwordHash;
    return Promise.resolve(new FakeUser(copy));
  };
  // Also works as a thenable (for await without .select())
  q.then = function (resolve, reject) {
    return Promise.resolve(new FakeUser({ ...found })).then(resolve, reject);
  };
  return q;
};

UserModule.create = async (data) => {
  const user = new FakeUser({ ...data, _id: makeId(), __v: 0 });
  _users.push({ ...user });
  return user;
};

UserModule.findById = (id) => {
  const found = _users.find(u => String(u._id) === String(id));
  return makeQuery(found ? { ...found } : null);
};

UserModule.findByIdAndUpdate = async (id, update, opts) => {
  const idx = _users.findIndex(u => String(u._id) === String(id));
  if (idx === -1) return null;
  const set = update.$set || {};
  _users[idx] = { ..._users[idx], ...set };
  return new FakeUser({ ..._users[idx] });
};

UserModule.hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

// ─── 4. Load app AFTER mocks are in place ─────────────────────────────────────
const request = require('supertest');
const app = require('../app');

// ─── 5. Test runner helpers ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label, detail) {
  if (condition) {
    console.log(`  ✅  PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL — ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

// ─── 6. Test suite ────────────────────────────────────────────────────────────
async function runTests() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log(' CampusConnect — Authentication & Protected Routes Tests');
  console.log('════════════════════════════════════════════════════════\n');

  let token = '';
  const TEST_USER = {
    name:     'Test Student',
    email:    'teststudent@campusconnect.test',
    password: 'SecurePass123'
  };

  // ── Test 1: Register a new user ───────────────────────────────────────────
  console.log('Test 1: Register a new user');
  {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER);
    assert(res.status === 201, 'POST /api/v1/auth/register returns 201', `got ${res.status}`);
    assert(res.body.success === true, 'Response has success:true');
    assert(res.body.data && res.body.data.token, 'Response contains JWT token');
    assert(!JSON.stringify(res.body).includes('passwordHash'), 'passwordHash NOT in response body');
    if (res.body.data && res.body.data.token) token = res.body.data.token;
  }

  // ── Test 2: Duplicate email is rejected ───────────────────────────────────
  console.log('\nTest 2: Duplicate email is rejected');
  {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_USER);
    assert(res.status === 400, 'Duplicate email returns 400', `got ${res.status}`);
    assert(res.body.success === false, 'Response has success:false');
  }

  // ── Test 3: Login with valid credentials ──────────────────────────────────
  console.log('\nTest 3: Login with valid credentials');
  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    assert(res.status === 200, 'POST /api/v1/auth/login returns 200', `got ${res.status}`);
    assert(res.body.success === true, 'Login success:true');
    assert(res.body.data && res.body.data.token, 'Login returns JWT token');
    assert(!JSON.stringify(res.body).includes('passwordHash'), 'passwordHash NOT in login response');
    if (res.body.data && res.body.data.token) token = res.body.data.token;
  }

  // ── Test 4: Login with wrong password is rejected ─────────────────────────
  console.log('\nTest 4: Wrong password is rejected');
  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'wrongpassword' });
    assert(res.status === 401, 'Wrong password returns 401', `got ${res.status}`);
    assert(res.body.success === false, 'Response has success:false');
  }

  // ── Test 5: Protected route without token returns 401 ─────────────────────
  console.log('\nTest 5: Protected route without token returns 401');
  {
    const res = await request(app).get('/api/v1/auth/me');
    assert(res.status === 401, 'GET /api/v1/auth/me without token returns 401', `got ${res.status}`);
    assert(res.body.success === false, 'Response has success:false');
  }

  // ── Test 6: Fetch profile with valid token ────────────────────────────────
  console.log('\nTest 6: GET /api/v1/auth/me with valid token');
  {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    assert(res.status === 200, 'GET /api/v1/auth/me returns 200', `got ${res.status}`);
    assert(res.body.success === true, 'Response has success:true');
    assert(res.body.data && res.body.data.user, 'Response contains user object');
    assert(!JSON.stringify(res.body).includes('passwordHash'), 'passwordHash NOT in profile response');
  }

  // ── Test 7: Update profile ────────────────────────────────────────────────
  console.log('\nTest 7: PUT /api/v1/users/profile updates profile');
  {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'CS student, 3rd year', college: 'Tech University' });
    assert(res.status === 200, 'PUT /api/v1/users/profile returns 200', `got ${res.status}`);
    assert(res.body.success === true, 'Response has success:true');
    assert(!JSON.stringify(res.body).includes('passwordHash'), 'passwordHash NOT in update response');
  }

  // ── Test 8: Change password — wrong current password ─────────────────────
  console.log('\nTest 8: Change password with wrong current password');
  {
    const res = await request(app)
      .put('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongOldPassword', newPassword: 'NewPass456' });
    assert(res.status === 400, 'Wrong current password returns 400', `got ${res.status}`);
    assert(res.body.success === false, 'Response has success:false');
  }

  // ── Test 9: Change password with correct current password ─────────────────
  console.log('\nTest 9: Change password with correct current password');
  {
    const res = await request(app)
      .put('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: TEST_USER.password, newPassword: 'NewSecurePass789' });
    assert(res.status === 200, 'PUT /api/v1/users/change-password returns 200', `got ${res.status}`);
    assert(res.body.success === true, 'Response has success:true');
  }

  // ── Test 10: Login with new password ──────────────────────────────────────
  console.log('\nTest 10: Login with new password after password change');
  {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'NewSecurePass789' });
    assert(res.status === 200, 'Login with new password returns 200', `got ${res.status}`);
    assert(res.body.success === true, 'Login success:true');
    assert(!JSON.stringify(res.body).includes('passwordHash'), 'passwordHash NOT in response');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log(` Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log('════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('✅  All authentication and protected route tests passed!');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
