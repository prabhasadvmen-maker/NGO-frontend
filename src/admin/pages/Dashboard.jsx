import React, { useState, useEffect } from 'react';
import { 
  Users, HandHeart, FolderKanban, CalendarDays, Heart, 
  UserCheck, TrendingUp, Clock, Plus, Activity, Mail, Phone, Calendar 
} from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../../shared/components/StatsCard';
import { useAuth } from '../../shared/AuthContext';
import { COLORS } from '../../shared/colors';
import API_BASE_URL from '../../shared/apiConfig';

const QuickLink = ({ icon: Icon, label, path, color }) => (
  <a href={path}
    className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer hover:shadow-md bg-white border border-gray-50"
    style={{ boxShadow: '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF' }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse-slow" style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <span className="text-sm font-bold text-gray-700">{label}</span>
  </a>
);

const Dashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ members: 0, donations: 0, projects: 0, events: 0, volunteers: 0, beneficiaries: 0 });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) {
      const fetchDashboardData = async () => {
        try {
          const [statsRes, membersRes, donationsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, { headers }),
            fetch(`${API_BASE_URL}/api/admin/members?page=1&limit=5`, { headers }),
            fetch(`${API_BASE_URL}/api/admin/donations?page=1&limit=5`, { headers })
          ]);

          const statsData = await statsRes.json();
          const membersData = await membersRes.json();
          const donationsData = await donationsRes.json();

          if (statsData.success) setStats(statsData.data);
          if (membersData.success && membersData.data) setRecentMembers(membersData.data);
          if (donationsData.success && donationsData.data) setRecentDonations(donationsData.data);
        } catch (e) {
          console.error('Error fetching admin dashboard data:', e);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [token]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const statCards = [
    { icon: Users,        label: 'Total Members',   value: stats.members,       color: COLORS.primary, subtext: 'registered members' },
    { icon: HandHeart,    label: 'Total Donations',  value: stats.donations ? `₹${stats.donations.toLocaleString('en-IN')}` : '₹0', color: '#E91E63', subtext: 'collected so far' },
    { icon: FolderKanban, label: 'Active Projects',  value: stats.projects,      color: '#FF9800',      subtext: 'ongoing projects' },
    { icon: CalendarDays, label: 'Upcoming Events',  value: stats.events,        color: '#2196F3',      subtext: 'scheduled events' },
    { icon: UserCheck,    label: 'Volunteers',       value: stats.volunteers,    color: '#9C27B0',      subtext: 'active volunteers' },
    { icon: Heart,        label: 'Beneficiaries',    value: stats.beneficiaries, color: '#F44336',      subtext: 'being served' },
  ];

  const quickLinks = [
    { icon: Users,        label: 'Add Member',     path: '/admin/members/add',      color: COLORS.primary },
    { icon: HandHeart,    label: 'Add Donation',    path: '/admin/donations',        color: '#E91E63' },
    { icon: FolderKanban, label: 'Add Project',     path: '/admin/projects/add',     color: '#FF9800' },
    { icon: CalendarDays, label: 'Create Event',    path: '/admin/events/create',    color: '#2196F3' },
    { icon: UserCheck,    label: 'Add Volunteer',   path: '/admin/volunteers/add',   color: '#9C27B0' },
    { icon: TrendingUp,   label: 'View Reports',    path: '/admin/reports/donations',color: '#4CAF50' },
    { icon: Clock,        label: 'Pending Members', path: '/admin/members/pending',  color: '#FF5722' },
    { icon: Heart,        label: 'Add Beneficiary', path: '/admin/beneficiaries/add',color: '#F44336' },
  ];

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }} />
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          {/* Header Greeting */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <p className="text-sm text-gray-400 font-semibold mt-1">{getFormattedDate()}</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl px-4 py-2 text-xs font-bold shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Branch Connected</span>
            </div>
          </div>

          {/* Core metrics grid */}
          <div>
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Overview Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((s, i) => <StatsCard key={i} {...s} />)}
            </div>
          </div>

          {/* Quick links actions */}
          <div>
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Management Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickLinks.map((q, i) => <QuickLink key={i} {...q} />)}
            </div>
          </div>

          {/* Dynamic Recent Activity (Donations & Member Registrations) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Donations Table */}
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">Recent Donations</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Latest Contributions to Branch</p>
                </div>
                <HandHeart size={18} className="text-pink-500 animate-pulse-slow" />
              </div>

              {recentDonations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <HandHeart size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-semibold">No donations recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/20">
                        {['Donor', 'Amount', 'Purpose', 'Date', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentDonations.map(d => (
                        <tr key={d._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors border-gray-50">
                          <td className="px-5 py-3 font-bold text-gray-800 text-xs">{d.donorName}</td>
                          <td className="px-5 py-3 text-xs font-extrabold text-emerald-700">₹{d.amount.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-xs text-gray-500 font-semibold">{d.purpose}</td>
                          <td className="px-5 py-3 text-xs text-gray-400 font-semibold">{formatDate(d.donationDate)}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${d.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-yellow-50 text-yellow-700 border border-yellow-150'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${d.paymentStatus === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                              {d.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Members Table */}
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 flex flex-col"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">Recent Member Sign-ups</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Newly Onboarded Branch Members</p>
                </div>
                <Users size={18} className="text-blue-500" />
              </div>

              {recentMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Users size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-semibold">No members onboarded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/20">
                        {['Member Name', 'Membership Type', 'Email', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentMembers.map(m => (
                        <tr key={m._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors border-gray-50">
                          <td className="px-5 py-3 font-bold text-gray-800 text-xs">{m.fullName}</td>
                          <td className="px-5 py-3 text-xs text-gray-500 font-semibold">{m.membershipType}</td>
                          <td className="px-5 py-3 text-xs text-gray-400 font-medium">{m.email}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${m.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-yellow-50 text-yellow-700 border border-yellow-150'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                              {m.status}
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

          {/* Admin Profile Summary Row */}
          <div className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-[#1B5E20] to-[#2E7D32]"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0 shadow-inner">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="text-white text-center md:text-left">
                <p className="font-extrabold text-xl tracking-tight">{user?.name || 'Admin User'}</p>
                <p className="text-white/85 text-xs mt-1 font-semibold flex items-center justify-center md:justify-start gap-1">
                  Logged in as a <span className="underline decoration-2 underline-offset-2 capitalize">{user?.role?.replace('_', ' ')}</span>
                </p>
                <p className="text-white/60 text-[11px] mt-1">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row items-center gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-xl text-center">
                <p className="text-[10px] text-white/70 font-bold uppercase">Assigned Projects</p>
                <p className="text-white font-extrabold text-base mt-0.5">{stats.projects}</p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-center">
                <p className="text-[10px] text-white/70 font-bold uppercase">Assigned Events</p>
                <p className="text-white font-extrabold text-base mt-0.5">{stats.events}</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
