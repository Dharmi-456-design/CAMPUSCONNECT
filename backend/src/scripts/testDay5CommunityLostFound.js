/**
 * testDay5CommunityLostFound.js — Verification tests for Day 5 (Lost & Found & Community Modules)
 * Tests:
 *  - Lost & Found CRUD, search, filter, pagination
 *  - Privacy controls on contact info
 *  - Owner-only editing and deletion (403 on unauthorized)
 *  - Community Post CRUD, search, filter, pagination
 *  - Comments on posts, comment count increment
 *  - Author-only editing and deletion of community posts
 *
 * Run: node src/scripts/testDay5CommunityLostFound.js
 */
'use strict';

process.env.JWT_SECRET = 'test_jwt_secret_campusconnect_2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';

const Module = require('module');
const path = require('path');
const jwt = require('jsonwebtoken');

// ── In-Memory Database Stores ────────────────────────────────────────────────
const _userStore = [];
const _lostFoundStore = [];
const _postStore = [];
const _commentStore = [];

let _seq = 3000;
const newId = () => new Array(25).join('0').slice(0, 24 - String(++_seq).length) + String(_seq);

// Generic Mongoose-like Query Wrapper
class FakeQuery {
  constructor(data) {
    this._data = data;
  }

  select(fields) {
    if (!this._data) return Promise.resolve(null);
    if (Array.isArray(this._data)) {
      return Promise.resolve(this._data.map((d) => ({ ...d })));
    }
    const copy = { ...this._data };
    if (typeof fields === 'string' && fields.includes('-passwordHash')) {
      delete copy.passwordHash;
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

// ── Model Mock Constructors ──────────────────────────────────────────────────
class FakeUser {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  save() {
    _userStore.push(this);
    return Promise.resolve(this);
  }

  static findById(id) {
    const user = _userStore.find((u) => u._id === String(id));
    return new FakeQuery(user || null);
  }

  static findOne(query) {
    const user = _userStore.find((u) => (query.email ? u.email === query.email : true));
    return new FakeQuery(user || null);
  }

  static countDocuments() {
    return Promise.resolve(_userStore.length);
  }
}

class FakeLostFoundItem {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  save() {
    _lostFoundStore.push(this);
    return Promise.resolve(this);
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
    const created = arr.map((d) => new FakeLostFoundItem(d));
    _lostFoundStore.push(...created);
    return Promise.resolve(created);
  }

  static countDocuments(filter = {}) {
    let result = _lostFoundStore;
    if (filter.type) result = result.filter((i) => i.type === filter.type);
    if (filter.category) result = result.filter((i) => i.category === filter.category);
    return Promise.resolve(result.length);
  }

  static find(filter = {}) {
    let result = [..._lostFoundStore];
    if (filter.type) result = result.filter((i) => i.type === filter.type);
    if (filter.category) result = result.filter((i) => i.category === filter.category);
    if (filter.status) result = result.filter((i) => i.status === filter.status);
    if (filter.$or) {
      result = result.filter((i) => {
        return filter.$or.some((clause) => {
          if (clause.title && clause.title.$regex) {
            return new RegExp(clause.title.$regex, 'i').test(i.title || '');
          }
          if (clause.description && clause.description.$regex) {
            return new RegExp(clause.description.$regex, 'i').test(i.description || '');
          }
          if (clause.location && clause.location.$regex) {
            return new RegExp(clause.location.$regex, 'i').test(i.location || '');
          }
          return false;
        });
      });
    }
    return new FakeQuery(result);
  }

  static findById(id) {
    const item = _lostFoundStore.find((i) => i._id === String(id));
    return new FakeQuery(item ? new FakeLostFoundItem(item) : null);
  }

  static findByIdAndUpdate(id, update, options) {
    const item = _lostFoundStore.find((i) => i._id === String(id));
    if (!item) return new FakeQuery(null);
    Object.assign(item, update);
    item.updatedAt = new Date();
    return new FakeQuery(new FakeLostFoundItem(item));
  }

  static findByIdAndDelete(id) {
    const idx = _lostFoundStore.findIndex((i) => i._id === String(id));
    if (idx !== -1) {
      _lostFoundStore.splice(idx, 1);
    }
    return Promise.resolve({ _id: id });
  }
}

class FakeCommunityPost {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.commentCount = fields.commentCount || 0;
    this.upvoteCount = fields.upvoteCount || 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  save() {
    _postStore.push(this);
    return Promise.resolve(this);
  }

  static create(data) {
    const post = new FakeCommunityPost(data);
    _postStore.push(post);
    return Promise.resolve(post);
  }

  static insertMany(arr) {
    const created = arr.map((d) => new FakeCommunityPost(d));
    _postStore.push(...created);
    return Promise.resolve(created);
  }

  static countDocuments(filter = {}) {
    let result = _postStore;
    if (filter.category) result = result.filter((p) => p.category === filter.category);
    return Promise.resolve(result.length);
  }

  static find(filter = {}) {
    let result = [..._postStore];
    if (filter.category) result = result.filter((p) => p.category === filter.category);
    if (filter.helpType) result = result.filter((p) => p.helpType === filter.helpType);
    if (filter.$or) {
      result = result.filter((p) => {
        return filter.$or.some((clause) => {
          if (clause.title && clause.title.$regex) {
            return new RegExp(clause.title.$regex, 'i').test(p.title || '');
          }
          if (clause.content && clause.content.$regex) {
            return new RegExp(clause.content.$regex, 'i').test(p.content || '');
          }
          if (clause.subject && clause.subject.$regex) {
            return new RegExp(clause.subject.$regex, 'i').test(p.subject || '');
          }
          return false;
        });
      });
    }
    return new FakeQuery(result);
  }

  static findById(id) {
    const post = _postStore.find((p) => p._id === String(id));
    return new FakeQuery(post ? new FakeCommunityPost(post) : null);
  }

  static findByIdAndUpdate(id, update, options) {
    const post = _postStore.find((p) => p._id === String(id));
    if (!post) return new FakeQuery(null);
    if (update.$inc) {
      if (update.$inc.commentCount) {
        post.commentCount = (post.commentCount || 0) + update.$inc.commentCount;
      }
      delete update.$inc;
    }
    Object.assign(post, update);
    post.updatedAt = new Date();
    return new FakeQuery(new FakeCommunityPost(post));
  }

  static findByIdAndDelete(id) {
    const idx = _postStore.findIndex((p) => p._id === String(id));
    if (idx !== -1) {
      _postStore.splice(idx, 1);
    }
    return Promise.resolve({ _id: id });
  }
}

class FakeComment {
  constructor(fields) {
    Object.assign(this, fields);
    this._id = fields._id || newId();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(data) {
    if (Array.isArray(data)) {
      const items = data.map((d) => new FakeComment(d));
      _commentStore.push(...items);
      return Promise.resolve(items);
    }
    const c = new FakeComment(data);
    _commentStore.push(c);
    return Promise.resolve(c);
  }

  static find(filter = {}) {
    let result = [..._commentStore];
    if (filter.post) {
      result = result.filter((c) => String(c.post) === String(filter.post));
    }
    return new FakeQuery(result);
  }

  static findById(id) {
    const c = _commentStore.find((item) => item._id === String(id));
    return new FakeQuery(c ? new FakeComment(c) : null);
  }

  static deleteMany(filter = {}) {
    if (filter.post) {
      const remaining = _commentStore.filter((c) => String(c.post) !== String(filter.post));
      _commentStore.length = 0;
      _commentStore.push(...remaining);
    }
    return Promise.resolve({ acknowledged: true });
  }
}

// ── Inject Mocks into Node Cache ─────────────────────────────────────────────
const userModelPath = path.resolve(__dirname, '../models/User.js');
const lostFoundModelPath = path.resolve(__dirname, '../models/LostFoundItem.js');
const communityPostModelPath = path.resolve(__dirname, '../models/CommunityPost.js');
const commentModelPath = path.resolve(__dirname, '../models/Comment.js');
const dbConfigPath = path.resolve(__dirname, '../config/db.js');

require(userModelPath);
Module._cache[userModelPath].exports = FakeUser;

require(lostFoundModelPath);
Module._cache[lostFoundModelPath].exports = FakeLostFoundItem;

require(communityPostModelPath);
Module._cache[communityPostModelPath].exports = FakeCommunityPost;

require(commentModelPath);
Module._cache[commentModelPath].exports = FakeComment;

require(dbConfigPath);
Module._cache[dbConfigPath].exports = async () => {};

// ── Supertest & App Setup ────────────────────────────────────────────────────
const request = require('supertest');
const app = require('../app');

// ── Test Runner ──────────────────────────────────────────────────────────────
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

async function runTests() {
  console.log('\n======================================================');
  console.log('   DAY 5 VERIFICATION: LOST & FOUND AND COMMUNITY     ');
  console.log('======================================================\n');

  // Seed Users: Student A (Reporter), Student B (Viewer/Other), Admin
  const studentA = new FakeUser({
    _id: newId(),
    name: 'Dharmi Patel',
    email: 'dharmi@campus.edu',
    role: 'student',
    branch: 'Computer Engg.',
  });
  _userStore.push(studentA);

  const studentB = new FakeUser({
    _id: newId(),
    name: 'Ananya Sharma',
    email: 'ananya@campus.edu',
    role: 'student',
    branch: 'Pharmacy',
  });
  _userStore.push(studentB);

  const adminUser = new FakeUser({
    _id: newId(),
    name: 'Campus Admin',
    email: 'admin@campus.edu',
    role: 'admin',
  });
  _userStore.push(adminUser);

  const tokenA = jwt.sign({ id: studentA._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const tokenB = jwt.sign({ id: studentB._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const tokenAdmin = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // ─────────────────────────────────────────────────────────────
  // 1. LOST & FOUND APIS
  // ─────────────────────────────────────────────────────────────
  console.log('=== 1. Lost & Found APIs ===');

  // Test 1.1: Validation failure on missing required fields
  const resInvalidLF = await request(app)
    .post('/api/v1/lost-found')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ type: 'LOST', title: '' });
  assert(resInvalidLF.status === 400, 'POST /lost-found: Rejects missing fields with 400 Bad Request');

  // Test 1.2: Create a LOST item with privacy controls (hide phone, show email)
  const resCreateLost = await request(app)
    .post('/api/v1/lost-found')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({
      type: 'LOST',
      title: 'Blue ADA Spiral Notebook',
      category: 'Books & Notes',
      location: 'Library 2nd Floor Study Cubicle',
      description: 'Contains handwritten lecture notes for ADA and assignment 2 solutions.',
      contactInfo: {
        name: 'Dharmi Patel',
        phone: '+91 98765 00001',
        email: 'dharmi@campus.edu',
        showPhone: false,
        showEmail: true,
      },
    });

  assert(resCreateLost.status === 201, 'POST /lost-found: Student A creates LOST item report successfully (201)');
  const lostItemId = resCreateLost.body.data?._id;
  assert(lostItemId !== undefined, 'POST /lost-found: Returns valid generated item ID');

  // Test 1.3: Create a FOUND item
  const resCreateFound = await request(app)
    .post('/api/v1/lost-found')
    .set('Authorization', `Bearer ${tokenB}`)
    .send({
      type: 'FOUND',
      title: 'Brown leather wallet',
      category: 'Wallets & Bags',
      location: 'Student Center Cafeteria',
      description: 'Found brown leather wallet with campus card and cash.',
      contactInfo: {
        name: 'Ananya Sharma',
        phone: '+91 98765 00002',
        email: 'ananya@campus.edu',
        showPhone: true,
        showEmail: true,
      },
    });

  assert(resCreateFound.status === 201, 'POST /lost-found: Student B creates FOUND item report (201)');
  const foundItemId = resCreateFound.body.data?._id;

  // Test 1.4: Retrieve all items with pagination
  const resGetAllLF = await request(app)
    .get('/api/v1/lost-found')
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resGetAllLF.status === 200, 'GET /lost-found: Retrieves lost & found items with 200 OK');
  assert(
    resGetAllLF.body.data?.items?.length >= 2,
    `GET /lost-found: Returns item list with total ${resGetAllLF.body.data?.items?.length} items`
  );
  assert(
    resGetAllLF.body.data?.pagination?.page === 1,
    'GET /lost-found: Returns pagination metadata (page, limit, total)'
  );

  // Test 1.5: Search and filter by category and type
  const resSearchLF = await request(app)
    .get('/api/v1/lost-found?type=LOST&category=Books%20%26%20Notes')
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resSearchLF.status === 200, 'GET /lost-found: Filter by type and category returns 200');
  assert(
    resSearchLF.body.data?.items?.every((i) => i.type === 'LOST'),
    'GET /lost-found: Filter strictly returns only LOST items'
  );

  // Test 1.6: Privacy control verification
  // Student B views Student A's item -> phone MUST be redacted / hidden!
  const resViewPrivacy = await request(app)
    .get(`/api/v1/lost-found/${lostItemId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(resViewPrivacy.status === 200, 'GET /lost-found/:id: Student B views Student A item');
  assert(
    resViewPrivacy.body.data?.contactInfo?.phone === undefined,
    'Privacy Control: Student B cannot see Student A hidden phone number'
  );
  assert(
    resViewPrivacy.body.data?.contactInfo?.email === 'dharmi@campus.edu',
    'Privacy Control: Student B can see public email address'
  );

  // Test 1.7: Owner views their own item -> phone is accessible to owner
  const resOwnerView = await request(app)
    .get(`/api/v1/lost-found/${lostItemId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(
    resOwnerView.body.data?.contactInfo?.phone === '+91 98765 00001',
    'Privacy Control: Owner can see their own phone number'
  );

  // Test 1.8: Unauthorized update attempt (Student B tries to update Student A item)
  const resUnauthUpdate = await request(app)
    .put(`/api/v1/lost-found/${lostItemId}`)
    .set('Authorization', `Bearer ${tokenB}`)
    .send({ status: 'RESOLVED' });
  assert(
    resUnauthUpdate.status === 403,
    'PUT /lost-found/:id: Unauthorized update by non-owner rejected with 403 Forbidden'
  );

  // Test 1.9: Authorized update by owner (Student A marks item as RESOLVED)
  const resOwnerUpdate = await request(app)
    .put(`/api/v1/lost-found/${lostItemId}`)
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ status: 'RESOLVED' });
  assert(resOwnerUpdate.status === 200, 'PUT /lost-found/:id: Owner updates status to RESOLVED successfully');
  assert(resOwnerUpdate.body.data?.status === 'RESOLVED', 'PUT /lost-found/:id: Status successfully persisted');

  // Test 1.10: Unauthorized delete attempt (Student B tries to delete Student A item)
  const resUnauthDelete = await request(app)
    .delete(`/api/v1/lost-found/${lostItemId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(
    resUnauthDelete.status === 403,
    'DELETE /lost-found/:id: Unauthorized delete by non-owner rejected with 403 Forbidden'
  );

  // Test 1.11: Authorized delete by owner
  const resOwnerDelete = await request(app)
    .delete(`/api/v1/lost-found/${lostItemId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resOwnerDelete.status === 200, 'DELETE /lost-found/:id: Owner deletes item report successfully (200)');

  // ─────────────────────────────────────────────────────────────
  // 2. COMMUNITY POSTS AND COMMENTS APIS
  // ─────────────────────────────────────────────────────────────
  console.log('\n=== 2. Community Posts & Comments APIs ===');

  // Test 2.1: Validation failure on missing post fields
  const resInvalidPost = await request(app)
    .post('/api/v1/community/posts')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: '' });
  assert(resInvalidPost.status === 400, 'POST /community/posts: Rejects missing title/content with 400');

  // Test 2.2: Create community post
  const resCreatePost = await request(app)
    .post('/api/v1/community/posts')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({
      title: 'How to calculate Time Complexity for Nested Loops with logarithmic increments?',
      content: 'In my ADA tutorial test, there was a loop where i multiplies by 2. How do we derive Big-O?',
      category: 'Question',
      subject: 'Analysis & Design of Algorithms',
      helpType: 'community',
      tags: ['ADA', 'Algorithms'],
    });

  assert(resCreatePost.status === 201, 'POST /community/posts: Student A creates question post (201)');
  const postId = resCreatePost.body.data?._id;
  assert(postId !== undefined, 'POST /community/posts: Returns valid post ID');

  // Test 2.3: Create a second post (tutor help)
  const resCreatePost2 = await request(app)
    .post('/api/v1/community/posts')
    .set('Authorization', `Bearer ${tokenB}`)
    .send({
      title: 'Looking for 2 React Native devs for Smart Gujarat Hackathon',
      content: 'Building an offline diagnostic kit for rural PHCs.',
      category: 'Hackathon Squad',
      subject: 'Mobile & AI Dev',
      helpType: 'tutor',
      tags: ['Hackathon', 'ReactNative'],
    });
  assert(resCreatePost2.status === 201, 'POST /community/posts: Student B creates Hackathon squad post (201)');

  // Test 2.4: Get all posts with search & filter
  const resGetPosts = await request(app)
    .get('/api/v1/community/posts?category=Question')
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resGetPosts.status === 200, 'GET /community/posts: Filter by category returns 200');
  assert(
    resGetPosts.body.data?.posts?.every((p) => p.category === 'Question'),
    'GET /community/posts: Filter strictly returns only Question posts'
  );

  // Test 2.5: Get single post by ID
  const resGetPost = await request(app)
    .get(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resGetPost.status === 200, 'GET /community/posts/:id: Retrieves post details with 200 OK');
  assert(
    resGetPost.body.data?.post?.title.includes('Nested Loops'),
    'GET /community/posts/:id: Returns accurate post title'
  );

  // Test 2.6: Add comment to post (Student B answers Student A's question)
  const resAddComment = await request(app)
    .post(`/api/v1/community/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${tokenB}`)
    .send({
      content: 'Since i doubles every iteration (i = i * 2), outer loop runs log2(N) times. Total O(N log N)!',
    });
  assert(resAddComment.status === 201, 'POST /community/posts/:id/comments: Student B adds comment/answer (201)');

  // Test 2.7: Verify comment count incremented on post
  const resCheckCount = await request(app)
    .get(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(
    resCheckCount.body.data?.post?.commentCount >= 1,
    'Community Post: commentCount successfully incremented on post'
  );

  // Test 2.8: Get comments for post
  const resGetComments = await request(app)
    .get(`/api/v1/community/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resGetComments.status === 200, 'GET /community/posts/:id/comments: Returns comments array');
  assert(resGetComments.body.data?.length >= 1, 'GET /community/posts/:id/comments: Contains posted comment');

  // Test 2.9: Unauthorized update of post (Student B tries to update Student A post)
  const resUnauthPostUpdate = await request(app)
    .put(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenB}`)
    .send({ title: 'Hacked title' });
  assert(
    resUnauthPostUpdate.status === 403,
    'PUT /community/posts/:id: Unauthorized update rejected with 403 Forbidden'
  );

  // Test 2.10: Authorized update of post (Author updates status to solved)
  const resAuthPostUpdate = await request(app)
    .put(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ status: 'solved' });
  assert(resAuthPostUpdate.status === 200, 'PUT /community/posts/:id: Author updates post to solved (200)');
  assert(
    resAuthPostUpdate.body.data?.status === 'solved',
    'PUT /community/posts/:id: Status solved persisted'
  );

  // Test 2.11: Unauthorized delete of post (Student B tries to delete Student A post)
  const resUnauthPostDelete = await request(app)
    .delete(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(
    resUnauthPostDelete.status === 403,
    'DELETE /community/posts/:id: Unauthorized delete rejected with 403 Forbidden'
  );

  // Test 2.12: Authorized delete of post (Author deletes post and comments cascade)
  const resAuthPostDelete = await request(app)
    .delete(`/api/v1/community/posts/${postId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(resAuthPostDelete.status === 200, 'DELETE /community/posts/:id: Author deletes post (200)');

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`DAY 5 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  if (failedTests === 0) {
    console.log('STATUS: ALL TESTS PASSED SUCCESSFULLY! 🚀');
  } else {
    console.error(`STATUS: ${failedTests} TESTS FAILED.`);
    process.exit(1);
  }
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\nFatal test error:', err);
  process.exit(1);
});
