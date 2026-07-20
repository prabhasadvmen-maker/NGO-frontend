import './App.css';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './shared/AuthContext';
import { SidebarProvider } from './shared/SidebarContext';
import { ToastProvider } from './shared/ToastContext';
import ProtectedRoute from './shared/ProtectedRoute';
import Preloader from './Website/components/Preloader';

// Dashboard Routes
import SuperAdminRoutes from './superadmin/routes/SuperAdminRoutes';
import AdminRoutes from './admin/routes/AdminRoutes';
import MemberRoutes from './member/routes/MemberRoutes';

// Public Website Routes
import WebsiteRoutes from './Website/WebsiteRoutes';

// Dispatcher Lazy Components for conflicting paths
const SA_Projects = lazy(() => import('./superadmin/pages/Projects'));
const SA_Events = lazy(() => import('./superadmin/pages/Events'));
const SA_Crowdfunding = lazy(() => import('./superadmin/pages/Crowdfunding'));
const SA_Reports = lazy(() => import('./superadmin/pages/Reports'));

const Public_Projects = lazy(() => import('./Website/pages/ProjectsPage'));
const Public_Events = lazy(() => import('./Website/pages/EventsPage'));
const Public_Crowdfunding = lazy(() => import('./Website/pages/CrowdfundingPage'));
const Public_Login = lazy(() => import('./Website/pages/WebsiteLogin'));
const NotFoundPage = lazy(() => import('./Website/pages/NotFoundPage'));

const wrapSuspense = (Component) => (
  <Suspense fallback={<Preloader />}>
    <Component />
  </Suspense>
);

function AppContent() {
  return (
    <Routes>
      {/* Direct Public Website Pages */}
      <Route path="/projects" element={wrapSuspense(Public_Projects)} />
      <Route path="/events" element={wrapSuspense(Public_Events)} />
      <Route path="/crowdfunding" element={wrapSuspense(Public_Crowdfunding)} />

      {/* Login Page */}
      <Route path="/login" element={wrapSuspense(Public_Login)} />

      {/* Website Public Routes */}
      {WebsiteRoutes()}

      {/* Dashboards Routes */}
      {SuperAdminRoutes()}
      {AdminRoutes()}
      {MemberRoutes()}

      {/* Catch-all fallback directs to the SEO-friendly 404 page */}
      <Route path="*" element={wrapSuspense(NotFoundPage)} />
    </Routes>
  );
}

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SidebarProvider>
            <ToastProvider>
              {isInitializing ? <Preloader /> : <AppContent />}
            </ToastProvider>
          </SidebarProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
