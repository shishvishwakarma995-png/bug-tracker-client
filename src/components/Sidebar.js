import { useNavigate, useLocation } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeProjectId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects } = useProjects();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const isBoardActive = location.pathname.includes('/board');
  const isBacklogActive = location.pathname.includes('/backlog');
  const isSprintActive = location.pathname.includes('/sprint');
  const isMembersActive = location.pathname.includes('/members');

  return (
    <aside className="w-56 min-h-screen flex flex-col fixed left-0 top-0 z-30"
      style={{ background: 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold btn-gradient">BT</div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Bug Tracker</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>v1.0 · Software</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <button onClick={() => navigate('/dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${isActive('/dashboard') ? 'sidebar-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <span>⚡</span><span>Dashboard</span>
        </button>

        {projects.length > 0 && (
          <>
            <p className="px-3 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Projects</p>
            {projects.map(p => (
              <button key={p._id} onClick={() => navigate(`/board/${p._id}`)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${activeProjectId === p._id ? 'sidebar-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 btn-gradient">
                  {p.title[0].toUpperCase()}
                </div>
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </>
        )}

        {activeProjectId && (
          <>
            <p className="px-3 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Planning</p>
            {[
              { label: 'Board', icon: '🧩', path: `/board/${activeProjectId}`, active: isBoardActive },
              { label: 'Backlog', icon: '📋', path: `/backlog/${activeProjectId}`, active: isBacklogActive },
              { label: 'Sprints', icon: '🏃', path: `/sprint/${activeProjectId}`, active: isSprintActive },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${item.active ? 'sidebar-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
              </button>
            ))}

            <p className="px-3 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>Manage</p>
            <button onClick={() => navigate(`/members/${activeProjectId}`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all ${isMembersActive ? 'sidebar-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span>👥</span><span>Members</span>
              {isMembersActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
            </button>
          </>
        )}
      </nav>

    </aside>
  );
}