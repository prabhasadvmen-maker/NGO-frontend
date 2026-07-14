import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  FolderKanban, DollarSign, Calendar, Filter, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, Settings, User, Building2, TrendingUp, Users, RefreshCw
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

const ActionMenu = ({ project, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" title="Actions">
        <Settings size={16} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button onClick={() => { onView(project); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left">
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button onClick={() => { onEdit(project); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left">
            <Pencil size={14} className="text-green-600" /> Edit Project
          </button>
          <div className="border-t border-gray-100" />
          <button onClick={() => { onDelete(project); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left">
            <Trash2 size={14} /> Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

const ProjectsList = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    branch: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Planned',
    budget: '',
    targetBeneficiaries: '',
    actualBeneficiaries: '0',
    volunteersCount: '0'
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
      const res = await fetch(`${API}/admin/projects/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [headers]);

  // Fetch projects list
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        status: selectedStatus,
        branch: selectedBranch,
        startDate,
        endDate
      });
      const res = await fetch(`${API}/admin/projects?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading projects');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedStatus, selectedBranch, startDate, endDate, headers, toast]);

  useEffect(() => {
    if (token) {
      fetchBranches();
      fetchStats();
    }
  }, [token, fetchBranches, fetchStats]);

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, fetchProjects]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        budget: Number(form.budget) || 0,
        targetBeneficiaries: Number(form.targetBeneficiaries) || 0,
        actualBeneficiaries: Number(form.actualBeneficiaries) || 0,
        volunteersCount: Number(form.volunteersCount) || 0
      };

      const res = await fetch(`${API}/admin/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Project created successfully!');
        setShowAddModal(false);
        setForm({
          title: '',
          description: '',
          branch: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'Planned',
          budget: '',
          targetBeneficiaries: '',
          actualBeneficiaries: '0',
          volunteersCount: '0'
        });
        fetchProjects();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to create project');
      }
    } catch {
      toast.error('Server error creating project');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      title: project.title || '',
      description: project.description || '',
      branch: project.branch?._id || project.branch || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status || 'Planned',
      budget: project.budget || '',
      targetBeneficiaries: project.targetBeneficiaries || '',
      actualBeneficiaries: project.actualBeneficiaries || '0',
      volunteersCount: project.volunteersCount || '0'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        budget: Number(form.budget) || 0,
        targetBeneficiaries: Number(form.targetBeneficiaries) || 0,
        actualBeneficiaries: Number(form.actualBeneficiaries) || 0,
        volunteersCount: Number(form.volunteersCount) || 0
      };

      const res = await fetch(`${API}/admin/projects/${editProject._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Project details updated successfully');
        setEditProject(null);
        fetchProjects();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update project');
      }
    } catch {
      toast.error('Server error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/admin/projects/${deleteProject._id}`, { 
        method: 'DELETE', 
        headers 
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Project deleted successfully');
        setProjects(prev => prev.filter(p => p._id !== deleteProject._id));
        setDeleteProject(null);
        fetchStats();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete project');
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <FolderKanban className="text-[#1B5E20]" size={28} />
              Projects Directory
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Define social projects, allocate budgets, and trace execution impacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { fetchProjects(); fetchStats(); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: stats.totalCount, color: COLORS.primary, sub: 'All assigned plans' },
            { label: 'Total Allocated Budget', value: formatCurrency(stats.totalBudget), color: COLORS.success, sub: 'Local aid budget' },
            { label: 'Cumulative Expenses', value: formatCurrency(stats.totalExpenses), color: COLORS.danger, sub: 'Spendings to date' },
            { label: 'Impact Reach Goal', value: `${stats.totalActualBeneficiaries} / ${stats.totalTargetBeneficiaries}`, color: '#D29C00', sub: 'Beneficiaries reached' },
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 flex items-center gap-4 bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                {idx === 0 ? <FolderKanban size={22} style={{ color: card.color }} /> :
                 idx === 1 ? <DollarSign size={22} style={{ color: card.color }} /> :
                 idx === 2 ? <TrendingUp size={22} style={{ color: card.color }} /> :
                 <Users size={22} style={{ color: card.color }} />}
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
                placeholder="Search by project title, descriptions..."
                value={search}
                onChange={e => handleFilterChange(setSearch, e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              
              {/* Branch */}
              <select
                value={selectedBranch}
                onChange={e => handleFilterChange(setSelectedBranch, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={e => handleFilterChange(setSelectedStatus, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">Status</option>
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>

              {/* Start Date */}
              <input 
                type="date" 
                value={startDate}
                onChange={e => handleFilterChange(setStartDate, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55 text-gray-600 font-semibold cursor-pointer"
                title="Start Date from"
              />

              {/* End Date */}
              <input 
                type="date" 
                value={endDate}
                onChange={e => handleFilterChange(setEndDate, e.target.value)}
                className="px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-55 text-gray-600 font-semibold cursor-pointer"
                title="Start Date to"
              />

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
              <p className="text-sm font-semibold text-gray-400">Loading projects list...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <FolderKanban size={44} className="opacity-30" />
              <p className="font-semibold text-sm">No projects registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Project Details', 'Branch', 'Duration', 'Financials', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => (
                    <tr key={project._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      
                      {/* Sr. No */}
                      <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>

                      {/* Project title */}
                      <td className="px-3.5 py-3 max-w-[200px]">
                        <div>
                          <p className="font-bold text-gray-800 leading-tight truncate" title={project.title}>{project.title}</p>
                          <p className="text-[10px] text-gray-500 font-semibold line-clamp-1 mt-0.5" title={project.description}>{project.description}</p>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-3.5 py-3">
                        {project.branch ? (
                          <div>
                            <p className="font-bold text-gray-700">{project.branch.name}</p>
                            <p className="text-[10px] text-gray-500 font-semibold">Code: {project.branch.code}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Timeline */}
                      <td className="px-3.5 py-3 text-xs font-semibold text-gray-600">
                        <p className="flex items-center gap-1"><Calendar size={10} /> {formatDate(project.startDate)}</p>
                        <p className="text-gray-400 text-[10px] pl-3.5">to {project.endDate ? formatDate(project.endDate) : 'ongoing'}</p>
                      </td>

                      {/* Financial values */}
                      <td className="px-3.5 py-3 text-xs">
                        <p className="text-green-700 font-bold">Budget: {formatCurrency(project.budget)}</p>
                        <p className="text-red-600 font-semibold mt-0.5">Spent: {formatCurrency(project.expenses)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          project.status === 'Active' ? 'bg-green-100 text-green-700' :
                          project.status === 'Planned' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-650'
                        }`}>
                          {project.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3">
                        <ActionMenu 
                          project={project} 
                          onView={setViewProject} 
                          onEdit={openEdit} 
                          onDelete={setDeleteProject} 
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

      {/* CREATE NEW PROJECT MODAL */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalHeader title="Create New NGO Project" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project Title *</label>
              <input type="text" required value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project Description *</label>
              <textarea required rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                <input type="date" required value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                <input type="date" value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">NGO Branch Assignment</label>
                <select value={form.branch}
                  onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 cursor-pointer">
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Allocated Budget (INR) *</label>
                <input type="number" required min="0" value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status *</label>
                <select value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 cursor-pointer">
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Beneficiaries Goal</label>
                <input type="number" min="0" value={form.targetBeneficiaries}
                  onChange={e => setForm(p => ({ ...p, targetBeneficiaries: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Creating project...' : 'Create Project'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* VIEW PROJECT DETAILS MODAL */}
      {viewProject && (
        <Modal onClose={() => setViewProject(null)}>
          <ModalHeader title="NGO Project Details Summary" onClose={() => setViewProject(null)} />
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 no-scrollbar">
            
            <div className="pb-4 border-b border-gray-100 space-y-1">
              <h3 className="text-xl font-extrabold text-gray-800 leading-tight">{viewProject.title}</h3>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  viewProject.status === 'Active' ? 'bg-green-100 text-green-700' :
                  viewProject.status === 'Planned' ? 'bg-blue-100 text-blue-700' :
                  viewProject.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-750'
                }`}>
                  {viewProject.status} Status
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  Branch: {viewProject.branch?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Project Description</h4>
              <p className="text-gray-700 text-xs font-medium leading-relaxed whitespace-pre-line">{viewProject.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              
              {/* Timelines */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Timelines</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Start Date</p>
                    <p className="text-gray-700 font-semibold">{formatDate(viewProject.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Estimated End Date</p>
                    <p className="text-gray-700 font-semibold">{viewProject.endDate ? formatDate(viewProject.endDate) : 'Ongoing project'}</p>
                  </div>
                </div>
              </div>

              {/* Impact Reach statistics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Aid Statistics</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Target Beneficiaries</p>
                    <p className="text-gray-700 font-semibold">{viewProject.targetBeneficiaries || 0} individuals</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Actual Reached</p>
                    <p className="text-gray-700 font-semibold text-green-700">{viewProject.actualBeneficiaries || 0} individuals</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Volunteers Deployed</p>
                    <p className="text-gray-700 font-semibold">{viewProject.volunteersCount || 0} volunteers</p>
                  </div>
                </div>
              </div>

              {/* Financial statements */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Financial Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Allocated Budget</p>
                    <p className="text-green-700 font-extrabold text-base">{formatCurrency(viewProject.budget)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Logged Expenditures</p>
                    <p className="text-red-600 font-extrabold text-base">{formatCurrency(viewProject.expenses)}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={() => setViewProject(null)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT NGO PROJECT MODAL */}
      {editProject && (
        <Modal onClose={() => setEditProject(null)}>
          <ModalHeader title="Modify Project Settings" onClose={() => setEditProject(null)} />
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project Title *</label>
              <input type="text" required value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project Description *</label>
              <textarea required rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                <input type="date" required value={form.startDate}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                <input type="date" value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">NGO Branch Assignment</label>
                <select value={form.branch}
                  onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 cursor-pointer">
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Allocated Budget (INR) *</label>
                <input type="number" required min="0" value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status *</label>
                <select value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 cursor-pointer">
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Beneficiaries</label>
                <input type="number" min="0" value={form.targetBeneficiaries}
                  onChange={e => setForm(p => ({ ...p, targetBeneficiaries: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Actual Reached</label>
                <input type="number" min="0" value={form.actualBeneficiaries}
                  onChange={e => setForm(p => ({ ...p, actualBeneficiaries: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Volunteers Deployed</label>
                <input type="number" min="0" value={form.volunteersCount}
                  onChange={e => setForm(p => ({ ...p, volunteersCount: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditProject(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProject && (
        <Modal onClose={() => setDeleteProject(null)}>
          <ModalHeader title="Remove NGO Project Profile" onClose={() => setDeleteProject(null)} />
          <div className="flex flex-col items-center gap-3 py-2 mb-6">
            <p className="text-center text-gray-600 text-sm">
              Are you sure you want to delete project <span className="font-bold text-gray-800">"{deleteProject.title}"</span>?<br />
              <span className="text-red-500 font-bold text-xs">WARNING: This will permanently delete the project record and all its mapped expense histories.</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteProject(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
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

export default ProjectsList;
