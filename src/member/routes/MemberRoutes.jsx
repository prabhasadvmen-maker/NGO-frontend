import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';

// Lazy loading all member pages for massive bundle size reduction
const MemberLogin = lazy(() => import('../auth/MemberLogin'));
const MemberRegister = lazy(() => import('../auth/MemberRegister'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const MyMembership = lazy(() => import('../pages/MyMembership'));
const MyDonations = lazy(() => import('../pages/MyDonations'));
const MyReceipts = lazy(() => import('../pages/MyReceipts'));
const MyCertificates = lazy(() => import('../pages/MyCertificates'));
const MyIdCard = lazy(() => import('../pages/MyIdCard'));
const MyEvents = lazy(() => import('../pages/MyEvents'));
const MyVolunteer = lazy(() => import('../pages/MyVolunteer'));
const MyProjects = lazy(() => import('../pages/MyProjects'));
const Referral = lazy(() => import('../pages/Referral'));
const Notifications = lazy(() => import('../pages/Notifications'));
const Help = lazy(() => import('../pages/Help'));
const Settings = lazy(() => import('../pages/Settings'));

const lazyWrap = (Component, props = {}) => (
  <Suspense fallback={
    <div className="flex items-center justify-center h-screen bg-[#0A1628]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20]" />
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

const M = (Component) => <ProtectedRoute role="member">{lazyWrap(Component)}</ProtectedRoute>;

const MemberRoutes = () => [
  <Route key="member-login" path="/member/login" element={lazyWrap(MemberLogin)} />,
  <Route key="member-register" path="/member/register" element={lazyWrap(MemberRegister)} />,
  <Route key="member-dashboard" path="/member/dashboard" element={M(Dashboard)} />,
  <Route key="member-profile" path="/member/profile" element={M(Profile)} />,
  <Route key="member-membership" path="/member/membership" element={M(MyMembership)} />,
  <Route key="member-donations" path="/member/donations" element={M(MyDonations)} />,
  <Route key="member-receipts" path="/member/receipts" element={M(MyReceipts)} />,
  <Route key="member-certificates" path="/member/certificates" element={M(MyCertificates)} />,
  <Route key="member-id-card" path="/member/id-card" element={M(MyIdCard)} />,
  <Route key="member-events" path="/member/events" element={M(MyEvents)} />,
  <Route key="member-volunteer" path="/member/volunteer" element={M(MyVolunteer)} />,
  <Route key="member-projects" path="/member/projects" element={M(MyProjects)} />,
  <Route key="member-referral" path="/member/referral" element={M(Referral)} />,
  <Route key="member-notifications" path="/member/notifications" element={M(Notifications)} />,
  <Route key="member-help" path="/member/help" element={M(Help)} />,
  <Route key="member-settings" path="/member/settings" element={M(Settings)} />,
];

export default MemberRoutes;
