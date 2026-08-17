import { useEffect, useState } from 'react';

const STATUSES = ['Applied', 'Interview', 'Offer', 'Ghosted', 'Withdrawn', 'Rejected'];

export default function JobDetailModal({ job, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setForm({
        company: job.company || '',
        jobTitle: job.jobTitle || '',
        status: job.status,
        location: job.location || '',
        salary: job.salary || '',
        skills: (job.skills || []).join(', '),
      });
      setEditing(false);
    }
  }, [job]);

  if (!job || !form) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(job._id, {
        company: form.company,
        jobTitle: form.jobTitle,
        status: form.status,
        location: form.location,
        salary: form.salary,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const row = (label, value) => (
    <div className="flex justify-between gap-4 py-2 border-b border-line last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">{label}</span>
      <span className="font-sans text-sm text-ink text-right">{value || '—'}</span>
    </div>
  );

  const editRow = (label, name, placeholder) => (
    <div className="flex justify-between items-center gap-4 py-2 border-b border-line last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 shrink-0">{label}</span>
      <input
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="bg-field border border-line text-ink font-sans text-sm px-2 py-1 text-right flex-1 focus:outline-none focus:border-ink"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-surface border border-line w-full max-w-md px-6 py-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-display uppercase text-lg tracking-wide text-ink">{job.jobTitle}</p>
            <p className="font-sans text-sm text-ink/60">{job.company}</p>
          </div>
          <button onClick={onClose} className="font-mono text-ink/40 hover:text-ink text-lg leading-none">×</button>
        </div>

        {editing ? (
          <>
            {editRow('Company', 'company', 'Company')}
            {editRow('Role', 'jobTitle', 'Job title')}
            <div className="flex justify-between items-center gap-4 py-2 border-b border-line">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50 shrink-0">Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="bg-field border border-line text-ink font-mono text-sm px-2 py-1 text-right focus:outline-none focus:border-ink"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {editRow('Location', 'location', 'Location')}
            {editRow('Salary', 'salary', 'Salary')}
            {editRow('Skills', 'skills', 'Comma separated')}
          </>
        ) : (
          <>
            {row('Company', job.company)}
            {row('Role', job.jobTitle)}
            {row('Status', job.status)}
            {row('Location', job.location)}
            {row('Salary', job.salary)}
            {row('Skills', job.skills?.length ? job.skills.join(', ') : null)}
            {row('Applied', new Date(job.appliedDate || job.createdAt).toLocaleDateString())}
          </>
        )}

        <div className="flex justify-end gap-3 mt-5">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="font-mono text-xs text-ink/50 hover:text-ink px-3 py-2">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="font-display uppercase text-xs tracking-wide bg-applied text-canvas px-4 py-2 hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="font-display uppercase text-xs tracking-wide bg-applied text-canvas px-4 py-2 hover:opacity-90"
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}