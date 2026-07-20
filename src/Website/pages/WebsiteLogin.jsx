import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Key, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const WebsiteLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Try all 3 roles in sequence — stops at first success
    const roles = ['SUPERADMIN', 'ADMIN', 'MEMBER'];
    let success = false;
    let userRole = null;

    for (const role of roles) {
      try {
        await login(email, password, role);
        success = true;
        userRole = role;
        break;
      } catch {
        // Try next role
      }
    }

    if (success) {
      // Determine dashboard URL based on role
      let dashboardUrl = '/';
      if (userRole === 'SUPERADMIN') dashboardUrl = '/dashboard';
      else if (userRole === 'ADMIN') dashboardUrl = '/admin/dashboard';
      else if (userRole === 'MEMBER') dashboardUrl = '/member/dashboard';

      // Open dashboard in new tab
      window.open(dashboardUrl, '_blank');
      
      // Keep user on website
      setEmail('');
      setPassword('');
      setError('');
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8F7F4] overflow-x-hidden">
      <SEOHead 
        title="Portal Login" 
        description="Access the SAVITRAM FOUNDATION NGO Management System portals for Super Admins, Branch Admins, and Members." 
        noindex={true}
      />
      <Navbar />

      <div className="flex-1 flex items-center justify-center pt-32 pb-20 px-6">
        <div className="w-full max-w-[420px] rounded-3xl p-8 bg-white border border-gray-100/50 flex flex-col justify-between"
          style={{ boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center mx-auto shadow-inner">
              <LogIn size={24} />
            </div>
            <h2 className="font-display font-black text-2xl text-[#0A1628]">Portal Access</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Savitram NGO System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 text-red-600 border border-red-150 text-xs font-bold leading-normal">
                <AlertCircle className="flex-shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {loading && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 text-green-600 border border-green-150 text-xs font-bold leading-normal">
                <ShieldCheck className="flex-shrink-0" size={16} />
                <span>Opening dashboard in new tab...</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></span>
                <input 
                  type="email" 
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="name@savitram.org"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Key size={16} /></span>
                <input 
                  type="password" 
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-250 bg-transparent text-xs text-gray-800 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-[#1B5E20] text-xs font-extrabold text-white transition-all shadow-md shadow-emerald-800/10 hover:scale-[1.01] hover:brightness-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset feature coming soon. Please contact support at +91 88600 36008');
                }}
                className="text-[10px] font-bold text-[#1B5E20] hover:text-[#0A1628] transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          {/* Secure indicator */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            <ShieldCheck size={14} className="text-[#1B5E20]" />
            <span>Encrypted SSL Secure Session</span>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WebsiteLogin;
