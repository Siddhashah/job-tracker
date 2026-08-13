const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: { type: String, required: true },
  jobTitle: { type: String, required: true },
  jobUrl: String,
  location: String,
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied',
  },
  appliedDate: { type: Date, default: Date.now },
  notes: String,
  statusUpdatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);