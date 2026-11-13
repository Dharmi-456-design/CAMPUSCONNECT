const EventNotice = require('../models/EventNotice');

exports.getEventsAndNotices = async (req, res, next) => {
  try {
    const { type, department, search } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (department && department !== 'All Departments') {
      filter.department = department;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await EventNotice.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

exports.createEventNotice = async (req, res, next) => {
  try {
    const { title, type, category, department, description, date, venue, isUrgent } = req.body;

    const newItem = await EventNotice.create({
      title,
      type: type || 'notice',
      category: category || 'Academic',
      university: 'Swaminarayan University',
      department: department || 'All Departments',
      description,
      date: date || new Date(),
      venue: venue || 'Swaminarayan University Campus',
      isUrgent: Boolean(isUrgent),
      author: req.user?._id
    });

    // 🔔 Broadcast to ALL users — new event or exam notice!
    try {
      const { sendBroadcastPush } = require('../services/pushNotification.service');

      const isExam = category === 'Examination' || type === 'exam';
      const isEvent = type === 'event';

      let pushTitle = '📢 Campus Notice';
      if (isExam) pushTitle = '📅 Exam Alert!';
      else if (isEvent) pushTitle = '🎉 New Campus Event!';
      else if (isUrgent) pushTitle = '🚨 Urgent Notice!';

      const dateStr = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
      const pushBody = `${title}${dateStr ? ' — ' + dateStr : ''}${venue ? ' @ ' + venue : ''}`;

      await sendBroadcastPush(
        pushTitle,
        pushBody,
        { tab: 'events', noticeId: newItem._id.toString() }
      );
    } catch (pushErr) {
      console.error('[Event/Notice Push] Failed:', pushErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Event/Notice created successfully',
      data: newItem
    });
  } catch (err) {
    next(err);
  }
};

