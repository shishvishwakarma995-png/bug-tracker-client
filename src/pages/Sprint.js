import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer, useToast } from '../components/Toast';
import { useProjects } from '../context/ProjectContext';
import api from '../utils/api';

const STATUS_COLOR = {
  planning: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
  active:   { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  completed:{ bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
};
const PRIORITY_COLOR = {
  high:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '⬆' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '➡' },
  low:    { color: '#0891B2', bg: '#F0FDFF', border: '#BAE6FD', icon: '⬇' },
};

export default function Sprint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjects } = useProjects();
  const { toasts, show } = useToast();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeSprint, setActiveSprint] = useState(null);
  const [sprintTickets, setSprintTickets] = useState([]);
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
  const [creating, setCreating] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProjects();
    api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/dashboard'));
    api.get(`/projects/${id}/tickets`).then(r => setTickets(r.data));
    api.get(`/projects/${id}/sprints`).then(r => {
      setSprints(r.data);
      if (r.data.length > 0) {
        setActiveSprint(r.data[0]);
        api.get(`/projects/${id}/sprints/${r.data[0]._id}/tickets`).then(rt => setSprintTickets(rt.data));
      }
    });
  }, [id]);

  const handleSelectSprint = async (sprint) => {
    setActiveSprint(sprint);
    const res = await api.get(`/projects/${id}/sprints/${sprint._id}/tickets`);
    setSprintTickets(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post(`/projects/${id}/sprints`, form);
      setSprints(prev => [res.data, ...prev]);
      setForm({ name: '', goal: '', startDate: '', endDate: '' });
      setShowModal(false);
      show('Sprint created!');
    } catch (err) {
      show(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (sprintId, status) => {
    const res = await api.put(`/projects/${id}/sprints/${sprintId}`, { status });
    setSprints(prev => prev.map(s => s._id === sprintId ? res.data : s));
    if (activeSprint?._id === sprintId) setActiveSprint(res.data);
    show(`Sprint ${status}!`, 'info');
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm('Delete this sprint?')) return;
    await api.delete(`/projects/${id}/sprints/${sprintId}`);
    setSprints(prev => prev.filter(s => s._id !== sprintId));
    if (activeSprint?._id === sprintId) { setActiveSprint(null); setSprintTickets([]); }
    show('Sprint deleted', 'info');
  };

  const handleAssignTicket = async (ticketId, sprintId) => {
    await api.put(`/projects/${id}/tickets/${ticketId}`, { sprint: sprintId || null });
    setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, sprint: sprintId } : t));
    if (activeSprint) {
      const res = await api.get(`/projects/${id}/sprints/${activeSprint._id}/tickets`);
      setSprintTickets(res.data);
    }
    show('Ticket updated!', 'info');
  };

  const inputFocus = (e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; };
  const inputBlur = (e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; };

  const unassignedTickets = tickets.filter(t => !t.sprint);

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>
      <Sidebar activeProjectId={id} />
      <div className="flex-1 ml-56">
        <Navbar />
        <main className="pt-12">
          <div className="px-6 py-3 bg-white flex items-center justify-between" style={{ borderBottom: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hover:text-violet-600 cursor-pointer transition" onClick={() => navigate('/dashboard')}>Projects</span>
              <span>/</span>
              <span className="text-slate-700 font-medium">{project.title}</span>
              <span>/</span>
              <span className="text-slate-700 font-medium">Sprints</span>
            </div>
            <button onClick={() => setShowModal(true)}
              className="btn-gradient px-4 py-1.5 rounded-lg text-sm font-medium text-white">
              + New Sprint
            </button>
          </div>

          <div className="px-6 py-6 flex gap-6">
            {/* Sprint list */}
            <div className="w-72 flex-shrink-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sprints ({sprints.length})</h3>
              {sprints.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center card-shadow" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="text-3xl mb-3">🏃</div>
                  <p className="text-sm text-slate-400 mb-4">No sprints yet</p>
                  <button onClick={() => setShowModal(true)} className="btn-gradient px-4 py-2 rounded-lg text-white text-xs font-medium">
                    Create sprint
                  </button>
                </div>
              ) : sprints.map(sprint => {
                const sc = STATUS_COLOR[sprint.status];
                const isActive = activeSprint?._id === sprint._id;
                return (
                  <div key={sprint._id} onClick={() => handleSelectSprint(sprint)}
                    className="bg-white rounded-xl p-4 mb-3 cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${isActive ? '#7C3AED' : '#E2E8F0'}`,
                      boxShadow: isActive ? '0 0 0 3px rgba(124,58,237,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                    }}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-700">{sprint.name}</h4>
                      <button onClick={e => { e.stopPropagation(); handleDeleteSprint(sprint._id); }}
                        className="text-slate-300 hover:text-red-400 transition text-xs">✕</button>
                    </div>
                    {sprint.goal && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{sprint.goal}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {sprint.status}
                      </span>
                      <div className="flex gap-1">
                        {sprint.status === 'planning' && (
                          <button onClick={e => { e.stopPropagation(); handleStatusChange(sprint._id, 'active'); }}
                            className="text-xs px-2 py-1 rounded-lg text-green-600 hover:bg-green-50 transition"
                            style={{ border: '1px solid #BBF7D0' }}>Start</button>
                        )}
                        {sprint.status === 'active' && (
                          <button onClick={e => { e.stopPropagation(); handleStatusChange(sprint._id, 'completed'); }}
                            className="text-xs px-2 py-1 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            style={{ border: '1px solid #BFDBFE' }}>Complete</button>
                        )}
                      </div>
                    </div>
                    {sprint.startDate && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-slate-400">📅 {new Date(sprint.startDate).toLocaleDateString()} → {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : '?'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sprint detail */}
            <div className="flex-1 min-w-0">
              {activeSprint ? (
                <>
                  <div className="bg-white rounded-xl p-5 mb-4 card-shadow" style={{ border: '1px solid #E2E8F0' }}>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-lg font-semibold text-slate-800">{activeSprint.name}</h2>
                      <span className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ background: STATUS_COLOR[activeSprint.status].bg, color: STATUS_COLOR[activeSprint.status].text, border: `1px solid ${STATUS_COLOR[activeSprint.status].border}` }}>
                        {activeSprint.status}
                      </span>
                    </div>
                    {activeSprint.goal && <p className="text-sm text-slate-500">{activeSprint.goal}</p>}
                    <div className="flex gap-4 mt-3">
                      <div className="text-xs text-slate-400">📋 {sprintTickets.length} tickets</div>
                      <div className="text-xs text-green-500">✓ {sprintTickets.filter(t => t.status === 'done').length} done</div>
                      <div className="text-xs text-violet-500">⚡ {sprintTickets.filter(t => t.status === 'inprogress').length} in progress</div>
                    </div>
                    {sprintTickets.length > 0 && (
                      <div className="mt-3">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full btn-gradient transition-all"
                            style={{ width: `${Math.round((sprintTickets.filter(t => t.status === 'done').length / sprintTickets.length) * 100)}%` }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {Math.round((sprintTickets.filter(t => t.status === 'done').length / sprintTickets.length) * 100)}% complete
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden card-shadow" style={{ border: '1px solid #E2E8F0' }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sprint Tickets</span>
                    </div>
                    {sprintTickets.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-300 text-sm">No tickets in this sprint yet</p>
                        <p className="text-slate-200 text-xs mt-1">Assign tickets from the backlog below</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <tbody>
                          {sprintTickets.map((t, i) => {
                            const pc = PRIORITY_COLOR[t.priority];
                            const typeIcons = { bug: '🐛', feature: '✨', task: '📝' };
                            return (
                              <tr key={t._id} style={{ borderBottom: i < sprintTickets.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                <td className="px-4 py-3 text-base">{typeIcons[t.type || 'bug']}</td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-700">{t.title}</td>
                                <td className="px-4 py-3">
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ color: pc.color, background: pc.bg, border: `1px solid ${pc.border}` }}>
                                    {pc.icon} {t.priority}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{t.status}</td>
                                <td className="px-4 py-3">
                                  <button onClick={() => handleAssignTicket(t._id, null)}
                                    className="text-xs text-red-400 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                                    style={{ border: '1px solid #FECACA' }}>Remove</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {unassignedTickets.length > 0 && (
                    <div className="mt-4 bg-white rounded-xl overflow-hidden card-shadow" style={{ border: '1px solid #E2E8F0' }}>
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Backlog — Add to sprint ({unassignedTickets.length})
                        </span>
                      </div>
                      <table className="w-full">
                        <tbody>
                          {unassignedTickets.map((t, i) => {
                            const typeIcons = { bug: '🐛', feature: '✨', task: '📝' };
                            return (
                              <tr key={t._id} className="hover:bg-slate-50 transition"
                                style={{ borderBottom: i < unassignedTickets.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                <td className="px-4 py-3 text-base">{typeIcons[t.type || 'bug']}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{t.title}</td>
                                <td className="px-4 py-3 text-xs text-slate-400">{t.priority}</td>
                                <td className="px-4 py-3">
                                  <button onClick={() => handleAssignTicket(t._id, activeSprint._id)}
                                    className="text-xs text-violet-600 hover:bg-violet-50 px-2 py-1 rounded-lg transition font-medium"
                                    style={{ border: '1px solid #DDD6FE' }}>+ Add</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl p-16 text-center card-shadow" style={{ border: '1px solid #E2E8F0' }}>
                  <div className="text-5xl mb-4">🏃</div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a sprint</h3>
                  <p className="text-sm text-slate-400">Click a sprint from the left to view details</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white btn-gradient">🏃</div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Create Sprint</h2>
                <p className="text-xs text-slate-400">{project.title}</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Sprint Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Sprint 1" required autoFocus
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Sprint Goal</label>
                <textarea value={form.goal} onChange={e => setForm({...form, goal: e.target.value})}
                  placeholder="What do you want to achieve?" rows={2}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-xl text-slate-500 hover:bg-slate-50 transition"
                  style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
                <button type="submit" disabled={creating}
                  className="btn-gradient px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}