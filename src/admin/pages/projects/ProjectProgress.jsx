import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FolderKanban, Check, Loader2, Search, Landmark, Users, TrendingUp, RefreshCw
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import { COLORS } from '../../../shared/colors';
import API_BASE_URL from '../../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const ProjectProgress = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

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
      console.error(err);
    }
  }, [headers]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        status: selectedStatus,
        branch: selectedBranch
      });
      const res = await fetch(`${API}/admin/projects?${queryParams}`, { headers });
      const data = await res.json();
      if (data.success) {
        // Map projects to include local input state values
        const mapped = data.data.map(p => ({
          ...p,
          localStatus: p.status,
          localActual: p.actualBeneficiaries || 0,
          localTarget: p.targetBeneficiaries || 0,
          localVolunteers: p.volunteersCount || 0
        }));
        setProjects(mapped);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading projects progress data');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedStatus, selectedBranch, headers, toast]);

  useEffect(() => {
    if (token) {
      fetchBranches();
      fetchProjects();
    }
  }, [token, fetchBranches, fetchProjects]);

  const handleInputChange = (projectId, field, value) => {
    setProjects(prev => prev.map(p => {
      if (p._id === projectId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSaveProgress = async (project) => {
    setUpdatingId(project._id);
    try {
      const res = await fetch(`${API}/admin/projects/${project._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: project.localStatus,
          actualBeneficiaries: Number(project.localActual) || 0,
          targetBeneficiaries: Number(project.localTarget) || 0,
          volunteersCount: Number(project.localVolunteers) || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Progress saved for "${project.title}"`);
        // Refresh local items
        setProjects(prev => prev.map(p => {
          if (p._id === project._id) {
            return {
              ...p,
              status: data.data.status,
              actualBeneficiaries: data.data.actualBeneficiaries,
              targetBeneficiaries: data.data.targetBeneficiaries,
              volunteersCount: data.data.volunteersCount
            };
          }
          return p;
        }));
      } else {
        toast.error(data.message || 'Failed to update progress');
      }
    } catch {
      toast.error('Server error updating progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const getPercentage = (actual, target) => {
    if (!target) return 0;
    const pct = Math.round((actual / target) * 100);
    return Math.min(pct, 100);
  };

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-[#1B5E20]" size={28} />
              Project Progress Tracker
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Audit field reach statistics, deployed helpers, and operational statuses</p>
          </div>
          <button 
            onClick={fetchProjects}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500 cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div 
          className="rounded-2xl p-5 bg-white space-y-4"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search projects by name..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50/50"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedBranch}
                onChange={e => { setSelectedBranch(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50 text-gray-600 font-semibold cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

          </div>
        </div>

        {/* Progress Grid list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
            <p className="text-sm font-semibold text-gray-400 mt-2">Loading progress matrix...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">
            <FolderKanban size={44} className="opacity-30" />
            <p className="font-semibold text-sm mt-2">No projects found to log progress</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map(p => {
              const reachPercentage = getPercentage(p.localActual, p.localTarget);
              const isUpdating = updatingId === p._id;

              return (
                <div 
                  key={p._id}
                  className="rounded-3xl p-6 bg-white border border-gray-100 space-y-5 transition-all duration-300 hover:shadow-lg"
                  style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
                >
                  
                  {/* Header info */}
                  <div className="flex items-start justify-between min-w-0 gap-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-800 leading-snug truncate" title={p.title}>{p.title}</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                        <Landmark size={12} /> Branch: {p.branch?.name || 'Unassigned'}
                      </p>
                    </div>
                    
                    {/* Status dropdown selector */}
                    <select
                      value={p.localStatus}
                      onChange={e => handleInputChange(p._id, 'localStatus', e.target.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 outline-none focus:border-green-500 bg-gray-50 text-gray-600 cursor-pointer"
                    >
                      <option value="Planned">Planned</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Impact Slider gauge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-500">Reach Progress</span>
                      <span className="text-green-700">{reachPercentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-green-500 transition-all duration-500" 
                        style={{ width: `${reachPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Operational parameters inputs */}
                  <div className="grid grid-cols-3 gap-3">
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reach Target</label>
                      <input 
                        type="number" 
                        min="0"
                        value={p.localTarget}
                        onChange={e => handleInputChange(p._id, 'localTarget', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Actual Reached</label>
                      <input 
                        type="number" 
                        min="0"
                        value={p.localActual}
                        onChange={e => handleInputChange(p._id, 'localActual', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Helpers Count</label>
                      <input 
                        type="number" 
                        min="0"
                        value={p.localVolunteers}
                        onChange={e => handleInputChange(p._id, 'localVolunteers', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border outline-none focus:border-green-500 bg-gray-50 text-gray-700 font-bold"
                      />
                    </div>

                  </div>

                  {/* Action Save button */}
                  <div className="flex justify-end pt-3 border-t border-gray-50">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSaveProgress(p)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 disabled:opacity-60 transition-all flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check size={13} /> Save Progress
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination logs */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white rounded-2xl shadow-sm">
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
    </Layout>
  );
};

export default ProjectProgress;
