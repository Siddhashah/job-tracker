import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const STRIP_COLOR = {
  Applied: 'border-applied text-applied',
  Interview: 'border-interview text-interview',
  Offer: 'border-offer text-offer',
  Ghosted: 'border-ghosted text-ghosted',
  Withdrawn: 'border-withdrawn text-withdrawn',
  Rejected: 'border-rejected text-rejected',
};

const ACTIVE_STATUSES = ['Applied', 'Interview'];

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function JobCard({ job, onDelete, onOpenDetail }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job._id });
  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 50 : undefined,
  };
  const idleDays = daysSince(job.statusUpdatedAt);
  const stale = idleDays >= 14 && ACTIVE_STATUSES.includes(job.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpenDetail(job)}
      className={`flex items-center gap-3 border-l-4 ${STRIP_COLOR[job.status]} bg-surface px-3 py-2 mb-2 cursor-pointer active:cursor-grabbing touch-none ${isDragging ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-mono uppercase text-sm text-ink truncate">{job.jobTitle}</p>
        <p className="font-sans text-xs text-ink/60 truncate">
          {job.company}{job.location ? ` — ${job.location}` : ''}{job.salary ? ` · ${job.salary}` : ''}
        </p>
      </div>
      {stale && (
        <span className="font-mono text-[10px] uppercase text-rejected shrink-0">stale {idleDays}d</span>
      )}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(job._id); }}
        className="font-mono text-[10px] text-ink/40 hover:text-rejected shrink-0"
      >
        delete
      </button>
    </div>
  );
}