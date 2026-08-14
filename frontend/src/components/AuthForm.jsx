import { useState } from 'react';
import { loginUser, registerUser } from '../api/authApi';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = mode === 'login'
        ? await loginUser(email, password)
        : await registerUser(firstName, lastName, email, password);
      onAuth(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-field border border-line text-ink font-mono text-sm px-3 py-2 focus:outline-none focus:border-ink";
  const labelClass = "block font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-1";

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display uppercase text-2xl tracking-widest text-ink text-center mb-1">Job Tracker</h1>
        <p className="font-mono text-xs text-ink/40 text-center mb-6">
          {mode === 'login' ? 'sign in to continue' : 'create an account'}
        </p>

        <form onSubmit={handleSubmit} className="bg-surface border border-line px-6 py-6">
          {mode === 'register' && (
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className={labelClass}>First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div className="mb-5">
            <label className={labelClass}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
          </div>

          {error && <p className="font-mono text-[11px] text-rejected mb-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-display uppercase text-sm tracking-wide bg-applied text-canvas px-5 py-2.5 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Processing…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          className="w-full font-mono text-xs text-ink/50 hover:text-ink text-center mt-4"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}