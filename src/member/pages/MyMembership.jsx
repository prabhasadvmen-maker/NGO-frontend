import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift, Clock, IndianRupee, Check, AlertCircle, Loader2, X,
  ArrowRight, Calendar, User, Phone, Mail
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/membership`;

const MyMembership = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');

  // Fetch current membership
  const fetchMembership = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setMembership(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch membership');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load membership details');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  // Fetch available membership types
  const fetchAvailableTypes = useCallback(async () => {
    if (!token) return;
    setLoadingTypes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/membership-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setAvailableTypes(resData.data.filter(t => t.isActive));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTypes(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMembership();
    fetchAvailableTypes();
  }, [fetchMembership, fetchAvailableTypes]);

  const handleRequestUpgrade = async () => {
    if (!selectedType) {
      toast.error('Please select a membership type');
      return;
    }
    if (!transactionId.trim()) {
      toast.error('Please enter the payment transaction reference ID (UTR)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/request-upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedType: selectedType,
          paymentMode,
          transactionId: transactionId.trim()
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Upgrade request submitted successfully');
        setIsUpgradeOpen(false);
        setSelectedType('');
        setTransactionId('');
        fetchMembership();
      } else {
        toast.error(resData.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin text-[#1B5E20] mx-auto mb-3" size={40} />
            <p className="text-gray-600 font-semibold">Loading membership details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!membership) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="text-red-600 mx-auto mb-3" size={40} />
            <p className="text-gray-800 font-bold">Membership not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Gift className="text-[#1B5E20]" size={28} />
            My Membership
          </h1>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            View your membership details and request upgrades
          </p>
        </div>

        {/* Current Membership Card */}
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
          }}
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Gift className="text-[#1B5E20]" size={24} />
            Current Membership
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Type Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase mb-2">Current Type</p>
              <h3 className="text-3xl font-extrabold text-[#1B5E20] mb-4">
                {membership.currentMembership.type}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <IndianRupee className="text-blue-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Annual Fee</p>
                    <p className="font-bold text-gray-800">₹{membership.currentMembership.fee.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="text-orange-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Validity</p>
                    <p className="font-bold text-gray-800">{membership.currentMembership.validityYears} Year(s)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-green-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Joining Date</p>
                    <p className="font-bold text-gray-800">
                      {new Date(membership.joiningDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase mb-3">Benefits</p>
              <div className="space-y-2">
                {membership.currentMembership.benefits.length > 0 ? (
                  membership.currentMembership.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific benefits listed</p>
                )}
              </div>

              {membership.currentMembership.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{membership.currentMembership.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Status Card */}
        {membership.requestStatus === 'Pending' && membership.requestedMembership && (
          <div
            className="rounded-3xl p-6 md:p-8 border-2 border-yellow-200"
            style={{
              backgroundColor: '#FFFBF0',
              boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
            }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={24} />
              Pending Upgrade Request
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Current */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 font-bold mb-2">Current</p>
                <p className="text-xl font-bold text-gray-800">{membership.currentMembership.type}</p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="text-[#1B5E20]" size={28} />
              </div>

              {/* Requested */}
              <div className="bg-white p-4 rounded-xl border border-[#1B5E20] border-2">
                <p className="text-xs text-gray-500 font-bold mb-2">Requested</p>
                <p className="text-xl font-bold text-[#1B5E20]">{membership.requestedMembership.type}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-semibold">
                ⏳ Your upgrade request is pending admin approval. You'll be notified once it's processed.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Request Card */}
        {membership.requestStatus !== 'Pending' && (
          <div
            className="rounded-3xl p-6 md:p-8"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
            }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ArrowRight className="text-[#1B5E20]" size={24} />
              Upgrade Your Membership
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTypes
                .filter(t => t.name !== membership.currentMembership.type)
                .map(type => (
                  <div
                    key={type._id}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#1B5E20] hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedType(type.name);
                      setIsUpgradeOpen(true);
                    }}
                  >
                    <h3 className="font-bold text-gray-800 mb-2">{type.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <IndianRupee className="text-blue-600" size={16} />
                      <span className="font-bold text-gray-800">₹{type.annualFee.toLocaleString('en-IN')}/year</span>
                    </div>
                    <button className="w-full px-3 py-2 rounded-lg bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#145a1b] transition-all">
                      Request Upgrade
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {isUpgradeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
              className="w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 relative max-h-[85vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: '10px 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <button
                onClick={() => {
                  setIsUpgradeOpen(false);
                  setSelectedType('');
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer bg-white shadow"
              >
                <X size={20} />
              </button>

              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">Confirm Upgrade</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Request to upgrade your membership
                </p>
              </div>

              {selectedType && availableTypes.find(t => t.name === selectedType) && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold mb-2">Current Membership</p>
                    <p className="text-lg font-bold text-gray-800">{membership.currentMembership.type}</p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="text-[#1B5E20]" size={24} />
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#1B5E20] border-2">
                    <p className="text-xs text-gray-500 font-bold mb-2">Requested Membership</p>
                    <p className="text-lg font-bold text-[#1B5E20]">{selectedType}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      ₹{availableTypes.find(t => t.name === selectedType)?.annualFee.toLocaleString('en-IN')}/year
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-left">
                    <p className="text-[11px] text-blue-800 leading-relaxed font-semibold">
                      Please make an offline payment of <strong>₹{availableTypes.find(t => t.name === selectedType)?.annualFee.toLocaleString('en-IN')}</strong> to the NGO's account/UPI, then enter the payment reference below.
                    </p>
                  </div>

                  <div className="space-y-3 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Mode *</label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white cursor-pointer"
                      >
                        <option value="UPI">UPI / GPay / PhonePe</option>
                        <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                        <option value="Cash">Cash to Branch Head</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction Ref / UTR ID *</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter UTR or Reference ID"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsUpgradeOpen(false);
                    setSelectedType('');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestUpgrade}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-[#1B5E20] hover:bg-[#145a1b] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyMembership;
