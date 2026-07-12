import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';
import AdminLogin from '../auth/AdminLogin';
import AdminAutoLogin from '../auth/AdminAutoLogin';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Help from '../pages/Help';
import ComingSoon from '../pages/ComingSoon';
import AddMember from '../pages/members/AddMember';
import MembersList from '../pages/members/MembersList';
import MemberApproval from '../pages/members/MemberApproval';
import MembershipRequests from '../pages/members/MembershipRequests';
import DonationsList from '../pages/donations/DonationsList';
import AddDonation from '../pages/donations/AddDonation';
import PendingDonations from '../pages/donations/PendingDonations';
import DonationReceipts from '../pages/donations/DonationReceipts';

const AD = (element) => <ProtectedRoute role="admin">{element}</ProtectedRoute>;
const ACS = (title) => AD(<ComingSoon title={title} />);

const AdminRoutes = () => [
  <Route key="admin-login" path="/admin/login" element={<AdminLogin />} />,
  <Route key="admin-autologin" path="/admin/autologin" element={<AdminAutoLogin />} />,
  <Route key="admin-dashboard" path="/admin/dashboard" element={AD(<Dashboard />)} />,
  <Route key="admin-members" path="/admin/members" element={AD(<MembersList />)} />,
  <Route key="admin-members-add" path="/admin/members/add" element={AD(<AddMember />)} />,
  <Route key="admin-members-approval" path="/admin/members/approval" element={AD(<MemberApproval />)} />,
  <Route key="admin-members-requests" path="/admin/members/requests" element={AD(<MembershipRequests />)} />,
  <Route key="admin-donations" path="/admin/donations" element={AD(<DonationsList />)} />,
  <Route key="admin-donations-add" path="/admin/donations/add" element={AD(<AddDonation />)} />,
  <Route key="admin-donations-pending" path="/admin/donations/pending" element={AD(<PendingDonations />)} />,
  <Route key="admin-donations-receipts" path="/admin/donations/receipts" element={AD(<DonationReceipts />)} />,
  <Route key="admin-beneficiaries" path="/admin/beneficiaries" element={ACS('All Beneficiaries')} />,
  <Route key="admin-beneficiaries-add" path="/admin/beneficiaries/add" element={ACS('Add Beneficiary')} />,
  <Route key="admin-beneficiaries-verification" path="/admin/beneficiaries/verification" element={ACS('Beneficiary Verification')} />,
  <Route key="admin-volunteers" path="/admin/volunteers" element={ACS('All Volunteers')} />,
  <Route key="admin-volunteers-add" path="/admin/volunteers/add" element={ACS('Add Volunteer')} />,
  <Route key="admin-volunteers-applications" path="/admin/volunteers/applications" element={ACS('Volunteer Applications')} />,
  <Route key="admin-volunteers-attendance" path="/admin/volunteers/attendance" element={ACS('Attendance')} />,
  <Route key="admin-projects" path="/admin/projects" element={ACS('All Projects')} />,
  <Route key="admin-projects-add" path="/admin/projects/add" element={ACS('Add Project')} />,
  <Route key="admin-projects-progress" path="/admin/projects/progress" element={ACS('Project Progress')} />,
  <Route key="admin-projects-expenses" path="/admin/projects/expenses" element={ACS('Project Expenses')} />,
  <Route key="admin-events" path="/admin/events" element={ACS('All Events')} />,
  <Route key="admin-events-create" path="/admin/events/create" element={ACS('Create Event')} />,
  <Route key="admin-events-registrations" path="/admin/events/registrations" element={ACS('Registrations')} />,
  <Route key="admin-events-attendance" path="/admin/events/attendance" element={ACS('Attendance')} />,
  <Route key="admin-crowdfunding" path="/admin/crowdfunding" element={ACS('Campaigns')} />,
  <Route key="admin-crowdfunding-create" path="/admin/crowdfunding/create" element={ACS('Create Campaign')} />,
  <Route key="admin-crowdfunding-contributions" path="/admin/crowdfunding/contributions" element={ACS('Contributions')} />,
  <Route key="admin-certificates-generate" path="/admin/certificates/generate" element={ACS('Generate Certificate')} />,
  <Route key="admin-certificates" path="/admin/certificates" element={ACS('Certificate List')} />,
  <Route key="admin-certificates-verify" path="/admin/certificates/verify" element={ACS('Verify Certificate')} />,
  <Route key="admin-id-cards-generate" path="/admin/id-cards/generate" element={ACS('Generate ID Card')} />,
  <Route key="admin-id-cards" path="/admin/id-cards" element={ACS('ID Card List')} />,
  <Route key="admin-finance-income" path="/admin/finance/income" element={ACS('Income')} />,
  <Route key="admin-finance-expenses" path="/admin/finance/expenses" element={ACS('Expenses')} />,
  <Route key="admin-finance-transactions" path="/admin/finance/transactions" element={ACS('Transactions')} />,
  <Route key="admin-reports-donations" path="/admin/reports/donations" element={ACS('Donation Reports')} />,
  <Route key="admin-reports-members" path="/admin/reports/members" element={ACS('Member Reports')} />,
  <Route key="admin-reports-projects" path="/admin/reports/projects" element={ACS('Project Reports')} />,
  <Route key="admin-reports-events" path="/admin/reports/events" element={ACS('Event Reports')} />,
  <Route key="admin-cms-homepage" path="/admin/cms/homepage" element={ACS('Homepage')} />,
  <Route key="admin-cms-projects" path="/admin/cms/projects" element={ACS('CMS Projects')} />,
  <Route key="admin-cms-news" path="/admin/cms/news" element={ACS('News / Blog')} />,
  <Route key="admin-cms-gallery" path="/admin/cms/gallery" element={ACS('Gallery')} />,
  <Route key="admin-cms-testimonials" path="/admin/cms/testimonials" element={ACS('Testimonials')} />,
  <Route key="admin-cms-contact" path="/admin/cms/contact" element={ACS('Contact Queries')} />,
  <Route key="admin-communication-email" path="/admin/communication/email" element={ACS('Email')} />,
  <Route key="admin-communication-sms" path="/admin/communication/sms" element={ACS('SMS')} />,
  <Route key="admin-communication-whatsapp" path="/admin/communication/whatsapp" element={ACS('WhatsApp')} />,
  <Route key="admin-communication-notifications" path="/admin/communication/notifications" element={ACS('Notifications')} />,
  <Route key="admin-media-library" path="/admin/media-library" element={ACS('Media Library')} />,
  <Route key="admin-forms-contact" path="/admin/forms/contact" element={ACS('Contact Forms')} />,
  <Route key="admin-forms-membership" path="/admin/forms/membership" element={ACS('Membership Forms')} />,
  <Route key="admin-forms-volunteer" path="/admin/forms/volunteer" element={ACS('Volunteer Forms')} />,
  <Route key="admin-profile" path="/admin/profile" element={AD(<Profile />)} />,
  <Route key="admin-settings" path="/admin/settings" element={AD(<Settings />)} />,
  <Route key="admin-help" path="/admin/help" element={AD(<Help />)} />,
];

export default AdminRoutes;
