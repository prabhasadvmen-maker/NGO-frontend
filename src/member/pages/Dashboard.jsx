import React, { useState, useEffect } from 'react';
import { User, CreditCard, Heart, Calendar, Award } from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../../shared/components/StatsCard';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';
import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Dashboard = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/member/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      } else {
        console.error('Failed to fetch profile:', data.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Welcome, {profile?.fullName || user?.name || 'Member'}!</h1>
          <p className="text-sm text-gray-400 font-semibold mt-1">{getFormattedDate()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={User} label="Member ID" value={profile?.memberId || 'N/A'} color={COLORS.primary} subtext="Your unique ID" />
          <StatsCard icon={CreditCard} label="Membership" value={profile?.membershipType || 'Standard'} color={COLORS.secondary} subtext={profile?.status || 'Active'} />
          <StatsCard icon={Heart} label="Donations" value="₹0" color={COLORS.accent} subtext="Total contributed" />
          <StatsCard icon={Award} label="Certificates" value="0" color={COLORS.info} subtext="Earned" />
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'View Profile', path: '/member/profile', icon: User },
              { label: 'My Donations', path: '/member/donations', icon: Heart },
              { label: 'Events', path: '/member/events', icon: Calendar },
              { label: 'Certificates', path: '/member/certificates', icon: Award },
            ].map(({ label, path, icon: Icon }) => (
              <a key={path} href={path} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer" style={{ boxShadow: '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF' }}>
                <Icon size={24} style={{ color: COLORS.primary }} />
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white">
              <p className="text-xs text-gray-400 font-semibold uppercase">Full Name</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{profile?.fullName || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white">
              <p className="text-xs text-gray-400 font-semibold uppercase">Email</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{profile?.email || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white">
              <p className="text-xs text-gray-400 font-semibold uppercase">Mobile</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{profile?.mobileNumber || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white">
              <p className="text-xs text-gray-400 font-semibold uppercase">Membership Type</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{profile?.membershipType || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white">
              <p className="text-xs text-gray-400 font-semibold uppercase">Joining Date</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN') : '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-white">
              <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${profile?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {profile?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
