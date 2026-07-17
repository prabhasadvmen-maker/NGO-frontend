import React, { useState, useEffect } from 'react';
import { Building2, Users, IndianRupee, Heart } from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../../shared/components/StatsCard';
import { COLORS } from '../../shared/colors';
import { useSidebar } from '../../shared/SidebarContext';
import { useAuth } from '../../shared/AuthContext';

import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const getLast6Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }
  return months;
};

const BarChart = ({ title, data, color, maxValue }) => (
  <div className="rounded-2xl p-6 flex flex-col h-full"
    style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-400 font-medium">Last 6 months</p>
      </div>
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">Monthly</span>
    </div>
    <div className="flex-1 flex items-end justify-between h-48 px-2">
      {data.map((item, idx) => {
        const heightPercent = maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%';
        return (
          <div key={idx} className="flex flex-col items-center flex-1 group">
            <span className="text-xs font-bold mb-1.5 h-4 transition-all duration-300 opacity-80 group-hover:opacity-100" style={{ color }}>
              {item.value > 0 ? item.value : ''}
            </span>
            <div className="w-8 sm:w-10 rounded-t-lg transition-all duration-500"
              style={{ height: heightPercent, backgroundColor: color, minHeight: item.value > 0 ? '4px' : '0' }} />
            <span className="text-xs font-semibold text-gray-400 mt-2">{item.month}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { 
    if (token) fetchAll(); 
  }, [token]);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/auth/dashboard/stats`, { headers }),
        fetch(`${API}/admins`, { headers }),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setRecentUsers(usersData.data.slice(0, 5));
      buildChartData(usersData.success ? usersData.data : []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildChartData = (users) => {
    const months = getLast6Months();
    const now = new Date();
    const userCounts = months.map((month, i) => {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const count = users.filter(u => {
        const d = new Date(u.createdAt);
        return d.getFullYear() === targetMonth.getFullYear() && d.getMonth() === targetMonth.getMonth();
      }).length;
      return { month, value: count };
    });
    setChartData({ userCounts });
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const months = getLast6Months();
  const emptyChart = months.map(m => ({ month: m, value: 0 }));

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }} />
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Overview</h1>
            <p className="text-sm text-gray-400 font-semibold mt-1">{getFormattedDate()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Building2} label="Total NGOs"        value={stats?.totalNGOs ?? 0}                                          color={COLORS.primary}   subtext="registered NGOs" />
            <StatsCard icon={Users}     label="Total Users"       value={stats?.totalUsers ?? 0}                                         color={COLORS.secondary} subtext="all roles" />
            <StatsCard icon={IndianRupee} label="Total Donations"   value={stats?.totalDonations ? `₹${(stats.totalDonations/100000).toFixed(1)}L` : '₹0'} color={COLORS.accent} subtext="total collected" />
            <StatsCard icon={Heart}     label="Active Volunteers" value={stats?.activeVolunteers ?? 0}                                   color={COLORS.info}      subtext="currently active" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart title="User Registrations" data={chartData?.userCounts ?? emptyChart} color={COLORS.primary}    maxValue={Math.max(...(chartData?.userCounts ?? emptyChart).map(d => d.value), 1)} />
            <BarChart title="NGO Onboarding"     data={emptyChart}                          color={COLORS.secondary}  maxValue={1} />
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: '#E0E0E0' }}>
              <h3 className="text-base font-bold text-gray-800">Recent Registrations</h3>
            </div>
            {recentUsers.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm font-medium">No registrations yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#F0F0F0' }}>
                      {['Name', 'Role', 'Email', 'Joined', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F5F5F5' }}>
                        <td className="px-5 py-3 font-semibold text-gray-800">{u.name}</td>
                        <td className="px-5 py-3 text-gray-500 capitalize">{u.role.replace('_', ' ')}</td>
                        <td className="px-5 py-3 text-gray-500">{u.email}</td>
                        <td className="px-5 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
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
    </Layout>
  );
};

export default Dashboard;
