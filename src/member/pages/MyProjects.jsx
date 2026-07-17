import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban, Search, Loader2, Calendar, Users, 
  Target, Award, CheckCircle2, ArrowRight, Eye, X, HelpCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS, SHADOWS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/member/activities/projects`;

const MyProjects = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setProjects(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects list');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleJoinProject = async (projectId) => {
    setProcessingId(projectId);
    try {
      const res = await fetch(`${API_BASE}/${projectId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Joined project successfully!');
        fetchProjects();
        if (selectedProject?._id === projectId) {
          setSelectedProject(prev => ({ 
            ...prev, 
            isJoined: true, 
            volunteersCount: (prev.volunteersCount || 0) + 1 
          }));
        }
      } else {
        toast.error(resData.message || 'Failed to join project');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error joining project');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLeaveProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to leave this project?')) return;
    
    setProcessingId(projectId);
    try {
      const res = await fetch(`${API_BASE}/${projectId}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Left project successfully');
        fetchProjects();
        if (selectedProject?._id === projectId) {
          setSelectedProject(prev => ({ 
            ...prev, 
            isJoined: false, 
            volunteersCount: Math.max(0, (prev.volunteersCount || 0) - 1) 
          }));
        }
      } else {
        toast.error(resData.message || 'Failed to leave project');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error leaving project');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <FolderKanban className="text-[#1B5E20]" size={28} />
              My Projects
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Explore NGO initiatives, volunteer for projects, and monitor social impact
            </p>
          </div>
        </div>

        {/* Projects Grid Container */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: SHADOWS.neo
          }}
        >
          {/* Filters */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                NGO PROJECTS ({filteredProjects.length})
              </h3>
              <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                <div className="relative flex items-center w-full sm:w-60">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full font-semibold"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer font-bold text-gray-600"
                >
                  <option value="All">All Statuses</option>
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500 font-bold">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner">
                <FolderKanban size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Projects Found</p>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Check back later for newly registered NGO projects</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => {
                const benProgress = project.targetBeneficiaries > 0 
                  ? Math.min(100, Math.round((project.actualBeneficiaries / project.targetBeneficiaries) * 100))
                  : 0;

                return (
                  <div
                    key={project._id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          project.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                          project.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          project.status === 'Planned' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {project.status}
                        </span>
                        {project.isJoined && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-150 px-2 py-1 rounded-lg border border-green-300">
                            <CheckCircle2 size={12} /> VOLUNTEERING
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-gray-800 text-sm truncate">{project.title}</h4>
                        <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-semibold">
                        {project.description}
                      </p>

                      {/* Beneficiaries Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                          <span>Beneficiaries Reached</span>
                          <span>{project.actualBeneficiaries} / {project.targetBeneficiaries}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-green-700 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${benProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold pt-2">
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-[#1B5E20]" /> {project.volunteersCount || 0} Volunteers
                        </span>
                        <span>
                          Budget: ₹{project.budget?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 mt-6">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="py-2.5 rounded-xl border border-gray-200 bg-transparent text-gray-600 hover:border-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition-all active:scale-95"
                      >
                        <Eye size={13} /> View Details
                      </button>

                      {project.isJoined ? (
                        <button
                          onClick={() => handleLeaveProject(project._id)}
                          disabled={processingId === project._id}
                          className="py-2.5 rounded-xl bg-red-50 text-red-650 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                        >
                          {processingId === project._id ? 'Leaving...' : 'Leave'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinProject(project._id)}
                          disabled={processingId === project._id || project.status === 'Completed'}
                          className="py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#145a1b] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                        >
                          {processingId === project._id ? 'Joining...' : 'Volunteer'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PROJECT DETAIL MODAL */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
            <div
              className="w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar animate-scale-up"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow z-10"
              >
                <X size={20} />
              </button>

              <div className="space-y-4 text-left">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                  selectedProject.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                  selectedProject.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selectedProject.status} Project
                </span>
                <h3 className="text-xl font-black text-gray-800 tracking-tight">{selectedProject.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 bg-white/50 p-4 rounded-2xl border border-white/80 text-xs">
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Start Date</span>
                    <span className="font-extrabold text-gray-700">
                      {new Date(selectedProject.startDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">End Date</span>
                    <span className="font-extrabold text-gray-700">
                      {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Ongoing'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Project Budget</span>
                    <span className="font-extrabold text-gray-700 text-sm">
                      ₹{selectedProject.budget?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Expenses Incurred</span>
                    <span className="font-extrabold text-gray-700 text-sm">
                      ₹{selectedProject.expenses?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Target Beneficiaries</span>
                    <span className="font-extrabold text-[#1B5E20]">
                      {selectedProject.targetBeneficiaries?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Volunteers Assumed</span>
                    <span className="font-extrabold text-[#1B5E20]">
                      {selectedProject.volunteersCount || 0} Joined
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Description</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                    {selectedProject.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer border-0 hover:bg-gray-300 transition-all text-center font-bold"
                >
                  Close Details
                </button>
                {selectedProject.isJoined ? (
                  <button
                    onClick={() => { handleLeaveProject(selectedProject._id); }}
                    disabled={processingId === selectedProject._id}
                    className="flex-1 py-3 bg-red-50 text-red-650 hover:bg-red-100 rounded-xl text-xs font-bold cursor-pointer border-0 disabled:opacity-50 transition-all font-bold"
                  >
                    Leave Project
                  </button>
                ) : (
                  <button
                    onClick={() => { handleJoinProject(selectedProject._id); }}
                    disabled={processingId === selectedProject._id || selectedProject.status === 'Completed'}
                    className="flex-1 py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-bold cursor-pointer border-0 disabled:opacity-50 transition-all font-bold"
                  >
                    Volunteer Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProjects;
