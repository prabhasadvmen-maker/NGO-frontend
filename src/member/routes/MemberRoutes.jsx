import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';
import MemberLogin from '../auth/MemberLogin';
import MemberRegister from '../auth/MemberRegister';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import MyMembership from '../pages/MyMembership';
import MyDonations from '../pages/MyDonations';
import MyReceipts from '../pages/MyReceipts';
import MyCertificates from '../pages/MyCertificates';
import MyIdCard from '../pages/MyIdCard';
import MyEvents from '../pages/MyEvents';
import MyVolunteer from '../pages/MyVolunteer';
import MyProjects from '../pages/MyProjects';
import Referral from '../pages/Referral';
import Notifications from '../pages/Notifications';
import Help from '../pages/Help';
import Settings from '../pages/Settings';

const M = (element) => <ProtectedRoute role="member">{element}</ProtectedRoute>;

const MemberRoutes = () => [
  <Route key="member-login" path="/member/login" element={<MemberLogin />} />,
  <Route key="member-register" path="/member/register" element={<MemberRegister />} />,
  <Route key="member-dashboard" path="/member/dashboard" element={M(<Dashboard />)} />,
  <Route key="member-profile" path="/member/profile" element={M(<Profile />)} />,
  <Route key="member-membership" path="/member/membership" element={M(<MyMembership />)} />,
  <Route key="member-donations" path="/member/donations" element={M(<MyDonations />)} />,
  <Route key="member-receipts" path="/member/receipts" element={M(<MyReceipts />)} />,
  <Route key="member-certificates" path="/member/certificates" element={M(<MyCertificates />)} />,
  <Route key="member-id-card" path="/member/id-card" element={M(<MyIdCard />)} />,
  <Route key="member-events" path="/member/events" element={M(<MyEvents />)} />,
  <Route key="member-volunteer" path="/member/volunteer" element={M(<MyVolunteer />)} />,
  <Route key="member-projects" path="/member/projects" element={M(<MyProjects />)} />,
  <Route key="member-referral" path="/member/referral" element={M(<Referral />)} />,
  <Route key="member-notifications" path="/member/notifications" element={M(<Notifications />)} />,
  <Route key="member-help" path="/member/help" element={M(<Help />)} />,
  <Route key="member-settings" path="/member/settings" element={M(<Settings />)} />,
];

export default MemberRoutes;
