import React, { useState, useEffect } from 'react';
import { Users, HandHeart, FolderKanban, CalendarDays, Heart, UserCheck, TrendingUp, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { COLORS } from '../../shared/colors';

const API = 'http://localhost:5000/api';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    style={{ backgroundColor: '#fff', boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      {subtext && <p className="text-[10px] text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const QuickLink = ({ icon: Icon, label, path, color }) => (
  <a href={path}
    className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
    style={{ backgroundColor: '#fff', boxShadow: '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF' }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
  </a>
);

const Dashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ members: 0, donations: 0, projects: 0, events: 0, volunteers: 0, beneficiaries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchStats = async () => {
        try {
          const res = await fetch(`${API}/admin/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setStats(data.data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
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

  const statCards = [
    { icon: Users,        label: 'Total Members',   value: stats.members,       color: COLORS.primary, subtext: 'registered members' },
    { icon: HandHeart,    label: 'Total Donations',  value: stats.donations,     color: '#E91E63',      subtext: 'collected so far' },
    { icon: FolderKanban, label: 'Active Projects',  value: stats.projects,      color: '#FF9800',      subtext: 'ongoing projects' },
    { icon: CalendarDays, label: 'Upcoming Events',  value: stats.events,        color: '#2196F3',      subtext: 'scheduled events' },
    { icon: UserCheck,    label: 'Volunteers',       value: stats.volunteers,    color: '#9C27B0',      subtext: 'active volunteers' },
    { icon: Heart,        label: 'Beneficiaries',    value: stats.beneficiaries, color: '#F44336',      subtext: 'being served' },
  ];

  const quickLinks = [
    { icon: Users,        label: 'Add Member',     path: '/admin/members/add',      color: COLORS.primary },
    { icon: HandHeart,    label: 'Add Donation',    path: '/admin/donations/add',    color: '#E91E63' },
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
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }} />
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{getFormattedDate()}</p>
          </div>

          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {statCards.map((s, i) => <StatCard key={i} {...s} />)}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickLinks.map((q, i) => <QuickLink key={i} {...q} />)}
            </div>
          </div>

          <div className="rounded-2xl p-6 flex items-center gap-5" style={{ backgroundColor: COLORS.primary }}>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-extrabold text-lg">{user?.name || 'Admin'}</p>
              <p className="text-white/70 text-sm mt-0.5">You are logged in as <span className="font-bold text-white capitalize">{user?.role?.replace('_', ' ')}</span></p>
              <p className="text-white/50 text-xs mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
