import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, IndianRupee, Plus, Eye, Loader2, Search, Heart, X, Settings, 
  Pencil, Trash2, Landmark, Calendar, LandmarkIcon, ClipboardList, Gift, RefreshCw
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/campaigns`;
const BRANCH_API = `${API_BASE_URL}/api/branches`;

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

const ActionMenu = ({ campaign, isMine, onView, onEdit, onLogDonation, onViewContributions, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-100 bg-white shadow-lg z-10 overflow-hidden text-left">
          <button 
            onClick={() => { onView(campaign); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <Eye size={14} className="text-blue-500" /> View Details
          </button>
          {isMine && (
            <button 
              onClick={() => { onEdit(campaign); setOpen(false); }} 
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <Pencil size={14} className="text-green-600" /> Edit Campaign
            </button>
          )}
          <button 
            disabled={campaign.status === 'Completed' || campaign.status === 'Suspended'}
            onClick={() => { onLogDonation(campaign); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-left"
          >
            <Gift size={14} className="text-green-700" /> Log Donation
          </button>
          <button 
            onClick={() => { onViewContributions(campaign._id); setOpen(false); }} 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-left"
          >
            <ClipboardList size={14} className="text-indigo-500" /> Contributors
          </button>
          {isMine && (
            <>
              <div className="border-t border-gray-100" />
              <button 
                onClick={() => { onDelete(campaign._id); setOpen(false); }} 
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-55 transition-colors cursor-pointer text-left"
              >
                <Trash2 size={14} /> Delete Drive
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CampaignsList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    completedCount: 0,
    totalTarget: 0,
    totalRaised: 0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [myCampaignsOnly, setMyCampaignsOnly] = useState('false');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);
  const [editCampaign, setEditCampaign] = useState(null);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Forms state
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
    status: 'Planned',
    branch: ''
  });

  const [contribForm, setContribForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(BRANCH_API, { headers });
      const data = await res.json();
      if (data.success) {
        setBranches(data.data.filter(b => b.isActive));
      }
    } catch (err) {
      console.error(err);
    }
  }, [headers]);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const mineParam = `&myCampaignsOnly=${myCampaignsOnly}`;
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${mineParam}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, myCampaignsOnly, toast, headers]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, headers]);

  useEffect(() => {
    if (token) {
      fetchBranches();
      fetchCampaigns();
      fetchStats();
    }
  }, [token, fetchBranches, fetchCampaigns, fetchStats]);

  const handleOpenContribModal = (campaign) => {
    setSelectedCampaign(campaign);
    setContribForm({
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      amount: '',
      paymentMethod: 'cash',
      notes: ''
    });
    setIsContribModalOpen(true);
  };

  const handleContribSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/${selectedCampaign._id}/contributions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(contribForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contribution registered successfully!');
        setIsContribModalOpen(false);
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to save contribution');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error registering campaign donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        targetAmount: parseFloat(form.targetAmount) || 0
      };

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Campaign launched successfully');
        setShowAddModal(false);
        setForm({
          title: '',
          description: '',
          targetAmount: '',
          startDate: '',
          endDate: '',
          status: 'Planned',
          branch: ''
        });
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to launch campaign');
      }
    } catch {
      toast.error('Server error creating campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (campaign) => {
    setEditCampaign(campaign);
    setForm({
      title: campaign.title || '',
      description: campaign.description || '',
      targetAmount: campaign.targetAmount || '',
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      status: campaign.status || 'Planned',
      branch: campaign.branch?._id || campaign.branch || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const bodyData = {
        ...form,
        targetAmount: parseFloat(form.targetAmount) || 0
      };

      const res = await fetch(`${API_BASE}/${editCampaign._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Campaign details updated successfully');
        setEditCampaign(null);
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update campaign');
      }
    } catch {
      toast.error('Server error updating campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action is permanent.')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete campaign');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigateToContributions = (id) => {
    navigate(`/admin/crowdfunding/contributions?campaign=${id}`);
  };

  const getPercentage = (raised, target) => {
    if (!target) return 0;
    const pct = Math.round((raised / target) * 100);
    return Math.min(pct, 100);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
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
      <div className="space-y-6 pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Megaphone className="text-[#1B5E20]" size={28} />
              Fundraising Campaigns
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Participate in NGO crowdfunding drives and register donor contributions</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { fetchCampaigns(); fetchStats(); }}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm text-gray-500 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Plus size={18} /> Create Campaign
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'My Registered Campaigns', value: stats.totalCount, color: COLORS.primary, sub: 'Total campaigns managed' },
            { label: 'Active Drives', value: stats.activeCount, color: '#00bcd4', sub: 'In progress' },
            { label: 'Total Targeted Goal', value: `₹${(stats.totalTarget / 100000).toFixed(1)}L`, color: '#e91e63', sub: 'Funding goals' },
            { label: 'Total Raised by Me', value: `₹${(stats.totalRaised / 100000).toFixed(2)}L`, color: COLORS.success, sub: 'Manual entries' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl p-5 bg-white flex items-center gap-4 transition-all"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-55">
                <Megaphone size={22} style={{ color: card.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-extrabold text-gray-800 leading-tight truncate">{card.value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-0.5 truncate">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div 
          className="rounded-2xl p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650"
            >
              <option value="">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={myCampaignsOnly}
              onChange={(e) => { setMyCampaignsOnly(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650"
            >
              <option value="false">All Active NGO Drives</option>
              <option value="true">Created by Me Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div 
          className="rounded-2xl overflow-hidden bg-white text-center" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No campaigns listed.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Campaign Details', 'Launch Date', 'Target Funding', 'Raised Amount', 'Funding Progress', 'Status', 'Actions'].map((h, idx) => (
                      <th key={h} className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500 ${idx === 7 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((camp, idx) => {
                    const isMine = camp.createdBy?._id === user?.id || camp.createdBy === user?.id;
                    const progressPercentage = getPercentage(camp.raisedAmount, camp.targetAmount);

                    return (
                      <tr key={camp._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors text-left" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <div>
                            <p className="font-bold text-gray-800 truncate" title={camp.title}>{camp.title}</p>
                            <p className="text-[10px] text-gray-500 font-semibold line-clamp-2 mt-0.5" title={camp.description}>{camp.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-700">
                          {formatDate(camp.startDate)}
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-700">
                          {formatCurrency(camp.targetAmount)}
                        </td>
                        <td className="px-4 py-4 text-xs font-extrabold text-green-700">
                          {formatCurrency(camp.raisedAmount)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-[120px] space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-gray-500">{progressPercentage}% Funded</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${progressPercentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            camp.status === 'Active' ? 'bg-green-100 text-green-700' :
                            camp.status === 'Planned' ? 'bg-yellow-100 text-yellow-750' :
                            camp.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-750'
                          }`}>
                            {camp.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <ActionMenu 
                              campaign={camp} 
                              isMine={isMine}
                              onView={setViewCampaign} 
                              onEdit={openEdit} 
                              onLogDonation={handleOpenContribModal}
                              onViewContributions={navigateToContributions}
                              onDelete={handleDeleteCampaign}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW CAMPAIGN MODAL */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ModalHeader title="Initiate Crowdfunding Drive" onClose={() => setShowAddModal(false)} />
          <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Title *</label>
              <input type="text" required placeholder="e.g. Village Solar Electrification Fund"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description & Target Objectives *</label>
              <textarea required rows={3} placeholder="Outline objectives, why funding is needed, budget distributions..."
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Fund Amount (INR) *</label>
                <input type="number" required min="1" placeholder="e.g. 250000"
                  value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Designated Branch office</label>
                <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="">Global/Central Operations</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                <input type="date" required value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date / Deadline *</label>
                <input type="date" required value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Launch status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Launching drive...' : 'Launch Campaign'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* EDIT CAMPAIGN MODAL */}
      {editCampaign && (
        <Modal onClose={() => setEditCampaign(null)}>
          <ModalHeader title="Edit Crowdfunding Campaign" onClose={() => setEditCampaign(null)} />
          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description & Target Objectives *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Fund Amount (INR) *</label>
                <input type="number" required min="1" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Designated Branch office</label>
                <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="">Global/Central Operations</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                <input type="date" required value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date / Deadline *</label>
                <input type="date" required value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 font-semibold" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Launch status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditCampaign(null)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all cursor-pointer" style={{ backgroundColor: COLORS.primary }}>
                {submitting ? 'Saving changes...' : 'Save Campaign Details'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* VIEW CAMPAIGN DETAILS MODAL */}
      {viewCampaign && (
        <Modal onClose={() => setViewCampaign(null)}>
          <ModalHeader title="Campaign Objectives Summary" onClose={() => setViewCampaign(null)} />
          <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 no-scrollbar text-sm">
            
            <div className="pb-4 border-b border-gray-100 space-y-1">
              <h3 className="text-xl font-extrabold text-gray-800 leading-tight">{viewCampaign.title}</h3>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  viewCampaign.status === 'Active' ? 'bg-green-100 text-green-700' :
                  viewCampaign.status === 'Planned' ? 'bg-yellow-100 text-yellow-755' :
                  viewCampaign.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-755'
                }`}>
                  {viewCampaign.status} Status
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gray-105 text-gray-600">
                  Goal Achieved: {getPercentage(viewCampaign.raisedAmount, viewCampaign.targetAmount)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider border-b pb-1">Fundraising Agenda</h4>
              <p className="text-gray-700 text-xs font-medium leading-relaxed whitespace-pre-line">{viewCampaign.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Target Goal</p>
                <p className="text-gray-800 font-bold text-sm">{formatCurrency(viewCampaign.targetAmount)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Raised Amount</p>
                <p className="text-green-700 font-extrabold text-sm">{formatCurrency(viewCampaign.raisedAmount)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Start Timeline</p>
                <p className="text-gray-750 font-semibold">{formatDate(viewCampaign.startDate)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">End Timeline</p>
                <p className="text-gray-750 font-semibold">{formatDate(viewCampaign.endDate)}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Branch Office</p>
                <p className="text-gray-750 font-semibold">{viewCampaign.branch?.name || 'Global Operations'}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Created By</p>
                <p className="text-gray-750 font-semibold">{viewCampaign.createdBy?.name || 'Central Admin'}</p>
              </div>
            </div>

          </div>
          <div className="mt-8 flex justify-end gap-3 border-t pt-4">
            <button 
              onClick={() => setViewCampaign(null)} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Close Summary
            </button>
          </div>
        </Modal>
      )}

      {/* RECORD CONTRIBUTION MODAL */}
      {isContribModalOpen && selectedCampaign && (
        <Modal onClose={() => setIsContribModalOpen(false)}>
          <ModalHeader title="Log Campaign Donation" onClose={() => setIsContribModalOpen(false)} />
          <form onSubmit={handleContribSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Full Name *</label>
              <input type="text" required placeholder="Anonymous or Name"
                value={contribForm.donorName} onChange={e => setContribForm(p => ({ ...p, donorName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Email</label>
                <input type="email" placeholder="email@example.com"
                  value={contribForm.donorEmail} onChange={e => setContribForm(p => ({ ...p, donorEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50/50" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Phone</label>
                <input type="text" placeholder="10-digit mobile"
                  value={contribForm.donorPhone} onChange={e => setContribForm(p => ({ ...p, donorPhone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donated Amount *</label>
                <input type="number" required min="1" placeholder="Enter INR value"
                  value={contribForm.amount} onChange={e => setContribForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-50/50 font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method *</label>
                <select value={contribForm.paymentMethod} onChange={e => setContribForm(p => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer font-semibold text-gray-650">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Debit/Credit Card</option>
                  <option value="online">Online Wallet/UPI</option>
                  <option value="other">Other Mode</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Remarks / Notes</label>
              <textarea placeholder="Log reference, transaction details, or comments..."
                value={contribForm.notes} rows={2} onChange={e => setContribForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none focus:border-green-500 bg-gray-55 resize-none" />
            </div>

            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setIsContribModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center justify-center gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Record Donation
              </button>
            </div>

          </form>
        </Modal>
      )}

    </Layout>
  );
};

export default CampaignsList;
