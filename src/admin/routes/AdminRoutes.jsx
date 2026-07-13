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
import EventsList from '../pages/events/EventsList';
import CreateEvent from '../pages/events/CreateEvent';
import Registrations from '../pages/events/Registrations';
import Attendance from '../pages/events/Attendance';
import CampaignsList from '../pages/crowdfunding/CampaignsList';
import CreateCampaign from '../pages/crowdfunding/CreateCampaign';
import ContributionsList from '../pages/crowdfunding/ContributionsList';
import GenerateCertificate from '../pages/certificates/GenerateCertificate';
import CertificateList from '../pages/certificates/CertificateList';
import VerifyCertificate from '../pages/certificates/VerifyCertificate';
import GenerateIDCard from '../pages/idcards/GenerateIDCard';
import IDCardList from '../pages/idcards/IDCardList';
import AdminCms from '../pages/cms/AdminCms';
import AdminFinance from '../pages/finance/AdminFinance';
import AdminReports from '../pages/reports/AdminReports';
import AdminCommunication from '../pages/communication/AdminCommunication';
import AdminMediaLibrary from '../pages/media/AdminMediaLibrary';
import AdminForms from '../pages/forms/AdminForms';

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
  <Route key="admin-events" path="/admin/events" element={AD(<EventsList />)} />,
  <Route key="admin-events-create" path="/admin/events/create" element={AD(<CreateEvent />)} />,
  <Route key="admin-events-registrations" path="/admin/events/registrations" element={AD(<Registrations />)} />,
  <Route key="admin-events-attendance" path="/admin/events/attendance" element={AD(<Attendance />)} />,
  <Route key="admin-crowdfunding" path="/admin/crowdfunding" element={AD(<CampaignsList />)} />,
  <Route key="admin-crowdfunding-create" path="/admin/crowdfunding/create" element={AD(<CreateCampaign />)} />,
  <Route key="admin-crowdfunding-contributions" path="/admin/crowdfunding/contributions" element={AD(<ContributionsList />)} />,
  <Route key="admin-certificates-generate" path="/admin/certificates/generate" element={AD(<GenerateCertificate />)} />,
  <Route key="admin-certificates" path="/admin/certificates" element={AD(<CertificateList />)} />,
  <Route key="admin-certificates-verify" path="/admin/certificates/verify" element={AD(<VerifyCertificate />)} />,
  <Route key="admin-id-cards-generate" path="/admin/id-cards/generate" element={AD(<GenerateIDCard />)} />,
  <Route key="admin-id-cards" path="/admin/id-cards" element={AD(<IDCardList />)} />,
  <Route key="admin-finance-income" path="/admin/finance/income" element={AD(<AdminFinance />)} />,
  <Route key="admin-finance-expenses" path="/admin/finance/expenses" element={AD(<AdminFinance />)} />,
  <Route key="admin-finance-transactions" path="/admin/finance/transactions" element={AD(<AdminFinance />)} />,
  <Route key="admin-reports-donations" path="/admin/reports/donations" element={AD(<AdminReports />)} />,
  <Route key="admin-reports-members" path="/admin/reports/members" element={AD(<AdminReports />)} />,
  <Route key="admin-reports-projects" path="/admin/reports/projects" element={AD(<AdminReports />)} />,
  <Route key="admin-reports-events" path="/admin/reports/events" element={AD(<AdminReports />)} />,
  <Route key="admin-cms-homepage" path="/admin/cms/homepage" element={AD(<AdminCms />)} />,
  <Route key="admin-cms-projects" path="/admin/cms/projects" element={AD(<AdminCms />)} />,
  <Route key="admin-cms-news" path="/admin/cms/news" element={AD(<AdminCms />)} />,
  <Route key="admin-cms-gallery" path="/admin/cms/gallery" element={AD(<AdminCms />)} />,
  <Route key="admin-cms-testimonials" path="/admin/cms/testimonials" element={AD(<AdminCms />)} />,
  <Route key="admin-cms-contact" path="/admin/cms/contact" element={AD(<AdminCms />)} />,
  <Route key="admin-communication-email" path="/admin/communication/email" element={AD(<AdminCommunication />)} />,
  <Route key="admin-communication-sms" path="/admin/communication/sms" element={AD(<AdminCommunication />)} />,
  <Route key="admin-communication-whatsapp" path="/admin/communication/whatsapp" element={AD(<AdminCommunication />)} />,
  <Route key="admin-communication-notifications" path="/admin/communication/notifications" element={AD(<AdminCommunication />)} />,
  <Route key="admin-media-library" path="/admin/media-library" element={AD(<AdminMediaLibrary />)} />,
  <Route key="admin-forms-contact" path="/admin/forms/contact" element={AD(<AdminForms defaultTab="contact" />)} />,
  <Route key="admin-forms-membership" path="/admin/forms/membership" element={AD(<AdminForms defaultTab="membership" />)} />,
  <Route key="admin-forms-volunteer" path="/admin/forms/volunteer" element={AD(<AdminForms defaultTab="volunteer" />)} />,
  <Route key="admin-profile" path="/admin/profile" element={AD(<Profile />)} />,
  <Route key="admin-settings" path="/admin/settings" element={AD(<Settings />)} />,
  <Route key="admin-help" path="/admin/help" element={AD(<Help />)} />,
];

export default AdminRoutes;
