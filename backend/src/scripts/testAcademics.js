/**
 * testAcademics.js — Integration tests for Academics (Subjects & Notes) Module
 * Tests CRUD operations, user ownership isolation, search, pagination, and validation.
 *
 * Run: node src/scripts/testAcademics.js
 */
'use strict';

process.env.JWT_SECRET     = 'test_jwt_secret_campusconnect_2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV       = 'test';
process.env.MONGODB_URI    = '';

const Module = require('module');
const path   = require('path');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ── In-Memory Database Stores ────────────────────────────────────────────────
const _userStore    = [];
const _subjectStore = [];
const _noteStore    = [];

let _seq = 1000;
const newId = () => new Array(25).join('0').slice(0, 24 - String(++_seq).length) + String(_seq);

// Generic Mongoose-like Query Wrapper
class FakeQuery {
  constructor(data) {
    this._data = data; // Single document or Array of documents
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
    return this; // Chainable populate stub
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
    if (!this._data) return Promise.resolve(null).then(resolve, reject);
    if (Array.isArray(this._data)) {
      return Promise.resolve(this._data.map((d) => ({ ...d }))).then(resolve, reject);
    }
    return Promise.resolve({ ...this._data }).then(resolve, reject);
  }
}

// ── Mock User Model ──────────────────────────────────────────────────────────
const UserMock = {
  findById: (id) => {
    const found = _userStore.find((u) => String(u._id) === String(id));
    return new FakeQuery(found || null);
  },
  findOne: (query) => {
    const [k, v] = Object.entries(query)[0];
    const found = _userStore.find((u) => u[k] === v);
    return new FakeQuery(found || null);
  },
  create: async (data) => {
    const doc = { ...data, _id: newId(), __v: 0 };
    _userStore.push(doc);
    return { ...doc };
  }
};

