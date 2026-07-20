import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { COLORS } from '../../shared/colors';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';

import SEOHead from '../../Website/components/SEOHead';

const MemberLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password, 'MEMBER');
      toast.success('Login successful!');
      navigate('/member/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.light }}>
      <SEOHead title="Member Login" noindex={true} />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-20 w-20 mx-auto rounded-full object-cover border-4 mb-4" style={{ borderColor: COLORS.primary }} />
          <h1 className="text-2xl font-bold text-gray-800">Member Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-8" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email" required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password" required
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/member/register" className="font-semibold" style={{ color: COLORS.primary }}>
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberLogin;
