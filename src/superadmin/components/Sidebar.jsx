import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, Building2, GitBranch, Layers,
  ShieldCheck, Users, UserCheck, Heart, HandHeart,
  DollarSign, FolderKanban, CalendarDays, Megaphone,
  Award, CreditCard, Wallet, BarChart3, Globe, MessageSquare,
  Image, FileText, ClipboardList, Settings, Database,
  Plug, Bot, User, HelpCircle, ChevronDown, ChevronRight, Gift
} from 'lucide-react';
import { COLORS } from '../../shared/colors';
import { useSidebar } from '../../shared/SidebarContext';
import { useAuth } from '../../shared/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [{ path: '/dashboard', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    label: 'Organization',
    items: [
      { path: '/org/profile',           label: 'NGO Profile',       icon: Building2 },
      { path: '/org/branches',          label: 'Branches',          icon: GitBranch },
      { path: '/org/departments',       label: 'Departments',       icon: Layers },
      { path: '/org/membership-types',  label: 'Membership Types',  icon: Users },
    ],
  },
  {
    label: 'Users',
    items: [
      { path: '/users/admins',        label: 'Admins',        icon: ShieldCheck },
      { path: '/users/members',       label: 'Members',       icon: Users },
      { path: '/users/volunteers',    label: 'Volunteers',    icon: UserCheck },
      { path: '/users/beneficiaries', label: 'Beneficiaries', icon: Heart },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/donations',              label: 'Donations',    icon: HandHeart },
      { path: '/dashboard/projects',     label: 'Projects',     icon: FolderKanban },
      { path: '/dashboard/events',       label: 'Events',       icon: CalendarDays },
      { path: '/dashboard/crowdfunding', label: 'Crowdfunding', icon: Megaphone },
    ],
  },
  {
    label: 'Documents',
    items: [
      { path: '/certificates', label: 'Certificates', icon: Award },
      { path: '/id-cards',     label: 'ID Cards',     icon: CreditCard },
    ],
  },
  {
    label: 'Finance & Reports',
    items: [
      { path: '/finance', label: 'Finance', icon: Wallet },
      { path: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/website-cms',   label: 'Website CMS',   icon: Globe },
      { path: '/communication', label: 'Communication', icon: MessageSquare },
      { path: '/media-library', label: 'Media Library', icon: Image },
      { path: '/forms',         label: 'Forms',         icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/audit-logs',       label: 'Audit Logs',        icon: ClipboardList },
      { path: '/settings',         label: 'System Settings',   icon: Settings },
      { path: '/backup',           label: 'Backup & Restore',  icon: Database },
      { path: '/api-integrations', label: 'API & Integrations',icon: Plug },
      { path: '/ai-center',        label: 'AI Center',         icon: Bot },
    ],
  },
];

const Sidebar = () => {
  const { isCollapsed, isMobileOpen, setIsMobileOpen, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    NAV_GROUPS.forEach(g => {
      initial[g.label] = g.items.some(item => location.pathname === item.path);
    });
    if (!NAV_GROUPS.some(g => g.items.some(item => location.pathname === item.path))) {
      initial['Dashboard'] = true;
    }
    return initial;
  });

  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isCollapsed) return;
    setOpenGroups(prev => {
      const next = {};
      let matched = false;
      NAV_GROUPS.forEach(g => {
        const hasActive = g.items.some(item => location.pathname === item.path);
        next[g.label] = hasActive;
        if (hasActive) matched = true;
      });
      if (!matched) return prev;
      return next;
    });
  }, [location.pathname, isCollapsed]);

  const isActive = (path) => location.pathname === path;

  const toggleGroup = (label) => {
    if (isCollapsed) return;
    setOpenGroups(prev => {
      const next = {};
      const wasOpen = prev[label];
      NAV_GROUPS.forEach(g => { next[g.label] = g.label === label ? !wasOpen : false; });
      return next;
    });
  };

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

        {/* Logo */}
        <div className={`flex items-center p-4 mt-3 mb-2 ${isCollapsed ? 'justify-center' : 'gap-3 px-5'}`}>
          <img src="/NGO logo.jpeg" alt="NGO Logo"
            className="h-10 w-10 rounded-full object-cover border-2 flex-shrink-0"
            style={{ borderColor: COLORS.accent }} />
          {!isCollapsed && (
            <div className="text-left">
              <h1 className="text-lg font-bold leading-none text-white tracking-wide">SAVITRAM FOUNDATION</h1>
              <p className="text-[10px] text-white/70 mt-1">NGO Management</p>
            </div>
          )}
        </div>

        <hr className="border-white/20 mx-4 mb-3" />

        {/* Scrollable Nav */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-2 px-3 no-scrollbar" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              {!isCollapsed && (
                <button onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100/70">{group.label}</span>
                  {openGroups[group.label]
                    ? <ChevronDown size={14} className="text-emerald-100/70" />
                    : <ChevronRight size={14} className="text-emerald-100/70" />}
                </button>
              )}

              {(isCollapsed || openGroups[group.label]) && (
                <div className={`space-y-1 ${isCollapsed ? 'px-1 mt-1' : 'pl-4 pr-1 mt-1 border-l border-white/10 ml-4'}`}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link key={item.path} to={item.path}
                        ref={active ? activeRef : null}
                        onClick={() => setIsMobileOpen(false)}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}`}
                        style={{ backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        {!isCollapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}

              {isCollapsed && <div className="my-1.5 mx-1 border-t border-white/10" />}
            </div>
          ))}
        </div>

        <hr className="border-white/20 mx-4 mt-2" />

        {/* Bottom: Profile, Settings, Help */}
        <div className="p-3 space-y-1 flex-shrink-0">
          {[
            { path: '/profile',  label: 'Profile',  icon: User },
            { path: '/settings', label: 'Settings', icon: Settings },
            { path: '/help',     label: 'Help',     icon: HelpCircle },
          ].map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`flex items-center rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
              style={{ backgroundColor: isActive(path) ? 'rgba(255,255,255,0.18)' : 'transparent', color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.85)' }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span className="text-sm font-semibold">{label}</span>}
            </Link>
          ))}
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
