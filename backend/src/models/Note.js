const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ownership is required for notes'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
      index: true
    },
    subjectName: {
      type: String,
      default: 'General',
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#16A36A',
      trim: true
    },
    characterCount: {
      type: Number,
      default: 0
    },
    // Supporting fields for file attachment & legacy campus downloads
    fileUrl: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: 'text'
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    branch: {
      type: String,
      default: 'General',
      trim: true
    },
    semester: {
      type: Number,
      default: 1
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      default: 5.0
    }
  },
  {
    timestamps: true
  }
);

// Auto-sync uploader and characterCount before saving
noteSchema.pre('save', function (next) {
  if (!this.uploader && this.user) {
    this.uploader = this.user;
  }
  if (!this.user && this.uploader) {
    this.user = this.uploader;
  }
  const textLen = (this.content || '').length;
  this.characterCount = textLen;
  if (!this.description && this.content) {
    this.description = this.content.slice(0, 160);
  }
  next();
});

// Text index for search across title, content, tags, and subjectName
noteSchema.index({ title: 'text', content: 'text', tags: 'text', subjectName: 'text' });

// Compound index for user query, subject filtering, and ordering
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, subject: 1, createdAt: -1 });
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
