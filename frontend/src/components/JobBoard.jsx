import { useState } from 'react';
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import JobCard from './JobCard';
import JobDetailModal from './JobDetailModal';

const STATUSES = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Ghosted', label: 'Ghosted' },
  { value: 'Withdrawn', label: 'Withdrawn' },
  { value: 'Rejected', label: 'Rejected' },
];

function Column({ id, label, jobs, onDelete, onOpenDetail }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`border-t-2 ${isOver ? 'border-ink' : 'border-line'} pt-3`}>
      <div className="flex items-baseline justify-between px-1 mb-2">
        <h2 className="font-display uppercase text-sm tracking-widest text-ink">{label}</h2>
        <span className="font-mono text-[11px] text-ink/50">{jobs.length}</span>
      </div>
      {jobs.length === 0 && <p className="font-mono text-[11px] text-ink/30 italic px-1">No applications yet.</p>}
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} onDelete={onDelete} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  );
}

export default function JobBoard({ jobs, loading, onStatusChange, onDelete, onUpdateJob }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const job = jobs.find((j) => j._id === active.id);
    if (job && job.status !== over.id) onStatusChange(job._id, over.id);
  };
  if (loading) return <p className="font-mono text-sm text-ink/60">Loading…</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Below sm: one full-width status section per row, stacked vertically —
          no horizontal swiping needed. sm+ switches to the side-by-side grid. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4">
        {STATUSES.map(({ value, label }) => (
          <Column
            key={value}
            id={value}
            label={label}
            jobs={jobs.filter((j) => j.status === value)}
            onDelete={onDelete}
            onOpenDetail={setSelectedJob}
          />
        ))}
      </div>
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onUpdate={onUpdateJob} />
    </DndContext>
  );
}