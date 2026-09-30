import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Navbar({ active, onExport, firstName, lastName, onLogout }) {
  const { pathname } = useLocation();
  const linkClass = (path) =>
    `font-mono text-xs uppercase tracking-wide ${pathname === path ? 'text-ink' : 'text-ink/50 hover:text-ink'}`;

  return (
    <div className="border-b border-line px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-x-4 gap-y-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 text-ink hover:opacity-90">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="7" width="18" height="13" rx="1.5" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M3 12h18" />
            </svg>
            <span className="font-display uppercase text-base sm:text-lg tracking-widest">Job Tracker</span>
          </Link>
          <Link to="/analytics" className={linkClass('/analytics')}>Analytics</Link>
        </div>
        {/* flex-wrap here too: if UserMenu + export + the active count don't
            all fit on one line on a narrow phone, they wrap onto their own
            row instead of forcing horizontal scroll on the navbar. */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
          <p className="font-mono text-sm text-ink/50">{active} active</p>
          <button onClick={onExport} className="font-mono text-xs text-ink/50 hover:text-ink whitespace-nowrap">
            export csv
          </button>
          <UserMenu firstName={firstName} lastName={lastName} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}