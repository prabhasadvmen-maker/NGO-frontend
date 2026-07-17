import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Loader2, ShieldAlert } from 'lucide-react';
import Layout from '../components/Layout';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API = `${API_BASE_URL}/api`;

const Profile = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        toast.error(data.message || 'Failed to fetch profile details');
      }
    } catch (err) {
      toast.error('Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/member/auth/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData(data.data);
        setEditing(false);
        toast.success('Your profile details have been updated');
      } else {
        toast.error(data.message || 'Failed to save updates');
      }
    } catch (err) {
      toast.error('Failed to submit updates');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-green-700" size={32} />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Profile Details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <User className="text-[#1B5E20]" size={28} />
              My Profile
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">Manage and update your personal registry details</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData(profile);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 bg-white transition-all cursor-pointer shadow-sm"
                >
                  <X size={15} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-green-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Save Details
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold transition-all hover:opacity-90 cursor-pointer shadow-sm border-0 bg-[#1B5E20]"
              >
                <Edit2 size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Top Info Banner */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="h-20 w-20 rounded-full flex items-center justify-center relative overflow-hidden bg-green-50 border-2 border-green-700 flex-shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User size={36} className="text-green-750" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-gray-800">{profile?.fullName || 'Active Member'}</h2>
              <p className="text-xs font-bold font-mono text-gray-400">ID: {profile?.memberId || 'N/A'}</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                profile?.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {profile?.status || 'Pending Verification'}
              </span>
            </div>
          </div>

          {/* Fields Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <User size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
                {editing ? (
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-50/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.fullName || '—'}</p>
                )}
              </div>
            </div>

            {/* Email Address (Always read-only for security) */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <Mail size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address (Read Only)</label>
                <p className="text-sm font-bold text-gray-700 truncate">{profile?.email || '—'}</p>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <Phone size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number *</label>
                {editing ? (
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber || ''}
                    onChange={(e) => setFormData(p => ({ ...p, mobileNumber: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.mobileNumber || '—'}</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <Calendar size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date of Birth</label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                    onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{formatDate(profile?.dateOfBirth)}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <User size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                {editing ? (
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.gender || '—'}</p>
                )}
              </div>
            </div>

            {/* Occupation */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <User size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Occupation</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData(p => ({ ...p, occupation: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.occupation || '—'}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-3 md:col-span-2">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <MapPin size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Street Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.address || '—'}</p>
                )}
              </div>
            </div>

            {/* District */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <MapPin size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">District</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.district || '—'}</p>
                )}
              </div>
            </div>

            {/* State */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <MapPin size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">State</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.state || '—'}</p>
                )}
              </div>
            </div>

            {/* Pin Code */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <MapPin size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pin Code</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.pinCode || ''}
                    onChange={(e) => setFormData(p => ({ ...p, pinCode: e.target.value }))}
                    className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-green-500 bg-gray-55/50"
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-700">{profile?.pinCode || '—'}</p>
                )}
              </div>
            </div>

            {/* Join Date info */}
            <div className="flex gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 h-10 w-10 flex items-center justify-center text-green-700">
                <Calendar size={18} />
              </div>
              <div className="flex-1 space-y-1 text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registry Join Date</label>
                <p className="text-sm font-bold text-gray-700">{formatDate(profile?.joiningDate)}</p>
              </div>
            </div>

          </div>

          {/* Security Alert info */}
          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex items-start gap-3">
            <ShieldAlert size={18} className="text-green-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-700">Database Registration Security Notice</p>
              <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                To edit security credentials (such as your registered email address or tier upgrades), please coordinate with your assigned branch head or submit an inquiry using the support panel.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;
