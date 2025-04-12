const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Message = require('../models/Message');

// Get chat history for a room
router.get('/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'firstName lastName');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new mentoring session (Alumni only)
router.post('/mentoring/schedule', [auth, authorize('alumni')], async (req, res) => {
  try {
    const { studentId, date, time, topic } = req.body;

    const session = new MentoringSession({
      mentor: req.user._id,
      student: studentId,
      date,
      time,
      topic,
      status: 'scheduled'
    });

    await session.save();

    // Create a unique room for the mentoring session
    const roomId = `mentoring-${session._id}`;
    
    res.status(201).json({
      message: 'Mentoring session scheduled successfully',
      session,
      roomId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mentoring sessions for a user
router.get('/mentoring/sessions', auth, async (req, res) => {
  try {
    const query = req.user.role === 'alumni'
      ? { mentor: req.user._id }
      : { student: req.user._id };

    const sessions = await MentoringSession.find(query)
      .populate('mentor', 'firstName lastName')
      .populate('student', 'firstName lastName')
      .sort({ date: 1, time: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;