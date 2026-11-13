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
    rollNumber: {
      type: String,
      trim: true,
      default: ''
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
      default: 'College of Engineering'
    },
    branch: {
      type: String,
      default: 'Computer Science & Engineering'
    },
    semester: {
      type: Number,
      default: 6
    },
    year: {
      type: Number,
      default: 3
    },
    gpa: {
      type: Number,
      default: 3.67
    },
    sks: {
      type: Number,
      default: 89
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
      enum: ['student', 'admin', 'faculty'],
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
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model('User', userSchema);
