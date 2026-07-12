import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FolderKanban, DollarSign, Calendar, Filter, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, Settings, User, Building2, TrendingUp, Users
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/superadmin/projects`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

const ActionMenu = ({ project, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(p => !p)} 
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" 
        title="Actions"
      >
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button 
            onClick={() => { onView(project); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-55 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button 
            onClick={() => { onEdit(project); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-55 transition-colors cursor-pointer text-left"
          >
            <Pencil size={14} className="text-green-600" /> Edit Project
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(project._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 size={14} /> Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

const Projects = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    plannedCount: 0,
    completedCount: 0,
    suspendedCount: 0,
    totalBudget: 0,
    totalExpenses: 0,
    totalTargetBeneficiaries: 0,
    totalActualBeneficiaries: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branch: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Planned',
    budget: '',
    expenses: '',
    targetBeneficiaries: '',
    actualBeneficiaries: '',
    volunteersCount: ''
  });

  const fetchBranches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(BRANCH_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter(b => b.isActive));
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const branchParam = filterBranch ? `&branch=${filterBranch}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${branchParam}${startParam}${endParam}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, filterBranch, startDate, endDate, toast]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      branch: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Planned',
      budget: '',
      expenses: '',
      targetBeneficiaries: '',
      actualBeneficiaries: '',
      volunteersCount: ''
    });
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setFormData({
      title: project.title || '',
      description: project.description || '',
      branch: project.branch?._id || project.branch || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status || 'Planned',
      budget: project.budget || '',
      expenses: project.expenses || '',
      targetBeneficiaries: project.targetBeneficiaries || '',
      actualBeneficiaries: project.actualBeneficiaries || '',
      volunteersCount: project.volunteersCount || ''
    });
    setEditingId(project._id);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (project) => {
    setViewingProject(project);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Project saved successfully');
        setIsModalOpen(false);
        resetForm();
        fetchProjects();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to save project');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its records permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Project deleted');
        fetchProjects();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <FolderKanban className="text-[#1B5E20]" size={28} />
              Projects Portfolio
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Define, monitor, and coordinate active social project plans</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border-0"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Projects', value: stats.activeCount, color: COLORS.primary, sub: 'Currently under execution' },
            { label: 'Total Portfolio Budget', value: `₹${(stats.totalBudget / 100000).toFixed(1)}L`, color: '#2196F3', sub: `Spent: ₹${(stats.totalExpenses / 100000).toFixed(1)}L` },
            { label: 'Target Beneficiaries', value: (stats.totalTargetBeneficiaries || 0).toLocaleString('en-IN'), color: COLORS.success, sub: `Reached: ${(stats.totalActualBeneficiaries || 0).toLocaleString('en-IN')}` },
            { label: 'Planned / Pending', value: stats.plannedCount, color: COLORS.warning, sub: 'Awaiting deployment' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 bg-white flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                <FolderKanban size={22} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-800 leading-tight">{card.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        <div 
          className="rounded-2xl p-5 bg-white space-y-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Search Projects</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, details..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">NGO Branch</label>
              <select
                value={filterBranch}
                onChange={(e) => { setFilterBranch(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Launch Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No projects found matching current criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Project Campaign', 'Branch', 'Duration', 'Budget & Cost', 'Reaches (Target/Actual)', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => {
                    const budgetVal = project.budget || 0;
                    const spentVal = project.expenses || 0;
                    const spentPercentage = budgetVal > 0 ? Math.min(Math.round((spentVal / budgetVal) * 100), 100) : 0;

                    return (
                      <tr key={project._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        {/* Sr. No. */}
                        <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>

                        {/* Title & Desc */}
                        <td className="px-3.5 py-3 max-w-[220px]">
                          <div>
                            <p className="font-bold text-gray-800 leading-tight truncate" title={project.title}>{project.title}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5" title={project.description}>{project.description}</p>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="px-3.5 py-3 font-semibold text-xs text-gray-700">
                          {project.branch ? (
                            <div>
                              <p className="font-bold text-gray-800">{project.branch.name}</p>
                              <p className="text-[9px] text-gray-400">Code: {project.branch.code}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-3.5 py-3 text-xs text-gray-600 font-semibold">
                          <div>
                            <p>S: {new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            {project.endDate ? (
                              <p>E: {new Date(project.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            ) : (
                              <p className="text-green-600 text-[10px]">Ongoing Campaign</p>
                            )}
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-3.5 py-3 max-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700">
                              <span>₹{spentVal.toLocaleString('en-IN')}</span>
                              <span className="text-gray-400">/ ₹{budgetVal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${spentPercentage}%`,
                                  backgroundColor: spentPercentage > 85 ? '#F44336' : spentPercentage > 50 ? '#FF9800' : '#4CAF50'
                                }} 
                              />
                            </div>
                          </div>
                        </td>

                        {/* Reaches */}
                        <td className="px-3.5 py-3">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700 border border-green-100">
                              Reaches: {(project.actualBeneficiaries || 0).toLocaleString('en-IN')}
                            </span>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Target: {(project.targetBeneficiaries || 0).toLocaleString('en-IN')} heads</p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            project.status === 'Active' ? 'bg-green-100 text-green-700' :
                            project.status === 'Planned' ? 'bg-yellow-100 text-yellow-700' :
                            project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {project.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3">
                          <ActionMenu 
                            project={project}
                            onView={handleOpenViewModal}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 font-bold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 text-xs font-bold text-gray-500 rounded-lg cursor-pointer hover:bg-gray-50 disabled:opacity-50 border-0 bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Project Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800">
                {editingId ? 'Edit Project Details' : 'Create New Project Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Project Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Rural Sanitation & Hydration Plan"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Description *</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Provide extensive details about project objectives, locations, and targets..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">NGO Branch Association</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="">Global/Central Operations</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Project Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="Planned">Planned</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Target End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Project Budget (INR)</label>
                    <input
                      type="number"
                      name="budget"
                      placeholder="e.g., 500000"
                      value={formData.budget}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Expenses Incurred (INR)</label>
                    <input
                      type="number"
                      name="expenses"
                      placeholder="e.g., 120000"
                      value={formData.expenses}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-gray-500">Target Beneficiaries</label>
                    <input
                      type="number"
                      name="targetBeneficiaries"
                      placeholder="e.g. 1500"
                      value={formData.targetBeneficiaries}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-gray-500">Reached Beneficiaries</label>
                    <input
                      type="number"
                      name="actualBeneficiaries"
                      placeholder="e.g. 350"
                      value={formData.actualBeneficiaries}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-bold text-gray-500">Assigned Volunteers</label>
                    <input
                      type="number"
                      name="volunteersCount"
                      placeholder="e.g. 15"
                      value={formData.volunteersCount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer transition-colors bg-white hover:bg-gray-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Update Project' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Viewing Project Detail Modal */}
      {isViewModalOpen && viewingProject && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <FolderKanban size={20} className="text-green-700" />
                Project Details
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 text-sm">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Project Campaign Title</span>
                <span className="font-extrabold text-gray-800 text-lg block leading-tight">{viewingProject.title}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Detailed Scope & Description</span>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap mt-1">
                  {viewingProject.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Branch</span>
                  <span className="font-bold text-gray-700 block">
                    {viewingProject.branch ? `${viewingProject.branch.name} (${viewingProject.branch.code})` : 'Central Headquarters'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Status</span>
                  <span className="font-bold text-gray-700 block capitalize">{viewingProject.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Launch Date</span>
                  <span className="font-semibold text-gray-700 block">
                    {new Date(viewingProject.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Conclusion</span>
                  <span className="font-semibold text-gray-700 block">
                    {viewingProject.endDate 
                      ? new Date(viewingProject.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Ongoing Campaign'
                    }
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Financial Indicators</h4>
                <div className="grid grid-cols-3 gap-4 bg-green-50/30 p-4 rounded-xl border border-green-50">
                  <div>
                    <span className="text-[10px] font-bold text-green-700 uppercase block">Total Budget</span>
                    <span className="text-base font-extrabold text-green-950">₹{viewingProject.budget.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Expenses Cost</span>
                    <span className="text-base font-extrabold text-amber-950">₹{viewingProject.expenses.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Remaining Balance</span>
                    <span className="text-base font-extrabold text-blue-950">
                      ₹{Math.max(0, viewingProject.budget - viewingProject.expenses).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Impact & Volunteers Metrics</h4>
                <div className="grid grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Target Beneficiaries</span>
                    <span className="text-base font-bold text-gray-800">{(viewingProject.targetBeneficiaries || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Actual Reached</span>
                    <span className="text-base font-bold text-gray-800">{(viewingProject.actualBeneficiaries || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Assigned Crew</span>
                    <span className="text-base font-bold text-gray-800">{viewingProject.volunteersCount} Vol.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
              >
                Close View
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
};

export default Projects;
