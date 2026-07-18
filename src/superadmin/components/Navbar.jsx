import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../shared/ToastContext';
import { useAuth } from '../../shared/AuthContext';
import { COLORS } from '../../shared/colors';
import { LogOut, Menu } from 'lucide-react';
import { useSidebar } from '../../shared/SidebarContext';

const ROUTE_TITLES = {
  '/dashboard':        'Overview',
  '/org/profile':      'NGO Profile',
  '/org/branches':     'Branches',
  '/org/departments':  'Departments',
  '/users/admins':     'Admins',
  '/users/members':    'Members',
  '/users/volunteers': 'Volunteers',
  '/users/beneficiaries': 'Beneficiaries',
  '/donations':        'Donations',
  '/dashboard/projects': 'Projects',
  '/dashboard/events':   'Events',
  '/dashboard/crowdfunding': 'Crowdfunding',
  '/certificates':     'Certificates',
  '/id-cards':         'ID Cards',
  '/finance':          'Finance',
  '/reports':          'Reports',
  '/website-cms':      'Website CMS',
  '/communication':    'Communication',
  '/media-library':    'Media Library',
  '/forms':            'Forms',
  '/audit-logs':       'Audit Logs',
  '/settings':         'System Settings',
  '/backup':           'Backup & Restore',
  '/api-integrations': 'API & Integrations',
  '/ai-center':        'AI Center',
  '/profile':          'My Profile',
  '/help':             'Help & Support',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pageTitle = ROUTE_TITLES[location.pathname] || 'Dashboard';

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    toast.success('Logged out successfully!');
    setTimeout(() => navigate('/superadmin/login'), 1500);
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 md:px-8 border-b"
      style={{ backgroundColor: COLORS.light, borderColor: COLORS.darkShadow }}>

      <div className="flex items-center gap-3">
        <Menu size={20} className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" onClick={toggleSidebar} />
        <span className="text-xl font-bold text-gray-800">{pageTitle}</span>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex flex-col items-end justify-center px-5 py-2 rounded-xl transition-all duration-300 bg-gray-100 hover:bg-gray-200 border cursor-pointer"
          style={{ borderColor: isDropdownOpen ? COLORS.primary : 'transparent' }}>
          <span className="text-sm font-semibold text-gray-700">{user?.email || 'superadmin@gmail.com'}</span>
          <span className="text-xs text-gray-500 font-medium leading-none mt-1">Super Admin</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50"
            style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: COLORS.darkShadow }}>
              <p className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{user?.name || 'Super Admin'}</p>
              <p className="text-xs" style={{ color: COLORS.textLight }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              style={{ color: COLORS.error }}>
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
