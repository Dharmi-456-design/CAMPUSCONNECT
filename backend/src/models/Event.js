const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Event title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Technology', 'Cultural', 'Sports', 'Academic', 'Career', 'Workshop', 'Clubs and Orgs', 'Networking', 'Other'],
      default: 'Cultural'
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    organizer: {
      type: String,
      default: 'Student Council',
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      default: 100,
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    imageUrl: {
      type: String,
      default: ''
    },
    perks: {
      type: [String],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ date: 1, category: 1 });
eventSchema.index({ title: 'text', description: 'text', venue: 'text', organizer: 'text' });

module.exports = mongoose.model('Event', eventSchema);
