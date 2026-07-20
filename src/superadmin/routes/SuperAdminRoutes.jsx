import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';

// Lazy loading all superadmin pages for massive bundle size reduction
const SuperAdminLogin = lazy(() => import('../auth/SuperAdminLogin'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const NGOProfile = lazy(() => import('../pages/NGOProfile'));
const Branches = lazy(() => import('../pages/Branches'));
const Departments = lazy(() => import('../pages/Departments'));
const MembershipTypes = lazy(() => import('../pages/MembershipTypes'));
const Admins = lazy(() => import('../pages/Admins'));
const Members = lazy(() => import('../pages/Members'));
const Volunteers = lazy(() => import('../pages/Volunteers'));
const Beneficiaries = lazy(() => import('../pages/Beneficiaries'));
const Donations = lazy(() => import('../pages/Donations'));
const Projects = lazy(() => import('../pages/Projects'));
const Events = lazy(() => import('../pages/Events'));
const Crowdfunding = lazy(() => import('../pages/Crowdfunding'));
const Certificates = lazy(() => import('../pages/Certificates'));
const IDCards = lazy(() => import('../pages/IDCards'));
const Finance = lazy(() => import('../pages/Finance'));
const Reports = lazy(() => import('../pages/Reports'));
const WebsiteCMS = lazy(() => import('../pages/WebsiteCMS'));
const Communication = lazy(() => import('../pages/Communication'));
const MediaLibrary = lazy(() => import('../pages/MediaLibrary'));
const Forms = lazy(() => import('../pages/Forms'));
const AuditLogs = lazy(() => import('../pages/AuditLogs'));
const Backup = lazy(() => import('../pages/Backup'));
const APIIntegrations = lazy(() => import('../pages/APIIntegrations'));
const AICenter = lazy(() => import('../pages/AICenter'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Help = lazy(() => import('../pages/Help'));
const ComingSoon = lazy(() => import('../pages/ComingSoon'));

const lazyWrap = (Component, props = {}) => (
  <Suspense fallback={
    <div className="flex items-center justify-center h-screen bg-[#0A1628]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20]" />
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

const SA = (Component) => <ProtectedRoute role="super_admin">{lazyWrap(Component)}</ProtectedRoute>;
const CS = (title) => SA(() => <ComingSoon title={title} />);

const SuperAdminRoutes = () => [
  <Route key="superadmin-login" path="/superadmin/login" element={lazyWrap(SuperAdminLogin)} />,
  <Route key="dashboard" path="/dashboard" element={SA(Dashboard)} />,
  <Route key="org-profile" path="/org/profile" element={SA(NGOProfile)} />,
  <Route key="org-branches" path="/org/branches" element={SA(Branches)} />,
  <Route key="org-departments" path="/org/departments" element={SA(Departments)} />,
  <Route key="org-membership-types" path="/org/membership-types" element={SA(MembershipTypes)} />,
  <Route key="users-admins" path="/users/admins" element={SA(Admins)} />,
  <Route key="users-members" path="/users/members" element={SA(Members)} />,
  <Route key="users-volunteers" path="/users/volunteers" element={SA(Volunteers)} />,
  <Route key="users-beneficiaries" path="/users/beneficiaries" element={SA(Beneficiaries)} />,
  <Route key="donations" path="/donations" element={SA(Donations)} />,
  <Route key="projects" path="/dashboard/projects" element={SA(Projects)} />,
  <Route key="events" path="/dashboard/events" element={SA(Events)} />,
  <Route key="crowdfunding" path="/dashboard/crowdfunding" element={SA(Crowdfunding)} />,
  <Route key="certificates" path="/certificates" element={SA(Certificates)} />,
  <Route key="id-cards" path="/id-cards" element={SA(IDCards)} />,
  <Route key="finance" path="/finance" element={SA(Finance)} />,
  <Route key="reports" path="/reports" element={SA(Reports)} />,
  <Route key="website-cms" path="/website-cms" element={SA(WebsiteCMS)} />,
  <Route key="communication" path="/communication" element={SA(Communication)} />,
  <Route key="media-library" path="/media-library" element={SA(MediaLibrary)} />,
  <Route key="forms" path="/forms" element={SA(Forms)} />,
  <Route key="audit-logs" path="/audit-logs" element={SA(AuditLogs)} />,
  <Route key="backup" path="/backup" element={SA(Backup)} />,
  <Route key="api-integrations" path="/api-integrations" element={SA(APIIntegrations)} />,
  <Route key="ai-center" path="/ai-center" element={SA(AICenter)} />,
  <Route key="profile" path="/profile" element={SA(Profile)} />,
  <Route key="settings" path="/settings" element={SA(Settings)} />,
  <Route key="help" path="/help" element={SA(Help)} />,
];

export default SuperAdminRoutes;
