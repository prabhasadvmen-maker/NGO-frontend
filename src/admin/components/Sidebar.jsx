import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Clock, ClipboardList,
  HandHeart, PlusCircle, Receipt, Heart, UserCheck, CalendarCheck,
  FolderKanban, TrendingUp, DollarSign, CalendarDays, Ticket,
  Megaphone, Award, CreditCard, ArrowUpCircle, ArrowDownCircle,
  ArrowLeftRight, BarChart3, Globe, Home, Newspaper, Image, MessageSquare,
  Mail, Phone, MessageCircle, Bell, FileText, User, Settings, HelpCircle,
  ChevronDown, ChevronRight, Menu, X
} from 'lucide-react';
import { COLORS } from '../../shared/colors';
import { useSidebar } from '../../shared/SidebarContext';
import { useAuth } from '../../shared/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Dashboard', icon: LayoutDashboard,
    items: [{ path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Members', icon: Users,
    items: [
      { path: '/admin/members',          label: 'All Members',         icon: Users },
      { path: '/admin/members/add',      label: 'Add Member',          icon: UserPlus },
      { path: '/admin/members/approval', label: 'Member Approval',     icon: UserCheck },
      { path: '/admin/members/requests', label: 'Membership Requests', icon: ClipboardList },
    ],
  },
  {
    label: 'Donations', icon: HandHeart,
    items: [
      { path: '/admin/donations',          label: 'All Donations',     icon: HandHeart },
      { path: '/admin/donations/add',      label: 'Add Donation',      icon: PlusCircle },
      { path: '/admin/donations/pending',  label: 'Pending Donations', icon: Clock },
      { path: '/admin/donations/receipts', label: 'Donation Receipts', icon: Receipt },
    ],
  },
  {
    label: 'Beneficiaries', icon: Heart,
    items: [
      { path: '/admin/beneficiaries',              label: 'All Beneficiaries',        icon: Heart },
      { path: '/admin/beneficiaries/add',          label: 'Add Beneficiary',          icon: UserPlus },
      { path: '/admin/beneficiaries/verification', label: 'Beneficiary Verification', icon: UserCheck },
    ],
  },
  {
    label: 'Volunteers', icon: UserCheck,
    items: [
      { path: '/admin/volunteers',              label: 'All Volunteers',        icon: Users },
      { path: '/admin/volunteers/add',          label: 'Add Volunteer',         icon: UserPlus },
      { path: '/admin/volunteers/applications', label: 'Volunteer Applications',icon: ClipboardList },
      { path: '/admin/volunteers/attendance',   label: 'Attendance',            icon: CalendarCheck },
    ],
  },
  {
    label: 'Projects', icon: FolderKanban,
    items: [
      { path: '/admin/projects',          label: 'All Projects',    icon: FolderKanban },
      { path: '/admin/projects/add',      label: 'Add Project',     icon: PlusCircle },
      { path: '/admin/projects/progress', label: 'Project Progress',icon: TrendingUp },
      { path: '/admin/projects/expenses', label: 'Project Expenses',icon: DollarSign },
    ],
  },
  {
    label: 'Events', icon: CalendarDays,
    items: [
      { path: '/admin/events',               label: 'All Events',    icon: CalendarDays },
      { path: '/admin/events/create',        label: 'Create Event',  icon: PlusCircle },
      { path: '/admin/events/registrations', label: 'Registrations', icon: Ticket },
      { path: '/admin/events/attendance',    label: 'Attendance',    icon: CalendarCheck },
    ],
  },
  {
    label: 'Crowdfunding', icon: Megaphone,
    items: [
      { path: '/admin/crowdfunding',               label: 'Campaigns',       icon: Megaphone },
      { path: '/admin/crowdfunding/create',        label: 'Create Campaign', icon: PlusCircle },
      { path: '/admin/crowdfunding/contributions', label: 'Contributions',   icon: HandHeart },
    ],
  },
  {
    label: 'Certificates', icon: Award,
    items: [
      { path: '/admin/certificates/generate', label: 'Generate Certificate', icon: Award },
      { path: '/admin/certificates',          label: 'Certificate List',     icon: ClipboardList },
      { path: '/admin/certificates/verify',   label: 'Verify Certificate',   icon: UserCheck },
    ],
  },
  {
    label: 'ID Cards', icon: CreditCard,
    items: [
      { path: '/admin/id-cards/generate', label: 'Generate ID Card', icon: CreditCard },
      { path: '/admin/id-cards',          label: 'ID Card List',     icon: ClipboardList },
    ],
  },
  {
    label: 'Finance', icon: ArrowLeftRight,
    items: [
      { path: '/admin/finance/income',       label: 'Income',       icon: ArrowUpCircle },
      { path: '/admin/finance/expenses',     label: 'Expenses',     icon: ArrowDownCircle },
      { path: '/admin/finance/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Reports', icon: BarChart3,
    items: [
      { path: '/admin/reports/donations', label: 'Donation Reports', icon: BarChart3 },
      { path: '/admin/reports/members',   label: 'Member Reports',   icon: BarChart3 },
      { path: '/admin/reports/projects',  label: 'Project Reports',  icon: BarChart3 },
      { path: '/admin/reports/events',    label: 'Event Reports',    icon: BarChart3 },
    ],
  },
  {
    label: 'Website CMS', icon: Globe,
    items: [
      { path: '/admin/cms/homepage',     label: 'Homepage',        icon: Home },
      { path: '/admin/cms/projects',     label: 'Projects',        icon: FolderKanban },
      { path: '/admin/cms/news',         label: 'News / Blog',     icon: Newspaper },
      { path: '/admin/cms/gallery',      label: 'Gallery',         icon: Image },
      { path: '/admin/cms/testimonials', label: 'Testimonials',    icon: MessageSquare },
      { path: '/admin/cms/contact',      label: 'Contact Queries', icon: Mail },
    ],
  },
  {
    label: 'Communication', icon: MessageCircle,
    items: [
      { path: '/admin/communication/email',         label: 'Email',         icon: Mail },
      { path: '/admin/communication/sms',           label: 'SMS',           icon: Phone },
      { path: '/admin/communication/whatsapp',      label: 'WhatsApp',      icon: MessageCircle },
      { path: '/admin/communication/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Media Library', icon: Image,
    items: [{ path: '/admin/media-library', label: 'Media Library', icon: Image }],
  },
  {
    label: 'Forms', icon: FileText,
    items: [
      { path: '/admin/forms/contact',    label: 'Contact Forms',    icon: FileText },
      { path: '/admin/forms/membership', label: 'Membership Forms', icon: FileText },
      { path: '/admin/forms/volunteer',  label: 'Volunteer Forms',  icon: FileText },
    ],
  },
];

const Sidebar = () => {
  const { isCollapsed, isMobileOpen, setIsMobileOpen, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    NAV_GROUPS.forEach(g => { init[g.label] = g.items.some(i => location.pathname === i.path); });
    if (!NAV_GROUPS.some(g => g.items.some(i => location.pathname === i.path))) init['Dashboard'] = true;
    return init;
  });

  useEffect(() => {
    if (isCollapsed) return;
    setOpenGroups(prev => {
      const next = {};
      let matched = false;
      NAV_GROUPS.forEach(g => {
        const hasActive = g.items.some(i => location.pathname === i.path);
        next[g.label] = hasActive;
        if (hasActive) matched = true;
      });
      if (!matched) return prev;
      return next;
    });
  }, [location.pathname, isCollapsed]);

  const isActive = (path) => location.pathname === path;

  // Single-open accordion logic: collapse others when one group is clicked
  const toggleGroup = (label) => {
    if (isCollapsed) return;
    setOpenGroups(prev => {
      const next = {};
      const wasOpen = prev[label];
      NAV_GROUPS.forEach(g => {
        next[g.label] = g.label === label ? !wasOpen : false;
      });
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
              <h1 className="text-lg font-bold leading-none text-white tracking-wide">Advmen</h1>
              <p className="text-[10px] text-white/70 mt-1">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Admin badge */}
        {!isCollapsed && (
          <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(user?.name || 'Anil').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Anil kumar singh'}</p>
              <p className="text-[10px] text-white/50 truncate">{user?.email || 'prabhas.advmen@gmail.com'}</p>
            </div>
          </div>
        )}

        <hr className="border-white/20 mx-4 mb-3" />

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3" style={{ scrollbarWidth: 'none' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              {!isCollapsed && (
                <button onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    {React.createElement(group.icon, { size: 14, className: 'text-emerald-100/70' })}
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100/70">{group.label}</span>
                  </div>
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
                        onClick={() => setIsMobileOpen(false)}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}`}
                        style={{
                          backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                          color: active ? '#fff' : 'rgba(255,255,255,0.85)',
                        }}>
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
        <div className="p-3 space-y-1">
          {[
            { path: '/admin/profile',  label: 'Profile',  icon: User },
            { path: '/admin/settings', label: 'Settings', icon: Settings },
            { path: '/admin/help',     label: 'Help',     icon: HelpCircle },
          ].map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`flex items-center rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
              style={{
                backgroundColor: isActive(path) ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.85)',
              }}>
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
