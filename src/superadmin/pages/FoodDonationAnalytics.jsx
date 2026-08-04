import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Utensils, 
  Users, 
  CheckCircle, 
  Building2, 
  RefreshCw,
  Download
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';
import SuperAdminSidebar from '../components/Sidebar';
import SuperAdminNavbar from '../components/Navbar';

const getAuthToken = () => {
  return (
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_member_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

export default function FoodDonationAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    const token = getAuthToken();
    axios
      .get(`${API_BASE_URL}/api/superadmin/food-donations/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) {
          setAnalytics(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <SuperAdminNavbar title="AnnDan Food Donation Analytics" />

        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="text-emerald-600" />
                <span>Superadmin Food Donation Analytics</span>
              </h1>
              <p className="text-xs text-slate-500">Comprehensive impact reporting and organizational donor trends.</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading analytics data...</div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Utensils size={20} />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{analytics.summary.totalDonations}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Donation Requests</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <p className="text-3xl font-black text-emerald-600">{analytics.summary.totalPeopleFed.toLocaleString()}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Beneficiaries Nourished</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-3xl font-black text-purple-600">{analytics.summary.completedCount}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Deliveries</p>
                </div>
              </div>

              {/* Categorical Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Food Type Distribution */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                    Donations by Food Category
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.foodTypeCounts || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-700">{type}</span>
                        <span className="font-extrabold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50">
                          {count} requests
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organization Type Distribution */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                    Donations by Organization Source
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.orgTypeCounts || {}).map(([org, count]) => (
                      <div key={org} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-700">{org}</span>
                        <span className="font-extrabold text-blue-700 px-2.5 py-1 rounded-full bg-blue-50">
                          {count} requests
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
