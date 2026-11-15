/**
 * testEventsNotices.js — Integration tests for Events and Notices Module (Day 4)
 * Tests Event CRUD, duplicate registration prevention, capacity limits,
 * registration cancellation, my-registrations, notices, and admin authorization.
 *
 * Run: node src/scripts/testEventsNotices.js
 */
'use strict';

process.env.JWT_SECRET     = 'test_jwt_secret_campusconnect_2026';
process.env.JWT_EXPIRES_IN = '7d';
process.env.NODE_ENV       = 'test';
process.env.MONGODB_URI    = '';

const Module = require('module');
const path   = require('path');
const jwt    = require('jsonwebtoken');

// ── In-Memory Database Stores ────────────────────────────────────────────────
const _userStore         = [];
const _eventStore        = [];
const _registrationStore = [];
const _noticeStore       = [];

let _seq = 2000;
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

// ── Mock Event Model ─────────────────────────────────────────────────────────
const EventMock = {
  find: (query = {}) => {
    let list = [..._eventStore];
    if (query.category) list = list.filter((e) => e.category === query.category);
    if (query.$or) {
      list = list.filter((e) =>
        query.$or.some((cond) => {
          const [k, regex] = Object.entries(cond)[0];
          return e[k] && regex.test(e[k]);
        })
      );
    }
    return new FakeQuery(list);
  },
  findById: (id) => {
    const found = _eventStore.find((e) => String(e._id) === String(id));
    if (!found) return new FakeQuery(null);
    const copy = {
      ...found,
      toJSON: function () {
        return { ...this };
      },
      save: async function () {
        const idx = _eventStore.findIndex((e) => String(e._id) === String(this._id));
        if (idx !== -1) _eventStore[idx] = { ...this };
        return this;
      }
    };
    return new FakeQuery(copy);
  },
  countDocuments: async (query = {}) => {
    let list = [..._eventStore];
    if (query.category) list = list.filter((e) => e.category === query.category);
    return list.length;
  },
  create: async (data) => {
    const doc = {
      ...data,
      _id: newId(),
      registeredCount: data.registeredCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON: function () {
        return { ...this };
      }
    };
    _eventStore.push(doc);
    return { ...doc };
  },
  insertMany: async (docs) => {
    const inserted = docs.map((d) => ({
      ...d,
      _id: newId(),
      registeredCount: d.registeredCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON: function () {
        return { ...this };
      }
    }));
    _eventStore.push(...inserted);
    return inserted;
  },
  deleteOne: async (query) => {
    const idx = _eventStore.findIndex((e) => String(e._id) === String(query._id));
    if (idx !== -1) _eventStore.splice(idx, 1);
    return { deletedCount: idx !== -1 ? 1 : 0 };
  }
};

