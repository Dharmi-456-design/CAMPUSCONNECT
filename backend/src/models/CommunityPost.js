const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: [
        'Discussion',
        'Question',
        'Study Group',
        'Hackathon Squad',
        'General',
        'Tech & Coding',
        'Campus Life',
      ],
      default: 'General',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    helpType: {
      type: String,
      enum: ['community', 'tutor'],
      default: 'community',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['open', 'solved', 'closed'],
      default: 'open',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

CommunityPostSchema.index({ createdAt: -1, category: 1 });
CommunityPostSchema.index({ title: 'text', content: 'text', subject: 'text' });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
