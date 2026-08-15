import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getJobs, updateJob, deleteJob, getStats } from './api/jobsApi';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [firstName, setFirstName] = useState(localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(localStorage.getItem('lastName') || '');
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    setStatsLoading(true);
    try {
      const [jobsData, statsData] = await Promise.all([getJobs(), getStats()]);
      setJobs(jobsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => { if (token) loadAll(); }, [token]);

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
    setStats(null);
  };

  const handleStatusChange = async (id, status) => { await updateJob(id, { status }); loadAll(); };
  const handleDelete = async (id) => { await deleteJob(id); loadAll(); };

  const exportCSV = () => {
    const headers = ['Company', 'Role', 'Location', 'Salary', 'Status', 'Applied Date'];
    const rows = jobs.map((j) => [
      j.company, j.jobTitle, j.location || '', j.salary || '', j.status,
      new Date(j.appliedDate || j.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!token) return <AuthForm onAuth={handleAuth} />;

  const active = jobs.filter((j) => j.status === 'Applied' || j.status === 'Interview').length;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-canvas">
        <Navbar active={active} onExport={exportCSV} firstName={firstName} lastName={lastName} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                jobs={jobs}
                loading={loading}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onJobAdded={loadAll}
              />
            }
          />
          <Route path="/analytics" element={<AnalyticsPage stats={stats} loading={statsLoading} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;