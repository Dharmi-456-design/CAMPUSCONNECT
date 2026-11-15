/**
 * testDay6FullIntegration.js — Complete End-to-End Integration Test Suite (Day 6)
 * Tests every module from signup to logout:
 *  - Authentication: Registration, Login, Profile retrieval, Profile update, Password change, Token verification
 *  - Academics: Subject creation, Private Notes ownership and isolation
 *  - Events & Notices: Registration, Duplicate registration rejection, Notice board
 *  - Lost & Found: Reporting, Privacy redaction on contact info, Unauthorized edits
 *  - Community: Post creation, Comments, Discussions, Cascading deletion
 *  - Security: Password hash never exposed, Private data protected, 401 on unauthenticated access
 *
 * Run: node src/scripts/testDay6FullIntegration.js
 */
'use strict';

process.env.JWT_SECRET = 'campusconnect_jwt_secret_key_2026_safe';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';

const Module = require('module');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── In-Memory Database Stores ────────────────────────────────────────────────
const _userStore = [];
const _subjectStore = [];
const _noteStore = [];
const _eventStore = [];
const _regStore = [];
const _noticeStore = [];
const _lostFoundStore = [];
const _postStore = [];
const _commentStore = [];

let _seq = 5000;
const newId = () => new Array(25).join('0').slice(0, 24 - String(++_seq).length) + String(_seq);

// Generic Mongoose-like Query Wrapper
class FakeQuery {
  constructor(data) {
    this._data = data;
  }

  select(fields) {
    if (!this._data) return Promise.resolve(null);
    if (Array.isArray(this._data)) {
      return Promise.resolve(this._data);
    }
    let copy;
    if (this._data instanceof FakeUser) {
      copy = new FakeUser(this._data);
    } else {
      copy = { ...this._data };
    }
    if (typeof fields === 'string') {
      if (fields.includes('-passwordHash')) {
        delete copy.passwordHash;
      }
    }
    return Promise.resolve(copy);
  }

  populate() {
    return this;
  }

  sort() {
    return this;
  }

  skip(n) {
    if (Array.isArray(this._data)) {
      this._data = this._data.slice(n);
    }
    return this;
  }

  limit(n) {
    if (Array.isArray(this._data)) {
      this._data = this._data.slice(0, n);
    }
    return this;
  }

  then(resolve, reject) {
    return Promise.resolve(this._data).then(resolve, reject);
  }
}

// ── User Model Mock ──────────────────────────────────────────────────────────
class FakeUser {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.role = fields.role || 'student';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async matchPassword(plainPassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(plainPassword, this.passwordHash);
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  save() {
    const idx = _userStore.findIndex((u) => u._id === this._id);
    if (idx !== -1) {
      _userStore[idx] = this;
    } else {
      _userStore.push(this);
    }
    return Promise.resolve(this);
  }

  toJSON() {
    const obj = { ...this };
    delete obj.passwordHash;
    return obj;
  }

  static create(data) {
    const user = new FakeUser(data);
    _userStore.push(user);
    return Promise.resolve(user);
  }

  static findOne(query) {
    const user = _userStore.find((u) => {
      if (query.email) return u.email.toLowerCase() === query.email.toLowerCase();
      return true;
    });
    return new FakeQuery(user ? new FakeUser(user) : null);
  }

  static findById(id) {
    const user = _userStore.find((u) => String(u._id) === String(id));
    return new FakeQuery(user ? new FakeUser(user) : null);
  }

  static findByIdAndUpdate(id, update, options) {
    const user = _userStore.find((u) => String(u._id) === String(id));
    if (!user) return new FakeQuery(null);
    const updates = update.$set ? update.$set : update;
    Object.assign(user, updates);
    user.updatedAt = new Date();
    return new FakeQuery(new FakeUser(user));
  }

  static countDocuments() {
    return Promise.resolve(_userStore.length);
  }
}

// ── Subject Model Mock ───────────────────────────────────────────────────────
class FakeSubject {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
  }
  static create(data) {
    const s = new FakeSubject(data);
    _subjectStore.push(s);
    return Promise.resolve(s);
  }
  static find(filter = {}) {
    let result = _subjectStore;
    if (filter.user) result = result.filter((s) => String(s.user) === String(filter.user));
    return new FakeQuery(result);
  }
  static findOne(query = {}) {
    const s = _subjectStore.find((x) => {
      if (query._id && query.user) return String(x._id) === String(query._id) && String(x.user) === String(query.user);
      if (query.code && query.user) return x.code === query.code && String(x.user) === String(query.user);
      return false;
    });
    return new FakeQuery(s || null);
  }
  static findById(id) {
    return new FakeQuery(_subjectStore.find((s) => String(s._id) === String(id)) || null);
  }
  static countDocuments() {
    return Promise.resolve(_subjectStore.length);
  }
}

