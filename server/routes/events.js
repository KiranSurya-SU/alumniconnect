const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user._id
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get event by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('registrations.user', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event (Organizer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.some(registration => 
      registration.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const status = event.isFull ? 'waitlisted' : 'confirmed';

    event.registrations.push({
      user: req.user._id,
      status
    });

    await event.save();
    res.json({ 
      message: `Registration ${status === 'confirmed' ? 'successful' : 'added to waitlist'}`,
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel registration
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrationIndex = event.registrations.findIndex(registration => 
      registration.user.toString() === req.user._id.toString()
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    event.registrations.splice(registrationIndex, 1);

    // If there are waitlisted registrations and a spot opened up
    const waitlistedRegistration = event.registrations.find(reg => reg.status === 'waitlisted');
    if (waitlistedRegistration) {
      waitlistedRegistration.status = 'confirmed';
    }

    await event.save();
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update event status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = status;
    await event.save();

    res.json({ message: 'Event status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;