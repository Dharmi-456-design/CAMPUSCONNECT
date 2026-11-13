const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'used', 'fair'],
      default: 'used'
    },
    images: {
      type: [String],
      default: []
    },
    location: {
      type: String,
      default: ''
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

marketplaceListingSchema.index({ title: 'text', description: 'text' });
marketplaceListingSchema.index({ category: 1, status: 1, price: 1 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
