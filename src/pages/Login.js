import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' }}>
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/30 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/30 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold btn-gradient">BT</div>
          <span className="text-white font-semibold text-lg">Bug Tracker</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Track bugs,<br />
            <span style={{ background: 'linear-gradient(90deg, #22D3EE, #A78BFA, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ship faster.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Manage your team's work with a professional issue tracker built for developers.
          </p>
          <div className="flex gap-3 mt-8">
            {[
              { icon: '🧩', label: 'Kanban Board' },
              { icon: '🐛', label: 'Bug Tracking' },
              { icon: '💬', label: 'Comments' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span>{f.icon}</span>{f.label}
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-xs">© 2026 Bug Tracker. Built with MERN Stack.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm glass-panel p-10 rounded-[24px] shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold btn-gradient">BT</div>
            <span className="font-semibold text-slate-800">Bug Tracker</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-7">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-5"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@example.com" required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all bg-white"
                style={{ border: '1px solid #E2E8F0' }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••" required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all bg-white"
                style={{ border: '1px solid #E2E8F0' }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-gradient py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#7C3AED' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}