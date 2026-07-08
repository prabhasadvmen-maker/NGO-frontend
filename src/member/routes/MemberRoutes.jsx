import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';
import MemberLogin from '../auth/MemberLogin';
import MemberRegister from '../auth/MemberRegister';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ComingSoon from '../pages/ComingSoon';

const M = (element) => <ProtectedRoute role="member">{element}</ProtectedRoute>;
const CS = (title) => M(<ComingSoon title={title} />);

const MemberRoutes = () => [
  <Route key="member-login" path="/member/login" element={<MemberLogin />} />,
  <Route key="member-register" path="/member/register" element={<MemberRegister />} />,
  <Route key="member-dashboard" path="/member/dashboard" element={M(<Dashboard />)} />,
  <Route key="member-profile" path="/member/profile" element={M(<Profile />)} />,
  <Route key="member-membership" path="/member/membership" element={CS('My Membership')} />,
  <Route key="member-donations" path="/member/donations" element={CS('My Donations')} />,
  <Route key="member-receipts" path="/member/receipts" element={CS('My Receipts')} />,
  <Route key="member-certificates" path="/member/certificates" element={CS('My Certificates')} />,
  <Route key="member-id-card" path="/member/id-card" element={CS('My ID Card')} />,
  <Route key="member-events" path="/member/events" element={CS('My Events')} />,
  <Route key="member-volunteer" path="/member/volunteer" element={CS('My Volunteer Activities')} />,
  <Route key="member-projects" path="/member/projects" element={CS('My Projects')} />,
  <Route key="member-referral" path="/member/referral" element={CS('Referral Program')} />,
  <Route key="member-notifications" path="/member/notifications" element={CS('Notifications')} />,
  <Route key="member-help" path="/member/help" element={CS('Help')} />,
  <Route key="member-settings" path="/member/settings" element={CS('Settings')} />,
];

export default MemberRoutes;
