const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'alumni'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  currentCompany: {
    type: String,
    required: function() {
      return this.role === 'alumni';
    }
  },
  designation: {
    type: String,
    required: function() {
      return this.role === 'alumni';
    }
  },
  location: String,
  bio: String,
  skills: [String],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String
  },
  profileImage: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);