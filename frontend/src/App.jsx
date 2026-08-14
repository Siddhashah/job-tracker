import { useEffect, useState } from 'react';
import { getJobs, updateJob, deleteJob } from './api/jobsApi';
import AddJobForm from './components/AddJobForm';
import JobBoard from './components/JobBoard';
import AuthForm from './components/AuthForm';
import UserMenu from './components/UserMenu';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(localStorage.getItem('lastName') || '');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try { setJobs(await getJobs()); }
    catch (err) { console.error('Failed to load jobs:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) loadJobs(); }, [token]);

  const handleAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('firstName', data.firstName);
    localStorage.setItem('lastName', data.lastName);
    setToken(data.token);
    setFirstName(data.firstName);
    setLastName(data.lastName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    setToken(null);
    setFirstName('');
    setLastName('');
    setJobs([]);
  };

  const handleStatusChange = async (id, status) => { await updateJob(id, { status }); loadJobs(); };
  const handleDelete = async (id) => { await deleteJob(id); loadJobs(); };

  if (!token) return <AuthForm onAuth={handleAuth} />;

  const filtered = jobs.filter((j) => (j.company + ' ' + j.jobTitle).toLowerCase().includes(query.toLowerCase()));
  const active = jobs.filter((j) => j.status === 'Applied' || j.status === 'Interview').length;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="border-b border-line px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-baseline justify-between flex-wrap gap-4">
          <h1 className="font-display uppercase text-3xl tracking-widest text-ink">Job Tracker</h1>
          <div className="flex items-center gap-4">
            <p className="font-mono text-sm text-ink/50">{active} active</p>
            <UserMenu firstName={firstName} lastName={lastName} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH BY COMPANY OR ROLE…"
          className="w-full max-w-sm bg-field border border-line text-ink placeholder-ink/30 font-mono text-xs px-3 py-2 mb-6 focus:outline-none focus:border-ink"
        />
        <AddJobForm onJobAdded={loadJobs} />
        <JobBoard jobs={filtered} loading={loading} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default App;