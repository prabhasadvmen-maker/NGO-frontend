import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Loader2, Award, Briefcase, Calendar, MapPin,
  CheckCircle, Clock, ShieldCheck, Mail, Phone, ArrowRight, Settings
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const API_BASE = `${API_BASE_URL}/api/member/activities`;

const MyVolunteer = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedBranch, setSelectedBranch] = useState('');
  const [availability, setAvailability] = useState('Part-time');
  const [skills, setSkills] = useState([]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  const skillOptions = [
    'Teaching & Education',
    'Healthcare & Medical Support',
    'Fundraising & Events',
    'Social Media & Digital Marketing',
    'Content Writing & Photography',
    'Field Work & Food Distribution',
    'Disaster Management',
    'Administrative & Office Support'
  ];

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/volunteer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setProfile(resData.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/branches`);
      const resData = await res.json();
      if (resData.success) {
        setBranches(resData.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const initData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchBranches()]);
    setLoading(false);
  }, [fetchProfile, fetchBranches]);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleSkillToggle = (skill) => {
    setSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranch) {
      toast.error('Please select an assignment branch');
      return;
    }
    if (skills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/volunteer/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branchId: selectedBranch,
          availability,
          skills,
          address,
          city,
          district,
          state,
          pinCode
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success('Application submitted successfully!');
        fetchProfile();
      } else {
        toast.error(resData.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 bg-[#F5F5F5] min-h-screen p-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Users className="text-[#1B5E20]" size={28} />
              Volunteer Registry
            </h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Apply or manage your active volunteer profiles and branches
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#1B5E20]" size={36} />
            <p className="text-sm font-semibold text-gray-500">Loading volunteering registry...</p>
          </div>
        ) : profile ? (
          /* VOLUNTEER PROFILE CONTAINER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 rounded-3xl p-6 md:p-8 space-y-6 bg-[#F5F5F5]"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-5 gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-800">{profile.fullName}</h3>
                  <p className="text-xs text-gray-400 font-bold tracking-widest mt-1">
                    VOLUNTEER ID: <span className="font-mono text-gray-700 font-black">{profile.volunteerId}</span>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  profile.status === 'Active' ? 'bg-green-100 text-green-700' :
                  profile.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                  'bg-red-100 text-red-655'
                }`}>
                  {profile.status}
                </span>
              </div>

              {/* Badges and Details */}
              <div className="space-y-4 text-left">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Selected Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map(skill => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-white border border-gray-250 text-gray-700 shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Availability</span>
                    <span className="font-extrabold text-gray-700">{profile.availability}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Branch Assignment</span>
                    <span className="font-extrabold text-gray-700">{profile.branch?.name || 'Central Office'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Mobile Contact</span>
                    <span className="font-extrabold text-gray-700">{profile.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold uppercase text-[9px] tracking-wider">Email Address</span>
                    <span className="font-extrabold text-gray-700">{profile.email || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-3xl p-6 md:p-8 bg-[#F5F5F5] flex flex-col items-center justify-center text-center space-y-4"
              style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}
            >
              <div className="p-4 bg-[#1B5E20]/10 rounded-full text-[#1B5E20] border-4 border-white shadow">
                <Award size={36} />
              </div>
              <h4 className="font-extrabold text-gray-800">Volunteering Guidelines</h4>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                As a registered volunteer, you can participate in all upcoming field work campaigns. Make sure to update your contact info in case schedules change.
              </p>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div
            className="rounded-3xl p-6 md:p-8 max-w-3xl mx-auto"
            style={{
              backgroundColor: '#F5F5F5',
              boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF'
            }}
          >
            <div className="border-b pb-4 mb-6">
              <h3 className="text-lg font-black text-gray-800">Become a Volunteer</h3>
              <p className="text-xs text-gray-450 font-semibold mt-1">Apply for social activities in your branch area</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Branch Office *</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Branch Assignment</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Availability *</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white cursor-pointer"
                  >
                    <option value="Part-time">Part-time (Few hours/week)</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Weekends">Weekends Only</option>
                    <option value="Occasional">Occasional / Event-based</option>
                  </select>
                </div>
              </div>

              {/* Skills checklist */}
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Skills & Areas of Interest *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skillOptions.map(skill => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-150 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors select-none text-xs font-bold text-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-gray-300 text-green-700 focus:ring-green-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address details */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Address Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, Landmark, Apartment"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City Name"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State Name"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Postal Code (PIN)</label>
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="6-digit PIN code"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:border-green-700 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#1B5E20] hover:bg-[#145a1b] text-white rounded-xl text-xs font-bold cursor-pointer border-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyVolunteer;
