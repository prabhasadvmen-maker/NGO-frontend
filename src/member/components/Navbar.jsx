import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import { useSidebar } from '../../shared/SidebarContext';
import { COLORS } from '../../shared/colors';

const TITLES = {
  '/member/dashboard': 'Dashboard',
  '/member/profile': 'My Profile',
  '/member/membership': 'My Membership',
  '/member/donations': 'My Donations',
  '/member/receipts': 'My Receipts',
  '/member/certificates': 'My Certificates',
  '/member/id-card': 'My ID Card',
  '/member/events': 'My Events',
  '/member/volunteer': 'My Volunteer Activities',
  '/member/projects': 'My Projects',
  '/member/referral': 'Referral Program',
  '/member/notifications': 'Notifications',
  '/member/help': 'Help & Support',
  '/member/settings': 'Settings',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const title = TITLES[location.pathname] || 'Member Portal';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout('MEMBER');
    toast.success('Logged out successfully!');
    setTimeout(() => navigate('/member/login'), 1000);
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b bg-white"
      style={{ borderColor: COLORS.darkShadow }}>
      <div className="flex items-center gap-3">
        <Menu size={20} className="text-gray-500 cursor-pointer hover:text-gray-800 transition-colors" onClick={toggleSidebar} />
        <span className="text-lg font-extrabold text-gray-800">{title}</span>
      </div>

      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(p => !p)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border transition-all cursor-pointer"
          style={{ borderColor: open ? COLORS.primary : 'transparent' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: COLORS.primary }}>
            {(user?.name || 'M').charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-gray-700 leading-none">{user?.name || 'Member'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{user?.memberId || 'Member'}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">{user?.name || 'Member'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
