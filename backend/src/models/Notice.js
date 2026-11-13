const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Administration', 'Examination', 'Campus', 'Emergency'],
      default: 'Campus',
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

NoticeSchema.index({ createdAt: -1, isImportant: 1 });

module.exports = mongoose.model('Notice', NoticeSchema);

