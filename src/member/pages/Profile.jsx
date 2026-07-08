import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';
import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Profile = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

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
        setFormData(data.data);
      } else {
        console.error('Failed to fetch profile:', data.message);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Placeholder - needs backend update endpoint
    setEditing(false);
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <button onClick={() => editing ? handleSave() : setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: editing ? COLORS.success : COLORS.primary }}>
            {editing ? <><Save size={16} /> Save</> : <><Edit2 size={16} /> Edit</>}
          </button>
        </div>

        <div className="rounded-2xl p-6" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="h-24 w-24 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary + '20' }}>
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <User size={40} style={{ color: COLORS.primary }} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile?.fullName}</h2>
              <p className="text-sm text-gray-500">{profile?.memberId}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${profile?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {profile?.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'fullName', label: 'Full Name', icon: User, type: 'text' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email' },
              { key: 'mobileNumber', label: 'Mobile', icon: Phone, type: 'tel' },
              { key: 'dateOfBirth', label: 'Date of Birth', icon: Calendar, type: 'date' },
              { key: 'address', label: 'Address', icon: MapPin, type: 'text' },
              { key: 'state', label: 'State', icon: MapPin, type: 'text' },
              { key: 'district', label: 'District', icon: MapPin, type: 'text' },
              { key: 'pinCode', label: 'Pin Code', icon: MapPin, type: 'text' },
              { key: 'occupation', label: 'Occupation', icon: User, type: 'text' },
              { key: 'gender', label: 'Gender', icon: User, type: 'text' },
            ].map(({ key, label, icon: Icon, type }) => (
              <div key={key} className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary + '10' }}>
                  <Icon size={18} style={{ color: COLORS.primary }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                  {editing ? (
                    <input type={type} value={formData[key] || ''} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2"
                      style={{ focusRingColor: COLORS.primary }} />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-gray-800">{profile?.[key] || '—'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ProfileBasic = () => {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (token) fetchProfile(); }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/member/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data) setProfile(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primary }} />;

  return <Profile profile={profile} />;
};

export default Profile;
