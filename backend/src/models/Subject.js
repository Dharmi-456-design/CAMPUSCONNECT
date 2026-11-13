const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      default: 3,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

SubjectSchema.index({ code: 1, department: 1 });

module.exports = mongoose.model('Subject', SubjectSchema);

