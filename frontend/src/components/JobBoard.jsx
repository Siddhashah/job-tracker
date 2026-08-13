import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import JobCard from './JobCard';

const STATUSES = [
  { value: 'Applied', label: 'Boarding' },
  { value: 'Interview', label: 'Departed' },
  { value: 'Offer', label: 'Landed' },
  { value: 'Rejected', label: 'Cancelled' },
];

function Column({ id, label, jobs, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`border-t-2 ${isOver ? 'border-flap' : 'border-split'} pt-3`}>
      <div className="flex items-baseline justify-between px-1 mb-2">
        <h2 className="font-display uppercase text-sm tracking-widest text-flap">{label}</h2>
        <span className="font-mono text-[11px] text-flap/50">{jobs.length}</span>
      </div>
      {jobs.length === 0 && <p className="font-mono text-[11px] text-flap/30 italic px-1">No flights.</p>}
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function JobBoard({ jobs, loading, onStatusChange, onDelete }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const job = jobs.find((j) => j._id === active.id);
    if (job && job.status !== over.id) onStatusChange(job._id, over.id);
  };
  if (loading) return <p className="font-mono text-sm text-flap/60">Loading board…</p>;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STATUSES.map(({ value, label }) => (
          <Column key={value} id={value} label={label} jobs={jobs.filter((j) => j.status === value)} onDelete={onDelete} />
        ))}
      </div>
    </DndContext>
  );
}