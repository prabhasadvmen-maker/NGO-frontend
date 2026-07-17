import React, { useState, useEffect } from 'react';
import { 
  User, CreditCard, Heart, Calendar, Award, 
  Clock, CheckCircle, Shield, Activity, Gift 
} from 'lucide-react';
import Layout from '../components/Layout';
import StatsCard from '../../shared/components/StatsCard';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';
import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Dashboard = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, donationsRes, certificatesRes] = await Promise.all([
        fetch(`${API}/member/auth/me`, { headers }),
        fetch(`${API}/member/activities/donations`, { headers }),
        fetch(`${API}/member/activities/certificates`, { headers })
      ]);

      const profileData = await profileRes.json();
      const donationsData = await donationsRes.json();
      const certificatesData = await certificatesRes.json();

      if (profileData.success && profileData.data) {
        setProfile(profileData.data);
      }
      
      let fetchedDonations = [];
      if (donationsData.success && donationsData.data) {
        setDonations(donationsData.data);
        fetchedDonations = donationsData.data;
      }

      let fetchedCertificates = [];
      if (certificatesData.success && certificatesData.data) {
        setCertificates(certificatesData.data);
        fetchedCertificates = certificatesData.data;
      }

      // Combine donations and certificates into a chronological activity feed
      const feed = [
        ...fetchedDonations.map(d => ({
          id: d._id,
          type: 'donation',
          date: d.donationDate || d.createdAt,
          title: `Made donation of ₹${d.amount.toLocaleString('en-IN')}`,
          subtext: `Purpose: ${d.purpose || 'General support'} • Via ${d.paymentMethod || 'Cash'}`,
          status: d.paymentStatus,
          icon: Gift,
          color: '#E91E63',
          bg: '#E91E6312'
        })),
        ...fetchedCertificates.map(c => ({
          id: c._id,
          type: 'certificate',
          date: c.issueDate || c.createdAt,
          title: `Earned Certificate`,
          subtext: `"${c.certificateType || 'NGO Membership Certificate'}" Issued`,
          status: 'Issued',
          icon: Award,
          color: '#2196F3',
          bg: '#2196F312'
        }))
      ];

      // Sort by date descending
      feed.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivityFeed(feed.slice(0, 5)); // top 5 activities

    } catch (err) {
      console.error('Fetch member dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // Compute stats
  const totalDonationsSum = donations.reduce((sum, d) => sum + (d.paymentStatus === 'completed' ? d.amount : 0), 0);
  const totalCertificatesCount = certificates.length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Welcome, {profile?.fullName || user?.name || 'Member'}!</h1>
            <p className="text-sm text-gray-400 font-semibold mt-1">{getFormattedDate()}</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-800 border border-green-150 rounded-xl px-4 py-2 text-xs font-bold shadow-sm self-start">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="capitalize">Membership status: {profile?.status || 'Active'}</span>
          </div>
        </div>

        {/* Dynamic metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={User} label="Member ID" value={profile?.memberId || 'N/A'} color={COLORS.primary} subtext="Your unique portal ID" />
          <StatsCard icon={CreditCard} label="Membership Type" value={profile?.membershipType || 'Standard'} color={COLORS.secondary} subtext={profile?.status || 'Active'} />
          <StatsCard icon={Heart} label="Total Contributions" value={`₹${totalDonationsSum.toLocaleString('en-IN')}`} color="#E91E63" subtext="total donations made" />
          <StatsCard icon={Award} label="Certificates Earned" value={`${totalCertificatesCount}`} color="#2196F3" subtext="accredited certificates" />
        </div>

        {/* Dynamic Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Member activity log timeline */}
          <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-gray-100 flex flex-col"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-800">Your Activity History</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Timeline of your contributions & achievements</p>
              </div>
              <Activity size={18} className="text-gray-400" />
            </div>

            {activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 flex-1">
                <Activity size={32} className="opacity-20 mb-2 animate-bounce-slow" />
                <p className="text-sm font-semibold">No recent activity logs.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 pl-6 ml-3 space-y-6 flex-1">
                {activityFeed.map((act) => {
                  const ActIcon = act.icon;
                  return (
                    <div key={act.id} className="relative group">
                      {/* Badge Icon */}
                      <span className="absolute -left-[37px] top-0.5 rounded-full p-1.5 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: act.bg, color: act.color, border: '2px solid #FFF' }}>
                        <ActIcon size={12} />
                      </span>
                      
                      {/* Log Card */}
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 tracking-tight">{act.title}</h4>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">{act.subtext}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 self-start xs:self-center">
                          <span className="text-[9px] font-bold text-gray-400">{formatDate(act.date)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                            act.status === 'completed' || act.status === 'Issued'
                              ? 'bg-green-50 text-green-700 border border-green-150' 
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                          }`}>
                            {act.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl p-6 bg-white border border-gray-100 flex flex-col justify-between"
            style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div>
              <div className="pb-4 border-b border-gray-100 mb-5">
                <h3 className="text-base font-bold text-gray-800">Quick Portal Actions</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Navigate member tools</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'View Profile', path: '/member/profile', icon: User, color: COLORS.primary },
                  { label: 'My Donations', path: '/member/donations', icon: Heart, color: '#E91E63' },
                  { label: 'Events List', path: '/member/events', icon: Calendar, color: '#2196F3' },
                  { label: 'Certificates', path: '/member/certificates', icon: Award, color: '#9C27B0' },
                ].map(({ label, path, icon: Icon, color }) => (
                  <a key={path} href={path} 
                    className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-gray-100 transition-all hover:scale-[1.03] cursor-pointer hover:shadow-sm" 
                    style={{ boxShadow: '4px 4px 8px #EBEBEB, -4px -4px 8px #FFFFFF' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-50 shadow-sm">
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Support Box */}
            <div className="mt-6 p-4 rounded-xl bg-green-50/40 border border-green-100/50 flex items-center gap-3">
              <div className="p-2 bg-[#1B5E20]/10 rounded-lg text-[#1B5E20]">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#1B5E20]">Need Assistance?</p>
                <p className="text-[9px] text-[#1b5e20]/80 font-semibold mt-0.5">Contact NGO Support via the Help section.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Profile Summary */}
        <div className="rounded-2xl p-6 bg-white border border-gray-100"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Membership Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/40">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Full Legal Name</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{profile?.fullName || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/40">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Registered Email Address</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{profile?.email || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/40">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Primary Phone Number</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{profile?.mobileNumber || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/40">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Membership Level</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{profile?.membershipType || '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/40">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Joined Date</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{profile?.joiningDate ? formatDate(profile.joiningDate) : '—'}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/40 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Account Status</p>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold ${profile?.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-yellow-50 text-yellow-700 border border-yellow-150'}`}>
                  {profile?.status || 'Pending'}
                </span>
              </div>
              <CheckCircle size={16} className={profile?.status === 'Active' ? 'text-green-500' : 'text-yellow-500'} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