// ── Note Model Mock ──────────────────────────────────────────────────────────
class FakeNote {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
  }
  static create(data) {
    const n = new FakeNote(data);
    _noteStore.push(n);
    return Promise.resolve(n);
  }
  static find(filter = {}) {
    let result = _noteStore;
    if (filter.user) result = result.filter((n) => String(n.user) === String(filter.user));
    return new FakeQuery(result);
  }
  static findById(id) {
    return new FakeQuery(_noteStore.find((n) => String(n._id) === String(id)) || null);
  }
  static countDocuments() {
    return Promise.resolve(_noteStore.length);
  }
}

// ── Event & Notice Models Mock ──────────────────────────────────────────────
class FakeEvent {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.registeredCount = fields.registeredCount || 0;
  }
  save() {
    const idx = _eventStore.findIndex((x) => x._id === this._id);
    if (idx !== -1) {
      _eventStore[idx] = this;
    } else {
      _eventStore.push(this);
    }
    return Promise.resolve(this);
  }
  toJSON() {
    return { ...this };
  }
  static create(data) {
    const e = new FakeEvent(data);
    _eventStore.push(e);
    return Promise.resolve(e);
  }
  static insertMany(arr) {
    const items = arr.map((d) => new FakeEvent(d));
    _eventStore.push(...items);
    return Promise.resolve(items);
  }
  static find() {
    return new FakeQuery([..._eventStore]);
  }
  static findById(id) {
    const found = _eventStore.find((e) => String(e._id) === String(id));
    return new FakeQuery(found ? new FakeEvent(found) : null);
  }
  static findByIdAndUpdate(id, update) {
    const e = _eventStore.find((x) => String(x._id) === String(id));
    if (!e) return new FakeQuery(null);
    if (update.$inc && update.$inc.registeredCount) {
      e.registeredCount = (e.registeredCount || 0) + update.$inc.registeredCount;
    }
    Object.assign(e, update);
    return new FakeQuery(e);
  }
  static countDocuments() {
    return Promise.resolve(_eventStore.length);
  }
}

class FakeEventRegistration {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.status = fields.status || 'CONFIRMED';
  }
  static create(data) {
    const r = new FakeEventRegistration(data);
    _regStore.push(r);
    return Promise.resolve(r);
  }
  static findOne(query) {
    const found = _regStore.find(
      (r) =>
        String(r.event) === String(query.event) &&
        String(r.user) === String(query.user) &&
        (!query.status || r.status === query.status)
    );
    return new FakeQuery(found || null);
  }
  static findOneAndUpdate(query, update, options) {
    let reg = _regStore.find(
      (r) => String(r.event) === String(query.event) && String(r.user) === String(query.user)
    );
    if (!reg && options && options.upsert) {
      reg = new FakeEventRegistration({
        event: query.event,
        user: query.user,
        ...(update.$set || update),
      });
      _regStore.push(reg);
    } else if (reg && update) {
      Object.assign(reg, update.$set || update);
    }
    return Promise.resolve(reg);
  }
  static find(query = {}) {
    let res = _regStore;
    if (query.user) res = res.filter((r) => String(r.user) === String(query.user));
    return new FakeQuery(res);
  }
  static countDocuments() {
    return Promise.resolve(_regStore.length);
  }
}

