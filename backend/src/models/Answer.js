const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    doubt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doubt',
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Answer text is required'],
      trim: true
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isAccepted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

answerSchema.index({ doubt: 1, createdAt: 1 });

module.exports = mongoose.model('Answer', answerSchema);
