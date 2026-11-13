const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'WAITLIST'],
      default: 'CONFIRMED',
    },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);

