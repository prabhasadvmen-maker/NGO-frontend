import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandHeart, ArrowLeft, Loader2, Save } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';
import { COLORS } from '../../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/admin/donations`;
const BRANCH_API = `${API_BASE_URL}/api/branches`;

const AddDonation = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    donorName: 'Anonymous',
    donorEmail: '',
    donorPhone: '',
    amount: '',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    transactionId: '',
    purpose: 'General',
    branch: '',
    notes: '',
    donationDate: new Date().toISOString().split('T')[0]
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
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast.error('Donation amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Donation recorded successfully');
        navigate('/admin/donations');
      } else {
        toast.error(data.message || 'Failed to save donation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error saving donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/admin/donations')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-800 transition-colors cursor-pointer border-0 bg-transparent"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <HandHeart className="text-green-800" size={32} />
            Record Donation
          </h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">Record a new donation transaction on behalf of a donor</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Donor Name *</label>
              <input
                type="text"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Donor Email</label>
                <input
                  type="email"
                  name="donorEmail"
                  value={formData.donorEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Donor Phone</label>
                <input
                  type="text"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Amount (INR) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Donation Date</label>
                <input
                  type="date"
                  name="donationDate"
                  value={formData.donationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Payment Method *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online Payment</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Payment Status *</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                >
                  <option value="completed">Completed (Verified)</option>
                  <option value="pending">Pending Verification</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Campaign / Purpose *</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                >
                  <option value="General">General Fund</option>
                  <option value="Education">Education</option>
                  <option value="Medical">Medical Aid</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">NGO Branch Association</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 bg-transparent cursor-pointer"
                >
                  <option value="">No Branch Association</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Transaction Reference ID (e.g. UPI Ref, Cheque No.)</label>
              <input
                type="text"
                name="transactionId"
                placeholder="UPI, cheque number, or bank deposit reference ID"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">Private Notes / Remarks</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 transition-colors bg-gray-50/50 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/admin/donations')}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 cursor-pointer bg-white transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer shadow-sm flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: COLORS.primary }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddDonation;
