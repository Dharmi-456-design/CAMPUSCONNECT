const mongoose = require('mongoose');

const teamPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department/Branch is required'],
      trim: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    teamSizeMax: {
      type: Number,
      required: [true, 'Maximum team size is required'],
      min: 2
    },
    currentTeamSize: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

teamPostSchema.index({ title: 'text', description: 'text' });
teamPostSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('TeamPost', teamPostSchema);
