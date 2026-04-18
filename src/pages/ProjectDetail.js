import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../utils/api';

const STATUSES = ['todo', 'inprogress', 'done'];
const STATUS_LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' };
const STATUS_COLOR = { todo: 'bg-blue-500', inprogress: 'bg-yellow-500', done: 'bg-green-500' };
const PRIORITY_COLOR = { low: 'text-green-400 bg-green-400/10', medium: 'text-yellow-400 bg-yellow-400/10', high: 'text-red-400 bg-red-400/10' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/dashboard'));
    api.get(`/projects/${id}/tickets`).then(r => setTickets(r.data));
  }, [id, navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editTicket) {
        const res = await api.put(`/projects/${id}/tickets/${editTicket._id}`, form);
        setTickets(prev => prev.map(t => t._id === editTicket._id ? res.data : t));
        setEditTicket(null);
      } else {
        const res = await api.post(`/projects/${id}/tickets`, form);
        setTickets(prev => [res.data, ...prev]);
      }
      setForm({ title: '', description: '', priority: 'medium' });
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/projects/${id}/tickets/${ticketId}`);
      setTickets(prev => prev.filter(t => t._id !== ticketId));
    } catch {}
  };

  const openEdit = (ticket) => {
    setEditTicket(ticket);
    setForm({ title: ticket.title, description: ticket.description, priority: ticket.priority });
    setShowModal(true);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    setTickets(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/projects/${id}/tickets/${draggableId}`, { status: newStatus });
    } catch {
      api.get(`/projects/${id}/tickets`).then(r => setTickets(r.data));
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const getCol = (status) => filteredTickets.filter(t => t.status === status);

  if (!project) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition text-sm">
          ← Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-medium">{project.title}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{project.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{project.description || 'No description'}</p>
          </div>
          <button onClick={() => { setEditTicket(null); setForm({ title: '', description: '', priority: 'medium' }); setShowModal(true); }}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition">
            + New Ticket
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64"
          />
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span className="text-gray-500 text-sm">{filteredTickets.length} tickets</span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-5">
            {STATUSES.map(status => {
              const col = getCol(status);
              return (
                <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${STATUS_COLOR[status]}`}></div>
                      <h3 className="font-medium text-sm">{STATUS_LABEL[status]}</h3>
                    </div>
                    <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{col.length}</span>
                  </div>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 min-h-32 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-gray-800/50' : ''}`}
                      >
                        {col.map((ticket, index) => (
                          <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-gray-800 border rounded-lg p-3 group cursor-grab active:cursor-grabbing transition-all ${
                                  snapshot.isDragging ? 'border-blue-500 shadow-lg shadow-blue-500/20 rotate-1' : 'border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm font-medium leading-snug">{ticket.title}</p>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                                    <button onClick={() => openEdit(ticket)}
                                      className="text-gray-500 hover:text-blue-400 text-xs p-1">✎</button>
                                    <button onClick={() => handleDelete(ticket._id)}
                                      className="text-gray-500 hover:text-red-400 text-xs p-1">✕</button>
                                  </div>
                                </div>
                                {ticket.description && (
                                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{ticket.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[ticket.priority]}`}>
                                    {ticket.priority}
                                  </span>
                                  <span className="text-gray-600 text-xs">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {col.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center text-gray-600 text-xs py-8 border border-dashed border-gray-800 rounded-lg">
                            Drop tickets here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editTicket ? 'Edit Ticket' : 'Create New Ticket'}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Login button not working" required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Describe the bug or task..." rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setEditTicket(null); }}
                  className="flex-1 border border-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-2.5 rounded-lg text-sm font-medium transition">
                  {creating ? 'Saving...' : editTicket ? 'Save Changes' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}