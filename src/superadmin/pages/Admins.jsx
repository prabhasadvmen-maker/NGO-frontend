import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, LogIn, ToggleLeft, ToggleRight, X, Eye, EyeOff, Settings, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import { COLORS } from '../../shared/colors';

import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-md mx-4 rounded-2xl p-6 bg-white border border-gray-100">{children}</div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-lg font-extrabold text-gray-800">{title}</h2>
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
      <X size={18} className="text-gray-500" />
    </button>
  </div>
);

const ActionMenu = ({ admin, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Actions">
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button onClick={() => { onView(admin); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye size={14} className="text-blue-500" /> View
          </button>
          <button onClick={() => { onEdit(admin); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Pencil size={14} className="text-green-600" /> Edit
          </button>
          <div className="border-t border-gray-100" />
          <button onClick={() => { onDelete(admin); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const Admins = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [admins, setAdmins]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const [addModal, setAddModal]       = useState(false);
  const [viewAdmin, setViewAdmin]     = useState(null);
  const [editAdmin, setEditAdmin]     = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);

  const [addForm, setAddForm]   = useState({ name: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API}/admins`, { headers });
      const data = await res.json();
      if (data.success) setAdmins(data.data);
    } catch { toast.error('Failed to fetch admins'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admins`, { method: 'POST', headers, body: JSON.stringify(addForm) });
      const data = await res.json();
      if (data.success) {
        toast.success('Admin created successfully!');
        setAdmins(prev => [data.data, ...prev]);
        setAddModal(false);
        setAddForm({ name: '', email: '', password: '' });
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to create admin'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (admin) => { setEditAdmin(admin); setEditForm({ name: admin.name, email: admin.email }); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admins/${editAdmin._id}`, { method: 'PUT', headers, body: JSON.stringify(editForm) });
      const data = await res.json();
      if (data.success) {
        toast.success('Admin updated!');
        setAdmins(prev => prev.map(a => a._id === editAdmin._id ? { ...a, ...editForm } : a));
        setEditAdmin(null);
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to update admin'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/admins/${deleteAdmin._id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) {
        toast.success('Admin deleted');
        setAdmins(prev => prev.filter(a => a._id !== deleteAdmin._id));
        setDeleteAdmin(null);
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to delete admin'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API}/admins/${id}/toggle-status`, { method: 'PATCH', headers });
      const data = await res.json();
      if (data.success) {
        setAdmins(prev => prev.map(a => a._id === id ? { ...a, isActive: data.data.isActive } : a));
        toast.success(data.message);
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to update status'); }
  };

  const handleLoginAs = async (id) => {
    try {
      const res = await fetch(`${API}/admins/${id}/login-as`, { method: 'POST', headers });
      const data = await res.json();
      if (data.success) {
        const userEncoded = encodeURIComponent(JSON.stringify(data.user));
        window.open(`/admin/autologin?session=${data.token}&user=${userEncoded}`, '_blank');
        toast.success(data.message);
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to login as admin'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Admins</h1>
            <p className="text-sm text-gray-400 mt-0.5">{admins.length} admin{admins.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}>
            <UserPlus size={16} /> Add Admin
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: COLORS.primary }} />
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <UserPlus size={40} className="mb-3 opacity-30" />
              <p className="font-medium">No admins yet. Add your first admin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Name', 'Email', 'Status', 'Last Login', 'Created', 'Login As', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, idx) => (
                    <tr key={admin._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-5 py-4 font-semibold text-gray-800">{admin.name}</td>
                      <td className="px-5 py-4 text-gray-500">{admin.email}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleToggle(admin._id)} title={admin.isActive ? 'Deactivate' : 'Activate'}>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${admin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {admin.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-gray-400">{formatDate(admin.lastLogin)}</td>
                      <td className="px-5 py-4 text-gray-400">{formatDate(admin.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleLoginAs(admin._id)} disabled={!admin.isActive}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ backgroundColor: COLORS.primary }}>
                          <LogIn size={13} /> Login
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <ActionMenu admin={admin} onView={setViewAdmin} onEdit={openEdit} onDelete={setDeleteAdmin} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {addModal && (
        <Modal onClose={() => setAddModal(false)}>
          <ModalHeader title="Add New Admin" onClose={() => setAddModal(false)} />
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" required placeholder="Enter full name" value={addForm.name}
                onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" required placeholder="admin@example.com" value={addForm.email}
                onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={6} placeholder="Min 6 characters" value={addForm.password}
                  onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50" />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {viewAdmin && (
        <Modal onClose={() => setViewAdmin(null)}>
          <ModalHeader title="Admin Details" onClose={() => setViewAdmin(null)} />
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: COLORS.primary }}>
              {viewAdmin.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-gray-800">{viewAdmin.name}</p>
              <p className="text-sm text-gray-400">{viewAdmin.email}</p>
            </div>
          </div>
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            {[
              { label: 'Role',       value: 'Admin' },
              { label: 'Status',     value: viewAdmin.isActive ? 'Active' : 'Inactive', color: viewAdmin.isActive ? 'text-green-600' : 'text-red-500' },
              { label: 'Last Login', value: formatDate(viewAdmin.lastLogin) },
              { label: 'Created',    value: formatDate(viewAdmin.createdAt) },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">{label}</span>
                <span className={`font-semibold text-gray-700 ${color || ''}`}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setViewAdmin(null)} className="w-full mt-5 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Close</button>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editAdmin && (
        <Modal onClose={() => setEditAdmin(null)}>
          <ModalHeader title="Edit Admin" onClose={() => setEditAdmin(null)} />
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" required value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" required value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditAdmin(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteAdmin && (
        <Modal onClose={() => setDeleteAdmin(null)}>
          <ModalHeader title="Delete Admin" onClose={() => setDeleteAdmin(null)} />
          <div className="flex flex-col items-center gap-3 py-2 mb-6">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <p className="text-center text-gray-600 text-sm">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteAdmin.name}"</span>?<br />
              <span className="text-gray-400">This action cannot be undone.</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteAdmin(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Yes, Delete</button>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default Admins;
