import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer, useToast } from '../components/Toast';

export default function Dashboard() {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects();
  const navigate = useNavigate();
  const { toasts, show } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const project = await createProject(form.title, form.description);
      setForm({ title: '', description: '' });
      setShowModal(false);
      show('Project created!');
      navigate(`/board/${project._id}`);
    } catch (err) {
      show(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setCreating(false);
    }
  };

  // // const PRIORITY_COLORS = {
  //   high: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  //   medium: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  //   low: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  // };

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>
      <Sidebar />
      <div className="flex-1 ml-56">
        <Navbar title="Projects" />
        <main className="pt-12 px-8 py-8">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">All Projects</h1>
              <p className="text-sm text-slate-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-gradient flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white">
              + Create project
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Projects', value: projects.length, icon: '📁', accent: '#7C3AED' },
              { label: 'Active Boards', value: projects.length, icon: '⚡', accent: '#0891B2' },
              { label: 'Team Members', value: 1, icon: '👥', accent: '#EC4899' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-5 flex items-center gap-4 card-shadow"
                style={{ border: '1px solid #E2E8F0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${s.accent}15`, border: `1px solid ${s.accent}25` }}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-400">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl p-20 text-center card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No projects yet</h3>
              <p className="text-sm text-slate-400 mb-6">Create your first project to start tracking issues</p>
              <button onClick={() => setShowModal(true)} className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-medium text-white">
                Create project
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                    {['Name', 'Key', 'Type', 'Lead', 'Created', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={p._id} onClick={() => navigate(`/board/${p._id}`)}
                      className="transition-all duration-200 cursor-pointer group hover:bg-violet-50/50 hover:shadow-sm"
                      style={{ borderBottom: i < projects.length - 1 ? '1px solid #F1F5F9' : 'none', transform: 'translateZ(0)' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white btn-gradient shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                            {p.title[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 ticket-id text-xs font-bold" style={{ color: '#7C3AED' }}>
                        {p.title.slice(0,3).toUpperCase()}-{i+1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1.5 rounded-full font-semibold"
                          style={{ background: '#F0FDFF', color: '#0891B2', border: '1px solid #BAE6FD' }}>Software</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{p.owner?.name || 'You'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={e => { e.stopPropagation(); if(window.confirm('Delete project?')) { deleteProject(p._id); show('Project deleted', 'info'); }}}
                          className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg text-red-500 hover:bg-red-100 hover:scale-110 text-sm">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <ToastContainer toasts={toasts} />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white btn-gradient">📁</div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Create project</h2>
                <p className="text-xs text-slate-400">Start tracking bugs and issues</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Project name <span className="text-red-400">*</span>
                </label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. E-commerce App" required autoFocus
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="What is this project about?" rows={3}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />
              </div>
              <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg text-slate-500 hover:bg-slate-50 transition"
                  style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
                <button type="submit" disabled={creating}
                  className="btn-gradient px-5 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}