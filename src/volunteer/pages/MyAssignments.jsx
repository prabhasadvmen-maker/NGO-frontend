import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, Clock, Utensils, RefreshCw, AlertCircle, Loader, LogOut } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../Website/components/Navbar';
import Footer from '../../Website/components/Footer';
import SEOHead from '../../Website/components/SEOHead';
import API_BASE_URL from '../../shared/apiConfig';
import DonationCard from '../components/DonationCard';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_volunteer_token') ||
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

export default function MyAssignments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'history'
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [volunteerInfo, setVolunteerInfo] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('savitram_volunteer_user');
    if (userStr) {
      try {
        setVolunteerInfo(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing volunteer info:', e);
      }
    }
  }, []);

  const fetchMyAssignments = () => {
    setLoading(true);
    setError('');
    const token = getAuthToken();

    axios
      .get(`${API_BASE_URL}/api/volunteer/food-donations/my-assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          setAssignments(res.data.data || []);
        } else {
          setError(res.data?.message || 'Failed to load your assignments.');
        }
      })
      .catch((err) => {
        console.error('Error fetching my assignments:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('savitram_volunteer_token');
          navigate('/volunteer/login');
        }
        setError(err.response?.data?.message || 'Error connecting to backend server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const activeDonations = assignments.filter((d) => d.status === 'Assigned' || d.status === 'Collected');
  const completedDonations = assignments.filter((d) => d.status === 'Distributed' || d.status === 'Completed');
  const historyDonations = assignments;

  const getTabDonations = () => {
    if (activeTab === 'active') return activeDonations;
    if (activeTab === 'completed') return completedDonations;
    return historyDonations;
  };

  const currentList = getTabDonations();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/volunteer/login';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SEOHead title="My Food Rescue Assignments | Volunteer Portal" />
      <Navbar />

      <main className="flex-grow pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {volunteerInfo?.profilePhotoUrl || volunteerInfo?.profilePhoto ? (
                  <img
                    src={volunteerInfo.profilePhotoUrl || volunteerInfo.profilePhoto}
                    alt={volunteerInfo?.fullName || volunteerInfo?.name || 'Volunteer'}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center font-black text-xl shadow-md">
                    {(volunteerInfo?.fullName || volunteerInfo?.name || 'V').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active Rescue Volunteer" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Food Rescue Assignments</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1B5E20] font-extrabold text-[10px] uppercase tracking-wider">
                    {volunteerInfo?.fullName || volunteerInfo?.name || 'Volunteer'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap font-medium">
                  {volunteerInfo?.email && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                      ✉️ {volunteerInfo.email}
                    </span>
                  )}
                  {(volunteerInfo?.mobileNumber || volunteerInfo?.mobile) && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                      📞 {volunteerInfo.mobileNumber || volunteerInfo.mobile}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={() => navigate('/volunteer/food-donation')}
              className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-[#1B5E20] font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Utensils size={15} />
              <span>Available Requests</span>
            </button>
            <button
              onClick={fetchMyAssignments}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck size={15} />
            <span>Active Pickups ({activeDonations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle size={15} />
            <span>Completed ({completedDonations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock size={15} />
            <span>All History ({historyDonations.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader size={36} className="animate-spin text-[#1B5E20] mx-auto" />
            <p className="text-sm font-black text-slate-600">Loading your assignments...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-800 flex items-center justify-center mx-auto">
              <Truck size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {activeTab === 'active'
                ? 'No Active Assignments'
                : activeTab === 'completed'
                ? 'No Completed Rescue Missions Yet'
                : 'No Assignment History Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {activeTab === 'active'
                ? 'Check the Available Requests tab to accept surplus food donations in your city.'
                : 'Once you collect and distribute food donations, your completed missions will show here.'}
            </p>
            <button
              onClick={() => navigate('/volunteer/food-donation')}
              className="px-6 py-3 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-extrabold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Utensils size={15} />
              <span>Browse Available Requests</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onCollect={(d) => navigate(`/volunteer/food-donation/${d._id}/collect`)}
                onDistribute={(d) => navigate(`/volunteer/food-donation/${d._id}/distribute`)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
