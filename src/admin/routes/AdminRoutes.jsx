import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/ProtectedRoute';

// Lazy loading all admin pages for massive bundle size reduction
const AdminLogin = lazy(() => import('../auth/AdminLogin'));
const AdminAutoLogin = lazy(() => import('../auth/AdminAutoLogin'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const Help = lazy(() => import('../pages/Help'));
const ComingSoon = lazy(() => import('../pages/ComingSoon'));
const AddMember = lazy(() => import('../pages/members/AddMember'));
const MembersList = lazy(() => import('../pages/members/MembersList'));
const MemberApproval = lazy(() => import('../pages/members/MemberApproval'));
const MembershipRequests = lazy(() => import('../pages/members/MembershipRequests'));
const DonationsList = lazy(() => import('../pages/donations/DonationsList'));
const PendingDonations = lazy(() => import('../pages/donations/PendingDonations'));
const DonationReceipts = lazy(() => import('../pages/donations/DonationReceipts'));
const EventsList = lazy(() => import('../pages/events/EventsList'));
const Registrations = lazy(() => import('../pages/events/Registrations'));
const Attendance = lazy(() => import('../pages/events/Attendance'));
const CampaignsList = lazy(() => import('../pages/crowdfunding/CampaignsList'));
const ContributionsList = lazy(() => import('../pages/crowdfunding/ContributionsList'));
const CertificateList = lazy(() => import('../pages/certificates/CertificateList'));
const VerifyCertificate = lazy(() => import('../pages/certificates/VerifyCertificate'));
const IDCardList = lazy(() => import('../pages/idcards/IDCardList'));
const AdminCms = lazy(() => import('../pages/cms/AdminCms'));
const AdminFinance = lazy(() => import('../pages/finance/AdminFinance'));
const AdminReports = lazy(() => import('../pages/reports/AdminReports'));
const AdminCommunication = lazy(() => import('../pages/communication/AdminCommunication'));
const AdminMediaLibrary = lazy(() => import('../pages/media/AdminMediaLibrary'));
const AdminForms = lazy(() => import('../pages/forms/AdminForms'));
const BeneficiariesList = lazy(() => import('../pages/beneficiaries/BeneficiariesList'));
const BeneficiaryVerification = lazy(() => import('../pages/beneficiaries/BeneficiaryVerification'));
const VolunteersList = lazy(() => import('../pages/volunteers/VolunteersList'));
const VolunteerApplications = lazy(() => import('../pages/volunteers/VolunteerApplications'));
const VolunteerAttendance = lazy(() => import('../pages/volunteers/Attendance'));
const ProjectsList = lazy(() => import('../pages/projects/ProjectsList'));
const ProjectProgress = lazy(() => import('../pages/projects/ProjectProgress'));
const ProjectExpenses = lazy(() => import('../pages/projects/ProjectExpenses'));

const lazyWrap = (Component, props = {}) => (
  <Suspense fallback={
    <div className="flex items-center justify-center h-screen bg-[#0A1628]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20]" />
    </div>
  }>
    <Component {...props} />
  </Suspense>
);

const AD = (Component, props = {}) => <ProtectedRoute role="admin">{lazyWrap(Component, props)}</ProtectedRoute>;

const AdminRoutes = () => [
  <Route key="admin-login" path="/admin/login" element={lazyWrap(AdminLogin)} />,
  <Route key="admin-autologin" path="/admin/autologin" element={lazyWrap(AdminAutoLogin)} />,
  <Route key="admin-dashboard" path="/admin/dashboard" element={AD(Dashboard)} />,
  <Route key="admin-members" path="/admin/members" element={AD(MembersList)} />,
  <Route key="admin-members-add" path="/admin/members/add" element={AD(AddMember)} />,
  <Route key="admin-members-approval" path="/admin/members/approval" element={AD(MemberApproval)} />,
  <Route key="admin-members-requests" path="/admin/members/requests" element={AD(MembershipRequests)} />,
  <Route key="admin-donations" path="/admin/donations" element={AD(DonationsList)} />,
  <Route key="admin-donations-pending" path="/admin/donations/pending" element={AD(PendingDonations)} />,
  <Route key="admin-donations-receipts" path="/admin/donations/receipts" element={AD(DonationReceipts)} />,
  <Route key="admin-beneficiaries" path="/admin/beneficiaries" element={AD(BeneficiariesList)} />,
  <Route key="admin-beneficiaries-verification" path="/admin/beneficiaries/verification" element={AD(BeneficiaryVerification)} />,
  <Route key="admin-volunteers" path="/admin/volunteers" element={AD(VolunteersList)} />,
  <Route key="admin-volunteers-applications" path="/admin/volunteers/applications" element={AD(VolunteerApplications)} />,
  <Route key="admin-volunteers-attendance" path="/admin/volunteers/attendance" element={AD(VolunteerAttendance)} />,
  <Route key="admin-projects" path="/admin/projects" element={AD(ProjectsList)} />,
  <Route key="admin-projects-progress" path="/admin/projects/progress" element={AD(ProjectProgress)} />,
  <Route key="admin-projects-expenses" path="/admin/projects/expenses" element={AD(ProjectExpenses)} />,
  <Route key="admin-events" path="/admin/events" element={AD(EventsList)} />,
  <Route key="admin-events-registrations" path="/admin/events/registrations" element={AD(Registrations)} />,
  <Route key="admin-events-attendance" path="/admin/events/attendance" element={AD(Attendance)} />,
  <Route key="admin-crowdfunding" path="/admin/crowdfunding" element={AD(CampaignsList)} />,
  <Route key="admin-crowdfunding-contributions" path="/admin/crowdfunding/contributions" element={AD(ContributionsList)} />,
  <Route key="admin-certificates" path="/admin/certificates" element={AD(CertificateList)} />,
  <Route key="admin-certificates-verify" path="/admin/certificates/verify" element={AD(VerifyCertificate)} />,
  <Route key="admin-id-cards" path="/admin/id-cards" element={AD(IDCardList)} />,
  <Route key="admin-finance" path="/admin/finance" element={AD(AdminFinance)} />,
  <Route key="admin-reports" path="/admin/reports" element={AD(AdminReports)} />,
  <Route key="admin-cms" path="/admin/cms" element={AD(AdminCms)} />,
  <Route key="admin-communication-email" path="/admin/communication/email" element={AD(AdminCommunication)} />,
  <Route key="admin-communication-sms" path="/admin/communication/sms" element={AD(AdminCommunication)} />,
  <Route key="admin-communication-whatsapp" path="/admin/communication/whatsapp" element={AD(AdminCommunication)} />,
  <Route key="admin-communication-notifications" path="/admin/communication/notifications" element={AD(AdminCommunication)} />,
  <Route key="admin-media-library" path="/admin/media-library" element={AD(AdminMediaLibrary)} />,
  <Route key="admin-forms" path="/admin/forms" element={AD(AdminForms, { defaultTab: 'contact' })} />,
  <Route key="admin-profile" path="/admin/profile" element={AD(Profile)} />,
  <Route key="admin-settings" path="/admin/settings" element={AD(Settings)} />,
  <Route key="admin-help" path="/admin/help" element={AD(Help)} />,
];

export default AdminRoutes;
