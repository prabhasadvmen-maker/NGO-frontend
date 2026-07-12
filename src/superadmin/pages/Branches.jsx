import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  GitBranch, MapPin, Phone, Mail, Building2, Plus, Edit2, Trash2, Eye,
  Loader2, Search, X, Check, Settings, Users, ChevronDown, Globe, Calendar, Save
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/superadmin/branches`;

const Branches = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    totalBranches: 0,
    activeBranches: 0,
    inactiveBranches: 0,
    statesCovered: 0,
    branchesByState: []
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [filterState, setFilterState] = useState('');

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBranch, setViewingBranch] = useState(null);

  const dropdownRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    establishedDate: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    phone: '',
    email: '',
    branchHead: '',
    isActive: true
  });

  // Fetch branches data
  const fetchBranches = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const activeParam = filterActive === 'all' ? '' : `&isActive=${filterActive === 'active'}`;
      const stateParam = filterState ? `&state=${encodeURIComponent(filterState)}` : '';
      const url = `${API_BASE}?search=${encodeURIComponent(search)}${activeParam}${stateParam}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setBranches(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch branches');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error fetching branches');
    } finally {
      setLoading(false);
    }
  }, [token, search, filterActive, filterState, toast]);

  // Fetch branch statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setStats(resData.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [token]);

  // Fetch active admins (for Branch Head select)
  const fetchAdmins = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setAdmins(resData.data.filter(admin => admin.isActive));
      }
    } catch (err) {
      console.error('Admins fetch error:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchBranches();
    fetchStats();
    fetchAdmins();
  }, [fetchBranches, fetchStats, fetchAdmins]);

  // Outside click listener for dropdowns
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDropdownToggle = (e, id) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === id ? null : id));
  };

  // Form input change handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCodeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      code: value.toUpperCase()
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      establishedDate: '',
      address: '',
      city: '',
      district: '',
      state: '',
      pinCode: '',
      phone: '',
      email: '',
      branchHead: '',
      isActive: true
    });
    setEditingId(null);
  };

  // Open create form
  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit form
  const handleOpenEditModal = (branch) => {
    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      establishedDate: branch.establishedDate ? new Date(branch.establishedDate).toISOString().split('T')[0] : '',
      address: branch.address || '',
      city: branch.city || '',
      district: branch.district || '',
      state: branch.state || '',
      pinCode: branch.pinCode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      branchHead: branch.branchHead?._id || branch.branchHead || '',
      isActive: branch.isActive !== undefined ? branch.isActive : true
    });
    setEditingId(branch._id);
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  // Open view modal
  const handleOpenViewModal = (branch) => {
    setViewingBranch(branch);
    setIsViewModalOpen(true);
    setActiveDropdownId(null);
  };

  // Form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.city || !formData.state) {
      toast.error('Please fill name, code, city, and state');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

      const payload = {
        ...formData,
        branchHead: formData.branchHead || null,
        establishedDate: formData.establishedDate || null
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || (editingId ? 'Branch updated successfully' : 'Branch created successfully'));
        setIsModalOpen(false);
        resetForm();
        fetchBranches();
        fetchStats();
      } else {
        toast.error(resData.message || 'Failed to save branch');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving branch');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Branch
  const handleDelete = async (id) => {
    setActiveDropdownId(null);
    if (!window.confirm('Are you sure you want to delete this branch?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'Branch deleted successfully');
        fetchBranches();
        fetchStats();
      } else {
        toast.error(resData.message || 'Failed to delete branch');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting branch');
    }
  };

  // Unique list of states from current active filter set for the dropdown
  const uniqueStates = Array.from(new Set(branches.map(b => b.state).filter(Boolean)));

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 w-full max-w-full overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <GitBranch className="text-[#1B5E20]" size={28} />
              Branches
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Manage organization branches across locations
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow hover:shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Add Branch
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
              <GitBranch size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-black">{stats.totalBranches}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Total Branches</p>
            </div>
          </div>

          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
              <Check size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1B5E20]">{stats.activeBranches}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Active Branches</p>
            </div>
          </div>

          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-red-600">
              <X size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-red-600">{stats.inactiveBranches}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Inactive Branches</p>
            </div>
          </div>

          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-blue-600">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-blue-600">{stats.statesCovered}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">States Covered</p>
            </div>
          </div>
        </div>

        {/* Filter Bar and Listing */}
        <div
          className="rounded-3xl p-6 md:p-8 space-y-6 max-w-full overflow-hidden"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
          }}
        >
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name, code or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Status:</span>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 text-xs font-bold text-black bg-white outline-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">State:</span>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 text-xs font-bold text-black bg-white outline-none cursor-pointer"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm self-start md:self-auto">
              Found: <span className="text-black">{branches.length} branches</span>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading branches...</p>
            </div>
          ) : branches.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <GitBranch className="text-gray-300" size={64} />
              <div>
                <h3 className="text-lg font-black text-black">No Branches Found</h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                  Adjust filters or add a new branch to populate the listing.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all shadow cursor-pointer active:scale-95"
              >
                Add first branch
              </button>
            </div>
          ) : (
            /* Table layout */
            /* Table layout */
            <div className="overflow-x-auto overflow-y-visible min-h-[250px] w-full rounded-2xl border border-gray-200 bg-white shadow-sm no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F0F8F0] border-b border-[#1B5E20]/20 text-[#1B5E20]">
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-12 text-center">Sr. No.</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-20">Code</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Branch Name</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Location</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Contact Info</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Branch Head</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-20">Status</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branches.map((branch, index) => (
                    <tr key={branch._id} className="hover:bg-[#F0F8F0]/30 transition-colors">
                      {/* Sr. No. */}
                      <td className="px-3 py-3 text-xs font-bold text-gray-500 text-center">
                        {index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1B5E20]/10 text-[#1B5E20] inline-block">
                          {branch.code}
                        </span>
                      </td>
                      
                      {/* Branch Name */}
                      <td className="px-3 py-3 font-extrabold text-black max-w-[180px] break-words">
                        {branch.name}
                      </td>
                      
                      {/* Location */}
                      <td className="px-3 py-3">
                        <div className="text-xs font-bold text-black">{branch.city}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">{branch.state}</div>
                      </td>
                      
                      {/* Contact */}
                      <td className="px-3 py-3">
                        <div className="text-xs font-bold text-black whitespace-nowrap">{branch.phone || 'N/A'}</div>
                        <div className="text-[10px] text-gray-500 font-semibold truncate max-w-[140px]" title={branch.email}>
                          {branch.email || 'N/A'}
                        </div>
                      </td>
                      
                      {/* Branch Head */}
                      <td className="px-3 py-3">
                        {branch.branchHead ? (
                          <>
                            <div className="text-xs font-bold text-black">{branch.branchHead.name}</div>
                            <div className="text-[10px] text-gray-500 font-semibold truncate max-w-[140px]" title={branch.branchHead.email}>
                              {branch.branchHead.email}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">No Head Assigned</span>
                        )}
                      </td>
                      
                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          branch.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-3 py-3 text-right relative overflow-visible">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => handleDropdownToggle(e, branch._id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black cursor-pointer transition-all border border-gray-200"
                          >
                            <Settings size={16} />
                          </button>

                          {activeDropdownId === branch._id && (
                            <div
                              className="absolute right-0 mt-1 w-28 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-fadeIn text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleOpenViewModal(branch)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-gray-700 hover:bg-[#F0F8F0] hover:text-[#1B5E20] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(branch)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-gray-700 hover:bg-[#F0F8F0] hover:text-[#1B5E20] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 size={12} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(branch._id)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 relative bg-[#F5F5F5] max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto no-scrollbar"
            style={{
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Close Icon Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="sticky top-0 ml-auto mb-2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Title Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-black text-black">
                {editingId ? 'Edit Branch' : 'Add New Branch'}
              </h2>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">
                NGO Branch Office Setup
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Branch Name */}
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. Lucknow Head Office"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Branch Code */}
                <div className="flex flex-col">
                  <label htmlFor="code" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Branch Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    placeholder="e.g. LKO-001"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Established Date */}
                <div className="flex flex-col">
                  <label htmlFor="establishedDate" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Established Date
                  </label>
                  <input
                    type="date"
                    id="establishedDate"
                    name="establishedDate"
                    value={formData.establishedDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Contact Phone */}
                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. 9918309983"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Primary Email */}
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="e.g. lucknow@ngo.org"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Branch Head Admin Selection */}
                <div className="flex flex-col">
                  <label htmlFor="branchHead" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Branch Head Administrator
                  </label>
                  <select
                    id="branchHead"
                    name="branchHead"
                    value={formData.branchHead}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">Select Branch Head Admin</option>
                    {admins.map(admin => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Office Address */}
                <div className="flex flex-col sm:col-span-2">
                  <label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    Office Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    placeholder="Full street address..."
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm resize-none"
                  ></textarea>
                </div>

                {/* City */}
                <div className="flex flex-col">
                  <label htmlFor="city" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g. Lucknow"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* District */}
                <div className="flex flex-col">
                  <label htmlFor="district" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    placeholder="e.g. Lucknow"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* State */}
                <div className="flex flex-col">
                  <label htmlFor="state" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="e.g. Uttar Pradesh"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* PIN Code */}
                <div className="flex flex-col">
                  <label htmlFor="pinCode" className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    id="pinCode"
                    name="pinCode"
                    placeholder="e.g. 226001"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Active Toggle Status */}
                {editingId && (
                  <div className="flex items-center gap-3 sm:col-span-2 py-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4.5 h-4.5 text-[#1B5E20] focus:ring-[#1B5E20] border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-xs font-black text-gray-700 uppercase tracking-wide cursor-pointer select-none">
                      Active Branch (Allow new members mapping)
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-1.5 shadow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Branch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Branch Details Modal */}
      {isViewModalOpen && viewingBranch && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto no-scrollbar">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 relative bg-[#F5F5F5] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden no-scrollbar"
            style={{
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                setViewingBranch(null);
              }}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black text-black">
                  {viewingBranch.name}
                </h2>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1B5E20]/10 text-[#1B5E20]">
                  {viewingBranch.code}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  viewingBranch.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {viewingBranch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                NGO Branch Details
              </p>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-1 no-scrollbar flex-1 content-start">
              {/* Established Date */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Established Date</span>
                <span className="text-sm font-bold text-black mt-1">
                  {viewingBranch.establishedDate
                    ? new Date(viewingBranch.establishedDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>

              {/* Office Address */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center sm:col-span-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Office Address</span>
                <span className="text-sm font-bold text-black mt-1">
                  {viewingBranch.address || 'N/A'}
                </span>
              </div>

              {/* City */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">City</span>
                <span className="text-sm font-bold text-black mt-1">{viewingBranch.city}</span>
              </div>

              {/* District */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">District</span>
                <span className="text-sm font-bold text-black mt-1">{viewingBranch.district || 'N/A'}</span>
              </div>

              {/* State */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">State</span>
                <span className="text-sm font-bold text-black mt-1">{viewingBranch.state}</span>
              </div>

              {/* PIN Code */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">PIN Code</span>
                <span className="text-sm font-bold text-black mt-1">{viewingBranch.pinCode || 'N/A'}</span>
              </div>

              {/* Contact details */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Contact Phone</span>
                <span className="text-sm font-bold text-black mt-1 flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" />
                  {viewingBranch.phone || 'N/A'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Primary Email</span>
                <span className="text-sm font-bold text-black mt-1 flex items-center gap-1.5 truncate" title={viewingBranch.email}>
                  <Mail size={14} className="text-gray-400" />
                  {viewingBranch.email || 'N/A'}
                </span>
              </div>

              {/* Branch Head */}
              <div className="bg-[#F0F8F0] p-5 rounded-2xl border border-[#1B5E20]/20 shadow-sm sm:col-span-2 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Branch Head Administrator</span>
                  <span className="text-base font-extrabold text-black block mt-0.5">
                    {viewingBranch.branchHead?.name || 'No Head Assigned'}
                  </span>
                  {viewingBranch.branchHead?.email && (
                    <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                      {viewingBranch.branchHead.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-5 border-t border-gray-200 flex justify-end mt-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingBranch(null);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default Branches;
