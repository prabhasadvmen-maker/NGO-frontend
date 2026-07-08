import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { COLORS } from '../../shared/colors';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const MemberRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/member/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Registration successful! Please login with your credentials.');
        setTimeout(() => navigate('/member/login'), 2000);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: COLORS.light }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/NGO logo.jpeg" alt="NGO Logo" className="h-20 w-20 mx-auto rounded-full object-cover border-4 mb-4" style={{ borderColor: COLORS.primary }} />
          <h1 className="text-2xl font-bold text-gray-800">Member Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account to access the portal</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-8 space-y-5" style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name *</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName} 
                onChange={handleChange}
                placeholder="Enter your full name" 
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} 
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.fullName}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Mobile Number *</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel" 
                name="mobileNumber"
                value={formData.mobileNumber} 
                onChange={handleChange}
                placeholder="10-digit mobile number" 
                maxLength="10"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} 
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.mobileNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email Address *</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="Enter your email" 
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} 
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Password *</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password} 
                onChange={handleChange}
                placeholder="Min 6 characters" 
                required
                className="w-full pl-12 pr-12 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Confirm Password *</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange}
                placeholder="Re-enter your password" 
                required
                className="w-full pl-12 pr-12 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#fff', boxShadow: 'inset 2px 2px 5px #D0D0D0, inset -2px -2px 5px #FFFFFF' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/member/login" className="font-semibold" style={{ color: COLORS.primary }}>
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberRegister;
