import { useState } from 'react';
import { createJob } from '../api/jobsApi';

export default function AddJobForm({ onJobAdded }) {
  const [form, setForm] = useState({ company: '', jobTitle: '', jobUrl: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.jobTitle) return;
    setSubmitting(true);
    try {
      const newJob = await createJob(form);
      onJobAdded(newJob);
      setForm({ company: '', jobTitle: '', jobUrl: '', location: '' });
    } catch (err) {
      console.error('Failed to add flight:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, placeholder) => (
    <input
      name={name}
      value={form[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className="bg-inputbg border border-split text-flap placeholder-flap/30 font-mono text-sm px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:border-flap"
    />
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-8">
      {field('company', 'COMPANY')}
      {field('jobTitle', 'ROLE')}
      {field('location', 'LOCATION')}
      {field('jobUrl', 'LINK')}
      <button
        type="submit"
        disabled={submitting}
        className="font-display uppercase text-sm tracking-wide bg-boarding text-board px-5 py-2 hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Adding…' : 'Add flight'}
      </button>
    </form>
  );
}