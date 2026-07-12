import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Camera, User, Phone, Mail, Calendar,
  MapPin, Briefcase, CreditCard, Lock, CheckCircle, AlertCircle, X,
  ChevronLeft, ChevronRight, Loader2, Users, FileText, ShieldCheck,
  Settings, Eye
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/admin/members`;

const INITIAL_FORM = {
  fullName: '',
  profilePhoto: null,
  mobileNumber: '',
  email: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  state: '',
  district: '',
  pinCode: '',
  occupation: '',
  membershipType: 'General',
  membershipFee: '0',
  joiningDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  referredBy: '',
  status: 'Pending'
};

const AddMember = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // Membership Types state
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Table & Fetching state
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Dropdown menus
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // View Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);

  // Add Member Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editFormData, setEditFormData] = useState(INITIAL_FORM);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editUploading, setEditUploading] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Fetch Membership Types from Public API
  const fetchMembershipTypes = useCallback(async () => {
    if (!token) return;
    setLoadingTypes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/membership-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMembershipTypes(resData.data);
      }
    } catch (err) {
      console.error('Error fetching membership types:', err);
    } finally {
      setLoadingTypes(false);
    }
  }, [token]);

  // Fetch Members List
  const fetchMembers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE}?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${statusFilter}&membershipType=${typeFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMembers(resData.data);
        setTotalCount(resData.pagination.total);
        setTotalPages(resData.pagination.totalPages);
      } else {
        toast.error(resData.message || 'Failed to fetch members');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load members from server');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, typeFilter, toast]);

  useEffect(() => {
    fetchMembershipTypes();
    fetchMembers();
  }, [fetchMembershipTypes, fetchMembers]);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  // Close dropdown on clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Upload Photo Flow (XHR for progress mapping)
  const uploadPhoto = (file, isEdit = false) => {
    return new Promise((resolve, reject) => {
      const fileName = file.name;
      const contentType = file.type;

      // GET Presigned URL from Backend
      fetch(`${API_BASE}/upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            throw new Error(data.message || 'Failed to obtain upload URL');
          }

          const { uploadUrl, key } = data;

          // Validate uploadUrl host to prevent open redirect / SSRF vulnerability
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
        setEditFormData(prev => ({ ...prev, profilePhoto: key }));
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
        setFormData(prev => ({ ...prev, profilePhoto: key }));
        toast.success('Form photo uploaded successfully');
      } catch (err) {
        console.error(err);
        toast.error('Form photo upload failed. Please try again.');
        setPhotoPreview(null);
      } finally {
        setUploading(false);
      }
    }
  };

  // Inline Validation
  const validateForm = (data, isEdit = false) => {
    const errors = {};
    if (!data.fullName || !data.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    if (!data.mobileNumber || !data.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(data.mobileNumber.trim())) {
      errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (data.email && !isEdit && !data.password) {
      errors.password = 'Password is required when email is set for portal login access';
    } else if (data.password && data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (data.pinCode && !/^\d{6}$/.test(data.pinCode.trim())) {
      errors.pinCode = 'PIN Code must be exactly 6 digits';
    }

    if (data.membershipFee !== undefined && data.membershipFee !== null) {
      if (isNaN(Number(data.membershipFee)) || Number(data.membershipFee) < 0) {
        errors.membershipFee = 'Fee must be a valid positive number';
      }
    }

    return errors;
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    
    // Auto-populate membershipFee when membershipType changes
    if (name === 'membershipType') {
      const selectedType = membershipTypes.find(t => t.name === value);
      if (selectedType) {
        if (isEdit) {
          setEditFormData(prev => ({
            ...prev,
            [name]: value,
            membershipFee: selectedType.annualFee.toString()
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            membershipFee: selectedType.annualFee.toString()
          }));
        }
        return;
      }
    }
    
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, [name]: value }));
      if (editFormErrors[name]) {
        setEditFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Submit New Member
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData, false);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        membershipFee: Number(formData.membershipFee || 0),
        dateOfBirth: formData.dateOfBirth || null,
        expiryDate: formData.expiryDate || null,
      };

      // Remove empty password if email is empty
      if (!payload.email || !payload.password) {
        delete payload.password;
      }

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'Member created successfully');
        setFormData(INITIAL_FORM);
        setPhotoPreview(null);
        setFormErrors({});
        setIsAddOpen(false);
        fetchMembers();
      } else {
        toast.error(resData.message || 'Failed to add member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  // Open View Modal
  const handleViewClick = (member) => {
    setViewingMember(member);
    setIsViewOpen(true);
  };

  // Open Edit Modal
  const handleEditClick = (member) => {
    setEditingMemberId(member._id);
    setEditFormData({
      fullName: member.fullName || '',
      profilePhoto: member.profilePhoto || null,
      mobileNumber: member.mobileNumber || '',
      email: member.email || '',
      password: '', // Blank by default, only sent if changed
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      gender: member.gender || '',
      address: member.address || '',
      state: member.state || '',
      district: member.district || '',
      pinCode: member.pinCode || '',
      occupation: member.occupation || '',
      membershipType: member.membershipType || 'General',
      membershipFee: member.membershipFee !== undefined ? String(member.membershipFee) : '0',
      joiningDate: member.joiningDate ? member.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: member.expiryDate ? member.expiryDate.split('T')[0] : '',
      referredBy: member.referredBy || '',
      status: member.status || 'Pending'
    });
    setEditPhotoPreview(member.photoUrl || null);
    setEditFormErrors({});
    setIsEditOpen(true);
  };

  // Submit Edit Modal
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(editFormData, true);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      toast.error('Please fix all errors before saving updates');
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        ...editFormData,
        membershipFee: Number(editFormData.membershipFee || 0),
        dateOfBirth: editFormData.dateOfBirth || null,
        expiryDate: editFormData.expiryDate || null,
      };

      // Don't send blank password to avoid overwriting existing password in db
      if (!payload.password) {
        delete payload.password;
      }

      const res = await fetch(`${API_BASE}/${editingMemberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'Member updated successfully');
        setIsEditOpen(false);
        fetchMembers();
      } else {
        toast.error(resData.message || 'Failed to update member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error updating member details');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Action
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this member? This action is irreversible.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'Member deleted successfully');
        fetchMembers();
      } else {
        toast.error(resData.message || 'Failed to delete member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error while deleting member');
    }
  };

  // Initials generator for fallback avatar
  const getInitials = (name) => {
    if (!name) return 'M';
    const split = name.trim().split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return split[0][0].toUpperCase();
  };

  const handleDropdownToggle = (e, memberId) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === memberId ? null : memberId));
  };

  return (
    <Layout>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Page Title Row with Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Users className="text-[#1B5E20]" size={28} />
              All Members
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">View all registered members in the system</p>
          </div>

          <button
            onClick={() => {
              setFormData(INITIAL_FORM);
              setPhotoPreview(null);
              setFormErrors({});
              setIsAddOpen(true);
            }}
            className="px-5 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 animate-fade-in"
            style={{
              backgroundColor: '#1B5E20',
              boxShadow: '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF'
            }}
          >
            <Plus size={18} /> Add Member
          </button>
        </div>

        {/* BOTTOM SECTION: MEMBERS DATA TABLE */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          {/* Table Headers / Filters */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={16} className="text-[#1B5E20]" /> All Members ({totalCount})
              </h3>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex items-center min-w-[200px]">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, mobile, id..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                {/* Filter by Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer"
                >
                  <option value="">All Types</option>
                  {membershipTypes.map(type => (
                    <option key={type._id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading members data register...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Users size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Members Found</p>
                <p className="text-xs text-gray-400 mt-1">Try modifying your filters, search queries, or register a new member</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Member ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joining Date</th>
                    <th className="px-4 py-3">Portal Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0 text-xs font-bold text-[#1B5E20]">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(member.fullName)
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-800 text-xs">{member.memberId}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-700 truncate max-w-[150px]">{member.fullName}</td>
                      <td className="px-4 py-3.5 text-gray-500 font-medium">{member.mobileNumber}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200/50">
                          {member.membershipType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            member.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : member.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 font-semibold text-xs">
                        {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      {/* Portal Login Column with Action Button */}
                      <td className="px-4 py-3.5">
                        {member.email ? (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`${API_BASE}/${member._id}/login-as`, {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                const data = await res.json();
                                if (res.ok && data.success) {
                                  const memberPortalUrl = `${window.location.origin.replace(window.location.hostname, 'localhost')}/member/dashboard?session=${data.token}`;
                                  // For production, use the actual frontend URL
                                  const prodUrl = `https://ngo-frontend-blue.vercel.app/member/dashboard?session=${data.token}`;
                                  const finalUrl = window.location.hostname === 'localhost' ? memberPortalUrl : prodUrl;
                                  window.open(finalUrl, '_blank');
                                  toast.success(`Logged in as ${member.fullName}`);
                                } else {
                                  toast.error(data.message || 'Failed to login as member');
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error('Error logging in as member');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-green-700 hover:bg-green-800 transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 flex-shrink-0"
                          >
                            <ShieldCheck size={13} /> Login
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No credentials</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right relative">
                        {/* Settings Button */}
                        <button
                          onClick={(e) => handleDropdownToggle(e, member._id)}
                          className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-sm text-gray-600 hover:text-green-700 active:scale-95 inline-flex items-center justify-center"
                          title="Actions Menu"
                        >
                          <Settings size={16} className={activeDropdownId === member._id ? 'animate-spin-slow text-[#1B5E20]' : ''} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownId === member._id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-4 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-up"
                            style={{
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
                            }}
                          >
                            {/* View details */}
                            <button
                              onClick={() => {
                                handleViewClick(member);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:text-[#1B5E20] hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Eye size={14} className="text-gray-400" /> View Profile
                            </button>

                            {/* Edit profile */}
                            <button
                              onClick={() => {
                                handleEditClick(member);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 size={14} className="text-gray-400" /> Edit Profile
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            {/* Delete member */}
                            <button
                              onClick={() => {
                                handleDeleteClick(member._id);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 size={14} className="text-red-400" /> Delete Member
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION PANEL */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-5 mt-4">
                  <p className="text-xs text-gray-400 font-bold">
                    Showing Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* VIEW MEMBER DETAILS MODAL DIALOG */}
        {isViewOpen && viewingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div
              className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setViewingMember(null);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
              >
                <X size={20} />
              </button>

              {/* Header Profile Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-200 pb-5">
                <div className="w-20 h-20 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-md text-2xl font-bold text-[#1B5E20] flex-shrink-0">
                  {viewingMember.photoUrl ? (
                    <img src={viewingMember.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(viewingMember.fullName)
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-[#1B5E20]/15 text-[#1B5E20]">
                    {viewingMember.memberId}
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-800 mt-1">{viewingMember.fullName}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        viewingMember.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : viewingMember.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {viewingMember.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200/50">
                      {viewingMember.membershipType} Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                
                {/* Personal Information Group */}
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={14} className="text-[#1B5E20]" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Mobile Number</span>
                      <span className="font-bold text-gray-800">{viewingMember.mobileNumber}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Date of Birth</span>
                      <span className="font-bold text-gray-800">
                        {viewingMember.dateOfBirth ? new Date(viewingMember.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Gender</span>
                      <span className="font-bold text-gray-800">{viewingMember.gender || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Occupation</span>
                      <span className="font-bold text-gray-800">{viewingMember.occupation || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Account & Login Settings Group */}
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Lock size={14} className="text-[#1B5E20]" /> Portal Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Registered Email</span>
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        {viewingMember.email ? (
                          <>
                            <ShieldCheck size={14} className="text-green-600" /> {viewingMember.email}
                          </>
                        ) : (
                          'No email configured'
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Login Access</span>
                      <span className={`font-bold text-xs ${viewingMember.email ? 'text-green-600' : 'text-gray-400'}`}>
                        {viewingMember.email ? 'Enabled (Password set)' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Membership Data Group */}
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-[#1B5E20]" /> Registration & Membership
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50">
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Membership Fee Paid</span>
                      <span className="font-bold text-gray-800 text-base">₹{viewingMember.membershipFee || 0}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Referred By</span>
                      <span className="font-bold text-gray-800">{viewingMember.referredBy || 'Direct'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Joining Date</span>
                      <span className="font-bold text-gray-800">
                        {viewingMember.joiningDate ? new Date(viewingMember.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">Expiry Date</span>
                      <span className="font-bold text-gray-800">
                        {viewingMember.expiryDate ? new Date(viewingMember.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Lifetime / Not Set'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Details Group */}
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#1B5E20]" /> Location Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-white/50 text-xs">
                    <div className="sm:col-span-2">
                      <span className="text-xs text-gray-400 font-semibold block">Address</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.address || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">District</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.district || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">State</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-semibold block">PIN Code</span>
                      <span className="font-bold text-gray-800 text-sm">{viewingMember.pinCode || '—'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Close Panel Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewOpen(false);
                    setViewingMember(null);
                  }}
                  className="px-6 py-2.5 rounded-xl transition-all font-bold text-xs text-white cursor-pointer hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#1B5E20' }}
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD MEMBER MODAL DIALOG */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div
              className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow"
              >
                <X size={20} />
              </button>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <Plus className="text-[#1B5E20]" size={20} /> Add New Member Profile
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Fill out registration parameters and set portal login credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 text-gray-400" size={16} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm transition-all"
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={20} className="text-gray-400" />
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">{uploadProgress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="relative cursor-pointer flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-green-700 rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-all">
                          <Plus size={14} /> {uploading ? 'Uploading...' : 'Choose Image'}
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => handleFileChange(e, false)}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-4 text-gray-400" size={16} />
                      <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm transition-all"
                      />
                    </div>
                    {formErrors.mobileNumber && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* PORTAL LOGIN INFO */}
                  <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Lock size={14} /> Member Portal Credentials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Member Email Address</label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-4 text-gray-400" size={16} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="member@example.com"
                            className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle size={12} /> {formErrors.email}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">If provided, member can login with this email address.</p>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Login Password</label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 text-gray-400" size={16} />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Create portal password"
                            className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                          />
                        </div>
                        {formErrors.password && (
                          <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle size={12} /> {formErrors.password}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">Required if member email is set.</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <FileText size={14} /> Profile & Registration Data
                    </h4>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-4 text-gray-400" size={16} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street, Area details"
                      rows={1}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm resize-none"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="District"
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      placeholder="PIN Code"
                      maxLength={6}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                    {formErrors.pinCode && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> {formErrors.pinCode}
                      </p>
                    )}
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Occupation"
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Membership Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Membership Type</label>
                    <select
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm cursor-pointer"
                      disabled={loadingTypes}
                    >
                      <option value="">Select Membership Type</option>
                      {membershipTypes.map(type => (
                        <option key={type._id} value={type.name}>
                          {type.name} - ₹{type.annualFee}/year
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Membership Fee */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Membership Fee (₹)</label>
                    <input
                      type="number"
                      name="membershipFee"
                      value={formData.membershipFee}
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm cursor-not-allowed text-gray-600"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Auto-populated from membership type</p>
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Referred By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Referred By</label>
                    <input
                      type="text"
                      name="referredBy"
                      value={formData.referredBy}
                      onChange={handleInputChange}
                      placeholder="Referred By"
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all font-semibold text-xs text-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: '#1B5E20' }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Member...
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* EDIT MODAL DIALOG */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div
              className="w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow"
              >
                <X size={20} />
              </button>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <Edit2 className="text-[#1B5E20]" size={20} /> Edit Member Profile
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Modify validation fields and R2 profile assets</p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 text-gray-400" size={16} />
                      <input
                        type="text"
                        name="fullName"
                        value={editFormData.fullName}
                        onChange={(e) => handleInputChange(e, true)}
                        className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                      />
                    </div>
                    {editFormErrors.fullName && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> {editFormErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {editPhotoPreview ? (
                          <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={20} className="text-gray-400" />
                        )}
                        {editUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">{editProgress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="relative cursor-pointer flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-green-700 rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-all">
                          <Plus size={14} /> {editUploading ? 'Uploading...' : 'Change Photo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => handleFileChange(e, true)}
                            className="hidden"
                            disabled={editUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-4 text-gray-400" size={16} />
                      <input
                        type="text"
                        name="mobileNumber"
                        value={editFormData.mobileNumber}
                        onChange={(e) => handleInputChange(e, true)}
                        maxLength={10}
                        className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                      />
                    </div>
                    {editFormErrors.mobileNumber && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> {editFormErrors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* PORTAL LOGIN INFO */}
                  <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Lock size={14} /> Update Member Portal Credentials
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Member Email Address</label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-4 text-gray-400" size={16} />
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={(e) => handleInputChange(e, true)}
                            placeholder="member@example.com"
                            className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                          />
                        </div>
                        {editFormErrors.email && (
                          <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle size={12} /> {editFormErrors.email}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">If provided, member can login with this email address.</p>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Update Password</label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-4 text-gray-400" size={16} />
                          <input
                            type="password"
                            name="password"
                            value={editFormData.password}
                            onChange={(e) => handleInputChange(e, true)}
                            placeholder="Leave blank to keep existing password"
                            className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                          />
                        </div>
                        {editFormErrors.password && (
                          <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle size={12} /> {editFormErrors.password}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">Only input password if you want to reset it.</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <FileText size={14} /> Profile & Registration Data
                    </h4>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-4 text-gray-400" size={16} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editFormData.dateOfBirth}
                        onChange={(e) => handleInputChange(e, true)}
                        className="w-full pl-11 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select
                      name="gender"
                      value={editFormData.gender}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                    <textarea
                      name="address"
                      value={editFormData.address}
                      onChange={(e) => handleInputChange(e, true)}
                      rows={1}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm resize-none"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                    <input
                      type="text"
                      name="state"
                      value={editFormData.state}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                    <input
                      type="text"
                      name="district"
                      value={editFormData.district}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={editFormData.pinCode}
                      onChange={(e) => handleInputChange(e, true)}
                      maxLength={6}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                    {editFormErrors.pinCode && (
                      <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> {editFormErrors.pinCode}
                      </p>
                    )}
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={editFormData.occupation}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Membership Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Membership Type</label>
                    <select
                      name="membershipType"
                      value={editFormData.membershipType}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm cursor-pointer"
                      disabled={loadingTypes}
                    >
                      <option value="">Select Membership Type</option>
                      {membershipTypes.map(type => (
                        <option key={type._id} value={type.name}>
                          {type.name} - ₹{type.annualFee}/year
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Membership Fee */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Membership Fee (₹)</label>
                    <input
                      type="number"
                      name="membershipFee"
                      value={editFormData.membershipFee}
                      readOnly
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm cursor-not-allowed text-gray-600"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Auto-populated from membership type</p>
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={editFormData.joiningDate}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={editFormData.expiryDate}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Referred By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Referred By</label>
                    <input
                      type="text"
                      name="referredBy"
                      value={editFormData.referredBy}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-4 py-3 text-sm cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all font-semibold text-xs text-gray-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting || editUploading}
                    className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: '#1B5E20' }}
                  >
                    {editSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default AddMember;
