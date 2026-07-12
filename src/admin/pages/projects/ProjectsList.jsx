import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  FolderKanban, DollarSign, Calendar, Filter, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, Settings, Phone, Mail, User, TrendingUp
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/projects`;

const ActionMenu = ({ project, onView, onEditProgress, onEditExpenses, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

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
            onClick={() => { navigate(`/admin/projects/progress?id=${project._id}`); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-55 transition-colors cursor-pointer text-left"
          >
            <Pencil size={14} className="text-green-600" /> Update Progress
          </button>
          <button 
            onClick={() => { navigate(`/admin/projects/expenses?id=${project._id}`); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-55 transition-colors cursor-pointer text-left"
          >
            <DollarSign size={14} className="text-amber-500" /> Update Expenses
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

const ProjectsList = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
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

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const startParam = startDate ? `&startDate=${startDate}` : '';
      const endParam = endDate ? `&endDate=${endDate}` : '';
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${startParam}${endParam}`;
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
  }, [token, page, limit, search, filterStatus, startDate, endDate, toast]);

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
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  const handleOpenViewModal = (project) => {
    setViewingProject(project);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project permanently?')) return;
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
              Managed Projects
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Track and update the execution status of campaigns you run</p>
          </div>
          <button
            onClick={() => navigate('/admin/projects/add')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border-0"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'My Projects', value: stats.totalCount, color: COLORS.primary, sub: 'Total campaigns recorded' },
            { label: 'Active Projects', value: stats.activeCount, color: '#2196F3', sub: 'In progress operations' },
            { label: 'Budget Managed', value: `₹${stats.totalBudget.toLocaleString('en-IN')}`, color: COLORS.success, sub: `Expenses: ₹${stats.totalExpenses.toLocaleString('en-IN')}` },
            { label: 'Target Beneficiaries', value: stats.totalTargetBeneficiaries.toLocaleString('en-IN'), color: COLORS.warning, sub: `Reached: ${stats.totalActualBeneficiaries.toLocaleString('en-IN')}` }
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

        {/* Filters */}
        <div 
          className="rounded-2xl p-5 bg-white space-y-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Search</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
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
              <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
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
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No projects found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Project Campaign', 'Branch', 'Duration', 'Budget & Expenses', 'Reaches', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-3.5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => {
                    const spentPercentage = project.budget > 0 ? Math.min(Math.round((project.expenses / project.budget) * 100), 100) : 0;
                    return (
                      <tr key={project._id} className="border-b last:border-0 hover:bg-gray-55 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-2.5 py-3 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-3.5 py-3 max-w-[220px]">
                          <div>
                            <p className="font-bold text-gray-800 leading-tight truncate">{project.title}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{project.description}</p>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-xs text-gray-700">
                          {project.branch?.name || <span className="text-gray-400 italic">Unassigned</span>}
                        </td>
                        <td className="px-3.5 py-3 text-xs text-gray-600 font-semibold">
                          <div>
                            <p>S: {new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            {project.endDate && <p>E: {new Date(project.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 max-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700">
                              <span>₹{project.expenses.toLocaleString('en-IN')}</span>
                              <span className="text-gray-400">/ ₹{project.budget.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full bg-green-600 rounded-full" style={{ width: `${spentPercentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700 border border-green-100">
                              Reached: {project.actualBeneficiaries}
                            </span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-3">
                          <ActionMenu 
                            project={project}
                            onView={handleOpenViewModal}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Viewing Details */}
      {isViewModalOpen && viewingProject && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <FolderKanban size={20} className="text-green-700" />
                Project Detail Audit
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 text-sm">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Campaign Title</span>
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
                    {viewingProject.branch ? `${viewingProject.branch.name}` : 'Central Headquarters'}
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
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Impact Metrics</h4>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Target Beneficiaries</span>
                    <span className="text-base font-bold text-gray-800">{viewingProject.targetBeneficiaries.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Actual Reached</span>
                    <span className="text-base font-bold text-gray-800">{viewingProject.actualBeneficiaries.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Crew Count</span>
                    <span className="text-base font-bold text-gray-800">{viewingProject.volunteersCount} Crew</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
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

export default ProjectsList;
