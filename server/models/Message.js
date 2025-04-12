const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    url: String
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
messageSchema.index({ roomId: 1, createdAt: -1 });

// Add method to mark message as read
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Message', messageSchema);