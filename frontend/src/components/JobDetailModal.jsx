export default function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  const row = (label, value) => (
    <div className="flex justify-between gap-4 py-2 border-b border-line last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">{label}</span>
      <span className="font-sans text-sm text-ink text-right">{value || '—'}</span>
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

        {row('Status', job.status)}
        {row('Location', job.location)}
        {row('Salary', job.salary)}
        {row('Skills', job.skills?.length ? job.skills.join(', ') : null)}
        {row('Applied', new Date(job.appliedDate || job.createdAt).toLocaleDateString())}
        {row('Last updated', job.statusUpdatedAt ? new Date(job.statusUpdatedAt).toLocaleDateString() : null)}
        {row('Notes', job.notes)}
      </div>
    </div>
  );
}