import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader } from 'lucide-react';
import { useToast } from '../../shared/ToastContext';
import { useAuth } from '../../shared/AuthContext';
import { COLORS } from '../../shared/colors';

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password, 'SUPERADMIN');
      if (loggedUser.role !== 'super_admin') {
        toast.error('Access denied. Super Admin only.');
        setLoading(false);
        return;
      }
      toast.success('Login successful!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 100);
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.light }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-20 w-20 mx-auto mb-4 rounded-full object-cover" />
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Advmen NGO</h1>
          <p className="text-gray-600 mt-2">Super Admin Portal</p>
        </div>

        <div className="rounded-3xl p-8" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>Email Address</label>
              <div className="flex items-center rounded-2xl px-4 py-3" style={{ backgroundColor: COLORS.light, boxShadow: errors.email ? `inset 2px 2px 4px #D0D0D0, inset -2px -2px 4px #FFFFFF, 0 0 0 2px ${COLORS.error}` : 'inset 4px 4px 8px #D0D0D0, inset -4px -4px 8px #FFFFFF' }}>
                <Mail size={18} style={{ color: COLORS.primary }} className="mr-3" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="superadmin@gmail.com"
                  className="flex-1 bg-transparent outline-none text-sm" style={{ color: COLORS.textPrimary }} />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: COLORS.error }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textPrimary }}>Password</label>
              <div className="flex items-center rounded-2xl px-4 py-3" style={{ backgroundColor: COLORS.light, boxShadow: errors.password ? `inset 2px 2px 4px #D0D0D0, inset -2px -2px 4px #FFFFFF, 0 0 0 2px ${COLORS.error}` : 'inset 4px 4px 8px #D0D0D0, inset -4px -4px 8px #FFFFFF' }}>
                <Lock size={18} style={{ color: COLORS.primary }} className="mr-3" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-sm" style={{ color: COLORS.textPrimary }} />
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: COLORS.error }}>{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 mt-6"
              style={{ backgroundColor: COLORS.primary, boxShadow: loading ? '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF' : '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
              {loading ? <><Loader size={18} className="animate-spin" /> Logging in...</> : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: COLORS.textLight }}>Super Admin Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
