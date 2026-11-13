const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Doubt title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

doubtSchema.index({ title: 'text', description: 'text', subject: 'text' });
doubtSchema.index({ subject: 1, status: 1 });

module.exports = mongoose.model('Doubt', doubtSchema);
