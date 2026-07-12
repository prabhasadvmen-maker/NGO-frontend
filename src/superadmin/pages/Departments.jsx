import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers, Check, X, GitBranch, Phone, Mail, Plus, Edit2, Trash2, Eye,
  Loader2, Search, Settings, Users, Save
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/superadmin/departments`;

const Departments = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  // State variables
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    activeDepartments: 0,
    inactiveDepartments: 0,
    branchesCovered: 0,
    departmentsByBranch: []
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'
  const [filterBranch, setFilterBranch] = useState('');

  // Modals & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDepartment, setViewingDepartment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    branch: '',
    description: '',
    departmentHead: '',
    phone: '',
    email: '',
    isActive: true
  });

  // Fetch Departments
  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const activeParam = filterActive === 'all' ? '' : `&isActive=${filterActive === 'active'}`;
      const branchParam = filterBranch ? `&branchId=${encodeURIComponent(filterBranch)}` : '';
      const url = `${API_BASE}?search=${encodeURIComponent(search)}${activeParam}${branchParam}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setDepartments(resData.data);
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, search, filterActive, filterBranch]);

  // Fetch Stats
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
      console.error('Fetch stats error:', err);
    }
  }, [token]);

  // Fetch Branches
  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setBranches(resData.data);
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [token]);

  // Fetch Admins
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
      console.error('Fetch admins error:', err);
    }
  }, [token]);

  // Load Initial Data
  useEffect(() => {
    fetchDepartments();
    fetchStats();
    fetchBranches();
    fetchAdmins();
  }, [fetchDepartments, fetchStats, fetchBranches, fetchAdmins]);

  // Outside click listener for settings dropdowns
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleDropdownToggle = (e, id) => {
    e.stopPropagation();
    setActiveDropdownId(prev => (prev === id ? null : id));
  };

  // Form Input handlers
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

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      branch: '',
      description: '',
      departmentHead: '',
      phone: '',
      email: '',
      isActive: true
    });
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      branch: dept.branch?._id || dept.branch || '',
      description: dept.description || '',
      departmentHead: dept.departmentHead?._id || dept.departmentHead || '',
      phone: dept.phone || '',
      email: dept.email || '',
      isActive: dept.isActive !== undefined ? dept.isActive : true
    });
    setEditingId(dept._id);
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleOpenViewModal = (dept) => {
    setViewingDepartment(dept);
    setIsViewModalOpen(true);
    setActiveDropdownId(null);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.branch) {
      toast.error('Please fill name, code, and assign a branch');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

      const payload = {
        name: formData.name,
        branch: formData.branch,
        description: formData.description || null,
        departmentHead: formData.departmentHead || null,
        phone: formData.phone || null,
        email: formData.email || null,
        isActive: formData.isActive,
        ...(!editingId && { code: formData.code }),
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
        toast.success(resData.message || (editingId ? 'Department updated successfully' : 'Department created successfully'));
        setIsModalOpen(false);
        resetForm();
        fetchDepartments();
        fetchStats();
      } else {
        toast.error(resData.message || 'Failed to save department');
      }
    } catch (err) {
      console.error('Submit department error:', err);
      toast.error('Server error saving department');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Department
  const handleDelete = async (id) => {
    setActiveDropdownId(null);
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(resData.message || 'Department deleted successfully');
        fetchDepartments();
        fetchStats();
      } else {
        toast.error(resData.message || 'Failed to delete department');
      }
    } catch (err) {
      console.error('Delete department error:', err);
      toast.error('Server error deleting department');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 w-full max-w-full overflow-hidden flex flex-col">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Layers className="text-[#1B5E20]" size={28} />
              Departments
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Manage organization departments and department heads
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow hover:shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Departments */}
          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-black">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-black">{stats.totalDepartments}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Total Departments</p>
            </div>
          </div>

          {/* Active Departments */}
          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
              <Check size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1B5E20]">{stats.activeDepartments}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Active Departments</p>
            </div>
          </div>

          {/* Inactive Departments */}
          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-red-600">
              <X size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-red-600">{stats.inactiveDepartments}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Inactive Departments</p>
            </div>
          </div>

          {/* Branches Covered */}
          <div className="bg-[#F0F8F0] rounded-2xl p-5 border border-[#1B5E20]/20 hover:shadow-lg transition-all flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-blue-600">
              <GitBranch size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-blue-600">{stats.branchesCovered}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5">Branches Covered</p>
            </div>
          </div>
        </div>

        {/* Main Card (Neumorphic layout) */}
        <div
          className="rounded-3xl p-6 md:p-8 space-y-6 max-w-full overflow-hidden"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
          }}
        >
          {/* Search/Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              
              {/* Search input */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name, code or branch..."
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

              {/* Branch Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Branch:</span>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 text-xs font-bold text-black bg-white outline-none cursor-pointer max-w-[200px]"
                >
                  <option value="">All Branches</option>
                  {branches.map(br => (
                    <option key={br._id} value={br._id}>{br.name} ({br.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Found Badge */}
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm self-start md:self-auto">
              Found: {departments.length} departments
            </div>
          </div>

          {/* Table / List Container */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="text-gray-300 mb-4 animate-pulse" size={64} />
              <h3 className="text-lg font-black text-black">No Departments Found</h3>
              <p className="text-sm text-gray-500 font-semibold mt-1">Adjust filters or add a new department</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-5 px-5 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow hover:shadow-md active:scale-95"
              >
                Add first department
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible min-h-[250px] w-full rounded-2xl border border-gray-200 bg-white shadow-sm no-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F0F8F0] border-b border-[#1B5E20]/20 text-[#1B5E20]">
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-12 text-center">Sr. No.</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-20">Code</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Department Name</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Branch</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Contact Info</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider">Dept Head</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-20">Status</th>
                    <th className="px-3 py-3.5 text-xs font-black uppercase tracking-wider w-16 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departments.map((dept, index) => (
                    <tr key={dept._id} className="hover:bg-[#F0F8F0]/30 transition-colors">
                      {/* Sr. No */}
                      <td className="px-3 py-3 text-xs font-bold text-gray-500 text-center">
                        {index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1B5E20]/10 text-[#1B5E20] inline-block">
                          {dept.code}
                        </span>
                      </td>

                      {/* Department Name */}
                      <td className="px-3 py-3 font-extrabold text-black max-w-[180px] break-words">
                        {dept.name}
                      </td>

                      {/* Branch */}
                      <td className="px-3 py-3">
                        <div className="text-xs font-bold text-black">{dept.branch?.name || 'N/A'}</div>
                        {dept.branch?.code && (
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">{dept.branch.code}</div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="px-3 py-3">
                        <div className="text-xs font-bold text-black whitespace-nowrap">{dept.phone || 'N/A'}</div>
                        <div className="text-[10px] text-gray-500 font-semibold truncate max-w-[140px]" title={dept.email}>
                          {dept.email || 'N/A'}
                        </div>
                      </td>

                      {/* Dept Head */}
                      <td className="px-3 py-3">
                        {dept.departmentHead ? (
                          <>
                            <div className="text-xs font-bold text-black">{dept.departmentHead.name}</div>
                            <div className="text-[10px] text-gray-500 font-semibold truncate max-w-[140px]" title={dept.departmentHead.email}>
                              {dept.departmentHead.email}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">No Head Assigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          dept.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions settings menu */}
                      <td className="px-3 py-3 text-right relative overflow-visible">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => handleDropdownToggle(e, dept._id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black cursor-pointer transition-all border border-gray-200"
                          >
                            <Settings size={16} />
                          </button>

                          {activeDropdownId === dept._id && (
                            <div
                              className="absolute right-0 mt-1 w-28 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-fadeIn text-left"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleOpenViewModal(dept)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-gray-700 hover:bg-[#F0F8F0] hover:text-[#1B5E20] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(dept)}
                                className="w-full px-3 py-1.5 text-left text-xs font-bold text-gray-700 hover:bg-[#F0F8F0] hover:text-[#1B5E20] transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 size={12} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(dept._id)}
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

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 relative bg-[#F5F5F5] max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto no-scrollbar"
            style={{
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="sticky top-0 ml-auto mb-2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10 animate-fadeIn"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-black">
                {editingId ? 'Edit Department' : 'Add Department'}
              </h2>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wide">
                {editingId ? 'Modify department configuration details' : 'Create a new department node'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Department Name */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Department Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter department name"
                    className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Department Code */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Department Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleCodeChange}
                    placeholder="e.g. HR, FIN, OPS"
                    disabled={!!editingId}
                    className={`px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm ${
                      editingId ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : ''
                    }`}
                    required
                  />
                </div>

                {/* Branch Select */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Branch *</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm cursor-pointer"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(br => (
                      <option key={br._id} value={br._id}>
                        {br.name} ({br.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Head */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Department Head</label>
                  <select
                    name="departmentHead"
                    value={formData.departmentHead}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm cursor-pointer"
                  >
                    <option value="">Assign Dept Head (Optional)</option>
                    {admins.map(adm => (
                      <option key={adm._id} value={adm._id}>
                        {adm.name} ({adm.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Phone */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Contact Email */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Primary Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter department email"
                    className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter department description"
                    rows={3}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none text-sm font-semibold text-black bg-white transition-all shadow-sm resize-none"
                  />
                </div>

                {/* Status Checkbox (Only on Edit) */}
                {editingId && (
                  <div className="flex items-center gap-2 mt-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4.5 h-4.5 rounded text-[#1B5E20] focus:ring-[#1B5E20] border-gray-300 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-xs font-bold text-gray-700 cursor-pointer select-none uppercase tracking-wide">
                      Active Status
                    </label>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-5 border-t border-gray-200 flex justify-end mt-4 flex-shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 shadow hover:shadow-md active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Department
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Department Details Modal */}
      {isViewModalOpen && viewingDepartment && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 relative bg-[#F5F5F5] shadow-2xl max-h-[90vh] flex flex-col overflow-y-auto no-scrollbar"
            style={{
              boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                setViewingDepartment(null);
              }}
              className="sticky top-0 ml-auto mb-2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black text-black">
                  {viewingDepartment.name}
                </h2>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1B5E20]/10 text-[#1B5E20]">
                  {viewingDepartment.code}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  viewingDepartment.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {viewingDepartment.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                NGO Department Details
              </p>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
              
              {/* Branch assigned */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Assigned Branch</span>
                <span className="text-sm font-bold text-black mt-1">
                  {viewingDepartment.branch?.name ? `${viewingDepartment.branch.name} (${viewingDepartment.branch.code})` : 'N/A'}
                </span>
              </div>

              {/* Description */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center sm:col-span-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Description</span>
                <span className="text-sm font-bold text-black mt-1">
                  {viewingDepartment.description || 'No description provided'}
                </span>
              </div>

              {/* Contact Phone */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Contact Phone</span>
                <span className="text-sm font-bold text-black mt-1 flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" />
                  {viewingDepartment.phone || 'N/A'}
                </span>
              </div>

              {/* Contact Email */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Primary Email</span>
                <span className="text-sm font-bold text-black mt-1 flex items-center gap-1.5 truncate" title={viewingDepartment.email}>
                  <Mail size={14} className="text-gray-400" />
                  {viewingDepartment.email || 'N/A'}
                </span>
              </div>

              {/* Department Head details card */}
              <div className="bg-[#F0F8F0] p-5 rounded-2xl border border-[#1B5E20]/20 shadow-sm sm:col-span-2 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Department Head Administrator</span>
                  <span className="text-base font-extrabold text-black block mt-0.5">
                    {viewingDepartment.departmentHead?.name || 'No Head Assigned'}
                  </span>
                  {viewingDepartment.departmentHead?.email && (
                    <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                      {viewingDepartment.departmentHead.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-5 border-t border-gray-200 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingDepartment(null);
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

export default Departments;
