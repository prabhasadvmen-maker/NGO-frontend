import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift, Copy, Check, Loader2, Users, Award, 
  TrendingUp, Clock, HelpCircle, CheckCircle2
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';
import { COLORS, SHADOWS } from '../../shared/colors';

const API_BASE = `${API_BASE_URL}/api/member/activities/referrals`;

const Referral = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferrals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      } else {
        toast.error(resData.message || 'Failed to fetch referral data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load referral details');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleCopyLink = () => {
    if (!data?.referralCode) return;
    const registerUrl = `${window.location.origin}/member/register?ref=${data.referralCode}`;
    navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1 text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Gift className="text-[#1B5E20]" size={28} />
              Referral Program
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Invite friends to join SAVITRAM FOUNDATION and earn reward points on every active registration
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
            <p className="text-sm font-semibold text-gray-500 font-bold">Loading referral details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Invite Card & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Invite Code Box */}
              <div
                className="lg:col-span-2 rounded-3xl p-6 md:p-8 flex flex-col justify-between"
                style={{
                  backgroundColor: '#F5F5F5',
                  boxShadow: SHADOWS.neo
                }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Share Your Referral Link</h3>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    Copy the invitation link below and share it with your friends, colleagues, or family. When they register as a member and their account becomes active, you will be awarded 100 referral points!
                  </p>

                  <div className="flex items-center gap-2 mt-4 bg-white/70 p-3 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-gray-500 select-all truncate flex-1">
                      {window.location.origin}/member/register?ref={data?.referralCode}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-xl bg-[#1B5E20] hover:bg-[#145a1b] text-white cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 font-bold text-xs"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 text-xs font-bold text-gray-400">
                  <Award size={16} className="text-[#1B5E20]" />
                  <span>My Code: </span>
                  <span className="text-gray-700 bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200 uppercase font-black tracking-wider">
                    {data?.referralCode}
                  </span>
                </div>
              </div>

              {/* Stats Box */}
              <div
                className="rounded-3xl p-6 md:p-8 space-y-6"
                style={{
                  backgroundColor: '#F5F5F5',
                  boxShadow: SHADOWS.neo
                }}
              >
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-3">
                  REFERRAL EARNINGS
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-white/60">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-green-700" size={18} />
                      <span className="text-xs text-gray-500 font-bold">Total Points</span>
                    </div>
                    <span className="text-lg font-black text-green-700">{data?.stats?.pointsEarned || 0} pts</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 p-3.5 rounded-2xl border border-white/60">
                      <span className="block text-[10px] text-gray-400 font-black uppercase">Active</span>
                      <span className="text-base font-extrabold text-gray-800">{data?.stats?.activeCount || 0}</span>
                    </div>
                    <div className="bg-white/50 p-3.5 rounded-2xl border border-white/60">
                      <span className="block text-[10px] text-gray-400 font-black uppercase">Pending</span>
                      <span className="text-base font-extrabold text-gray-800">{data?.stats?.pendingCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals List Table */}
            <div
              className="rounded-3xl p-6 md:p-8"
              style={{
                backgroundColor: '#F5F5F5',
                boxShadow: SHADOWS.neo
              }}
            >
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-4 mb-4">
                MY REFERRALS ({data?.referrals?.length || 0})
              </h3>

              {!data?.referrals || data.referrals.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-700">No Referrals Recorded</p>
                    <p className="text-[11px] text-gray-400 mt-1 font-semibold">Share your referral link to build the community</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-250 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                        <th className="px-4 py-3">Photo</th>
                        <th className="px-4 py-3">Member ID</th>
                        <th className="px-4 py-3">Full Name</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Joining Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.referrals.map(referral => (
                        <tr key={referral._id} className="border-b border-gray-100/50 hover:bg-white/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-[#1B5E20]/10 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0 text-xs font-bold text-[#1B5E20]">
                              {referral.photoUrl ? (
                                <img src={referral.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                getInitials(referral.fullName)
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-black text-gray-750 text-xs uppercase tracking-wide">
                            {referral.memberId}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-700">{referral.fullName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              referral.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                              referral.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                              {referral.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-450 font-bold">
                            {new Date(referral.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Referral;