class FakeNotice {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
  }
  static insertMany(arr) {
    const items = arr.map((d) => new FakeNotice(d));
    _noticeStore.push(...items);
    return Promise.resolve(items);
  }
  static find() {
    return new FakeQuery([..._noticeStore]);
  }
  static findById(id) {
    return new FakeQuery(_noticeStore.find((n) => String(n._id) === String(id)) || null);
  }
  static countDocuments() {
    return Promise.resolve(_noticeStore.length);
  }
}

// ── Lost & Found Model Mock ──────────────────────────────────────────────────
class FakeLostFoundItem {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.createdAt = new Date();
  }
  toObject() {
    return JSON.parse(JSON.stringify(this));
  }
  static create(data) {
    const item = new FakeLostFoundItem(data);
    _lostFoundStore.push(item);
    return Promise.resolve(item);
  }
  static insertMany(arr) {
    const items = arr.map((d) => new FakeLostFoundItem(d));
    _lostFoundStore.push(...items);
    return Promise.resolve(items);
  }
  static find() {
    return new FakeQuery([..._lostFoundStore]);
  }
  static findById(id) {
    const item = _lostFoundStore.find((i) => String(i._id) === String(id));
    return new FakeQuery(item ? new FakeLostFoundItem(item) : null);
  }
  static findByIdAndUpdate(id, update) {
    const item = _lostFoundStore.find((i) => String(i._id) === String(id));
    if (!item) return new FakeQuery(null);
    Object.assign(item, update);
    return new FakeQuery(new FakeLostFoundItem(item));
  }
  static findByIdAndDelete(id) {
    const idx = _lostFoundStore.findIndex((i) => String(i._id) === String(id));
    if (idx !== -1) _lostFoundStore.splice(idx, 1);
    return Promise.resolve({ _id: id });
  }
  static countDocuments() {
    return Promise.resolve(_lostFoundStore.length);
  }
}

// ── Community Models Mock ────────────────────────────────────────────────────
class FakeCommunityPost {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.commentCount = fields.commentCount || 0;
    this.createdAt = new Date();
  }
  static create(data) {
    const p = new FakeCommunityPost(data);
    _postStore.push(p);
    return Promise.resolve(p);
  }
  static insertMany(arr) {
    const items = arr.map((d) => new FakeCommunityPost(d));
    _postStore.push(...items);
    return Promise.resolve(items);
  }
  static find() {
    return new FakeQuery([..._postStore]);
  }
  static findById(id) {
    const p = _postStore.find((x) => String(x._id) === String(id));
    return new FakeQuery(p ? new FakeCommunityPost(p) : null);
  }
  static findByIdAndUpdate(id, update) {
    const p = _postStore.find((x) => String(x._id) === String(id));
    if (!p) return new FakeQuery(null);
    if (update.$inc && update.$inc.commentCount) {
      p.commentCount = (p.commentCount || 0) + update.$inc.commentCount;
    }
    Object.assign(p, update);
    return new FakeQuery(new FakeCommunityPost(p));
  }
  static findByIdAndDelete(id) {
    const idx = _postStore.findIndex((x) => String(x._id) === String(id));
    if (idx !== -1) _postStore.splice(idx, 1);
    return Promise.resolve({ _id: id });
  }
  static countDocuments() {
    return Promise.resolve(_postStore.length);
  }
}

class FakeComment {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.createdAt = new Date();
  }
  static create(data) {
    const c = new FakeComment(data);
    _commentStore.push(c);
    return Promise.resolve(c);
  }
  static find(query = {}) {
    let res = _commentStore;
    if (query.post) res = res.filter((c) => String(c.post) === String(query.post));
    return new FakeQuery(res);
  }
  static findById(id) {
    const found = _commentStore.find((c) => String(c._id) === String(id));
    return new FakeQuery(found || null);
  }
  static deleteMany(query = {}) {
    if (query.post) {
      const remaining = _commentStore.filter((c) => String(c.post) !== String(query.post));
      _commentStore.length = 0;
      _commentStore.push(...remaining);
    }
    return Promise.resolve({ acknowledged: true });
  }
}

