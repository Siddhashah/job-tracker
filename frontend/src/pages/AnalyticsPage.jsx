import Dashboard from '../components/Dashboard';

export default function AnalyticsPage({ stats, loading }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h2 className="font-display uppercase text-xl tracking-widest text-ink mb-4">Analytics</h2>
      <Dashboard stats={stats} loading={loading} />
    </div>
  );
}