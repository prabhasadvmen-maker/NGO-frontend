import React, { useState } from 'react';
import { Mail, Shield, Calendar, Pencil, Save, X, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../shared/colors';

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });

  const handleSave = () => { toast.success('Profile updated successfully!'); setEditing(false); };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setTimeout(() => navigate('/superadmin/login'), 1000);
  };

  const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const infoItems = [
    { icon: Mail,     label: 'Email',        value: user?.email || '—' },
    { icon: Shield,   label: 'Role',         value: user?.role?.replace('_', ' ') || '—' },
    { icon: Calendar, label: 'Member Since', value: 'July 2025' },
  ];

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your personal information</p>
        </div>

        <div className="rounded-2xl p-6 flex items-center gap-5"
          style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ backgroundColor: COLORS.primary }}>{initials}</div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-800">{user?.name || 'Admin'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 capitalize">
              {user?.role?.replace('_', ' ') || 'Super Admin'}
            </span>
          </div>
          <button onClick={() => setEditing(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: editing ? '#f3f4f6' : COLORS.primary, color: editing ? '#374151' : '#fff' }}>
            {editing ? <><X size={15} /> Cancel</> : <><Pencil size={15} /> Edit</>}
          </button>
        </div>

        {editing && (
          <div className="rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Edit Information</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 border border-gray-200 focus:border-green-500 outline-none bg-gray-50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 border border-gray-200 focus:border-green-500 outline-none bg-gray-50 transition-colors" />
            </div>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: COLORS.primary }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Details</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E8F5E9' }}>
                  <Icon size={16} style={{ color: COLORS.primary }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-700 capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors">
          <LogOut size={15} /> Logout
        </button>
      </div>
    </Layout>
  );
};

export default Profile;
