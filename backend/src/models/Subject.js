const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ownership is required for subjects'],
      index: true
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      default: 3,
      min: [1, 'Credits must be at least 1'],
      max: [12, 'Credits cannot exceed 12']
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      default: 1,
      min: [1, 'Semester must be between 1 and 10'],
      max: [10, 'Semester must be between 1 and 10']
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    instructor: {
      type: String,
      default: '',
      trim: true
    },
    grade: {
      type: String,
      default: 'A',
      trim: true
    },
    color: {
      type: String,
      default: '#10B981',
      trim: true
    },
    category: {
      type: String,
      enum: ['my_subjects', 'main_hub'],
      default: 'my_subjects'
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user subjects and lookup
subjectSchema.index({ user: 1, code: 1 });
subjectSchema.index({ user: 1, category: 1 });
subjectSchema.index({ name: 'text', code: 'text', instructor: 'text' });

module.exports = mongoose.model('Subject', subjectSchema);
