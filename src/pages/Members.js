import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer, useToast } from '../components/Toast';
import { useProjects } from '../context/ProjectContext';
import api from '../utils/api';

export default function Members() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProjects } = useProjects();
  const { toasts, show } = useToast();
  const [project, setProject] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProjects();
    api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/dashboard'));
  }, [id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api.put(`/projects/${id}/invite`, { email: inviteEmail });
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setInviteEmail('');
      show('Member invited!');
    } catch (err) {
      show(err.response?.data?.message || 'User not found', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.put(`/projects/${id}/remove-member`, { memberId });
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      show('Member removed', 'info');
    } catch (err) {
      show(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const inputFocus = (e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; };
  const inputBlur = (e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; };

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
        <main className="pt-12 px-8 py-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Team Members</h1>
            <p className="text-slate-400 text-sm mb-8">{project.title} · {project.members?.length || 0} members</p>

            {/* Invite form */}
            <div className="bg-white rounded-2xl p-6 mb-6 card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Invite by email</h3>
              <form onSubmit={handleInvite} className="flex gap-3">
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com" required
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onFocus={inputFocus} onBlur={inputBlur} />
                <button type="submit" disabled={inviting}
                  className="btn-gradient px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50">
                  {inviting ? 'Inviting...' : 'Invite'}
                </button>
              </form>
              <p className="text-xs text-slate-400 mt-2">The user must already have an account.</p>
            </div>

            {/* Members list */}
            <div className="bg-white rounded-2xl overflow-hidden card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <div className="px-6 py-3 flex items-center justify-between" style={{ background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Members</span>
              </div>
              {project.members?.map((member, i) => (
                <div key={member._id || i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition group"
                  style={{ borderBottom: i < project.members.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold btn-gradient">
                      {member.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={member._id === project.owner?._id || member._id === project.owner
                        ? { background: '#FAF5FF', color: '#7C3AED', border: '1px solid #DDD6FE' }
                        : { background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' }}>
                      {member._id === project.owner?._id || member._id === project.owner ? 'Owner' : 'Member'}
                    </span>
                    {(member._id !== project.owner?._id && member._id !== project.owner) && (
                      <button onClick={() => handleRemove(member._id)}
                        className="text-xs text-red-400 hover:bg-red-50 px-2 py-1 rounded-lg transition opacity-0 group-hover:opacity-100"
                        style={{ border: '1px solid #FECACA' }}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}