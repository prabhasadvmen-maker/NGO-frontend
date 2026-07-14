import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/admin/donations`;

const PendingDonations = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPendingDonations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?paymentStatus=pending&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending donations');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchPendingDonations();
  }, [fetchPendingDonations]);

  const handleApprove = async (id) => {
    if (!window.confirm('Verify this donation has been received and mark as completed?')) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: 'completed' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Donation marked as completed!');
        fetchPendingDonations();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/admin/donations')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-800 transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>

        {/* Title */}
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Pending Verification</h1>
          <p className="text-xs text-gray-400 font-bold mt-1">Verify cheque deposits or bank transfers to clear donations</p>
        </div>

        {/* List Card */}
        <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm text-left">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3 font-semibold text-xs tracking-wider uppercase">
              <AlertCircle size={28} />
              <span>No pending donations found requiring verification.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 border-gray-150">
                    {['Donor Name', 'Amount', 'Date', 'Purpose', 'Method', 'Transaction Ref', 'Action'].map((h, i) => (
                      <th key={i} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-450">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-650">
                  {donations.map(donation => (
                    <tr key={donation._id} className="hover:bg-gray-55 transition-colors">
                      <td className="px-5 py-4 font-bold text-gray-800">{donation.donorName}</td>
                      <td className="px-5 py-4 font-black text-gray-800">₹{donation.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-gray-600 font-semibold">
                        {new Date(donation.donationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-600">{donation.purpose}</td>
                      <td className="px-5 py-4 font-semibold text-gray-600 capitalize">{donation.paymentMethod.replace('_', ' ')}</td>
                      <td className="px-5 py-4 font-mono text-xs text-gray-500 font-semibold">
                        {donation.transactionId || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleApprove(donation._id)}
                          disabled={updatingId === donation._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B5E20] hover:opacity-95 text-white rounded-lg font-bold text-xs cursor-pointer border-0 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                        >
                          {updatingId === donation._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Approve Payment
                        </button>
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

export default PendingDonations;