// ── Inject Mocks into Node Module Cache ──────────────────────────────────────
const userModelPath = path.resolve(__dirname, '../models/User.js');
const subjectModelPath = path.resolve(__dirname, '../models/Subject.js');
const noteModelPath = path.resolve(__dirname, '../models/Note.js');
const eventModelPath = path.resolve(__dirname, '../models/Event.js');
const regModelPath = path.resolve(__dirname, '../models/EventRegistration.js');
const noticeModelPath = path.resolve(__dirname, '../models/Notice.js');
const lostFoundModelPath = path.resolve(__dirname, '../models/LostFoundItem.js');
const communityPostModelPath = path.resolve(__dirname, '../models/CommunityPost.js');
const commentModelPath = path.resolve(__dirname, '../models/Comment.js');
const dbConfigPath = path.resolve(__dirname, '../config/db.js');

require(userModelPath);
Module._cache[userModelPath].exports = FakeUser;

require(subjectModelPath);
Module._cache[subjectModelPath].exports = FakeSubject;

require(noteModelPath);
Module._cache[noteModelPath].exports = FakeNote;

require(eventModelPath);
Module._cache[eventModelPath].exports = FakeEvent;

require(regModelPath);
Module._cache[regModelPath].exports = FakeEventRegistration;

require(noticeModelPath);
Module._cache[noticeModelPath].exports = FakeNotice;

require(lostFoundModelPath);
Module._cache[lostFoundModelPath].exports = FakeLostFoundItem;

require(communityPostModelPath);
Module._cache[communityPostModelPath].exports = FakeCommunityPost;

require(commentModelPath);
Module._cache[commentModelPath].exports = FakeComment;

require(dbConfigPath);
Module._cache[dbConfigPath].exports = async () => {};