// ── Mock Subject Model ────────────────────────────────────────────────────────
const SubjectMock = {
  find: (query = {}) => {
    let list = [..._subjectStore];
    if (query.user) {
      list = list.filter((s) => String(s.user) === String(query.user));
    }
    if (query.category) {
      list = list.filter((s) => s.category === query.category);
    }
    if (query.$or) {
      list = list.filter((s) =>
        query.$or.some((cond) => {
          const [k, regex] = Object.entries(cond)[0];
          return s[k] && regex.test(s[k]);
        })
      );
    }
    return new FakeQuery(list);
  },
  findOne: (query = {}) => {
    let list = [..._subjectStore];
    if (query._id) list = list.filter((s) => String(s._id) === String(query._id));
    if (query.user) list = list.filter((s) => String(s.user) === String(query.user));
    if (query.code) list = list.filter((s) => s.code === query.code);
    const found = list[0] || null;
    if (!found) return new FakeQuery(null);
    const copy = {
      ...found,
      save: async function () {
        const idx = _subjectStore.findIndex((s) => String(s._id) === String(this._id));
        if (idx !== -1) _subjectStore[idx] = { ...this };
        return this;
      }
    };
    return new FakeQuery(copy);
  },
  findById: (id) => {
    const found = _subjectStore.find((s) => String(s._id) === String(id)) || null;
    return new FakeQuery(found);
  },
  countDocuments: async (query = {}) => {
    let list = [..._subjectStore];
    if (query.user) list = list.filter((s) => String(s.user) === String(query.user));
    if (query.category) list = list.filter((s) => s.category === query.category);
    return list.length;
  },
  create: async (data) => {
    const doc = {
      ...data,
      _id: newId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    _subjectStore.push(doc);
    return { ...doc };
  },
  insertMany: async (docs) => {
    const inserted = docs.map((d) => ({
      ...d,
      _id: newId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    _subjectStore.push(...inserted);
    return inserted;
  },
  deleteOne: async (query) => {
    const idx = _subjectStore.findIndex((s) => String(s._id) === String(query._id));
    if (idx !== -1) _subjectStore.splice(idx, 1);
    return { deletedCount: idx !== -1 ? 1 : 0 };
  }
};

// ── Mock Note Model ───────────────────────────────────────────────────────────
const NoteMock = {
  find: (query = {}) => {
    let list = [..._noteStore];
    if (query.user) list = list.filter((n) => String(n.user) === String(query.user));
    if (query.subject) list = list.filter((n) => String(n.subject) === String(query.subject));
    if (query.isPinned !== undefined) list = list.filter((n) => n.isPinned === query.isPinned);
    if (query.isLocked !== undefined) list = list.filter((n) => n.isLocked === query.isLocked);
    if (query.$or) {
      list = list.filter((n) =>
        query.$or.some((cond) => {
          const [k, regex] = Object.entries(cond)[0];
          return n[k] && regex.test(n[k]);
        })
      );
    }
    return new FakeQuery(list);
  },
  findById: (id) => {
    const found = _noteStore.find((n) => String(n._id) === String(id)) || null;
    if (!found) return new FakeQuery(null);
    const copy = {
      ...found,
      save: async function () {
        const idx = _noteStore.findIndex((n) => String(n._id) === String(this._id));
        if (idx !== -1) _noteStore[idx] = { ...this };
        return this;
      }
    };
    return new FakeQuery(copy);
  },
  countDocuments: async (query = {}) => {
    let list = [..._noteStore];
    if (query.user) list = list.filter((n) => String(n.user) === String(query.user));
    if (query.subject) list = list.filter((n) => String(n.subject) === String(query.subject));
    return list.length;
  },
  create: async (data) => {
    const doc = {
      ...data,
      _id: newId(),
      characterCount: (data.content || '').length,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    _noteStore.push(doc);
    return { ...doc };
  },
  insertMany: async (docs) => {
    const inserted = docs.map((d) => ({
      ...d,
      _id: newId(),
      characterCount: (d.content || '').length,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    _noteStore.push(...inserted);
    return inserted;
  },
  deleteOne: async (query) => {
    const idx = _noteStore.findIndex((n) => String(n._id) === String(query._id));
    if (idx !== -1) _noteStore.splice(idx, 1);
    return { deletedCount: idx !== -1 ? 1 : 0 };
  },
  updateMany: async (filter, update) => {
    let count = 0;
    _noteStore.forEach((n) => {
      let match = true;
      if (filter.user && String(n.user) !== String(filter.user)) match = false;
      if (filter.subject && String(n.subject) !== String(filter.subject)) match = false;
      if (match) {
        Object.assign(n, update.$set || {});
        count++;
      }
    });
    return { modifiedCount: count };
  }
};

// ── Inject Mocks into Module Cache BEFORE App Loads ──────────────────────────
const USER_PATH    = path.resolve(__dirname, '../models/User.js');
const SUBJECT_PATH = path.resolve(__dirname, '../models/Subject.js');
const NOTE_PATH    = path.resolve(__dirname, '../models/Note.js');
const DB_PATH      = path.resolve(__dirname, '../config/db.js');

Module._cache[USER_PATH]    = { id: USER_PATH, filename: USER_PATH, loaded: true, exports: UserMock };
Module._cache[SUBJECT_PATH] = { id: SUBJECT_PATH, filename: SUBJECT_PATH, loaded: true, exports: SubjectMock };
Module._cache[NOTE_PATH]    = { id: NOTE_PATH, filename: NOTE_PATH, loaded: true, exports: NoteMock };
Module._cache[DB_PATH]      = { id: DB_PATH, filename: DB_PATH, loaded: true, exports: async () => {} };

// ── Load Supertest and Express App ───────────────────────────────────────────
const request = require('supertest');
const app     = require('../app');

// Test Assertion Counters
let pass = 0, fail = 0;
function ok(cond, label, hint) {
  if (cond) {
    console.log(`  ✅  PASS — ${label}`);
    pass++;
  } else {
    console.error(`  ❌  FAIL — ${label}${hint ? ' → ' + hint : ''}`);
    fail++;
  }
}

async function runAcademicsTests() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log(' CampusConnect — Academics & Notes Module Tests (Day 3)');
  console.log('════════════════════════════════════════════════════════\n');

  // Setup Test Students
  const studentA = await UserMock.create({
    name: 'Dharmi Patel',
    email: 'dharmi@campusconnect.test',
    role: 'student'
  });
  const tokenA = jwt.sign({ id: studentA._id, role: studentA.role }, process.env.JWT_SECRET);

  const studentB = await UserMock.create({
    name: 'Other Student',
    email: 'other@campusconnect.test',
    role: 'student'
  });
  const tokenB = jwt.sign({ id: studentB._id, role: studentB.role }, process.env.JWT_SECRET);

  let createdSubjectId = '';
  let createdNoteId = '';

  // ── 1. Subjects CRUD ────────────────────────────────────────────────────────
  console.log('--- 1. SUBJECTS CRUD ---');

  console.log('Test 1.1: POST /api/v1/subjects — create new subject');
  {
    const r = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        code: 'CS301',
        name: 'Data Structures & Algorithms',
        credits: 4,
        semester: 5,
        department: 'Computer Science',
        instructor: 'Dr. Patel',
        grade: 'A',
        color: '#10B981',
        category: 'my_subjects'
      });
    ok(r.status === 201, 'Returns 201 Created', `got ${r.status}`);
    ok(r.body.success === true, 'success: true');
    ok(r.body.data?.subject?.code === 'CS301', 'Subject code matches CS301');
    createdSubjectId = r.body.data?.subject?._id;
  }

  console.log('\nTest 1.2: POST /api/v1/subjects — validation rejects empty name');
  {
    const r = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ code: 'CS999', name: '' });
    ok(r.status === 400, 'Returns 400 for empty name', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  console.log('\nTest 1.3: POST /api/v1/subjects — duplicate code rejected for same student');
  {
    const r = await request(app)
      .post('/api/v1/subjects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ code: 'CS301', name: 'Duplicate Course', credits: 3 });
    ok(r.status === 400, 'Returns 400 for duplicate code', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  console.log('\nTest 1.4: GET /api/v1/subjects — student gets their own subjects');
  {
    const r = await request(app)
      .get('/api/v1/subjects')
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.success === true, 'success: true');
    ok(Array.isArray(r.body.data?.subjects), 'Subjects array returned');
    ok(r.body.data.subjects.some((s) => s.code === 'CS301'), 'CS301 is in student A list');
  }

  console.log('\nTest 1.5: GET /api/v1/subjects with search filter');
  {
    const r = await request(app)
      .get('/api/v1/subjects?search=Structures')
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.subjects?.length >= 1, 'Search matched subject name');
  }

  console.log('\nTest 1.6: GET /api/v1/subjects/:id — retrieve single subject details');
  {
    const r = await request(app)
      .get(`/api/v1/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.subject?.name === 'Data Structures & Algorithms', 'Subject name retrieved correctly');
  }

  console.log('\nTest 1.7: PUT /api/v1/subjects/:id — update subject details');
  {
    const r = await request(app)
      .put(`/api/v1/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ grade: 'A+', credits: 4 });
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.subject?.grade === 'A+', 'Grade updated to A+');
  }

  console.log('\nTest 1.8: PUT /api/v1/subjects/:id — user B cannot update user A subject');
  {
    const r = await request(app)
      .put(`/api/v1/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ grade: 'F' });
    ok(r.status === 404, 'Returns 404 access denied for unauthorized student', `got ${r.status}`);
  }

  // ── 2. Notes CRUD ───────────────────────────────────────────────────────────
  console.log('\n--- 2. NOTES CRUD ---');

  console.log('Test 2.1: POST /api/v1/notes — create private note');
  {
    const r = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Binary Trees and Heap Sort',
        content: 'Binary heaps are complete binary trees satisfying heap invariant. O(N log N) worst-case sort time.',
        subject: createdSubjectId,
        tags: ['Data Structures', 'Trees', 'Heap'],
        isPinned: true,
        isLocked: false
      });
    ok(r.status === 201, 'Returns 201 Created', `got ${r.status}`);
    ok(r.body.success === true, 'success: true');
    ok(r.body.data?.note?.title === 'Binary Trees and Heap Sort', 'Note title stored properly');
    ok(r.body.data?.note?.characterCount > 0, 'Character count auto-calculated');
    createdNoteId = r.body.data?.note?._id;
  }

  console.log('\nTest 2.2: POST /api/v1/notes — validation rejects missing title');
  {
    const r = await request(app)
      .post('/api/v1/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Only content no title' });
    ok(r.status === 400, 'Returns 400 for missing title', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  console.log('\nTest 2.3: GET /api/v1/notes — student retrieves their own notes');
  {
    const r = await request(app)
      .get('/api/v1/notes')
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(Array.isArray(r.body.data?.notes), 'Notes array returned');
    ok(r.body.data.notes.some((n) => n._id === createdNoteId), 'Created note present in list');
  }

  console.log('\nTest 2.4: GET /api/v1/notes with search query');
  {
    const r = await request(app)
      .get('/api/v1/notes?search=Heap')
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.notes?.length >= 1, 'Search query matched note content/title');
  }

  console.log('\nTest 2.5: GET /api/v1/notes/:id — student views their own note');
  {
    const r = await request(app)
      .get(`/api/v1/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.note?.title === 'Binary Trees and Heap Sort', 'Note retrieved');
  }

  console.log('\nTest 2.6: GET /api/v1/notes/:id — unauthorized student blocked (Strict Privacy)');
  {
    const r = await request(app)
      .get(`/api/v1/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    ok(r.status === 403, 'Returns 403 Access Denied for other student', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  console.log('\nTest 2.7: PUT /api/v1/notes/:id — student updates their note');
  {
    const r = await request(app)
      .put(`/api/v1/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Binary Trees and Heap Sort [Updated]',
        isLocked: true
      });
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.note?.title.includes('[Updated]'), 'Title updated successfully');
    ok(r.body.data?.note?.isLocked === true, 'Lock status updated');
  }

  console.log('\nTest 2.8: PUT /api/v1/notes/:id — unauthorized student blocked from updating');
  {
    const r = await request(app)
      .put(`/api/v1/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Tampered Title' });
    ok(r.status === 403, 'Returns 403 Forbidden to unauthorized student', `got ${r.status}`);
  }

  console.log('\nTest 2.9: DELETE /api/v1/notes/:id — unauthorized student blocked from deleting');
  {
    const r = await request(app)
      .delete(`/api/v1/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    ok(r.status === 403, 'Returns 403 Forbidden for unauthorized student', `got ${r.status}`);
  }

  console.log('\nTest 2.10: DELETE /api/v1/notes/:id — owner student deletes note');
  {
    const r = await request(app)
      .delete(`/api/v1/notes/${createdNoteId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.deletedId === createdNoteId, 'Correct note deleted');
  }

  console.log('\nTest 2.11: DELETE /api/v1/subjects/:id — owner student deletes subject');
  {
    const r = await request(app)
      .delete(`/api/v1/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.deletedId === createdSubjectId, 'Subject deleted');
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = pass + fail;
  console.log('\n════════════════════════════════════════════════════════');
  console.log(` Results: ${pass} passed, ${fail} failed out of ${total} tests`);
  console.log('════════════════════════════════════════════════════════\n');

  if (fail > 0) {
    console.error('❌  Some tests failed — see above.');
    process.exit(1);
  } else {
    console.log('✅  All Academics & Notes module tests passed successfully!\n');
    process.exit(0);
  }
}

runAcademicsTests().catch((err) => {
  console.error('\nFatal test error:', err);
  process.exit(1);
});
