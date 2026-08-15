import { useState } from 'react';
import AddJobForm from '../components/AddJobForm';
import JobBoard from '../components/JobBoard';

export default function HomePage({ jobs, loading, onStatusChange, onDelete, onJobAdded }) {
  const [query, setQuery] = useState('');
  const filtered = jobs.filter((j) =>
    (j.company + ' ' + j.jobTitle).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="SEARCH BY COMPANY OR ROLE…"
        className="w-full max-w-sm bg-field border border-line text-ink placeholder-ink/30 font-mono text-xs px-3 py-2 mb-6 focus:outline-none focus:border-ink"
      />
      <AddJobForm onJobAdded={onJobAdded} />
      <JobBoard jobs={filtered} loading={loading} onStatusChange={onStatusChange} onDelete={onDelete} />
    </div>
  );
}