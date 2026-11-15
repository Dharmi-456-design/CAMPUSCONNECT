const mongoose = require('mongoose');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Starter events matching the reference screens (media_1794716870205_ba96cb1c.jpg & media_1794716872880_bc956b2a.jpg)
const DEFAULT_CAMPUS_EVENTS = [
  {
    title: 'Onam Celebration',
    description: 'Roll Call in the university is a celebratory cultural event organized to welcome new students, featuring traditional flower rangoli (Pookkalam), cultural music, and feast.',
    category: 'Cultural',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    time: 'June 24, 5:30 PM',
    venue: 'Bulman centre',
    organizer: 'International Student Services',
    capacity: 150,
    registeredCount: 42,
    perks: ['Food Available', 'Recent'],
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'HKN hosts Carollo Engineering',
    description: 'Exclusive industry networking session with engineering leadership from Carollo. Learn about full-time and internship career opportunities in infrastructure systems.',
    category: 'Networking',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    time: 'Friday, 1:00pm - 2:00pm',
    venue: 'Engineering Hall 101',
    organizer: 'Clubs and Orgs',
    capacity: 80,
    registeredCount: 35,
    perks: ['Free lunch!! Hiring!!', 'Networking'],
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Communities of Practice host Lam Research',
    description: 'EECS Design Student Communities of Practice host Semiconductor Industry Info Session with senior engineers from Lam Research.',
    category: 'Technology',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: 'April 10th, 11:00am - 12:00pm',
    venue: 'Seminar Hall B',
    organizer: 'Clubs and Orgs',
    capacity: 100,
    registeredCount: 60,
    perks: ['Recent', 'Limited seats'],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'EECS Design Student CoP host RF and Power Industry Session',
    description: 'Interactive workshop with Zack Pelser from Qorvo exploring RF integrated circuits, power amplifiers, and 5G transceiver architectures.',
    category: 'Workshop',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    time: 'April 17th, 11:00am - 12:00pm',
    venue: 'Hardware Innovation Lab',
    organizer: 'Clubs and Orgs',
    capacity: 50,
    registeredCount: 28,
    perks: ['Limited seats'],
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop'
  }
];

// @desc    Get all events with search, category filtering, and pagination
// @route   GET /api/v1/events
// @access  Public / Authenticated
const getEvents = asyncHandler(async (req, res) => {
  const { search, category, perk, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (category && category !== 'All' && category !== 'all') {
    filter.category = category;
  }

  if (perk && perk !== 'All') {
    filter.perks = new RegExp(perk.trim(), 'i');
  }

  if (search && search.trim()) {
    const term = search.trim();
    const regex = new RegExp(term, 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { venue: regex },
      { organizer: regex },
      { category: regex }
    ];
  }

  let total = await Event.countDocuments(filter);

  // Auto-seed starter events if database has zero events
  if (total === 0 && !search && !category) {
    const defaultCreatorId = req.user?._id || new mongoose.Types.ObjectId();
    const starterDocs = DEFAULT_CAMPUS_EVENTS.map((e) => ({
      ...e,
      createdBy: defaultCreatorId
    }));
    await Event.insertMany(starterDocs);
    total = starterDocs.length;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const events = await Event.find(filter)
    .populate('createdBy', 'name email role')
    .sort({ date: 1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Check registration status for current authenticated user
  let userRegistrations = [];
  if (req.user) {
    userRegistrations = await EventRegistration.find({
      user: req.user._id,
      status: 'CONFIRMED'
    }).select('event');
  }
  const registeredEventIds = new Set(userRegistrations.map((r) => r.event.toString()));

  const eventsWithStatus = events.map((ev) => {
    const obj = ev.toJSON ? ev.toJSON() : { ...ev };
    obj.isRegistered = registeredEventIds.has(ev._id.toString());
    obj.isFull = (ev.registeredCount || 0) >= (ev.capacity || 100);
    return obj;
  });

  return ApiResponse.success(
    res,
    'Events retrieved successfully',
    {
      events: eventsWithStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    },
    200
  );
});

// @desc    Get single event by ID
// @route   GET /api/v1/events/:id
// @access  Public / Authenticated
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email role');

  if (!event) {
    return ApiResponse.error(res, 'Event not found', [], 404);
  }

  let isRegistered = false;
  if (req.user) {
    const reg = await EventRegistration.findOne({
      event: event._id,
      user: req.user._id,
      status: 'CONFIRMED'
    });
    isRegistered = Boolean(reg);
  }

  const eventData = event.toJSON ? event.toJSON() : { ...event };
  eventData.isRegistered = isRegistered;
  eventData.isFull = (event.registeredCount || 0) >= (event.capacity || 100);

  return ApiResponse.success(res, 'Event details retrieved', { event: eventData }, 200);
});

// @desc    Create a new event
// @route   POST /api/v1/events
// @access  Private/Admin or Faculty
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    date,
    time,
    venue,
    organizer,
    capacity,
    imageUrl,
    perks
  } = req.body;

  const eventDate = new Date(date);
  if (isNaN(eventDate.getTime())) {
    return ApiResponse.error(res, 'Invalid event date provided', [], 400);
  }

  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    category: category || 'Cultural',
    date: eventDate,
    time: time.trim(),
    venue: venue.trim(),
    organizer: organizer ? organizer.trim() : 'Student Council',
    capacity: Number(capacity) || 100,
    registeredCount: 0,
    imageUrl: imageUrl ? imageUrl.trim() : '',
    perks: Array.isArray(perks) ? perks : [],
    createdBy: req.user._id
  });

  return ApiResponse.success(res, 'Event created successfully', { event }, 201);
});

// @desc    Update an existing event
// @route   PUT /api/v1/events/:id
// @access  Private/Admin or Faculty
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return ApiResponse.error(res, 'Event not found', [], 404);
  }

  const allowedUpdates = [
    'title',
    'description',
    'category',
    'date',
    'time',
    'venue',
    'organizer',
    'capacity',
    'imageUrl',
    'perks'
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'date') {
        event.date = new Date(req.body.date);
      } else {
        event[field] = req.body[field];
      }
    }
  });

  await event.save();

  return ApiResponse.success(res, 'Event updated successfully', { event }, 200);
});

// @desc    Delete an event
// @route   DELETE /api/v1/events/:id
// @access  Private/Admin or Faculty
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return ApiResponse.error(res, 'Event not found', [], 404);
  }

  await Event.deleteOne({ _id: event._id });

  // Cancel any confirmed registrations for this deleted event
  await EventRegistration.deleteMany({ event: event._id });

  return ApiResponse.success(res, 'Event deleted successfully', { deletedId: event._id }, 200);
});

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
