import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import { useSidebar } from '../../shared/SidebarContext';
import { COLORS } from '../../shared/colors';

const TITLES = {
  '/admin/dashboard':                    'Dashboard',
  '/admin/members':                      'All Members',
  '/admin/members/add':                  'Add Member',
  '/admin/members/pending':              'Pending Members',
  '/admin/members/requests':             'Membership Requests',
  '/admin/donations':                    'All Donations',
  '/admin/donations/add':                'Add Donation',
  '/admin/donations/pending':            'Pending Donations',
  '/admin/donations/receipts':           'Donation Receipts',
  '/admin/beneficiaries':                'All Beneficiaries',
  '/admin/beneficiaries/add':            'Add Beneficiary',
  '/admin/beneficiaries/verification':   'Beneficiary Verification',
  '/admin/volunteers':                   'All Volunteers',
  '/admin/volunteers/add':               'Add Volunteer',
  '/admin/volunteers/applications':      'Volunteer Applications',
  '/admin/volunteers/attendance':        'Attendance',
  '/admin/projects':                     'All Projects',
  '/admin/projects/add':                 'Add Project',
  '/admin/projects/progress':            'Project Progress',
  '/admin/projects/expenses':            'Project Expenses',
  '/admin/events':                       'All Events',
  '/admin/events/create':                'Create Event',
  '/admin/events/registrations':         'Registrations',
  '/admin/events/attendance':            'Attendance',
  '/admin/crowdfunding':                 'Campaigns',
  '/admin/crowdfunding/create':          'Create Campaign',
  '/admin/crowdfunding/contributions':   'Contributions',
  '/admin/certificates/generate':        'Generate Certificate',
  '/admin/certificates':                 'Certificate List',
  '/admin/certificates/verify':          'Verify Certificate',
  '/admin/id-cards/generate':            'Generate ID Card',
  '/admin/id-cards':                     'ID Card List',
  '/admin/finance/income':               'Income',
  '/admin/finance/expenses':             'Expenses',
  '/admin/finance/transactions':         'Transactions',
  '/admin/reports/donations':            'Donation Reports',
  '/admin/reports/members':              'Member Reports',
  '/admin/reports/projects':             'Project Reports',
  '/admin/reports/events':               'Event Reports',
  '/admin/cms/homepage':                 'Homepage',
  '/admin/cms/projects':                 'CMS Projects',
  '/admin/cms/news':                     'News / Blog',
  '/admin/cms/gallery':                  'Gallery',
  '/admin/cms/testimonials':             'Testimonials',
  '/admin/cms/contact':                  'Contact Queries',
  '/admin/communication/email':          'Email',
  '/admin/communication/sms':            'SMS',
  '/admin/communication/whatsapp':       'WhatsApp',
  '/admin/communication/notifications':  'Notifications',
  '/admin/media-library':                'Media Library',
  '/admin/forms/contact':                'Contact Forms',
  '/admin/forms/membership':             'Membership Forms',
  '/admin/forms/volunteer':              'Volunteer Forms',
  '/admin/profile':                      'My Profile',
  '/admin/settings':                     'Settings',
  '/admin/help':                         'Help & Support',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const title = TITLES[location.pathname] || 'Admin Panel';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setTimeout(() => navigate('/admin/login'), 1000);
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
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-gray-700 leading-none">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">{user?.name || 'Admin'}</p>
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
