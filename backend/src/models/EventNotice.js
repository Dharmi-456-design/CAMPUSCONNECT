const mongoose = require('mongoose');

const eventNoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['event', 'notice', 'holiday', 'workshop'],
      default: 'notice'
    },
    category: {
      type: String,
      default: 'Academic' // Academic, Cultural, Sports, Placement, Holiday
    },
    university: {
      type: String,
      default: 'Swaminarayan University'
    },
    department: {
      type: String,
      default: 'All Departments'
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    date: {
      type: Date,
      default: Date.now
    },
    venue: {
      type: String,
      default: 'Main Campus'
    },
    isUrgent: {
      type: Boolean,
      default: false
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventNotice', eventNoticeSchema);
