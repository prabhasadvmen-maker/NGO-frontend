import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Megaphone, DollarSign, Calendar, Filter, Plus, Pencil, Trash2, Eye,
  Loader2, Search, X, Check, FileText, Heart, ShieldCheck, Settings
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/superadmin/campaigns`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

const ActionMenu = ({ campaign, onView, onViewContributions, onEdit, onDelete }) => {
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
        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden">
          <button 
            onClick={() => { onView(campaign); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          <button 
            onClick={() => { onViewContributions(campaign); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <DollarSign size={14} className="text-emerald-600" /> Contributions
          </button>
          <button 
            onClick={() => { onEdit(campaign); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Pencil size={14} className="text-green-600" /> Edit Campaign
          </button>
          <div className="border-t border-gray-100" />
          <button 
            onClick={() => { onDelete(campaign._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <Trash2 size={14} /> Delete Campaign
          </button>
        </div>
      )}
    </div>
  );
};

const Crowdfunding = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    plannedCount: 0,
    completedCount: 0,
    suspendedCount: 0,
    totalTarget: 0,
    totalRaised: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
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
  const [viewingCampaign, setViewingCampaign] = useState(null);

  // Contributions Modal
  const [isContrModalOpen, setIsContrModalOpen] = useState(false);
  const [contrCampaign, setContrCampaign] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [contrSearch, setContrSearch] = useState('');
  const [contrLoading, setContrLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
    branch: ''
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

  const fetchCampaigns = useCallback(async () => {
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
        setCampaigns(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load campaigns');
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
    fetchCampaigns();
    fetchStats();
  }, [fetchCampaigns, fetchStats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      startDate: '',
      endDate: '',
      status: 'Planned',
      branch: ''
    });
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setFormData({
      title: c.title || '',
      description: c.description || '',
      targetAmount: c.targetAmount !== undefined ? String(c.targetAmount) : '',
      startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      status: c.status || 'Planned',
      branch: c.branch?._id || c.branch || ''
    });
    setEditingId(c._id);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (c) => {
    setViewingCampaign(c);
    setIsViewModalOpen(true);
  };

  const fetchContributions = async (campaignId, searchQ = contrSearch) => {
    if (!token || !campaignId) return;
    setContrLoading(true);
    try {
      const url = `${API_BASE}/${campaignId}/contributions?search=${encodeURIComponent(searchQ)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setContributions(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contributions');
    } finally {
      setContrLoading(false);
    }
  };

  const handleOpenContributionsModal = (c) => {
    setContrCampaign(c);
    setContributions([]);
    setContrSearch('');
    setIsContrModalOpen(true);
    fetchContributions(c._id, '');
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
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount) || 0
        })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Campaign saved successfully');
        setIsModalOpen(false);
        resetForm();
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to save campaign');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this crowdfunding campaign? Associated donations will be detached.')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
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
              <Megaphone className="text-[#1B5E20]" size={28} />
              Crowdfunding Campaigns
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage NGO fundraising goals, targets, and donors list</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm border-0"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Plus size={18} />
            Create Campaign
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Campaigns', value: stats.activeCount, color: COLORS.primary, sub: 'Currently fundraising' },
            { label: 'Total Targeted Goal', value: `₹${(stats.totalTarget / 100000).toFixed(1)}L`, color: '#00bcd4', sub: 'Cumulative funding goals' },
            { label: 'Total Funds Raised', value: `₹${(stats.totalRaised / 100000).toFixed(2)}L`, color: COLORS.success, sub: `Raised: ${stats.totalTarget > 0 ? Math.round((stats.totalRaised / stats.totalTarget) * 100) : 0}% aggregate` },
            { label: 'Pending Planned', value: stats.plannedCount, color: COLORS.warning, sub: 'Awaiting deployment' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 bg-white flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}15` }}>
                <Megaphone size={22} style={{ color: card.color }} />
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
              <label className="text-[10px] font-bold text-gray-400 uppercase">Search Campaigns</label>
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
              <label className="text-[10px] font-bold text-gray-400 uppercase">Launch Date</label>
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
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No campaigns found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Fundraising Campaign', 'Branch', 'Duration Range', 'Funding Progress', 'Funds Raised', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, idx) => {
                    const raised = c.raisedAmount || 0;
                    const target = c.targetAmount || 1;
                    const progress = Math.min(Math.round((raised / target) * 100), 100);

                    return (
                      <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <div>
                            <p className="font-bold text-gray-800 truncate" title={c.title}>{c.title}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5" title={c.description}>{c.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-xs text-gray-700">
                          {c.branch ? (
                            <div>
                              <p className="font-bold text-gray-800">{c.branch.name}</p>
                              <p className="text-[9px] text-gray-400">Code: {c.branch.code}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Central NGO</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                          <div>
                            <p>S: {new Date(c.startDate).toLocaleDateString('en-IN')}</p>
                            <p>E: {new Date(c.endDate).toLocaleDateString('en-IN')}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-[150px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-700">
                              <span>{progress}%</span>
                              <span className="text-gray-400">Goal: ₹{target.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${progress}%`,
                                  backgroundColor: progress >= 100 ? '#4CAF50' : COLORS.primary
                                }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-sm text-green-700">
                          ₹{raised.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            c.status === 'Active' ? 'bg-green-100 text-green-700' :
                            c.status === 'Planned' ? 'bg-yellow-100 text-yellow-700' :
                            c.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <ActionMenu 
                            campaign={c}
                            onView={handleOpenViewModal}
                            onViewContributions={handleOpenContributionsModal}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
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

      {/* Create / Edit Campaign Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800">
                {editingId ? 'Edit Campaign Configurations' : 'Initiate Crowdfunding Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Campaign Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Flood Relief Fundraising 2026"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Description / Goal Objectives *</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Detailed explanation of campaign objective, fund allocation plan..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Target Funding Amount (INR) *</label>
                    <input
                      type="number"
                      name="targetAmount"
                      value={formData.targetAmount}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="e.g. 500000"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">NGO Branch Office</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                    >
                      <option value="">Global Central Headquarters</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
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
                    <label className="text-xs font-bold text-gray-500">Expiration End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Campaign Status</label>
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
                  {editingId ? 'Update Campaign' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Campaign Details Modal */}
      {isViewModalOpen && viewingCampaign && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                <Megaphone size={20} className="text-green-700" />
                Campaign Specifications
              </h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 text-sm">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Title</span>
                <span className="font-extrabold text-gray-800 text-lg block leading-tight">{viewingCampaign.title}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Detailed Scope & Funding Goals</span>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap mt-1">
                  {viewingCampaign.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Branch office</span>
                  <span className="font-bold text-gray-700 block mt-0.5">
                    {viewingCampaign.branch ? `${viewingCampaign.branch.name}` : 'NGO Headquarters'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Status</span>
                  <span className="font-bold text-gray-700 block mt-0.5 capitalize">{viewingCampaign.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Launch Date</span>
                  <span className="font-semibold text-gray-700 block">
                    {new Date(viewingCampaign.startDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Deadline</span>
                  <span className="font-semibold text-gray-700 block">
                    {new Date(viewingCampaign.endDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/40">
                <div>
                  <span className="text-[10px] font-bold text-green-700 uppercase block">Target Amount</span>
                  <span className="text-lg font-extrabold text-green-900">₹{viewingCampaign.targetAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase block">Total Funds Raised</span>
                  <span className="text-lg font-extrabold text-blue-900">₹{viewingCampaign.raisedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">Remaining Deficit</span>
                  <span className="text-lg font-extrabold text-purple-900">
                    ₹{Math.max(0, viewingCampaign.targetAmount - viewingCampaign.raisedAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Contributions List Modal */}
      {isContrModalOpen && contrCampaign && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="w-full max-w-4xl my-8 bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-extrabold text-gray-800">
                  Donor Contributions: {contrCampaign.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Audit log of all successful/pending payments received for this campaign</p>
              </div>
              <button onClick={() => setIsContrModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Sub-Filters */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search contribution by donor name, email, or receipt number..."
                value={contrSearch}
                onChange={(e) => { setContrSearch(e.target.value); fetchContributions(contrCampaign._id, e.target.value); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* List */}
            <div className="max-h-[50vh] overflow-y-auto border border-gray-100 rounded-xl">
              {contrLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-green-600" size={24} />
                </div>
              ) : contributions.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs font-semibold">No contributions recorded yet.</div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 uppercase text-gray-400 border-b">
                    <tr>
                      <th className="px-4 py-3">Receipt No.</th>
                      <th className="px-4 py-3">Donor details</th>
                      <th className="px-4 py-3">Donation Date</th>
                      <th className="px-4 py-3">Payment Method</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(contr => (
                      <tr key={contr._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-700">{contr.receiptNumber}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-800">{contr.donorName}</p>
                            <p className="text-[10px] text-gray-400">{contr.donorEmail || 'No Email'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-medium">
                          {new Date(contr.donationDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-600 uppercase">{contr.paymentMethod}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            contr.paymentStatus === 'completed' ? 'bg-green-105 text-green-700 border border-green-200' :
                            contr.paymentStatus === 'pending' ? 'bg-yellow-105 text-yellow-705 border border-yellow-200' :
                            'bg-red-105 text-red-600 border border-red-200'
                          }`}>
                            {contr.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-green-700 text-sm">
                          ₹{contr.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button 
                onClick={() => setIsContrModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white"
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

export default Crowdfunding;
