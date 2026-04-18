import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer, useToast } from '../components/Toast';
import api from '../utils/api';

const STATUS_BADGE = {
  todo:       { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0', label: 'To Do' },
  inprogress: { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE', label: 'In Progress' },
  done:       { bg: '#F0FDFF', text: '#0891B2', border: '#BAE6FD', label: 'Done' },
};
const PRIORITY_CONFIG = {
  high:   { color: '#DC2626', icon: '⬆' },
  medium: { color: '#D97706', icon: '➡' },
  low:    { color: '#0891B2', icon: '⬇' },
};

export default function Backlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjects } = useProjects();
  const { toasts, show } = useToast();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchProjects();
  api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/dashboard'));
  api.get(`/projects/${id}/tickets`).then(r => setTickets(r.data));
}, [id]);

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Delete issue?')) return;
    await api.delete(`/projects/${id}/tickets/${ticketId}`);
    setTickets(prev => prev.filter(t => t._id !== ticketId));
    show('Issue deleted', 'info');
  };

  const handleStatusChange = async (ticketId, status) => {
    const res = await api.put(`/projects/${id}/tickets/${ticketId}`, { status });
    setTickets(prev => prev.map(t => t._id === ticketId ? res.data : t));
    show(`Status updated`, 'info');
  };

  const filtered = tickets.filter(t => {
    const ms = t.title.toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus === 'all' || t.status === filterStatus;
    const mp = filterPriority === 'all' || t.priority === filterPriority;
    return ms && mst && mp;
  });

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>
      <Sidebar activeProjectId={id} />
      <div className="flex-1 ml-56">
        <Navbar onSearch={setSearch} />
        <main className="pt-12">
          <div className="px-6 py-3 bg-white flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hover:text-violet-600 cursor-pointer transition" onClick={() => navigate('/dashboard')}>Projects</span>
              <span>/</span>
              <span className="hover:text-violet-600 cursor-pointer transition">{project.title}</span>
              <span>/</span>
              <span className="text-slate-700 font-medium">Backlog</span>
            </div>
            <button onClick={() => navigate(`/board/${id}`)}
              className="text-xs px-3 py-1.5 rounded-lg text-violet-600 hover:bg-violet-50 transition font-medium"
              style={{ border: '1px solid #DDD6FE' }}>
              → Switch to Board
            </button>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="text-xs rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none"
                style={{ border: '1px solid #E2E8F0' }}>
                <option value="all">All statuses</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="text-xs rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none"
                style={{ border: '1px solid #E2E8F0' }}>
                <option value="all">All priorities</option>
                <option value="high">⬆ High</option>
                <option value="medium">➡ Medium</option>
                <option value="low">⬇ Low</option>
              </select>
              <span className="text-xs text-slate-400 ml-auto">{filtered.length} issues</span>
            </div>

            <div className="bg-white rounded-xl overflow-hidden card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                    {['Type', 'Summary', 'Status', 'Priority', 'Created', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-slate-300 text-sm">No issues found</td></tr>
                  ) : filtered.map((t, i) => {
                    const sb = STATUS_BADGE[t.status];
                    const pc = PRIORITY_CONFIG[t.priority];
                    const typeIcons = { bug: '🐛', feature: '✨', task: '📝' };
                    return (
                      <tr key={t._id} className="hover:bg-slate-50 transition group"
                        style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td className="px-4 py-3 text-base">{typeIcons[t.type || 'bug']}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700 hover:text-violet-600 cursor-pointer transition"
                            onClick={() => navigate(`/board/${id}`)}>
                            {t.title}
                          </p>
                          {t.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <select value={t.status} onChange={e => handleStatusChange(t._id, e.target.value)}
                            className="text-xs font-medium px-2 py-1 rounded-full cursor-pointer focus:outline-none"
                            style={{ background: sb.bg, color: sb.text, border: `1px solid ${sb.border}` }}>
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold" style={{ color: pc.color }}>
                            {pc.icon} {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(t._id)}
                            className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-red-400 hover:bg-red-50 text-sm">🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}