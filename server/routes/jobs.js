const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth, authorize } = require('../middleware/auth');

// Get all jobs
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, company } = req.query;
    const filter = { status: 'active' };

    if (type) filter.type = type;
    if (company) filter.company = new RegExp(company, 'i');

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new job (Alumni only)
router.post('/', [auth, authorize('alumni')], async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get job by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email')
      .populate('applicants.user', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update job (Alumni only)
router.put('/:id', [auth, authorize('alumni')], async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for job (Student only)
router.post('/:id/apply', [auth, authorize('student')], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.some(applicant => 
      applicant.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    job.applicants.push({
      user: req.user._id,
      status: 'pending'
    });

    await job.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update application status (Alumni only)
router.put('/:id/applications/:applicationId', [auth, authorize('alumni')], async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findOne({
      _id: req.params.id,
      postedBy: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = job.applicants.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await job.save();

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;