const mongoose = require('mongoose');

const LostFoundItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: [true, 'Item type must be LOST or FOUND'],
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1500,
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'Wallets & Bags',
        'ID Cards',
        'Books & Notes',
        'Keys',
        'Watches & Jewelry',
        'Bottles & Bags',
        'Accessories',
        'Clothing',
        'Other',
      ],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 150,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLAIMED', 'RESOLVED'],
      default: 'OPEN',
      uppercase: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    contactInfo: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: true },
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
LostFoundItemSchema.index({ category: 1 });
LostFoundItemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('LostFoundItem', LostFoundItemSchema);
