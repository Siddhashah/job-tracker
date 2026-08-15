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
    const status = req.body.status || 'Applied';
    const job = new Job({
      ...req.body,
      status,
      user: req.user.id,
      statusHistory: [{ status, changedAt: new Date() }],
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const updates = { ...req.body };
    const updateDoc = { $set: updates };

    if (updates.status) {
      updates.statusUpdatedAt = new Date();
      updateDoc.$push = { statusHistory: { status: updates.status, changedAt: updates.statusUpdatedAt } };
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateDoc,
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

exports.getStats = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).lean();
    const STATUSES = ['Applied', 'Interview', 'Offer', 'Ghosted', 'Withdrawn', 'Rejected'];

    const total = jobs.length;
    const byStatus = {};
    jobs.forEach((j) => { byStatus[j.status] = (byStatus[j.status] || 0) + 1; });

    const appliedCount = jobs.filter((j) => j.statusHistory?.some((h) => h.status === 'Applied')).length;
    const reachedInterview = jobs.filter((j) => j.statusHistory?.some((h) => h.status === 'Interview')).length;
    const reachedOffer = jobs.filter((j) => j.statusHistory?.some((h) => h.status === 'Offer')).length;

    const interviewRate = appliedCount ? Math.round((reachedInterview / appliedCount) * 100) : 0;
    const offerRate = reachedInterview ? Math.round((reachedOffer / reachedInterview) * 100) : 0;

    const applyToInterviewDurations = [];
    jobs.forEach((j) => {
      const applied = j.statusHistory?.find((h) => h.status === 'Applied');
      const interview = j.statusHistory?.find((h) => h.status === 'Interview');
      if (applied && interview) {
        applyToInterviewDurations.push((new Date(interview.changedAt) - new Date(applied.changedAt)) / 86400000);
      }
    });
    const avgDaysToInterview = applyToInterviewDurations.length
      ? Math.round(applyToInterviewDurations.reduce((a, b) => a + b, 0) / applyToInterviewDurations.length)
      : null;

    const now = new Date();
    const weekLabels = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      weekLabels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }

    const weekly = {};
    weekLabels.forEach((w) => { weekly[w] = 0; });
    jobs.forEach((j) => {
      const diffWeeks = Math.floor((now - new Date(j.createdAt)) / (7 * 86400000));
      if (diffWeeks >= 0 && diffWeeks < 8) weekly[weekLabels[7 - diffWeeks]] += 1;
    });

    const weeklyByStatus = {};
    STATUSES.forEach((s) => {
      weeklyByStatus[s] = {};
      weekLabels.forEach((w) => { weeklyByStatus[s][w] = 0; });
    });
    jobs.forEach((j) => {
      (j.statusHistory || []).forEach((h) => {
        const diffWeeks = Math.floor((now - new Date(h.changedAt)) / (7 * 86400000));
        if (diffWeeks >= 0 && diffWeeks < 8 && weeklyByStatus[h.status]) {
          weeklyByStatus[h.status][weekLabels[7 - diffWeeks]] += 1;
        }
      });
    });

    const staleCount = jobs.filter((j) => {
      if (!['Applied', 'Interview'].includes(j.status)) return false;
      return (Date.now() - new Date(j.statusUpdatedAt)) / 86400000 >= 14;
    }).length;

    res.json({ total, byStatus, interviewRate, offerRate, avgDaysToInterview, weekly, weeklyByStatus, staleCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};