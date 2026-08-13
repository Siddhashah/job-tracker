import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const STRIP_COLOR = {
  Applied: 'border-boarding text-boarding',
  Interview: 'border-departed text-departed',
  Offer: 'border-landed text-landed',
  Rejected: 'border-cancelled text-cancelled',
};

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function JobCard({ job, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job._id });
  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 50 : undefined,
  };
  const idleDays = daysSince(job.statusUpdatedAt);
  const delayed = idleDays >= 14 && job.status !== 'Offer' && job.status !== 'Rejected';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 border-l-4 ${STRIP_COLOR[job.status]} bg-panel px-3 py-2 mb-2 cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-mono uppercase text-sm text-flap truncate">{job.jobTitle}</p>
        <p className="font-sans text-xs text-flap/60 truncate">
          {job.company}{job.location ? ` — ${job.location}` : ''}
        </p>
      </div>
      {delayed && (
        <span className="font-mono text-[10px] uppercase text-cancelled shrink-0">delayed {idleDays}d</span>
      )}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(job._id)}
        className="font-mono text-[10px] text-flap/40 hover:text-cancelled shrink-0"
      >
        cancel
      </button>
    </div>
  );
}