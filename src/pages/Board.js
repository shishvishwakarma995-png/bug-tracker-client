import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer, useToast } from '../components/Toast';
import api from '../utils/api';

const STATUSES = ['todo', 'inprogress', 'done'];
const STATUS_LABEL = { todo: 'TO DO', inprogress: 'IN PROGRESS', done: 'DONE' };
const STATUS_STYLE = {
  todo:       { dot: '#94A3B8', bg: '#F8FAFC', border: '#CBD5E1', header: '#64748B' },
  inprogress: { dot: '#7C3AED', bg: '#FAF5FF', border: '#DDD6FE', header: '#7C3AED' },
  done:       { dot: '#0891B2', bg: '#F0FDFF', border: '#BAE6FD', header: '#0891B2' },
};
const PRIORITY_CONFIG = {
  high:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '⬆', label: 'High' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '➡', label: 'Medium' },
  low:    { color: '#0891B2', bg: '#F0FDFF', border: '#BAE6FD', icon: '⬇', label: 'Low' },
};
const TYPE_CONFIG = {
  bug:     { icon: '🐛' },
  feature: { icon: '✨' },
  task:    { icon: '📝' },
};

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjects } = useProjects();
  const { toasts, show } = useToast();

  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', type: 'bug' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [dragOverCol, setDragOverCol] = useState(null);
  const dragTicketId = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProjects();
    api.get(`/projects/${id}`)
      .then(r => setProject(r.data))
      .catch(() => navigate('/dashboard'));
    api.get(`/projects/${id}/tickets`)
      .then(r => setTickets(r.data));
  }, [id]);

  useEffect(() => {
    if (selectedTicket) {
      api.get(`/tickets/${selectedTicket._id}/comments`)
        .then(r => setComments(r.data))
        .catch(() => setComments([]));
    }
  }, [selectedTicket]);

  const ticketCode = (index) =>
    `${project?.title?.slice(0, 3).toUpperCase()}-${index + 1}`;

  const resetForm = () =>
    setForm({ title: '', description: '', priority: 'medium', type: 'bug' });

  // ── Drag handlers ──────────────────────────────────────
  const handleDragStart = (e, ticketId) => {
    dragTicketId.current = ticketId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = async (e, status) => {
    e.preventDefault();
    setDragOverCol(null);
    const tId = dragTicketId.current;
    if (!tId) return;
    const ticket = tickets.find(t => t._id === tId);
    if (!ticket || ticket.status === status) return;

    setTickets(prev =>
      prev.map(t => t._id === tId ? { ...t, status } : t)
    );
    try {
      await api.put(`/projects/${id}/tickets/${tId}`, { status });
      show(`Moved to ${STATUS_LABEL[status]}`, 'info');
    } catch {
      api.get(`/projects/${id}/tickets`).then(r => setTickets(r.data));
      show('Failed to move ticket', 'error');
    }
    dragTicketId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    dragTicketId.current = null;
  };
  // ───────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editTicket) {
        const res = await api.put(`/projects/${id}/tickets/${editTicket._id}`, form);
        setTickets(prev => prev.map(t => t._id === editTicket._id ? res.data : t));
        show('Issue updated!');
        setEditTicket(null);
      } else {
        const res = await api.post(`/projects/${id}/tickets`, form);
        setTickets(prev => [res.data, ...prev]);
        show('Issue created!');
      }
      resetForm();
      setShowModal(false);
    } catch (err) {
      show(err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await api.delete(`/projects/${id}/tickets/${ticketId}`);
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
      show('Issue deleted', 'info');
    } catch {
      show('Failed to delete', 'error');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddingComment(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/comments`, { text: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch {
      show('Failed to add comment', 'error');
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/tickets/${selectedTicket._id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch {
      show('Failed to delete comment', 'error');
    }
  };

  const filtered = tickets.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterPriority === 'all' || t.priority === filterPriority)
  );
  const getCol = (status) => filtered.filter(t => t.status === status);

  const inputFocus = (e) => {
    e.target.style.borderColor = '#7C3AED';
    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow = 'none';
  };

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-400">Loading board...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>
      <Sidebar activeProjectId={id} />

      <div className="flex-1 ml-56 flex flex-col">
        <Navbar onSearch={setSearch} />

        <main className="pt-12 flex flex-col flex-1">
          {/* Top bar */}
          <div className="px-6 py-3 bg-white flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hover:text-violet-600 cursor-pointer transition"
                onClick={() => navigate('/dashboard')}>Projects</span>
              <span>/</span>
              <span className="hover:text-violet-600 cursor-pointer transition">{project.title}</span>
              <span>/</span>
              <span className="text-slate-700 font-medium">Board</span>
            </div>
            <div className="flex items-center gap-3">
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                className="text-xs rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none"
                style={{ border: '1px solid #E2E8F0' }}>
                <option value="all">All priorities</option>
                <option value="high">⬆ High</option>
                <option value="medium">➡ Medium</option>
                <option value="low">⬇ Low</option>
              </select>
              <span className="text-xs text-slate-400">{filtered.length} issues</span>
              <button
                onClick={() => { setEditTicket(null); resetForm(); setShowModal(true); }}
                className="btn-gradient flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white">
                + Create issue
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="px-6 py-5 flex-1">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {STATUSES.map(status => {
                const col = getCol(status);
                const ss = STATUS_STYLE[status];
                const isDragOver = dragOverCol === status;
                return (
                  <div key={status} style={{ minWidth: 0 }}>
                    {/* Column header */}
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: ss.dot }}></div>
                      <span className="text-xs font-bold tracking-widest"
                        style={{ color: ss.header }}>{STATUS_LABEL[status]}</span>
                      <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full bg-white flex-shrink-0"
                        style={{ border: '1px solid #E2E8F0', color: '#64748B' }}>{col.length}</span>
                    </div>

                    {/* Drop zone */}
                      <div
                      onDragOver={e => handleDragOver(e, status)}
                      onDragLeave={handleDragLeave}
                      onDrop={e => handleDrop(e, status)}
                      className="rounded-2xl transition-all duration-300"
                      style={{
                        minHeight: '200px',
                        padding: '12px',
                        background: isDragOver ? `${ss.bg}AA` : 'transparent',
                        border: `2px ${isDragOver ? 'dashed' : 'solid'} ${isDragOver ? ss.dot : 'transparent'}`,
                        boxShadow: isDragOver ? `inset 0 0 20px ${ss.dot}15` : 'none',
                      }}>

                      {col.map((ticket) => {
                        const pc = PRIORITY_CONFIG[ticket.priority];
                        const tc = TYPE_CONFIG[ticket.type || 'bug'];
                        const allIdx = tickets.findIndex(t => t._id === ticket._id);
                        return (
                          <div
                            key={ticket._id}
                            draggable
                            onDragStart={e => handleDragStart(e, ticket._id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedTicket(ticket)}
                            className="group premium-card"
                            style={{
                              borderRadius: '14px',
                              padding: '16px',
                              marginBottom: '12px',
                              cursor: 'grab',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              border: '1px solid #E2E8F0',
                            }}>

                            {/* Ticket header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>{tc.icon}</span>
                              <p style={{ fontSize: '13px', fontWeight: '500', color: '#334155', lineHeight: '1.4', flex: 1 }}>
                                {ticket.title}
                              </p>
                              <div className="opacity-0 group-hover:opacity-100"
                                style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditTicket(ticket);
                                    setForm({ title: ticket.title, description: ticket.description, priority: ticket.priority, type: ticket.type || 'bug' });
                                    setShowModal(true);
                                  }}
                                  style={{ color: '#CBD5E1', fontSize: '12px', padding: '2px 4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                                  onMouseEnter={e => e.target.style.color = '#7C3AED'}
                                  onMouseLeave={e => e.target.style.color = '#CBD5E1'}>✎</button>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDelete(ticket._id); }}
                                  style={{ color: '#CBD5E1', fontSize: '12px', padding: '2px 4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                                  onMouseEnter={e => e.target.style.color = '#EF4444'}
                                  onMouseLeave={e => e.target.style.color = '#CBD5E1'}>✕</button>
                              </div>
                            </div>

                            {/* Description */}
                            {ticket.description && (
                              <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {ticket.description}
                              </p>
                            )}

                            {/* Footer */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                              <span style={{
                                fontSize: '11px', fontWeight: '600',
                                padding: '2px 8px', borderRadius: '999px',
                                color: pc.color, background: pc.bg,
                                border: `1px solid ${pc.border}`,
                              }}>
                                {pc.icon} {pc.label}
                              </span>
                              <span className="ticket-id" style={{ fontSize: '11px', fontWeight: '600', color: '#7C3AED', opacity: 0.5 }}>
                                {ticketCode(allIdx)}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {col.length === 0 && !isDragOver && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                          <p style={{ fontSize: '12px', color: '#CBD5E1' }}>Drop issues here</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ── Ticket Detail Panel ── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-end"
          style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && setSelectedTicket(null)}>
          <div className="glass-panel slide-in-right h-full w-full max-w-lg overflow-y-auto shadow-2xl"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.4)' }}>

            <div className="sticky top-0 px-6 py-5 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)', zIndex: 10 }}>
              <span className="ticket-id text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ color: '#7C3AED', background: '#FAF5FF', border: '1px solid #DDD6FE' }}>
                {ticketCode(tickets.findIndex(t => t._id === selectedTicket._id))}
              </span>
              <div className="flex gap-2">
                <button onClick={() => {
                  setEditTicket(selectedTicket);
                  setForm({ title: selectedTicket.title, description: selectedTicket.description, priority: selectedTicket.priority, type: selectedTicket.type || 'bug' });
                  setShowModal(true);
                  setSelectedTicket(null);
                }}
                  className="text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition"
                  style={{ border: '1px solid #E2E8F0' }}>Edit</button>
                <button onClick={() => handleDelete(selectedTicket._id)}
                  className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                  style={{ border: '1px solid #FECACA' }}>Delete</button>
                <button onClick={() => setSelectedTicket(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition"
                  style={{ border: '1px solid #E2E8F0' }}>✕</button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-5">
                <span className="text-2xl">{TYPE_CONFIG[selectedTicket.type || 'bug'].icon}</span>
                <h2 className="text-lg font-semibold text-slate-800 leading-snug">{selectedTicket.title}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl p-4 mb-5"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Status</p>
                  <p className="text-sm font-medium" style={{ color: STATUS_STYLE[selectedTicket.status].dot }}>
                    {STATUS_LABEL[selectedTicket.status]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Priority</p>
                  <p className="text-sm font-medium" style={{ color: PRIORITY_CONFIG[selectedTicket.priority].color }}>
                    {PRIORITY_CONFIG[selectedTicket.priority].icon} {PRIORITY_CONFIG[selectedTicket.priority].label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Type</p>
                  <p className="text-sm font-medium text-slate-600 capitalize">{selectedTicket.type || 'Bug'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Created</p>
                  <p className="text-sm font-medium text-slate-600">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedTicket.description && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed rounded-xl p-4"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    {selectedTicket.description}
                  </p>
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Move to</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.filter(s => s !== selectedTicket.status).map(s => (
                    <button key={s} onClick={async () => {
                      const res = await api.put(`/projects/${id}/tickets/${selectedTicket._id}`, { status: s });
                      setTickets(prev => prev.map(t => t._id === selectedTicket._id ? res.data : t));
                      setSelectedTicket(res.data);
                      show(`Moved to ${STATUS_LABEL[s]}`, 'info');
                    }}
                      className="text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition"
                      style={{ border: '1px solid #E2E8F0' }}>
                      → {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Comments ({comments.length})
                </p>
                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 rounded-xl" style={{ border: '1px dashed #E2E8F0' }}>
                      <p className="text-xs text-slate-300">No comments yet</p>
                    </div>
                  ) : comments.map(c => (
                    <div key={c._id} className="flex gap-3 group">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold btn-gradient flex-shrink-0">
                        {c.author?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 rounded-xl px-3 py-2.5"
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">{c.author?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                            <button onClick={() => handleDeleteComment(c._id)}
                              className="text-xs text-slate-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100">✕</button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment... (Enter to send)"
                    className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
                    onFocus={inputFocus}
                    onBlur={inputBlur} />
                  <button onClick={handleAddComment}
                    disabled={addingComment || !newComment.trim()}
                    className="btn-gradient px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-40">
                    {addingComment ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white btn-gradient text-base">
                {editTicket ? '✎' : '+'}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">{editTicket ? 'Edit issue' : 'Create issue'}</h2>
                <p className="text-xs text-slate-400">{project.title}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Summary <span className="text-red-400">*</span>
                </label>
                <input type="text" value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Short summary of the issue"
                  required autoFocus
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Add more context..." rows={3}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 text-slate-700"
                    style={{ border: '1px solid #E2E8F0' }}>
                    <option value="low">⬇ Low</option>
                    <option value="medium">➡ Medium</option>
                    <option value="high">⬆ High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Issue type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-slate-50 text-slate-700"
                    style={{ border: '1px solid #E2E8F0' }}>
                    <option value="bug">🐛 Bug</option>
                    <option value="feature">✨ Feature</option>
                    <option value="task">📝 Task</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                <button type="button"
                  onClick={() => { setShowModal(false); setEditTicket(null); resetForm(); }}
                  className="px-4 py-2 text-sm rounded-xl text-slate-500 hover:bg-slate-50 transition"
                  style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
                <button type="submit" disabled={creating}
                  className="btn-gradient px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50">
                  {creating
                    ? <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Saving...
                      </span>
                    : editTicket ? 'Save changes' : 'Create issue'}
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