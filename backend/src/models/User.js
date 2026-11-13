const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: false,
      select: false
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    college: {
      type: String,
      default: ''
    },
    branch: {
      type: String,
      default: ''
    },
    semester: {
      type: Number,
      default: 1
    },
    year: {
      type: Number,
      default: 1
    },
    skills: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      default: ''
    },
    photoUrl: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 0
    },
    expoPushToken: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for profile and content filtering
userSchema.index({ college: 1, branch: 1, semester: 1 });

// Ensure passwordHash is stripped on serialization
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
