const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['webinar', 'workshop', 'meetup', 'conference', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  location: {
    type: String,
    required: true
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    required: function() {
      return this.isVirtual;
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  registrations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled'],
      default: 'confirmed'
    }
  }],
  tags: [String],
  image: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
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
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.registrations.length >= this.capacity;
});

// Virtual for getting number of available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.capacity - this.registrations.length);
});

module.exports = mongoose.model('Event', eventSchema);