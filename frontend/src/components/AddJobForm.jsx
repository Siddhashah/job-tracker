import { useState } from 'react';
import { createJob } from '../api/jobsApi';
import { extractPosting } from '../api/extractApi';

export default function AddJobForm({ onJobAdded }) {
  const [form, setForm] = useState({ company: '', jobTitle: '', location: '', salary: '', skills: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleExtract = async () => {
    if (!pasteText.trim()) return;
    setExtracting(true);
    setExtractError('');
    try {
      const data = await extractPosting(pasteText);
      // Overwrite, don't merge with old state — a re-extraction should
      // start clean, not blend with leftovers from a previous posting.
      setForm({
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        location: data.location || '',
        salary: data.salary || '',
        skills: (data.skills || []).join(', '),
      });
    } catch (err) {
      setExtractError('Extraction failed — fill in the fields manually below.');
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.jobTitle) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const newJob = await createJob(payload);
      onJobAdded(newJob);
      setForm({ company: '', jobTitle: '', location: '', salary: '', skills: '' });
      setPasteText('');
      setShowPaste(false);
    } catch (err) {
      console.error('Failed to add job:', err);
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
      className="bg-field border border-line text-ink placeholder-ink/30 font-mono text-sm px-3 py-2 flex-1 min-w-[140px] focus:outline-none focus:border-ink"
    />
  );

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setShowPaste((s) => !s)}
        className="font-mono text-xs text-ink/50 hover:text-ink mb-2"
      >
        {showPaste ? '− hide paste-to-fill' : '+ paste a posting to autofill'}
      </button>

      {showPaste && (
        <div className="bg-surface border border-line px-4 py-3 mb-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste the full job posting text here…"
            rows={5}
            className="w-full bg-field border border-line text-ink font-sans text-sm px-3 py-2 mb-2 focus:outline-none focus:border-ink"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || !pasteText.trim()}
              className="font-display uppercase text-xs tracking-wide bg-applied text-canvas px-4 py-2 hover:opacity-90 disabled:opacity-50"
            >
              {extracting ? 'Extracting…' : 'Extract fields'}
            </button>
            {extractError && <p className="font-mono text-[11px] text-rejected">{extractError}</p>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        {field('company', 'COMPANY')}
        {field('jobTitle', 'ROLE')}
        {field('location', 'LOCATION')}
        {field('salary', 'SALARY (e.g. $90k - $100k)')}
        {field('skills', 'SKILLS / REQUIREMENTS (comma separated)')}
        <button
          type="submit"
          disabled={submitting}
          className="font-display uppercase text-sm tracking-wide bg-applied text-canvas px-5 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add job'}
        </button>
      </form>
    </div>
  );
}