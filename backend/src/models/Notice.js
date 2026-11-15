const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [140, 'Notice title cannot exceed 140 characters']
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Administration', 'Examination', 'Campus', 'Emergency'],
      default: 'Campus'
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    department: {
      type: String,
      default: 'All Departments',
      trim: true
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

noticeSchema.index({ createdAt: -1, isImportant: 1 });
noticeSchema.index({ title: 'text', content: 'text', department: 'text' });

module.exports = mongoose.model('Notice', noticeSchema);