// ── Mock EventRegistration Model ─────────────────────────────────────────────
const EventRegistrationMock = {
  find: (query = {}) => {
    let list = [..._registrationStore];
    if (query.user) list = list.filter((r) => String(r.user) === String(query.user));
    if (query.event) list = list.filter((r) => String(r.event) === String(query.event));
    if (query.status) list = list.filter((r) => r.status === query.status);
    const populated = list.map((r) => {
      const ev = _eventStore.find((e) => String(e._id) === String(r.event));
      return {
        ...r,
        event: ev ? { ...ev, toJSON: () => ({ ...ev }) } : null
      };
    });
    return new FakeQuery(populated);
  },
  findOne: (query = {}) => {
    let list = [..._registrationStore];
    if (query.event) list = list.filter((r) => String(r.event) === String(query.event));
    if (query.user) list = list.filter((r) => String(r.user) === String(query.user));
    if (query.status) list = list.filter((r) => r.status === query.status);
    const found = list[0] || null;
    return new FakeQuery(found);
  },
  findOneAndUpdate: async (filter, update, opts) => {
    let idx = _registrationStore.findIndex(
      (r) => String(r.event) === String(filter.event) && String(r.user) === String(filter.user)
    );
    if (idx === -1) {
      const newDoc = {
        _id: newId(),
        event: filter.event,
        user: filter.user,
        status: update.status || 'CONFIRMED',
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      _registrationStore.push(newDoc);
      return newDoc;
    }
    Object.assign(_registrationStore[idx], update);
    return _registrationStore[idx];
  },
  deleteOne: async (query) => {
    const idx = _registrationStore.findIndex((r) => String(r._id) === String(query._id));
    if (idx !== -1) _registrationStore.splice(idx, 1);
    return { deletedCount: idx !== -1 ? 1 : 0 };
  },
  deleteMany: async (query) => {
    let count = 0;
    for (let i = _registrationStore.length - 1; i >= 0; i--) {
      if (String(_registrationStore[i].event) === String(query.event)) {
        _registrationStore.splice(i, 1);
        count++;
      }
    }
    return { deletedCount: count };
  }
};

// ── Mock Notice Model ────────────────────────────────────────────────────────
const NoticeMock = {
  find: (query = {}) => {
    let list = [..._noticeStore];
    if (query.category) list = list.filter((n) => n.category === query.category);
    if (query.isImportant !== undefined) list = list.filter((n) => n.isImportant === query.isImportant);
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
    const found = _noticeStore.find((n) => String(n._id) === String(id));
    if (!found) return new FakeQuery(null);
    const copy = {
      ...found,
      save: async function () {
        const idx = _noticeStore.findIndex((n) => String(n._id) === String(this._id));
        if (idx !== -1) _noticeStore[idx] = { ...this };
        return this;
      }
    };
    return new FakeQuery(copy);
  },
  countDocuments: async () => _noticeStore.length,
  create: async (data) => {
    const doc = {
      ...data,
      _id: newId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    _noticeStore.push(doc);
    return { ...doc };
  },
  insertMany: async (docs) => {
    const inserted = docs.map((d) => ({
      ...d,
      _id: newId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    _noticeStore.push(...inserted);
    return inserted;
  },
  deleteOne: async (query) => {
    const idx = _noticeStore.findIndex((n) => String(n._id) === String(query._id));
    if (idx !== -1) _noticeStore.splice(idx, 1);
    return { deletedCount: idx !== -1 ? 1 : 0 };
  }
};

// ── Inject Mocks into Module Cache BEFORE App Loads ──────────────────────────
const USER_PATH         = path.resolve(__dirname, '../models/User.js');
const EVENT_PATH        = path.resolve(__dirname, '../models/Event.js');
const REG_PATH          = path.resolve(__dirname, '../models/EventRegistration.js');
const NOTICE_PATH       = path.resolve(__dirname, '../models/Notice.js');
const DB_PATH           = path.resolve(__dirname, '../config/db.js');

Module._cache[USER_PATH]   = { id: USER_PATH, filename: USER_PATH, loaded: true, exports: UserMock };
Module._cache[EVENT_PATH]  = { id: EVENT_PATH, filename: EVENT_PATH, loaded: true, exports: EventMock };
Module._cache[REG_PATH]    = { id: REG_PATH, filename: REG_PATH, loaded: true, exports: EventRegistrationMock };
Module._cache[NOTICE_PATH] = { id: NOTICE_PATH, filename: NOTICE_PATH, loaded: true, exports: NoticeMock };
Module._cache[DB_PATH]     = { id: DB_PATH, filename: DB_PATH, loaded: true, exports: async () => {} };

// ── Load Supertest and Express App ───────────────────────────────────────────
const request = require('supertest');
const app     = require('../app');

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

async function runEventsNoticesTests() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log(' CampusConnect — Events & Notices Module Tests (Day 4) ');
  console.log('════════════════════════════════════════════════════════\n');

  // Setup Admin and Student Users
  const adminUser = await UserMock.create({
    name: 'Admin Faculty',
    email: 'admin@campusconnect.test',
    role: 'admin'
  });
  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET);

  const studentUser = await UserMock.create({
    name: 'Dharmi Patel',
    email: 'dharmi@campusconnect.test',
    role: 'student'
  });
  const studentToken = jwt.sign({ id: studentUser._id, role: 'student' }, process.env.JWT_SECRET);

  let eventId = '';
  let fullEventId = '';
  let noticeId = '';

  // ── 1. Event CRUD & Authorization ───────────────────────────────────────────
  console.log('--- 1. EVENT CRUD & ADMIN AUTHORIZATION ---');

  console.log('Test 1.1: POST /api/v1/events — student is rejected (403)');
  {
    const r = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Event',
        description: 'Should fail',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '2:00 PM',
        venue: 'Room 101'
      });
    ok(r.status === 403, 'Returns 403 Forbidden for student', `got ${r.status}`);
  }

  console.log('\nTest 1.2: POST /api/v1/events — admin creates event (201)');
  {
    const r = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'National Robotics Championship 2026',
        description: 'Annual inter-college autonomous robot race and combat arena.',
        category: 'Technology',
        date: new Date(Date.now() + 5 * 86400000).toISOString(),
        time: '10:00 AM',
        venue: 'Main Indoor Stadium',
        organizer: 'Robotics Club',
        capacity: 100,
        perks: ['Limited seats']
      });
    ok(r.status === 201, 'Returns 201 Created for admin', `got ${r.status}`);
    ok(r.body.data?.event?.title === 'National Robotics Championship 2026', 'Event title stored');
    eventId = r.body.data?.event?._id;
  }

  console.log('\nTest 1.3: GET /api/v1/events — browse events with search');
  {
    const r = await request(app)
      .get('/api/v1/events?search=Robotics')
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.events?.length >= 1, 'Search matched event');
  }

  console.log('\nTest 1.4: GET /api/v1/events/:id — view single event details');
  {
    const r = await request(app)
      .get(`/api/v1/events/${eventId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.event?.venue === 'Main Indoor Stadium', 'Venue details match');
  }

  // ── 2. Event Registration & Cancellation ────────────────────────────────────
  console.log('\n--- 2. EVENT REGISTRATION & CANCELLATION ---');

  console.log('Test 2.1: POST /api/v1/events/:id/register — student registers for event');
  {
    const r = await request(app)
      .post(`/api/v1/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 201, 'Returns 201 Created', `got ${r.status}`);
    ok(r.body.data?.registration?.status === 'CONFIRMED', 'Registration status CONFIRMED');
  }

  console.log('\nTest 2.2: POST /api/v1/events/:id/register — duplicate registration rejected');
  {
    const r = await request(app)
      .post(`/api/v1/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 400, 'Returns 400 Bad Request for duplicate registration', `got ${r.status}`);
    ok(r.body.success === false, 'success: false');
  }

  console.log('\nTest 2.3: GET /api/v1/events/my-registrations — retrieve student registered events');
  {
    const r = await request(app)
      .get('/api/v1/events/my-registrations')
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.events?.some((e) => String(e._id) === String(eventId)), 'Registered event present');
  }

  // Create full event to test capacity limits
  {
    const r = await request(app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'VIP Masterclass with Industry CTO',
        description: 'Strict 1-seat executive round table',
        category: 'Career',
        date: new Date(Date.now() + 3 * 86400000).toISOString(),
        time: '3:00 PM',
        venue: 'Boardroom A',
        capacity: 1,
        registeredCount: 1 // Full capacity
      });
    fullEventId = r.body.data?.event?._id;
  }

  console.log('\nTest 2.4: POST /api/v1/events/:id/register — full event registration rejected');
  {
    const r = await request(app)
      .post(`/api/v1/events/${fullEventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 400, 'Returns 400 Bad Request when capacity full', `got ${r.status}`);
    ok(r.body.message.includes('capacity') || r.body.message.includes('full'), 'Message identifies full capacity');
  }

  console.log('\nTest 2.5: DELETE /api/v1/events/:id/register — student cancels registration');
  {
    const r = await request(app)
      .delete(`/api/v1/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 200, 'Returns 200 OK for cancellation', `got ${r.status}`);
  }

  console.log('\nTest 2.6: DELETE /api/v1/events/:id/register — cancelling non-registered returns 404');
  {
    const r = await request(app)
      .delete(`/api/v1/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 404, 'Returns 404 Not Found for non-registered event', `got ${r.status}`);
  }

  // ── 3. College Notices & Admin Authorization ─────────────────────────────────
  console.log('\n--- 3. NOTICES & ADMIN AUTHORIZATION ---');

  console.log('Test 3.1: POST /api/v1/notices — student is rejected (403)');
  {
    const r = await request(app)
      .post('/api/v1/notices')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Student Fake Notice', content: 'Should fail' });
    ok(r.status === 403, 'Returns 403 Forbidden for student', `got ${r.status}`);
  }

  console.log('\nTest 3.2: POST /api/v1/notices — admin creates notice (201)');
  {
    const r = await request(app)
      .post('/api/v1/notices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Official Final Semester Examination Guidelines',
        content: 'All candidates must strictly report 30 minutes before commencement of paper.',
        category: 'Examination',
        isImportant: true,
        department: 'Examination Bureau'
      });
    ok(r.status === 201, 'Returns 201 Created for admin', `got ${r.status}`);
    ok(r.body.data?.notice?.isImportant === true, 'Important flag set');
    noticeId = r.body.data?.notice?._id;
  }

  console.log('\nTest 3.3: GET /api/v1/notices — student reads notice board (200)');
  {
    const r = await request(app)
      .get('/api/v1/notices?search=Guidelines')
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 200, 'Returns 200 OK', `got ${r.status}`);
    ok(r.body.data?.notices?.length >= 1, 'Notice board search matched');
  }

  console.log('\nTest 3.4: PUT /api/v1/notices/:id — admin updates notice (200)');
  {
    const r = await request(app)
      .put(`/api/v1/notices/${noticeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Official Final Semester Examination Guidelines [UPDATED]' });
    ok(r.status === 200, 'Returns 200 OK for admin update', `got ${r.status}`);
    ok(r.body.data?.notice?.title.includes('[UPDATED]'), 'Title updated');
  }

  console.log('\nTest 3.5: DELETE /api/v1/notices/:id — student cannot delete notice (403)');
  {
    const r = await request(app)
      .delete(`/api/v1/notices/${noticeId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    ok(r.status === 403, 'Returns 403 Forbidden for student delete', `got ${r.status}`);
  }

  console.log('\nTest 3.6: DELETE /api/v1/notices/:id — admin deletes notice (200)');
  {
    const r = await request(app)
      .delete(`/api/v1/notices/${noticeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    ok(r.status === 200, 'Returns 200 OK for admin delete', `got ${r.status}`);
  }

  console.log('\nTest 3.7: DELETE /api/v1/events/:id — admin deletes event (200)');
  {
    const r = await request(app)
      .delete(`/api/v1/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    ok(r.status === 200, 'Returns 200 OK for event delete', `got ${r.status}`);
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
    console.log('✅  All Events & Notices module tests passed successfully!\n');
    process.exit(0);
  }
}

runEventsNoticesTests().catch((err) => {
  console.error('\nFatal test error:', err);
  process.exit(1);
});
