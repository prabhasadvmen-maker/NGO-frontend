import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, User, CreditCard, Heart, FileText, Award, CreditCard as IdCard, Calendar, HandHeart, FolderKanban, Gift, Bell, HelpCircle, Settings } from 'lucide-react';
import { COLORS } from '../../shared/colors';
import { useSidebar } from '../../shared/SidebarContext';

const NAV_ITEMS = [
  { path: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/member/membership', label: 'My Membership', icon: CreditCard },
  { path: '/member/donations', label: 'My Donations', icon: Heart },
  { path: '/member/receipts', label: 'My Receipts', icon: FileText },
  { path: '/member/certificates', label: 'My Certificates', icon: Award },
  { path: '/member/id-card', label: 'My ID Card', icon: IdCard },
  { path: '/member/events', label: 'My Events', icon: Calendar },
  { path: '/member/volunteer', label: 'My Volunteer Activities', icon: HandHeart },
  { path: '/member/projects', label: 'My Projects', icon: FolderKanban },
  { path: '/member/referral', label: 'Referral Program', icon: Gift },
  { path: '/member/notifications', label: 'Notifications', icon: Bell },
];

const BOTTOM_ITEMS = [
  { path: '/member/profile', label: 'My Profile', icon: User },
  { path: '/member/help', label: 'Help', icon: HelpCircle },
  { path: '/member/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { isCollapsed, isMobileOpen, setIsMobileOpen, toggleSidebar } = useSidebar();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg cursor-pointer"
        style={{ backgroundColor: COLORS.primary, color: '#fff' }}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ backgroundColor: COLORS.sidebarBg }}>

        <div className={`flex items-center p-4 mt-3 mb-2 ${isCollapsed ? 'justify-center' : 'gap-3 px-5'}`}>
          <img src="/NGO logo.jpeg" alt="NGO Logo"
            className="h-10 w-10 rounded-full object-cover border-2 flex-shrink-0"
            style={{ borderColor: COLORS.accent }} />
          {!isCollapsed && (
            <div className="text-left">
              <h1 className="text-lg font-bold leading-none text-white tracking-wide">Member</h1>
              <p className="text-[10px] text-white/70 mt-1">Savitram Foundation Portal</p>
            </div>
          )}
        </div>

        <hr className="border-white/20 mx-4 mb-3" />

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
                  style={{ backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <hr className="border-white/20 mx-4 mb-3" />

        <div className="p-3 space-y-1">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
