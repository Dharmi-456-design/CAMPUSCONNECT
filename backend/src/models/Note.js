const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required']
    },
    tags: {
      type: [String],
      default: []
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileType: {
      type: String,
      default: 'pdf'
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Text index for search
noteSchema.index({ title: 'text', tags: 'text', subject: 'text' });

// Compound index for filtering
noteSchema.index({ branch: 1, semester: 1, approvalStatus: 1 });

module.exports = mongoose.model('Note', noteSchema);
