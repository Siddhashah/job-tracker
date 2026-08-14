import { useEffect, useRef, useState } from 'react';

export default function UserMenu({ firstName, lastName, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const fullName = `${firstName} ${lastName}`.trim();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-xs text-ink/80 hover:text-ink flex items-center gap-1.5"
      >
        {fullName.toUpperCase()}
        <span className="text-ink/40 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-surface border border-line shadow-lg z-20">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40 px-3 pt-3">Signed in as</p>
          <p className="font-sans text-sm text-ink px-3 pb-3 pt-0.5 border-b border-line truncate">{fullName}</p>
          <button
            onClick={onLogout}
            className="w-full text-left font-mono text-xs text-rejected hover:bg-line px-3 py-2.5"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}