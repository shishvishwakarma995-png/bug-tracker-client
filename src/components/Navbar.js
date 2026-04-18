import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-56 right-0 h-12 bg-white flex items-center px-5 z-20 gap-4"
      style={{ borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {title && <h1 className="text-sm font-semibold text-slate-700 mr-2">{title}</h1>}

      <div className="relative max-w-xs w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
        <input type="text" placeholder="Search issues..."
          onChange={e => onSearch && onSearch(e.target.value)}
          className="w-full rounded-lg pl-8 pr-4 py-1.5 text-sm focus:outline-none transition-all"
          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A' }}
          onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition text-sm"
          style={{ border: '1px solid #E2E8F0' }}>🔔</button>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold btn-gradient">
            {user?.name?.[0]?.toUpperCase()}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl w-52 py-2 z-50"
              style={{ border: '1px solid #E2E8F0' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <p className="text-slate-800 text-sm font-medium">{user?.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{user?.email}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition mt-1">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}