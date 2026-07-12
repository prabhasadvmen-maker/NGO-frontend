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
  <Route key="donations" path="/donations" element={CS('Donations')} />,
  <Route key="projects" path="/projects" element={CS('Projects')} />,
  <Route key="events" path="/events" element={CS('Events')} />,
  <Route key="crowdfunding" path="/crowdfunding" element={CS('Crowdfunding')} />,
  <Route key="certificates" path="/certificates" element={CS('Certificates')} />,
  <Route key="id-cards" path="/id-cards" element={CS('ID Cards')} />,
  <Route key="finance" path="/finance" element={CS('Finance')} />,
  <Route key="reports" path="/reports" element={CS('Reports')} />,
  <Route key="website-cms" path="/website-cms" element={CS('Website CMS')} />,
  <Route key="communication" path="/communication" element={CS('Communication')} />,
  <Route key="media-library" path="/media-library" element={CS('Media Library')} />,
  <Route key="forms" path="/forms" element={CS('Forms')} />,
  <Route key="audit-logs" path="/audit-logs" element={CS('Audit Logs')} />,
  <Route key="backup" path="/backup" element={CS('Backup & Restore')} />,
  <Route key="api-integrations" path="/api-integrations" element={CS('API & Integrations')} />,
  <Route key="ai-center" path="/ai-center" element={CS('AI Center')} />,
  <Route key="profile" path="/profile" element={SA(<Profile />)} />,
  <Route key="settings" path="/settings" element={SA(<Settings />)} />,
  <Route key="help" path="/help" element={SA(<Help />)} />,
];

export default SuperAdminRoutes;
