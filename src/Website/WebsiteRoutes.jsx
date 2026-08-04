import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy loading all pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const DonatePage = lazy(() => import('./pages/DonatePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const OurWorkPage = lazy(() => import('./pages/OurWorkPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CrowdfundingPage = lazy(() => import('./pages/CrowdfundingPage'));
const CrowdfundingDetailPage = lazy(() => import('./pages/CrowdfundingDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const VolunteerPage = lazy(() => import('./pages/VolunteerPage'));
const VolunteerLoginPage = lazy(() => import('./pages/VolunteerLogin'));
const VolunteerSignupPage = lazy(() => import('./pages/VolunteerSignup'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const FoodDonationPage = lazy(() => import('./pages/FoodDonationPage'));
const DonationFormPage = lazy(() => import('./pages/DonationFormPage'));
const DonationStatusPage = lazy(() => import('./pages/DonationStatusPage'));
const AnnDanImpactPage = lazy(() => import('./pages/AnnDanImpactPage'));
const VolunteerFoodDashboard = lazy(() => import('../volunteer/pages/FoodDonationDashboard'));
const VolunteerMyAssignments = lazy(() => import('../volunteer/pages/MyAssignments'));
const VolunteerCollectionInterface = lazy(() => import('../volunteer/pages/CollectionInterface'));
const VolunteerDistributionInterface = lazy(() => import('../volunteer/pages/DistributionInterface'));

const wrapSuspense = (Component) => (
  <React.Suspense fallback={
    <div className="flex items-center justify-center h-screen bg-[#0A1628]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20]" />
    </div>
  }>
    <Component />
  </React.Suspense>
);

export const WebsiteRoutes = () => [
  <Route key="home" path="/" element={wrapSuspense(HomePage)} />,
  <Route key="donate" path="/donate" element={wrapSuspense(DonatePage)} />,
  <Route key="food-donation" path="/food-donation" element={wrapSuspense(FoodDonationPage)} />,
  <Route key="food-donation-donate" path="/food-donation/donate" element={wrapSuspense(DonationFormPage)} />,
  <Route key="food-donation-track-param" path="/food-donation/track/:id" element={wrapSuspense(DonationStatusPage)} />,
  <Route key="food-donation-track" path="/food-donation/track" element={wrapSuspense(DonationStatusPage)} />,
  <Route key="food-donation-impact" path="/food-donation/impact" element={wrapSuspense(AnnDanImpactPage)} />,
  <Route key="volunteer-signup" path="/volunteer/signup" element={wrapSuspense(VolunteerSignupPage)} />,
  <Route key="volunteer-login" path="/volunteer/login" element={wrapSuspense(VolunteerLoginPage)} />,
  <Route key="volunteer-food-donation" path="/volunteer/food-donation" element={wrapSuspense(VolunteerFoodDashboard)} />,
  <Route key="volunteer-my-assignments" path="/volunteer/food-donation/my-assignments" element={wrapSuspense(VolunteerMyAssignments)} />,
  <Route key="volunteer-collect" path="/volunteer/food-donation/:id/collect" element={wrapSuspense(VolunteerCollectionInterface)} />,
  <Route key="volunteer-distribute" path="/volunteer/food-donation/:id/distribute" element={wrapSuspense(VolunteerDistributionInterface)} />,
  <Route key="about" path="/about" element={wrapSuspense(AboutPage)} />,
  <Route key="our-work" path="/our-work" element={wrapSuspense(OurWorkPage)} />,
  <Route key="project-detail" path="/projects/:id" element={wrapSuspense(ProjectDetailPage)} />,
  <Route key="event-detail" path="/events/:id" element={wrapSuspense(EventDetailPage)} />,
  <Route key="news" path="/news" element={wrapSuspense(NewsPage)} />,
  <Route key="news-detail" path="/news/:slug" element={wrapSuspense(NewsDetailPage)} />,
  <Route key="crowdfunding-detail" path="/crowdfunding/:id" element={wrapSuspense(CrowdfundingDetailPage)} />,
  <Route key="contact" path="/contact" element={wrapSuspense(ContactPage)} />,
  <Route key="volunteer" path="/volunteer" element={wrapSuspense(VolunteerPage)} />,
  <Route key="membership" path="/membership" element={wrapSuspense(MembershipPage)} />,
  <Route key="verify" path="/verify" element={wrapSuspense(VerifyPage)} />,
  <Route key="gallery" path="/gallery" element={wrapSuspense(GalleryPage)} />,
  <Route key="privacy" path="/privacy" element={wrapSuspense(PrivacyPage)} />,
  <Route key="terms" path="/terms" element={wrapSuspense(TermsPage)} />,
  <Route key="refund" path="/refund" element={wrapSuspense(RefundPage)} />,
];

export default WebsiteRoutes;
