import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Users, Eye, Pencil, Trash2, ToggleLeft, ToggleRight, X, Search, 
  Settings, Loader2, Calendar, Mail, Phone, MapPin, User, Landmark, ShieldAlert,
  ArrowRight, ShieldCheck, Heart, Wrench, RefreshCw, Camera, Plus, FileText
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import { COLORS } from '../../shared/colors';
import API_BASE_URL from '../../shared/apiConfig';

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

const ActionMenu = ({ beneficiary, onView, onEdit, onDelete, onToggle }) => {
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
          <button onClick={() => { onView(beneficiary); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button onClick={() => { onEdit(beneficiary); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Pencil size={14} className="text-green-600" /> Edit Info
          </button>
          <button onClick={() => { onToggle(beneficiary._id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            {beneficiary.status === 'Active' ? (
              <><ToggleLeft size={14} className="text-amber-500" /> Deactivate</>
            ) : (
              <><ToggleRight size={14} className="text-green-500" /> Activate</>
            )}
          </button>
          <div className="border-t border-gray-100" />
          <button onClick={() => { onDelete(beneficiary); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const Beneficiaries = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    activeBeneficiaries: 0,
    inactiveBeneficiaries: 0,
    categoriesBreakdown: []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [editUploading, setEditUploading] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);

  // Filter & pagination states
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewBeneficiary, setViewBeneficiary] = useState(null);
  const [editBeneficiary, setEditBeneficiary] = useState(null);
  const [deleteBeneficiary, setDeleteBeneficiary] = useState(null);
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
    category: 'Healthcare',
    needsIdentified: '',
    supportReceived: '',
    branch: '',
    status: 'Active',
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
    category: 'Healthcare',
    needsIdentified: '',
    supportReceived: '',
    branch: '',
    status: 'Active',
    profilePhoto: null
  });

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  // Fetch branches for dropdown filter & edit form
  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(`${API}/superadmin/branches?isActive=true`, { headers });
      const data = await res.json();
      if (data.success) setBranches(data.data);
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [headers]);

  // Fetch stats values
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/superadmin/beneficiaries/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [headers]);

  // Main beneficiaries listing query
  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        status: selectedStatus,
        category: selectedCategory,
        branch: selectedBranch
      });
      const res = await fetch(`${API}/superadmin/beneficiaries?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        setBeneficiaries(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.message || 'Failed to fetch beneficiaries');
      }
    } catch (err) {
      console.error('Fetch beneficiaries error:', err);
      toast.error('Network error loading beneficiaries');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedStatus, selectedCategory, selectedBranch, headers, toast]);

  useEffect(() => {
    if (token) {
      fetchBranches();
      fetchStats();
    }
  }, [token, fetchBranches, fetchStats]);

  useEffect(() => {
    if (token) {
      fetchBeneficiaries();
    }
  }, [token, fetchBeneficiaries]);

  // Handle filter changes (resets page to 1)
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  // Upload Photo Flow (using XMLHttpRequest for progress)
  const uploadPhoto = (file, isEdit = false) => {
    return new Promise((resolve, reject) => {
      const fileName = file.name;
      const contentType = file.type;

      // GET Presigned URL from Backend
      fetch(`${API}/superadmin/beneficiaries/upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            throw new Error(data.message || 'Failed to obtain upload URL');
          }

          const { uploadUrl, key } = data;

          // Validate uploadUrl host
          const parsedUrl = new URL(uploadUrl);
          if (!parsedUrl.hostname.endsWith('r2.cloudflarestorage.com')) {
            throw new Error('Security Error: Invalid upload destination domain');
          }

          // PUT File directly to Cloudflare R2
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
            if (xhr.status === 200) {
              resolve(key);
            } else {
              reject(new Error('S3/R2 direct upload failed'));
            }
          };

          xhr.onerror = () => reject(new Error('Network upload failed'));
          xhr.send(file);
        })
        .catch(err => reject(err));
    });
  };

  const handleFileChange = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit & type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed');
      return;
    }

    const localUrl = URL.createObjectURL(file);

    if (isEdit) {
      setEditPhotoPreview(localUrl);
      setEditUploading(true);
      setEditProgress(0);
      try {
        const key = await uploadPhoto(file, true);
        setEditForm(prev => ({ ...prev, profilePhoto: key }));
        toast.success('Edit photo uploaded successfully');
      } catch (err) {
        console.error(err);
        toast.error('Edit photo upload failed. Please try again.');
        setEditPhotoPreview(null);
      } finally {
        setEditUploading(false);
      }
    } else {
      setPhotoPreview(localUrl);
      setUploading(true);
      setUploadProgress(0);
      try {
        const key = await uploadPhoto(file, false);
        setAddForm(prev => ({ ...prev, profilePhoto: key }));
        toast.success('Profile photo uploaded successfully');
      } catch (err) {
        console.error(err);
        toast.error('Profile photo upload failed. Please try again.');
        setPhotoPreview(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`${API}/superadmin/beneficiaries/${id}/toggle-status`, { 
        method: 'PATCH', 
        headers 
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setBeneficiaries(prev => prev.map(b => b._id === id ? { ...b, status: data.data.status } : b));
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to change status');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...addForm,
        needsIdentified: addForm.needsIdentified.split(',').map(s => s.trim()).filter(Boolean),
        supportReceived: addForm.supportReceived.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${API}/superadmin/beneficiaries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Beneficiary registered successfully');
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
          category: 'Healthcare',
          needsIdentified: '',
          supportReceived: '',
          branch: '',
          status: 'Active',
          profilePhoto: null
        });
        setPhotoPreview(null);
        fetchBeneficiaries();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to register beneficiary');
      }
    } catch {
      toast.error('Server error registering beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (beneficiary) => {
    setEditBeneficiary(beneficiary);
    setEditPhotoPreview(beneficiary.photoUrl || null);
    setEditForm({
      fullName: beneficiary.fullName || '',
      mobileNumber: beneficiary.mobileNumber || '',
      email: beneficiary.email || '',
      gender: beneficiary.gender || '',
      dateOfBirth: beneficiary.dateOfBirth ? new Date(beneficiary.dateOfBirth).toISOString().split('T')[0] : '',
      address: beneficiary.address || '',
      city: beneficiary.city || '',
      district: beneficiary.district || '',
      state: beneficiary.state || '',
      pinCode: beneficiary.pinCode || '',
      category: beneficiary.category || 'Healthcare',
      needsIdentified: beneficiary.needsIdentified ? beneficiary.needsIdentified.join(', ') : '',
      supportReceived: beneficiary.supportReceived ? beneficiary.supportReceived.join(', ') : '',
      branch: beneficiary.branch?._id || beneficiary.branch || '',
      status: beneficiary.status || 'Active',
      profilePhoto: beneficiary.profilePhoto || null
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...editForm,
        needsIdentified: editForm.needsIdentified.split(',').map(s => s.trim()).filter(Boolean),
        supportReceived: editForm.supportReceived.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(`${API}/superadmin/beneficiaries/${editBeneficiary._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Beneficiary updated successfully');
        setEditBeneficiary(null);
        fetchBeneficiaries();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update beneficiary');
      }
    } catch {
      toast.error('Server error updating beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/superadmin/beneficiaries/${deleteBeneficiary._id}`, { 
        method: 'DELETE', 
        headers 
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Beneficiary deleted successfully');
        setBeneficiaries(prev => prev.filter(b => b._id !== deleteBeneficiary._id));
        setDeleteBeneficiary(null);
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete beneficiary');
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
              Beneficiaries Registry
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and audit registered aid recipients across sectors</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { fetchBeneficiaries(); fetchStats(); }}
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
              Add Beneficiary
            </button>
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Beneficiaries', value: stats.totalBeneficiaries, color: COLORS.primary, sub: 'Registered database' },
            { label: 'Active Recipients', value: stats.activeBeneficiaries, color: COLORS.success, sub: 'Receiving support' },
            { label: 'Primary Sector', value: stats.categoriesBreakdown[0]?.name || 'N/A', color: COLORS.info, sub: `${stats.categoriesBreakdown[0]?.count || 0} active profiles` },
            { label: 'Inactive Profiles', value: stats.inactiveBeneficiaries, color: COLORS.danger, sub: 'On hold / Suspended' },
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

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={e => handleFilterChange(setSelectedCategory, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Sectors</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Women Empowerment">Women Empowerment</option>
                <option value="Skill Development">Skill Development</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Social Welfare">Social Welfare</option>
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={e => handleFilterChange(setSelectedStatus, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
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
              <p className="text-sm font-semibold text-gray-400">Loading beneficiaries data...</p>
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <Users size={44} className="opacity-30" />
              <p className="font-semibold text-sm">No beneficiaries registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'ID', 'Recipient Profile', 'Contact', 'Branch', 'Category / Needs', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((beneficiary, idx) => (
                    <tr key={beneficiary._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      
                      {/* Sr. No */}
                      <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>

                      {/* ID */}
                      <td className="px-3.5 py-3 font-bold text-gray-700">{beneficiary.beneficiaryId || 'N/A'}</td>

                      {/* Profile & Name */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border">
                            {beneficiary.photoUrl ? (
                              <img src={beneficiary.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User size={18} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{beneficiary.fullName}</p>
                            <p className="text-[10px] text-gray-500 font-semibold capitalize">{beneficiary.gender || 'No spec'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3.5 py-3">
                        <div className="space-y-0.5">
                          <p className="text-gray-700 font-semibold text-xs flex items-center gap-1">
                            <Phone size={11} className="text-gray-500" /> {beneficiary.mobileNumber}
                          </p>
                          <p className="text-gray-500 text-[11px] flex items-center gap-1 max-w-[150px] truncate" title={beneficiary.email || ''}>
                            <Mail size={11} className="text-gray-400" /> {beneficiary.email || 'No email'}
                          </p>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-3.5 py-3">
                        {beneficiary.branch ? (
                          <div>
                            <p className="font-bold text-gray-700">{beneficiary.branch.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold">Code: {beneficiary.branch.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Category & Needs */}
                      <td className="px-3.5 py-3">
                        <div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700 border border-green-100">
                            {beneficiary.category}
                          </span>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1 max-w-[150px] truncate" title={beneficiary.needsIdentified?.join(', ') || ''}>
                            Needs: {beneficiary.needsIdentified && beneficiary.needsIdentified.length > 0 ? beneficiary.needsIdentified.join(', ') : 'None logged'}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3">
                        <button onClick={() => handleToggleStatus(beneficiary._id)} title="Click to Toggle Status">
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition-all hover:scale-[1.03] ${
                            beneficiary.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {beneficiary.status === 'Active' ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                            {beneficiary.status}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3">
                        <ActionMenu 
                          beneficiary={beneficiary} 
                          onView={setViewBeneficiary} 
                          onEdit={openEdit} 
                          onDelete={setDeleteBeneficiary} 
                          onToggle={handleToggleStatus}
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

      {/* ADD BENEFICIARY MODAL */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalHeader title="Register New Beneficiary" onClose={() => setShowAddModal(false)} />
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
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Aid Sector Category *</label>
                <select required value={addForm.category}
                  onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Women Empowerment">Women Empowerment</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Social Welfare">Social Welfare</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Needs Identified (Comma-separated)</label>
                <input type="text" placeholder="e.g. Free Tuition, Eye Care, Ration Kits" value={addForm.needsIdentified}
                  onChange={e => setAddForm(p => ({ ...p, needsIdentified: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Support Received (Comma-separated)</label>
                <input type="text" placeholder="e.g. Textbook Set, Medical Checkup, Ration Box" value={addForm.supportReceived}
                  onChange={e => setAddForm(p => ({ ...p, supportReceived: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
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
                {submitting ? 'Registering...' : 'Register Beneficiary'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* VIEW BENEFICIARY DETAILS MODAL */}
      {viewBeneficiary && (
        <Modal onClose={() => setViewBeneficiary(null)}>
          <ModalHeader title="Beneficiary Profile Summary" onClose={() => setViewBeneficiary(null)} />
          
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 no-scrollbar">
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-green-500 shadow flex-shrink-0">
                {viewBeneficiary.photoUrl ? (
                  <img src={viewBeneficiary.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-xl font-extrabold text-gray-800">{viewBeneficiary.fullName}</h3>
                <p className="text-sm text-gray-500 font-semibold flex items-center justify-center md:justify-start gap-1">
                  <Landmark size={14} /> ID: <span className="text-green-700 font-bold">{viewBeneficiary.beneficiaryId || 'N/A'}</span>
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                    viewBeneficiary.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {viewBeneficiary.status} Recipient
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    {viewBeneficiary.category} Sector
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
                      <p className="text-gray-700 font-semibold">{viewBeneficiary.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Date of Birth</p>
                      <p className="text-gray-700 font-semibold">{formatDate(viewBeneficiary.dateOfBirth)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Needs Matrix Log</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {viewBeneficiary.needsIdentified && viewBeneficiary.needsIdentified.length > 0 ? (
                          viewBeneficiary.needsIdentified.map((need, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 text-xs font-bold rounded bg-amber-50 text-amber-700 border border-amber-100">
                              {need}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-700 font-semibold">No special needs flagged</span>
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
                      <p className="text-gray-700 font-semibold">{viewBeneficiary.mobileNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                      <p className="text-gray-700 font-semibold break-all">{viewBeneficiary.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Full Address</p>
                      <p className="text-gray-700 font-semibold text-xs leading-tight">
                        {viewBeneficiary.address ? `${viewiciaryAddress(viewBeneficiary)}` : 'No address saved'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch & Support Log */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">NGO Support History & Context</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Landmark size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">NGO Branch</p>
                        <p className="text-gray-700 font-semibold">{viewBeneficiary.branch?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Registered By (Admin)</p>
                        <p className="text-gray-700 font-semibold">{viewBeneficiary.createdBy?.name || 'System Setup'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Kits/Support Distributed</p>
                    <div className="flex flex-wrap gap-1">
                      {viewBeneficiary.supportReceived && viewBeneficiary.supportReceived.length > 0 ? (
                        viewBeneficiary.supportReceived.map((sup, supIdx) => (
                          <span key={supIdx} className="px-2 py-0.5 text-xs font-bold rounded bg-green-50 text-green-700 border border-green-100">
                            {sup}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">No support distributions logged</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={() => setViewBeneficiary(null)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close Profile
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT BENEFICIARY DETAILS MODAL */}
      {editBeneficiary && (
        <Modal onClose={() => setEditBeneficiary(null)}>
          <ModalHeader title="Edit Beneficiary Profile" onClose={() => setEditBeneficiary(null)} />
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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Aid Sector Category *</label>
                <select required value={editForm.category}
                  onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 cursor-pointer">
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Women Empowerment">Women Empowerment</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Social Welfare">Social Welfare</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Needs Identified (Comma-separated)</label>
                <input type="text" placeholder="e.g. Free Tuition, Eye Care, Ration Kits" value={editForm.needsIdentified}
                  onChange={e => setEditForm(p => ({ ...p, needsIdentified: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Support Received (Comma-separated)</label>
                <input type="text" placeholder="e.g. Textbook Set, Medical Checkup, Ration Box" value={editForm.supportReceived}
                  onChange={e => setEditForm(p => ({ ...p, supportReceived: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50" />
              </div>
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
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditBeneficiary(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
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
      {deleteBeneficiary && (
        <Modal onClose={() => setDeleteBeneficiary(null)}>
          <ModalHeader title="Remove Beneficiary Profile" onClose={() => setDeleteBeneficiary(null)} />
          <div className="flex flex-col items-center gap-3 py-2 mb-6">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert size={24} className="text-red-500" />
            </div>
            <p className="text-center text-gray-600 text-sm">
              Are you sure you want to delete beneficiary <span className="font-bold text-gray-800">"{deleteBeneficiary.fullName}"</span> ({deleteBeneficiary.beneficiaryId || 'N/A'})?<br />
              <span className="text-red-500 font-bold text-xs">WARNING: This will permanently delete the recipient profile and aid logs.</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteBeneficiary(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
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

// Helper for address parsing
const viewiciaryAddress = (b) => {
  const parts = [];
  if (b.address) parts.push(b.address);
  if (b.city) parts.push(b.city);
  if (b.district) parts.push(b.district);
  if (b.state) parts.push(b.state);
  if (b.pinCode) parts.push(b.pinCode);
  return parts.join(', ');
};

export default Beneficiaries;
