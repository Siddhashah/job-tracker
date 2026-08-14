const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobUrl: String,
  location: String,
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Ghosted', 'Withdrawn', 'Rejected'],
    default: 'Applied',
  },
  appliedDate: { type: Date, default: Date.now },
  notes: String,
  statusUpdatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);