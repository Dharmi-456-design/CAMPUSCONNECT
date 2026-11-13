/**
 * testAuth.js — Integration tests for authentication and protected routes
 * Mocks User model at the Node module cache level so no DB is needed.
 *
 * Run: node src/scripts/testAuth.js
 */
'use strict';

process.env.JWT_SECRET     = 'test_jwt_secret_campusconnect_2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV       = 'test';
process.env.MONGODB_URI    = '';   // empty → db.js should skip connect

// ── Resolve the User model path and inject our mock BEFORE anything loads it ─
const Module  = require('module');
const path    = require('path');
const bcrypt  = require('bcryptjs');

const USER_MODEL_PATH = path.resolve(__dirname, '../models/User.js');

// In-memory user store
const _store = [];
let   _seq   = 1;
const newId  = () => new Array(25).join('0').slice(0, 24 - String(_seq).length) + String(_seq++);

class FakeUser {
  constructor (data) { Object.assign(this, data); }

  async matchPassword (plain) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(plain, this.passwordHash);
  }

  async save () {
    const i = _store.findIndex(u => u._id === this._id);
    const snap = { ...this };
    if (i !== -1) _store[i] = snap; else _store.push(snap);
    return this;
  }

  toJSON () {
    const o = { ...this };
    delete o.passwordHash;
    delete o.__v;
    return o;
  }
}

class FakeQuery {
  constructor (doc) { this._doc = doc; }

  select (fields) {
    if (!this._doc) return Promise.resolve(null);
    // Keep passwordHash only when explicitly selected via '+passwordHash'
    if (typeof fields === 'string' && fields.includes('+passwordHash')) {
      return Promise.resolve(new FakeUser({ ...this._doc }));
    }
    const copy = { ...this._doc };
    delete copy.passwordHash;
    return Promise.resolve(new FakeUser(copy));
  }

  then (resolve, reject) {
    if (!this._doc) return Promise.resolve(null).then(resolve, reject);
    const copy = { ...this._doc };
    delete copy.passwordHash;
    return Promise.resolve(new FakeUser(copy)).then(resolve, reject);
  }
}

// The fake User "model" object controllers will get
const UserMock = {
  findOne: (query) => {
    const [k, v] = Object.entries(query)[0];
    const found = _store.find(u => u[k] === v) || null;
    return new FakeQuery(found);
  },
  create: async (data) => {
    const doc = { ...data, _id: newId(), __v: 0 };
    _store.push(doc);
    return new FakeUser(doc);
  },
  findById: (id) => {
    const found = _store.find(u => u._id === String(id)) || null;
    return new FakeQuery(found);
  },
  findByIdAndUpdate: (id, update, _opts) => {
    const i = _store.findIndex(u => u._id === String(id));
    if (i === -1) return new FakeQuery(null);
    _store[i] = { ..._store[i], ...(update.$set || {}) };
    return new FakeQuery({ ..._store[i] });
  },
  hashPassword: async (plain) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
  }
};

// Inject mock into module cache BEFORE app loads
Module._cache[USER_MODEL_PATH] = { id: USER_MODEL_PATH, filename: USER_MODEL_PATH, loaded: true, exports: UserMock };

// Also stub out db connect so it's a no-op
const DB_PATH = path.resolve(__dirname, '../config/db.js');
Module._cache[DB_PATH] = { id: DB_PATH, filename: DB_PATH, loaded: true, exports: async () => {} };

// Also stub mongoose so models don't try to register
const mongoosePaths = Object.keys(Module._cache).filter(k => k.includes('mongoose') && k.endsWith('mongoose.js'));
// We won't stub mongoose itself — just prevent server.js from connecting by patching db.js above.

// ── Load app via app.js (not server.js — server.js calls connectDB) ───────────
const request = require('supertest');
const app     = require('../app');

// ── Helpers ───────────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
function ok (cond, label, hint) {
  if (cond) { console.log(`  ✅  PASS — ${label}`); pass++; }
  else       { console.error(`  ❌  FAIL — ${label}${hint ? ' → ' + hint : ''}`); fail++; }
}

