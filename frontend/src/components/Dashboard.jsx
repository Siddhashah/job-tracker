import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STATUS_COLORS = {
  Applied: '#5B9BD1',
  Interview: '#D79A3D',
  Offer: '#6FAE5B',
  Ghosted: '#6E6A85',
  Withdrawn: '#4A7A78',
  Rejected: '#D9564A',
};

function ChartTooltip({ active, payload, label, color }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-surface border border-line px-3 py-2 shadow-lg">
      <p className="font-mono text-[10px] text-ink/50 mb-1">{label}</p>
      <p className="font-mono text-xs font-medium" style={{ color }}>
        {payload[0].value} application{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function MiniChart({ label, data, color }) {
  const chartData = Object.entries(data).map(([week, count]) => ({ week, count }));
  return (
    <div className="bg-surface border border-line px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={chartData}>
          <XAxis dataKey="week" stroke="#F4EFE4" fontSize={9} tickLine={false} axisLine={{ stroke: '#2A2F38' }} />
          <YAxis allowDecimals={false} stroke="#F4EFE4" fontSize={9} tickLine={false} axisLine={false} width={20} />
          <Tooltip
            content={<ChartTooltip color={color} />}
            cursor={{ fill: 'rgba(244, 239, 228, 0.06)' }}
          />
          <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard({ stats, loading }) {
  if (loading || !stats) return null;

  const statCard = (label, value) => (
    <div className="bg-surface border border-line px-4 py-3 flex-1 min-w-[130px]">
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-1">{label}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 mb-6">
        {statCard('Total applications', stats.total)}
        {statCard('Interview rate', `${stats.interviewRate}%`)}
        {statCard('Offer rate', `${stats.offerRate}%`)}
        {statCard('Avg days to interview', stats.avgDaysToInterview ?? '—')}
        {statCard('Stale (14d+)', stats.staleCount)}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-2">By category, per week</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats.weeklyByStatus || {}).map(([status, data]) => (
          <MiniChart key={status} label={status} data={data} color={STATUS_COLORS[status] || '#5B9BD1'} />
        ))}
      </div>
    </div>
  );
}