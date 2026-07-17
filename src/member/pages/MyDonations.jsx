import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, Search, Loader2, IndianRupee, Calendar, TrendingUp,
  Download, ArrowRight, Filter, FileText
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/activities`;

const MyDonations = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('All');

  const fetchDonations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setDonations(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch donations');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Calculations
  const totalContributed = donations
    .filter(d => d.paymentStatus === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const donationCount = donations.filter(d => d.paymentStatus === 'completed').length;

  const averageDonation = donationCount > 0 ? Math.round(totalContributed / donationCount) : 0;

  // Filter logic
  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
      d.purpose?.toLowerCase().includes(search.toLowerCase()) ||
      d.transactionId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesPurpose = purposeFilter === 'All' || d.purpose?.includes(purposeFilter);

    return matchesSearch && matchesPurpose;
  });

  const uniquePurposes = ['All', ...new Set(donations.map(d => d.purpose).filter(Boolean))];

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Heart className="text-red-500 fill-red-500" size={28} />
              My Contributions
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Track and manage all your donations and support certificates
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="rounded-3xl p-6 flex items-center gap-4 bg-[#F5F5F5]"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <div className="p-4 rounded-2xl bg-red-50 text-red-500">
              <IndianRupee size={24} />
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Donated</span>
              <span className="text-2xl font-black text-gray-800">
                ₹{totalContributed.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div
            className="rounded-3xl p-6 flex items-center gap-4 bg-[#F5F5F5]"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Transactions</span>
              <span className="text-2xl font-black text-gray-800">{donationCount}</span>
            </div>
          </div>

          <div
            className="rounded-3xl p-6 flex items-center gap-4 bg-[#F5F5F5]"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
          >
            <div className="p-4 rounded-2xl bg-purple-50 text-purple-500">
              <Heart size={24} />
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Average Contribution</span>
              <span className="text-2xl font-black text-gray-800">
                ₹{averageDonation.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Table container */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          {/* Filtering Header */}
          <div className="mb-6 border-b border-gray-200 pb-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={16} className="text-[#1B5E20]" /> Donation Ledger ({filteredDonations.length})
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center min-w-[200px]">
                  <Search className="absolute left-3.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search receipt, purpose, UTR..."
                    className="pl-10 rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all w-full"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Filter size={14} className="text-gray-400" />
                  <select
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-gray-50 px-3 py-2 text-xs transition-all cursor-pointer font-bold text-gray-600"
                  >
                    {uniquePurposes.map(purpose => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
              <p className="text-sm font-semibold text-gray-500">Loading donation list...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Heart size={32} />
              </div>
              <div>
                <p className="text-base font-extrabold text-gray-800">No Donations Recorded</p>
                <p className="text-xs text-gray-400 mt-1">Get started by participating in our campaigns</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">UTR / Ref</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation, idx) => (
                    <tr key={donation._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-gray-800 text-xs">{donation.receiptNumber || '—'}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-700 truncate max-w-[180px]">{donation.purpose}</td>
                      <td className="px-4 py-3.5 font-extrabold text-[#1B5E20]">₹{donation.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-gray-500 font-bold text-xs uppercase">{donation.paymentMethod || 'cash'}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-500 select-all">{donation.transactionId || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          donation.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' :
                          donation.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-650'
                        }`}>
                          {donation.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 font-semibold text-xs">
                        {new Date(donation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyDonations;
