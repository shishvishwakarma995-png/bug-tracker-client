import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer, useToast } from '../components/Toast';
import api from '../utils/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, show } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      show('Profile updated!');
    } catch (err) {
      show(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      show('Passwords do not match', 'error');
      return;
    }
    setChangingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      show('Password changed!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      show(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const inputFocus = (e) => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; };
  const inputBlur = (e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>
      <Sidebar />
      <div className="flex-1 ml-56">
        <Navbar />
        <main className="pt-12 px-8 py-8">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Profile</h1>
            <p className="text-slate-400 text-sm mb-8">Manage your account settings</p>

            {/* Avatar */}
            <div className="bg-white rounded-2xl p-6 mb-5 card-shadow flex items-center gap-5" style={{ border: '1px solid #E2E8F0' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold btn-gradient">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{user?.name}</h3>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: '#FAF5FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}>Member</span>
              </div>
            </div>

            {/* Update profile */}
            <div className="bg-white rounded-2xl p-6 mb-5 card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Personal Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving}
                    className="btn-gradient px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-2xl p-6 mb-5 card-shadow" style={{ border: '1px solid #E2E8F0' }}>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: 'Current Password', key: 'current', val: passwords.current },
                  { label: 'New Password', key: 'newPass', val: passwords.newPass },
                  { label: 'Confirm New Password', key: 'confirm', val: passwords.confirm },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{f.label}</label>
                    <input type="password" value={f.val}
                      onChange={e => setPasswords({...passwords, [f.key]: e.target.value})}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                      onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                ))}
                <div className="flex justify-end">
                  <button type="submit" disabled={changingPass}
                    className="btn-gradient px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50">
                    {changingPass ? 'Changing...' : 'Change password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl p-6 card-shadow" style={{ border: '1px solid #FECACA' }}>
              <h3 className="text-sm font-semibold text-red-400 mb-4">Danger Zone</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Sign out</p>
                  <p className="text-xs text-slate-400">Sign out from all devices</p>
                </div>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="text-sm px-4 py-2 rounded-xl text-red-400 hover:bg-red-50 transition"
                  style={{ border: '1px solid #FECACA' }}>Sign out</button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}