import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, Mail, Key, AlertCircle, CheckCircle, Loader, Upload, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import API_BASE_URL from '../../shared/apiConfig';

export default function VolunteerSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    branch: '',
    availability: 'Part-time',
    skills: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });

  // Fetch branches on mount from public endpoint
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/public/branches`);
        if (res.data?.success) {
          setBranches(res.data.data || []);
        } else {
          setError('Failed to load branches');
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Unable to load branches. Please refresh the page.');
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      setError('Valid 10-digit mobile number is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Valid email address is required');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.branch) {
      setError('Please select an NGO branch');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('skills', formData.skills);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('pinCode', formData.pinCode);
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      const res = await axios.post(`${API_BASE_URL}/api/volunteer/auth/signup`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccess('Signup successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/volunteer/login');
        }, 2000);
      } else {
        setError(res.data?.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Error during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-emerald-50 to-slate-100 overflow-x-hidden">
      <SEOHead
        title="Volunteer Registration | Savitram Foundation"
        description="Register as a volunteer with Savitram Foundation to help with food rescue and community service."
        noindex={true}
      />
      <Navbar />

      <div className="flex-1 flex items-center justify-center pt-36 pb-16 px-4">
        <div className="w-full max-w-2xl">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shadow-md">
                <UserPlus size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Volunteer Registration</h1>
                <p className="text-sm text-slate-500 font-semibold">Join our food rescue mission</p>
              </div>
            </div>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border-2 border-green-200 text-green-700">
                <CheckCircle size={20} className="flex-shrink-0" />
                <span className="text-sm font-bold">{success}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Profile Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200" />
                  )}
                  <label className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1B5E20] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Upload size={18} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">Choose Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)
                    }))}
                    disabled={loading}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  NGO Branch Assignment *
                </label>
                {branchesLoading ? (
                  <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500 flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Loading branches...</span>
                  </div>
                ) : (
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    disabled={loading || branches.length === 0}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all bg-white"
                  >
                    <option value="">
                      {branches.length === 0 ? 'No branches available' : 'Select Branch'}
                    </option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name} - {branch.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Availability *
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Occasional">Occasional</option>
                </select>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="e.g. Teaching, Fundraising, First Aid, Media"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Street address"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  District / City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="State"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Pin Code */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pinCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                  }))}
                  disabled={loading}
                  placeholder="6-digit pin code"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || branchesLoading}
                className="w-full py-4 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-black text-sm transition-all shadow-lg shadow-emerald-800/20 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Register as Volunteer</span>
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/volunteer/login')}
                    className="text-[#1B5E20] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
