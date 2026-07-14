import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Users, Eye, Pencil, Trash2, ToggleLeft, ToggleRight, X, Search, 
  Settings, Loader2, Calendar, Mail, Phone, MapPin, User, Landmark, ShieldAlert,
  ArrowRight, ShieldCheck, Heart, Wrench, RefreshCw, Camera, Plus, CheckCircle, XCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import { COLORS } from '../../../shared/colors';
import API_BASE_URL from '../../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className="w-full max-w-2xl my-8 rounded-3xl p-6 md:p-8 bg-white border border-gray-100 shadow-2xl relative">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
      <X size={18} className="text-gray-500" />
    </button>
  </div>
);

const ActionMenu = ({ volunteer, onView, onEdit, onDelete, onApprove, onReject }) => {
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
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button onClick={() => { onView(volunteer); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button onClick={() => { onEdit(volunteer); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Pencil size={14} className="text-green-600" /> Edit Info
          </button>
          {volunteer.status === 'Pending' && (
            <>
              <button onClick={() => { onApprove(volunteer._id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <CheckCircle size={14} className="text-green-500" /> Verify/Approve
              </button>
              <button onClick={() => { onReject(volunteer._id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <XCircle size={14} className="text-red-500" /> Reject
              </button>
            </>
          )}
          <div className="border-t border-gray-100" />
          <button onClick={() => { onDelete(volunteer); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const VolunteersList = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [volunteers, setVolunteers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    pendingVolunteers: 0,
    inactiveVolunteers: 0,
    skillsBreakdown: []
  });

  // Uploader Add state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Uploader Edit state
  const [editUploading, setEditUploading] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);

  // Filter & pagination states
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewVolunteer, setViewVolunteer] = useState(null);
  const [editVolunteer, setEditVolunteer] = useState(null);
  const [deleteVolunteer, setDeleteVolunteer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    skills: '',
    availability: 'Part-time',
    branch: '',
    status: 'Pending',
    profilePhoto: null
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    skills: '',
    availability: 'Part-time',
    branch: '',
    status: 'Pending',
    profilePhoto: null
  });

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(`${API}/branches?isActive=true`, { headers });
      const data = await res.json();
      if (data.success) setBranches(data.data);
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [headers]);

  // Fetch stats values
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/volunteers/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [headers]);

  // Fetch volunteers list
  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        status: selectedStatus,
        availability: selectedAvailability,
        branch: selectedBranch
      });
      const res = await fetch(`${API}/admin/volunteers?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.message || 'Failed to fetch volunteers');
      }
    } catch (err) {
      console.error('Fetch volunteers error:', err);
      toast.error('Network error loading volunteers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedStatus, selectedAvailability, selectedBranch, headers, toast]);

  useEffect(() => {
    if (token) {
      fetchBranches();
      fetchStats();
    }
  }, [token, fetchBranches, fetchStats]);

  useEffect(() => {
    if (token) {
      fetchVolunteers();
    }
  }, [token, fetchVolunteers]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const uploadPhoto = (file, isEdit = false) => {
    return new Promise((resolve, reject) => {
      const fileName = file.name;
      const contentType = file.type;

      fetch(`${API}/admin/volunteers/upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) throw new Error(data.message || 'Failed to get upload URL');
          const { uploadUrl, key } = data;

          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', contentType);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              if (isEdit) {
                setEditProgress(percent);
              } else {
                setUploadProgress(percent);
              }
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) resolve(key);
            else reject(new Error('S3 direct upload failed'));
          };

          xhr.onerror = () => reject(new Error('Network upload error'));
          xhr.send(file);
        })
        .catch(err => reject(err));
    });
  };

  const handleFileChange = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (isEdit) {
      setEditPhotoPreview(previewUrl);
      setEditUploading(true);
      setEditProgress(0);
      try {
        const key = await uploadPhoto(file, true);
        setEditForm(prev => ({ ...prev, profilePhoto: key }));
        toast.success('Photo uploaded successfully');
      } catch (err) {
        console.error(err);
        toast.error('Photo upload failed');
        setEditPhotoPreview(null);
      } finally {
        setEditUploading(false);
      }
    } else {
      setPhotoPreview(previewUrl);
      setUploading(true);
      setUploadProgress(0);
      try {
        const key = await uploadPhoto(file, false);
        setAddForm(prev => ({ ...prev, profilePhoto: key }));
        toast.success('Photo uploaded successfully');
      } catch (err) {
        console.error(err);
        toast.error('Photo upload failed');
        setPhotoPreview(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleApproveRequest = async (id) => {
    if (!window.confirm('Verify and approve this volunteer registry?')) return;
    try {
      const res = await fetch(`${API}/admin/volunteers/${id}/approve-request`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status: 'Active' } : v));
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (id) => {
    if (!window.confirm('Reject this volunteer registry request?')) return;
    try {
      const res = await fetch(`${API}/admin/volunteers/${id}/reject-request`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status: 'Inactive' } : v));
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...addForm,
        skills: addForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${API}/admin/volunteers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Volunteer registered successfully!');
        setShowAddModal(false);
        setAddForm({
          fullName: '',
          mobileNumber: '',
          email: '',
          gender: '',
          dateOfBirth: '',
          address: '',
          city: '',
          district: '',
          state: '',
          pinCode: '',
          skills: '',
          availability: 'Part-time',
          branch: '',
          status: 'Pending',
          profilePhoto: null
        });
        setPhotoPreview(null);
        fetchVolunteers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to register volunteer');
      }
    } catch {
      toast.error('Server error registering volunteer');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (volunteer) => {
    setEditVolunteer(volunteer);
    setEditPhotoPreview(volunteer.photoUrl || null);
    setEditForm({
      fullName: volunteer.fullName || '',
      mobileNumber: volunteer.mobileNumber || '',
      email: volunteer.email || '',
      gender: volunteer.gender || '',
      dateOfBirth: volunteer.dateOfBirth ? new Date(volunteer.dateOfBirth).toISOString().split('T')[0] : '',
      address: volunteer.address || '',
      city: volunteer.city || '',
      district: volunteer.district || '',
      state: volunteer.state || '',
      pinCode: volunteer.pinCode || '',
      skills: volunteer.skills ? volunteer.skills.join(', ') : '',
      availability: volunteer.availability || 'Part-time',
      branch: volunteer.branch?._id || volunteer.branch || '',
      status: volunteer.status || 'Pending',
      profilePhoto: volunteer.profilePhoto || null
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...editForm,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${API}/admin/volunteers/${editVolunteer._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Volunteer profile updated successfully');
        setEditVolunteer(null);
        fetchVolunteers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update volunteer');
      }
    } catch {
      toast.error('Server error updating volunteer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/admin/volunteers/${deleteVolunteer._id}`, { 
        method: 'DELETE', 
        headers 
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Volunteer deleted successfully');
        setVolunteers(prev => prev.filter(v => v._id !== deleteVolunteer._id));
        setDeleteVolunteer(null);
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete volunteer');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Users className="text-[#1B5E20]" size={28} />
              Volunteers Directory
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage branch-level social volunteers and tasks assignment</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { fetchVolunteers(); fetchStats(); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={16} /> Add Volunteer
            </button>
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'My Registered', value: stats.totalVolunteers, color: COLORS.primary, sub: 'All profiles added' },
            { label: 'Active Volunteers', value: stats.activeVolunteers, color: COLORS.success, sub: 'Active helpers' },
            { label: 'Pending Verification', value: stats.pendingVolunteers, color: '#D29C00', sub: 'Applications' },
            { label: 'Inactive / Suspended', value: stats.inactiveVolunteers, color: COLORS.danger, sub: 'On hold' },
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 flex items-center gap-4 bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                <Users size={22} style={{ color: card.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-extrabold text-gray-800 leading-tight truncate ${typeof card.value === 'string' && card.value.length > 12 ? 'text-[15px]' : 'text-2xl'}`} title={card.value}>
                  {card.value}
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 truncate">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div 
          className="rounded-2xl p-5 bg-white space-y-4"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search by ID, Name, Mobile, Email..."
                value={search}
                onChange={e => handleFilterChange(setSearch, e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              
              {/* Branch */}
              <select
                value={selectedBranch}
                onChange={e => handleFilterChange(setSelectedBranch, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>

              {/* Availability */}
              <select
                value={selectedAvailability}
                onChange={e => handleFilterChange(setSelectedAvailability, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">Availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Weekends">Weekends</option>
                <option value="Occasional">Occasional</option>
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={e => handleFilterChange(setSelectedStatus, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>

            </div>
          </div>
        </div>

        {/* Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-400">Loading volunteers list...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <Users size={44} className="opacity-30" />
              <p className="font-semibold text-sm">No volunteers registered by you yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'ID', 'Volunteer Profile', 'Contact', 'Branch', 'Availability / Skills', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer, idx) => (
                    <tr key={volunteer._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      
                      {/* Sr. No */}
                      <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>

                      {/* ID */}
                      <td className="px-3.5 py-3 font-bold text-gray-700">{volunteer.volunteerId || 'N/A'}</td>

                      {/* Profile & Name */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                            {volunteer.photoUrl ? (
                              <img src={volunteer.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User size={18} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{volunteer.fullName}</p>
                            <p className="text-[10px] text-gray-500 font-semibold capitalize">{volunteer.gender || 'No spec'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5">
                          <p className="text-gray-700 font-semibold text-xs flex items-center gap-1">
                            <Phone size={11} className="text-gray-500" /> {volunteer.mobileNumber}
                          </p>
                          <p className="text-gray-500 text-[11px] flex items-center gap-1 max-w-[150px] truncate" title={volunteer.email || ''}>
                            <Mail size={11} className="text-gray-400" /> {volunteer.email || 'No email'}
                          </p>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-3.5 py-3">
                        {volunteer.branch ? (
                          <div>
                            <p className="font-bold text-gray-700">{volunteer.branch.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold">Code: {volunteer.branch.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Availability & Skills */}
                      <td className="px-3.5 py-3">
                        <div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700 border border-green-100">
                            {volunteer.availability}
                          </span>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1 max-w-[150px] truncate" title={volunteer.skills?.join(', ') || ''}>
                            Skills: {volunteer.skills && volunteer.skills.length > 0 ? volunteer.skills.join(', ') : 'None listed'}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          volunteer.status === 'Active' ? 'bg-green-100 text-green-700' :
                          volunteer.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-650'
                        }`}>
                          {volunteer.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3">
                        <ActionMenu 
                          volunteer={volunteer} 
                          onView={setViewVolunteer} 
                          onEdit={openEdit} 
                          onDelete={setDeleteVolunteer} 
                          onApprove={handleApproveRequest}
                          onReject={handleRejectRequest}
                        />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* REGISTER NEW VOLUNTEER MODAL */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalHeader title="Register New Volunteer" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input type="text" required value={addForm.fullName}
                  onChange={e => setAddForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
              
              {/* Profile Photo Upload */}
              <div className="row-span-2 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Profile Photo</label>
                <div className="relative w-16 h-16 rounded-full border bg-white flex items-center justify-center overflow-hidden flex-shrink-0 mb-2">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{uploadProgress}%</span>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer px-3 py-1 text-[10px] font-bold rounded-lg border border-green-600 text-green-700 bg-white hover:bg-green-50 transition-colors">
                  {uploading ? 'Uploading...' : 'Choose Image'}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, false)} className="hidden" disabled={uploading} />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                <input type="text" required value={addForm.mobileNumber}
                  onChange={e => setAddForm(p => ({ ...p, mobileNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" value={addForm.email}
                  onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input type="date" value={addForm.dateOfBirth}
                  onChange={e => setAddForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
                <select value={addForm.gender}
                  onChange={e => setAddForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">NGO Branch Assignment *</label>
                <select required value={addForm.branch}
                  onChange={e => setAddForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Availability *</label>
                <select required value={addForm.availability}
                  onChange={e => setAddForm(p => ({ ...p, availability: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Skills represented (Comma-separated)</label>
              <input type="text" placeholder="e.g. Teaching, Operations, Event Coordinator" value={addForm.skills}
                onChange={e => setAddForm(p => ({ ...p, skills: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
              <input type="text" value={addForm.address}
                onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">District / City</label>
                <input type="text" value={addForm.district}
                  onChange={e => setAddForm(p => ({ ...p, district: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                <input type="text" value={addForm.state}
                  onChange={e => setAddForm(p => ({ ...p, state: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pin Code</label>
                <input type="text" value={addForm.pinCode}
                  onChange={e => setAddForm(p => ({ ...p, pinCode: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Registering...' : 'Register Volunteer'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* VIEW VOLUNTEER DETAILS MODAL */}
      {viewVolunteer && (
        <Modal onClose={() => setViewVolunteer(null)}>
          <ModalHeader title="Volunteer Roster Profile Details" onClose={() => setViewVolunteer(null)} />
          
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 no-scrollbar">
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-green-500 shadow flex-shrink-0">
                {viewVolunteer.photoUrl ? (
                  <img src={viewVolunteer.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-xl font-extrabold text-gray-800">{viewVolunteer.fullName}</h3>
                <p className="text-sm text-gray-500 font-semibold flex items-center justify-center md:justify-start gap-1">
                  <Landmark size={14} /> ID: <span className="text-green-700 font-bold">{viewVolunteer.volunteerId || 'N/A'}</span>
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    viewVolunteer.status === 'Active' ? 'bg-green-100 text-green-700' :
                    viewVolunteer.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-750'
                  }`}>
                    {viewVolunteer.status}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    {viewVolunteer.availability} Availability
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              
              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Personal Details</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Gender</p>
                      <p className="text-gray-700 font-semibold">{viewVolunteer.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Date of Birth</p>
                      <p className="text-gray-700 font-semibold">{formatDate(viewVolunteer.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wrench size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Represented Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewVolunteer.skills && viewVolunteer.skills.length > 0 ? (
                          viewVolunteer.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-700 font-semibold">No special skills listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Contact & Address</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                      <p className="text-gray-700 font-semibold">{viewVolunteer.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                      <p className="text-gray-700 font-semibold break-all">{viewVolunteer.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Full Address</p>
                      <p className="text-gray-700 font-semibold text-xs leading-tight">
                        {viewVolunteer.address ? `${viewVolunteerAddress(viewVolunteer)}` : 'No address saved'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch & Created Date */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">NGO Branch & Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Landmark size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Branch</p>
                        <p className="text-gray-700 font-semibold">{viewVolunteer.branch?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Registration Date</p>
                        <p className="text-gray-700 font-semibold">{formatDate(viewVolunteer.joinedDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={() => setViewVolunteer(null)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close Profile
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT VOLUNTEER DETAILS MODAL */}
      {editVolunteer && (
        <Modal onClose={() => setEditVolunteer(null)}>
          <ModalHeader title="Edit Volunteer Profile" onClose={() => setEditVolunteer(null)} />
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input type="text" required value={editForm.fullName}
                  onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
              
              {/* Profile Photo Edit */}
              <div className="row-span-2 flex flex-col items-center justify-center p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Profile Photo</label>
                <div className="relative w-16 h-16 rounded-full border bg-white flex items-center justify-center overflow-hidden flex-shrink-0 mb-2">
                  {editPhotoPreview ? (
                    <img src={editPhotoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={24} className="text-gray-400" />
                  )}
                  {editUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">{editProgress}%</span>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer px-3 py-1 text-[10px] font-bold rounded-lg border border-green-600 text-green-700 bg-white hover:bg-green-50 transition-colors">
                  {editUploading ? 'Uploading...' : 'Choose Image'}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, true)} className="hidden" disabled={editUploading} />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                <input type="text" required value={editForm.mobileNumber}
                  onChange={e => setEditForm(p => ({ ...p, mobileNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input type="email" value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                <input type="date" value={editForm.dateOfBirth}
                  onChange={e => setEditForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
                <select value={editForm.gender}
                  onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">NGO Branch Assignment *</label>
                <select required value={editForm.branch}
                  onChange={e => setEditForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Availability *</label>
                <select required value={editForm.availability}
                  onChange={e => setEditForm(p => ({ ...p, availability: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Skills represented (Comma-separated)</label>
              <input type="text" placeholder="e.g. Teaching, Operations, Event Coordinator" value={editForm.skills}
                onChange={e => setEditForm(p => ({ ...p, skills: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Street Address</label>
              <input type="text" value={editForm.address}
                onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">District / City</label>
                <input type="text" value={editForm.district}
                  onChange={e => setEditForm(p => ({ ...p, district: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                <input type="text" value={editForm.state}
                  onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pin Code</label>
                <input type="text" value={editForm.pinCode}
                  onChange={e => setEditForm(p => ({ ...p, pinCode: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status *</label>
                <select required value={editForm.status}
                  onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditVolunteer(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteVolunteer && (
        <Modal onClose={() => setDeleteVolunteer(null)}>
          <ModalHeader title="Remove Volunteer Profile" onClose={() => setDeleteVolunteer(null)} />
          <div className="flex flex-col items-center gap-3 py-2 mb-6">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert size={24} className="text-red-500" />
            </div>
            <p className="text-center text-gray-600 text-sm">
              Are you sure you want to delete volunteer <span className="font-bold text-gray-800">"{deleteVolunteer.fullName}"</span> ({deleteVolunteer.volunteerId || 'N/A'})?<br />
              <span className="text-red-500 font-bold text-xs">WARNING: This will permanently delete the volunteer roster profile.</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteVolunteer(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
              Yes, Delete Permanent
            </button>
          </div>
        </Modal>
      )}

    </Layout>
  );
};

const viewVolunteerAddress = (v) => {
  const parts = [];
  if (v.address) parts.push(v.address);
  if (v.city) parts.push(v.city);
  if (v.district) parts.push(v.district);
  if (v.state) parts.push(v.state);
  if (v.pinCode) parts.push(v.pinCode);
  return parts.join(', ');
};

export default VolunteersList;
