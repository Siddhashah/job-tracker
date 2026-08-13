import { useEffect, useState } from 'react';
import { getJobs, updateJob, deleteJob } from './api/jobsApi';
import AddJobForm from './components/AddJobForm';
import JobBoard from './components/JobBoard';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try { setJobs(await getJobs()); }
    catch (err) { console.error('Failed to load board:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleStatusChange = async (id, status) => { await updateJob(id, { status }); loadJobs(); };
  const handleDelete = async (id) => { await deleteJob(id); loadJobs(); };

  const filtered = jobs.filter((j) => (j.company + ' ' + j.jobTitle).toLowerCase().includes(query.toLowerCase()));
  const active = jobs.filter((j) => j.status === 'Applied' || j.status === 'Interview').length;
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-board">
      <div className="border-b border-split px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="font-display uppercase text-3xl tracking-widest text-flap">Departures</h1>
          <p className="font-mono text-sm text-flap/50">{active} active · {now}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH BY COMPANY OR ROLE…"
          className="w-full max-w-sm bg-inputbg border border-split text-flap placeholder-flap/30 font-mono text-xs px-3 py-2 mb-6 focus:outline-none focus:border-flap"
        />
        <AddJobForm onJobAdded={loadJobs} />
        <JobBoard jobs={filtered} loading={loading} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default App;