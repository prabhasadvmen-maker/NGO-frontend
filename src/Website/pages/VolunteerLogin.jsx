import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Key, AlertCircle, CheckCircle, Loader, UserPlus, Clock } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import API_BASE_URL from '../../shared/apiConfig';

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem('savitram_volunteer_token') ||
      localStorage.getItem('savitram_admin_token') ||
      localStorage.getItem('savitram_superadmin_token') ||
      localStorage.getItem('token');
    if (token) {
      navigate('/volunteer/food-donation');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/volunteer/auth/login`, {
        email,
        password,
      });

      if (res.data?.success) {
        localStorage.setItem('savitram_volunteer_token', res.data.token);
        localStorage.setItem('savitram_volunteer_user', JSON.stringify(res.data.user));
        navigate('/volunteer/food-donation');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-emerald-50 to-slate-100 overflow-x-hidden">
      <SEOHead
        title="Volunteer Portal Login | Savitram Foundation"
        description="Login to your volunteer account to access food rescue assignments and track your impact."
        noindex={true}
      />
      <Navbar />

      <div className="flex-1 flex items-center justify-center pt-32 pb-20 px-4">
        <div className="w-full max-w-md">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6 mb-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto shadow-md">
                <LogIn size={32} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Volunteer Portal</h1>
              <p className="text-sm text-slate-500 font-semibold">Access your food rescue assignments</p>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6">
            {error && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${
                error.includes('under review') || error.includes('Pending')
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error.includes('under review') || error.includes('Pending') ? (
                  <Clock size={20} className="flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className="text-sm font-bold block">{error}</span>
                  {(error.includes('under review') || error.includes('Pending')) && (
                    <span className="text-xs font-medium mt-1 block opacity-90">
                      आपका खाता समीक्षा के अंतर्गत है। कृपया अपने शाखा प्रशासक से संपर्क करें।
                    </span>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your registered email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 font-medium">Registered email with Savitram</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? '👁️' : '👁️🗨️'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Default: Last 4 digits of mobile + "Savitram"
                </p>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-4 rounded-2xl bg-[#1B5E20] hover:bg-emerald-800 text-white font-black text-sm transition-all shadow-lg shadow-emerald-800/20 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-black text-[#1B5E20] uppercase tracking-wider">ℹ️ First Time Login?</p>
              <p className="text-xs text-slate-600 font-medium">
                Register as a new volunteer or contact your branch admin to activate your account.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/volunteer/signup')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] font-bold text-xs transition-colors border border-emerald-200"
              >
                <UserPlus size={16} />
                <span>Register as New Volunteer</span>
              </button>

              <p className="text-xs text-slate-500 font-medium text-center">
                Need help?{' '}
                <a
                  href="tel:+918860036008"
                  className="text-[#1B5E20] font-bold hover:underline"
                >
                  Call Support: +91 88600 36008
                </a>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <CheckCircle size={14} className="text-[#1B5E20]" />
            <span>Encrypted SSL Secure Connection</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
