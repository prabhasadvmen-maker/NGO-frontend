import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, DollarSign, Plus, Eye, Loader2, Search, Heart } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/campaigns`;

const CampaignsList = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    completedCount: 0,
    totalTarget: 0,
    totalRaised: 0
  });

  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [myCampaignsOnly, setMyCampaignsOnly] = useState('false');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Log contribution Modal
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [submittingContrib, setSubmittingContrib] = useState(false);
  const [contribForm, setContribForm] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const fetchCampaigns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : '';
      const mineParam = `&myCampaignsOnly=${myCampaignsOnly}`;
      
      const url = `${API_BASE}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${statusParam}${mineParam}`;
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
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, myCampaignsOnly, toast]);

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
    fetchCampaigns();
    fetchStats();
  }, [fetchCampaigns, fetchStats]);

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
    setSubmittingContrib(true);
    try {
      const res = await fetch(`${API_BASE}/${selectedCampaign._id}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
      setSubmittingContrib(false);
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
              Fundraising Campaigns
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Participate in NGO crowdfunding drives and register donor contributions</p>
          </div>
          <button
            onClick={() => navigate('/admin/crowdfunding/create')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700"
          >
            <Plus size={18} />
            Create Campaign
          </button>
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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
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
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
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
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
            >
              <option value="false">All Active NGO Drives</option>
              <option value="true">Created by Me Only</option>
            </select>
          </div>
        </div>

        {/* Campaigns list */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No fundraising drives active.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Campaign details', 'Launch Date', 'Target Funding', 'Raised Amount', 'Funding Progress', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, idx) => {
                    const progress = Math.min(Math.round((c.raisedAmount / c.targetAmount) * 100), 100);

                    return (
                      <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                        <td className="px-4 py-4 text-gray-500 font-medium">{(page - 1) * limit + idx + 1}</td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <div>
                            <p className="font-bold text-gray-800 truncate">{c.title}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{c.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-600">
                          {new Date(c.startDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-700 text-xs">
                          ₹{c.targetAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4 font-extrabold text-green-700">
                          ₹{c.raisedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4 max-w-[150px]">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-700">{progress}% Funded</span>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all" 
                                style={{ 
                                  width: `${progress}%`,
                                  backgroundColor: progress >= 100 ? '#4CAF50' : COLORS.primary
                                }} 
                              />
                            </div>
                          </div>
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
                        <td className="px-4 py-4 text-xs font-bold space-x-2">
                          <button
                            onClick={() => handleOpenContribModal(c)}
                            disabled={c.status === 'Completed' || c.status === 'Suspended'}
                            className="px-2.5 py-1.5 rounded-lg border-0 bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Log Donation
                          </button>
                          
                          <button
                            onClick={() => navigate(`/admin/crowdfunding/contributions?campaign=${c._id}`)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold bg-white cursor-pointer"
                          >
                            Contributors
                          </button>
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

      {/* Log Contribution Modal */}
      {isContribModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Record Campaign Donation</h3>
                <p className="text-xs text-gray-400 mt-0.5">Campaign: {selectedCampaign.title}</p>
              </div>
              <button onClick={() => setIsContribModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleContribSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Anonymous or Name"
                  value={contribForm.donorName}
                  onChange={(e) => setContribForm(p => ({ ...p, donorName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={contribForm.donorEmail}
                    onChange={(e) => setContribForm(p => ({ ...p, donorEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Donor Mobile</label>
                  <input
                    type="text"
                    placeholder="10 digit number"
                    value={contribForm.donorPhone}
                    onChange={(e) => setContribForm(p => ({ ...p, donorPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 5000"
                    value={contribForm.amount}
                    onChange={(e) => setContribForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method *</label>
                  <select
                    value={contribForm.paymentMethod}
                    onChange={(e) => setContribForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold"
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online / UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Audit Notes / Comments</label>
                <textarea
                  placeholder="Record transaction IDs or deposit slips audit details..."
                  value={contribForm.notes}
                  rows={2}
                  onChange={(e) => setContribForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsContribModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContrib}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-green-700 hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submittingContrib && <Loader2 size={14} className="animate-spin" />}
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CampaignsList;
