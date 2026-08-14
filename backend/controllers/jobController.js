const Job = require('../models/Job');

exports.getJobs = async (req, res) => {
  try {
    const filter = { user: req.user.id, ...(req.query.status ? { status: req.query.status } : {}) };
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body, user: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status) updates.statusUpdatedAt = new Date();

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { returnDocument: 'after', runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};