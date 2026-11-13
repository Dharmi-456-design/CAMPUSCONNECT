const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema(
  {
    teamPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamPost',
      required: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

teamRequestSchema.index({ teamPost: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('TeamRequest', teamRequestSchema);