// ── Test suite ────────────────────────────────────────────────────────────────
async function run () {
  console.log('\n════════════════════════════════════════════════════════');
  console.log(' CampusConnect — Authentication & Protected Routes Tests');
  console.log('════════════════════════════════════════════════════════\n');

  const EMAIL = 'dharmi.test@campusconnect.dev';
  const PASS  = 'SecurePass123';
  let token   = '';

  // 1 ─────────────────────────────────────────────────────────────────────────
  console.log('Test 1: Register a new user');
  {
    const r = await request(app).post('/api/v1/auth/register')
      .send({ name: 'Dharmi Test', email: EMAIL, password: PASS });
    ok(r.status === 201,              'POST /api/v1/auth/register returns 201',   `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === true,       'success: true');
    ok(!!r.body.data?.token,          'Response contains JWT token');
    ok(!JSON.stringify(r.body).includes('passwordHash'), 'passwordHash NOT in response');
    token = r.body.data?.token || '';
  }

  // 2 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 2: Duplicate email is rejected');
  {
    const r = await request(app).post('/api/v1/auth/register')
      .send({ name: 'Dharmi Test', email: EMAIL, password: PASS });
    ok(r.status === 400,         'Returns 400 for duplicate email', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  // 3 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 3: Login with valid credentials');
  {
    const r = await request(app).post('/api/v1/auth/login')
      .send({ email: EMAIL, password: PASS });
    ok(r.status === 200,         'POST /api/v1/auth/login returns 200',  `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === true,  'success: true');
    ok(!!r.body.data?.token,     'Response contains JWT token');
    ok(!JSON.stringify(r.body).includes('passwordHash'), 'passwordHash NOT in login response');
    if (r.body.data?.token) token = r.body.data.token;
  }

  // 4 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 4: Login with wrong password');
  {
    const r = await request(app).post('/api/v1/auth/login')
      .send({ email: EMAIL, password: 'WrongPassword!' });
    ok(r.status === 401,         'Returns 401 for wrong password', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  // 5 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 5: Protected route without token → 401');
  {
    const r = await request(app).get('/api/v1/auth/me');
    ok(r.status === 401,         'GET /api/v1/auth/me without token returns 401', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  // 6 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 6: GET /api/v1/auth/me with valid token');
  {
    const r = await request(app).get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    ok(r.status === 200,         'Returns 200',         `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === true,  'success: true');
    ok(!!r.body.data?.user,      'Response contains user object');
    ok(!JSON.stringify(r.body).includes('passwordHash'), 'passwordHash NOT in profile response');
  }

  // 7 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 7: PUT /api/v1/users/profile — update profile');
  {
    const r = await request(app).put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'CS student, final year', college: 'Gujarat Tech University' });
    ok(r.status === 200,         'Returns 200',    `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === true,  'success: true');
    ok(!JSON.stringify(r.body).includes('passwordHash'), 'passwordHash NOT in update response');
  }

  // 8 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 8: Change password — wrong current password');
  {
    const r = await request(app).put('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongOldPass!', newPassword: 'SomethingNew456' });
    ok(r.status === 400,         'Returns 400',  `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === false, 'success: false');
  }

  // 9 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 9: Change password — correct current password');
  {
    const r = await request(app).put('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: PASS, newPassword: 'NewSecurePass789' });
    ok(r.status === 200,         'Returns 200',    `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === true,  'success: true');
  }

  // 10 ─────────────────────────────────────────────────────────────────────────
  console.log('\nTest 10: Login with new password after password change');
  {
    const r = await request(app).post('/api/v1/auth/login')
      .send({ email: EMAIL, password: 'NewSecurePass789' });
    ok(r.status === 200,         'Login with new password returns 200', `got ${r.status} — ${r.body.message}`);
    ok(r.body.success === true,  'success: true');
    ok(!JSON.stringify(r.body).includes('passwordHash'), 'passwordHash NOT in response');
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const total = pass + fail;
  console.log('\n════════════════════════════════════════════════════════');
  console.log(` Results: ${pass} passed, ${fail} failed out of ${total} tests`);
  console.log('════════════════════════════════════════════════════════\n');

  if (fail > 0) {
    console.error('❌  Some tests failed — see above for details.');
    process.exit(1);
  } else {
    console.log('✅  All authentication and protected route tests passed!\n');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('\nFatal error during test run:', err);
  process.exit(1);
});
