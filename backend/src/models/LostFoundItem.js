const mongoose = require('mongoose');

const LostFoundItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Electronics', 'ID Cards', 'Books & Notes', 'Bottles & Bags', 'Accessories', 'Other'],
      default: 'Other',
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED', 'CLAIMED'],
      default: 'OPEN',
    },
    imageUrl: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

LostFoundItemSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('LostFoundItem', LostFoundItemSchema);

