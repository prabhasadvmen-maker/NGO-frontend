import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';
import SuperAdminLogin from '../auth/SuperAdminLogin';
import Dashboard from '../pages/Dashboard';
import Admins from '../pages/Admins';
import MembershipTypes from '../pages/MembershipTypes';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Help from '../pages/Help';
import ComingSoon from '../pages/ComingSoon';
import NGOProfile from '../pages/NGOProfile';
import Branches from '../pages/Branches';
import Departments from '../pages/Departments';
import Members from '../pages/Members';
import Volunteers from '../pages/Volunteers';
import Beneficiaries from '../pages/Beneficiaries';
import Donations from '../pages/Donations';
import Projects from '../pages/Projects';
import Events from '../pages/Events';
import Crowdfunding from '../pages/Crowdfunding';
import Certificates from '../pages/Certificates';
import IDCards from '../pages/IDCards';
import Finance from '../pages/Finance';
import Reports from '../pages/Reports';
import WebsiteCMS from '../pages/WebsiteCMS';
import Communication from '../pages/Communication';
import MediaLibrary from '../pages/MediaLibrary';
import Forms from '../pages/Forms';
import AuditLogs from '../pages/AuditLogs';
import Backup from '../pages/Backup';
import APIIntegrations from '../pages/APIIntegrations';
import AICenter from '../pages/AICenter';

const SA = (element) => <ProtectedRoute role="super_admin">{element}</ProtectedRoute>;
const CS = (title) => SA(<ComingSoon title={title} />);

const SuperAdminRoutes = () => [
  <Route key="superadmin-login" path="/superadmin/login" element={<SuperAdminLogin />} />,
  <Route key="dashboard" path="/dashboard" element={SA(<Dashboard />)} />,
  <Route key="org-profile" path="/org/profile" element={SA(<NGOProfile />)} />,
  <Route key="org-branches" path="/org/branches" element={SA(<Branches />)} />,
  <Route key="org-departments" path="/org/departments" element={SA(<Departments />)} />,
  <Route key="org-membership-types" path="/org/membership-types" element={SA(<MembershipTypes />)} />,
  <Route key="users-admins" path="/users/admins" element={SA(<Admins />)} />,
  <Route key="users-members" path="/users/members" element={SA(<Members />)} />,
  <Route key="users-volunteers" path="/users/volunteers" element={SA(<Volunteers />)} />,
  <Route key="users-beneficiaries" path="/users/beneficiaries" element={SA(<Beneficiaries />)} />,
  <Route key="donations" path="/donations" element={SA(<Donations />)} />,
  <Route key="projects" path="/projects" element={SA(<Projects />)} />,
  <Route key="events" path="/events" element={SA(<Events />)} />,
  <Route key="crowdfunding" path="/crowdfunding" element={SA(<Crowdfunding />)} />,
  <Route key="certificates" path="/certificates" element={SA(<Certificates />)} />,
  <Route key="id-cards" path="/id-cards" element={SA(<IDCards />)} />,
  <Route key="finance" path="/finance" element={SA(<Finance />)} />,
  <Route key="reports" path="/reports" element={SA(<Reports />)} />,
  <Route key="website-cms" path="/website-cms" element={SA(<WebsiteCMS />)} />,
  <Route key="communication" path="/communication" element={SA(<Communication />)} />,
  <Route key="media-library" path="/media-library" element={SA(<MediaLibrary />)} />,
  <Route key="forms" path="/forms" element={SA(<Forms />)} />,
  <Route key="audit-logs" path="/audit-logs" element={SA(<AuditLogs />)} />,
  <Route key="backup" path="/backup" element={SA(<Backup />)} />,
  <Route key="api-integrations" path="/api-integrations" element={SA(<APIIntegrations />)} />,
  <Route key="ai-center" path="/ai-center" element={SA(<AICenter />)} />,
  <Route key="profile" path="/profile" element={SA(<Profile />)} />,
  <Route key="settings" path="/settings" element={SA(<Settings />)} />,
  <Route key="help" path="/help" element={SA(<Help />)} />,
];

export default SuperAdminRoutes;