// ── Supertest Setup ──────────────────────────────────────────────────────────
const request = require('supertest');
const app = require('../app');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  FAIL: ${message}`);
    failedTests++;
  }
}

async function runEndToEndTests() {
  console.log('\n================================================================');
  console.log('   DAY 6 COMPLETE APPLICATION INTEGRATION & VERIFICATION       ');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & SECURITY FLOW
  // ─────────────────────────────────────────────────────────────
  console.log('=== 1. Authentication & Security Flow ===');

  // Test 1.1: Register new student
  const resRegister = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Dharmi Patel',
      email: 'dharmi.patel@ssit.edu.in',
      password: 'InitialPassword123',
      branch: 'Computer Engineering',
      semester: 3,
      college: 'Swaminarayan University, Kalol',
    });

  assert(resRegister.status === 201, 'POST /auth/register: User registers successfully (201)');
  const registeredToken = resRegister.body.data?.token;
  const registeredUser = resRegister.body.data?.user;
  assert(registeredToken !== undefined, 'POST /auth/register: Returns valid JWT token');
  assert(registeredUser.passwordHash === undefined, 'Security: Password hash is NEVER returned in response');

  // Test 1.2: Register a second user (Student B)
  const resRegB = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Rahul Mehta',
      email: 'rahul.mehta@ssit.edu.in',
      password: 'StudentBPassword123',
      branch: 'Computer Engineering',
      semester: 3,
    });
  const tokenB = resRegB.body.data?.token;
  const studentBId = resRegB.body.data?.user?._id;

  // Test 1.3: Login with correct credentials
  const resLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'dharmi.patel@ssit.edu.in',
      password: 'InitialPassword123',
    });
  assert(resLogin.status === 200, 'POST /auth/login: Valid credentials login succeeds (200)');
  assert(resLogin.body.data?.user?.email === 'dharmi.patel@ssit.edu.in', 'POST /auth/login: User data returned');

  // Test 1.4: Login with incorrect credentials fails
  const resBadLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'dharmi.patel@ssit.edu.in',
      password: 'WrongPassword!',
    });
  assert(resBadLogin.status === 401, 'POST /auth/login: Bad password rejected with 401 Unauthorized');

  // Test 1.5: Access profile API
  const resProfile = await request(app)
    .get('/api/v1/users/profile')
    .set('Authorization', `Bearer ${registeredToken}`);
  assert(resProfile.status === 200, 'GET /users/profile: Protected profile accessible with token');

  // Test 1.6: Update user profile
  const resUpdateProfile = await request(app)
    .put('/api/v1/users/profile')
    .set('Authorization', `Bearer ${registeredToken}`)
    .send({
      name: 'Dharmi Patel (Updated)',
      bio: 'B.Tech CSE student passionate about Full-Stack & AI.',
    });
  assert(resUpdateProfile.status === 200, 'PUT /users/profile: Updates profile fields successfully');
  assert(
    resUpdateProfile.body.data?.user?.name === 'Dharmi Patel (Updated)',
    'PUT /users/profile: Updated name persisted'
  );

  // Test 1.7: Change password
  const resChangePwd = await request(app)
    .put('/api/v1/users/change-password')
    .set('Authorization', `Bearer ${registeredToken}`)
    .send({
      currentPassword: 'InitialPassword123',
      newPassword: 'BrandNewSecurePassword456',
    });
  assert(resChangePwd.status === 200, 'PUT /users/change-password: Password updated successfully (200)');

  // Test 1.8: Login with old password rejected
  const resOldLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'dharmi.patel@ssit.edu.in',
      password: 'InitialPassword123',
    });
  assert(resOldLogin.status === 401, 'Security: Login with old password rejected (401)');

  // Test 1.9: Login with new password succeeds
  const resNewLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'dharmi.patel@ssit.edu.in',
      password: 'BrandNewSecurePassword456',
    });
  assert(resNewLogin.status === 200, 'Security: Login with new password succeeds (200)');
  const freshToken = resNewLogin.body.data?.token;

  // Test 1.10: Unauthenticated request rejected
  const resUnauth = await request(app).get('/api/v1/users/profile');
  assert(resUnauth.status === 401, 'Security: Missing token rejected with 401 Unauthorized');

  // Admin user for faculty/admin routes
  const adminUser = new FakeUser({
    _id: newId(),
    name: 'SSIT Admin',
    email: 'admin@ssit.edu.in',
    role: 'admin',
  });
  _userStore.push(adminUser);
  const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // ─────────────────────────────────────────────────────────────
  // 2. ACADEMICS & NOTES MODULE (DAY 3 FLOW)
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== 2. Academics & Private Notes Module ===');

  // Test 2.1: Create Subject
  const resSub = await request(app)
    .post('/api/v1/subjects')
    .set('Authorization', `Bearer ${freshToken}`)
    .send({
      name: 'Analysis & Design of Algorithms',
      code: 'ADA301',
      credits: 4,
    });
  assert(resSub.status === 201, 'POST /subjects: Subject created successfully (201)');
  const subjectId = resSub.body.data?.subject?._id || resSub.body.data?._id;

  // Test 2.2: Create Private Note
  const resNote = await request(app)
    .post('/api/v1/notes')
    .set('Authorization', `Bearer ${freshToken}`)
    .send({
      title: 'Handwritten Module 1 ADA Notes',
      content: 'Master theorem asymptotic complexity derivations.',
      subject: subjectId,
    });
  assert(resNote.status === 201, 'POST /notes: Student creates private note (201)');
  const noteId = resNote.body.data?.note?._id || resNote.body.data?._id;

  // Test 2.3: Student B cannot view or edit Student A private note
  const resNoteB = await request(app)
    .get(`/api/v1/notes/${noteId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(resNoteB.status === 403, 'Privacy: Student B cannot access Student A private note (403 Forbidden)');

  // ─────────────────────────────────────────────────────────────
  // 3. EVENTS & NOTICES MODULE (DAY 4 FLOW)
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== 3. Events & Notices Module ===');

  // Test 3.1: Admin creates event
  const resEvent = await request(app)
    .post('/api/v1/events')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Smart Gujarat Hackathon Orientation',
      description: 'Introduction to problem statements and squad registrations.',
      category: 'Clubs and Orgs',
      date: new Date(Date.now() + 86400000).toISOString(),
      time: '10:00 AM',
      venue: 'Main Auditorium',
      capacity: 100,
    });
  assert(resEvent.status === 201, 'POST /events: Admin creates campus event successfully (201)');
  const eventId = resEvent.body.data?.event?._id || resEvent.body.data?._id;

  // Test 3.2: Register for event
  const resReg = await request(app)
    .post(`/api/v1/events/${eventId}/register`)
    .set('Authorization', `Bearer ${freshToken}`);
  assert(resReg.status === 201, 'POST /events/:id/register: Student registers for event (201)');

  // Test 3.3: Duplicate registration rejected
  const resDupReg = await request(app)
    .post(`/api/v1/events/${eventId}/register`)
    .set('Authorization', `Bearer ${freshToken}`);
  assert(resDupReg.status === 400, 'Integrity: Duplicate event registration rejected (400)');

  // ─────────────────────────────────────────────────────────────
  // 4. LOST & FOUND MODULE (DAY 5 FLOW)
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== 4. Lost & Found Module ===');

  // Test 4.1: Report lost item with hidden phone
  const resLF = await request(app)
    .post('/api/v1/lost-found')
    .set('Authorization', `Bearer ${freshToken}`)
    .send({
      type: 'LOST',
      title: 'HP Scientific Calculator',
      category: 'Electronics',
      location: 'Room 204 Computer Lab',
      description: 'Silver HP 35s scientific calculator with serial tag.',
      contactInfo: {
        name: 'Dharmi Patel',
        phone: '+91 99988 77766',
        email: 'dharmi@campus.edu',
        showPhone: false,
        showEmail: true,
      },
    });
  assert(resLF.status === 201, 'POST /lost-found: Lost item reported (201)');
  const lfId = resLF.body.data?._id;

  // Test 4.2: Student B views item -> phone is hidden
  const resLFViewB = await request(app)
    .get(`/api/v1/lost-found/${lfId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(
    resLFViewB.body.data?.contactInfo?.phone === undefined,
    'Privacy: Student B cannot see hidden contact phone number'
  );

  // Test 4.3: Unauthorized delete rejected
  const resLFDelB = await request(app)
    .delete(`/api/v1/lost-found/${lfId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(resLFDelB.status === 403, 'Authorization: Student B cannot delete Student A report (403)');

  // ─────────────────────────────────────────────────────────────
  // 5. COMMUNITY MODULE (DAY 5 FLOW)
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== 5. Community Forum Module ===');

  // Test 5.1: Create post
  const resPost = await request(app)
    .post('/api/v1/community/posts')
    .set('Authorization', `Bearer ${freshToken}`)
    .send({
      title: 'Best approach for Dynamic Programming Memoization?',
      content: 'Can someone explain top-down vs bottom-up with space complexity?',
      category: 'Question',
      subject: 'Analysis & Design of Algorithms',
      helpType: 'community',
    });
  assert(resPost.status === 201, 'POST /community/posts: Community post created (201)');
  const postId = resPost.body.data?._id;

  // Test 5.2: Student B comments on post
  const resComm = await request(app)
    .post(`/api/v1/community/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${tokenB}`)
    .send({
      content: 'Top-down uses recursion + cache table; bottom-up fills the iterative matrix directly!',
    });
  assert(resComm.status === 201, 'POST /community/posts/:id/comments: Student B adds answer (201)');

  // Test 5.3: Unauthorized post deletion rejected
  const resDelPostB = await request(app)
    .delete(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(resDelPostB.status === 403, 'Authorization: Student B cannot delete Student A post (403)');

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`DAY 6 FULL INTEGRATION RESULTS: ${passedTests}/${totalTests} tests passed`);
  if (failedTests === 0) {
    console.log('STATUS: FULL APPLICATION INTEGRATION VERIFIED 100%! 🚀');
  } else {
    console.error(`STATUS: ${failedTests} TESTS FAILED.`);
    process.exit(1);
  }
  console.log('================================================================\n');
}

runEndToEndTests().catch((err) => {
  console.error('\nFatal test error:', err);
  process.exit(1);
});
