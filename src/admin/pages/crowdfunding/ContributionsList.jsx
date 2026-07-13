import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DollarSign, Search, ArrowLeft, Loader2, Heart, Plus } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/campaigns`;

const ContributionsList = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');

  const [allCampaigns, setAllCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignId || '');
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Log contribution Form State
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
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
    try {
      const res = await fetch(`${API_BASE}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllCampaigns(data.data);
        if (!selectedCampaignId && data.data.length > 0) {
          setSelectedCampaignId(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, selectedCampaignId]);

  const fetchContributions = useCallback(async (cId = selectedCampaignId, searchQ = search) => {
    if (!token || !cId) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/${cId}/contributions?search=${encodeURIComponent(searchQ)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setContributions(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contributions list');
    } finally {
      setLoading(false);
    }
  }, [token, selectedCampaignId, search, toast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchContributions(selectedCampaignId, search);
    }
  }, [selectedCampaignId, search, fetchContributions]);

  const handleOpenContribModal = () => {
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
    if (!selectedCampaignId) return;
    setSubmittingContrib(true);
    try {
      const res = await fetch(`${API_BASE}/${selectedCampaignId}/contributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contribForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contribution recorded successfully!');
        setIsContribModalOpen(false);
        fetchContributions();
      } else {
        toast.error(data.message || 'Failed to record contribution');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error recording payment');
    } finally {
      setSubmittingContrib(false);
    }
  };

  const getCampaignTitle = () => {
    const matched = allCampaigns.find(c => c._id === selectedCampaignId);
    return matched ? matched.title : 'Selected Campaign';
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <button
          onClick={() => navigate('/admin/crowdfunding')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <DollarSign size={26} className="text-green-700" />
              Contributions Log
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Audit trail of crowdfunding campaign contributions and micro-donations</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Select Drive:</span>
              <select
                value={selectedCampaignId}
                onChange={(e) => { setSelectedCampaignId(e.target.value); }}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer font-bold max-w-xs"
              >
                {allCampaigns.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleOpenContribModal}
              disabled={!selectedCampaignId}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed border-0 cursor-pointer bg-green-700 text-xs"
            >
              <Plus size={14} /> Record Payment
            </button>
          </div>
        </div>

        {/* Filter search */}
        <div 
          className="rounded-2xl p-5 bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search donor name, email or receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table list */}
        <div 
          className="rounded-2xl overflow-hidden bg-white" 
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-700" size={32} />
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-semibold text-sm">No donations logged for {getCampaignTitle()}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#E0E0E0' }}>
                    {['#', 'Receipt Number', 'Donor Detail', 'Donated Date', 'Payment Method', 'Audit Status', 'Amount'].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contr, idx) => (
                    <tr key={contr._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                      <td className="px-4 py-4 text-gray-500 font-medium">{idx + 1}</td>
                      <td className="px-4 py-4 font-bold text-gray-800">{contr.receiptNumber}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-gray-800">{contr.donorName}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{contr.donorEmail || 'Offline Walk-in'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-400">
                        {new Date(contr.donationDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-4 py-4 font-bold text-xs text-gray-600 uppercase">
                        {contr.paymentMethod}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          contr.paymentStatus === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          contr.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-705 border border-yellow-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {contr.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-extrabold text-sm text-green-700 text-right pr-6">
                        ₹{contr.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Contribution Modal */}
      {isContribModalOpen && selectedCampaignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Record Campaign Donation</h3>
                <p className="text-xs text-gray-400 mt-0.5">Campaign: {getCampaignTitle()}</p>
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
                    placeholder="e.g. 10000"
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
                  placeholder="Slips, transaction reference IDs or details..."
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
                  Discard
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

export default ContributionsList;
