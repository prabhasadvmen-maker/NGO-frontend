import './App.css';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const wrapSuspense = (Component) => (
  <Suspense fallback={<Preloader />}>
    <Component />
  </Suspense>
);

const RoleDispatcher = ({ adminComponent: AdminComponent, publicComponent: PublicComponent, role = 'super_admin' }) => {
  const { user } = useAuth();
  if (user && user.role === role) {
    return <ProtectedRoute role={role}>{wrapSuspense(AdminComponent)}</ProtectedRoute>;
  }
  return wrapSuspense(PublicComponent);
};

function AppContent() {
  // Filter out clashing paths from SuperAdminRoutes to let role dispatchers handle them at `/projects`, `/events`, etc.
  const filteredSuperAdminRoutes = SuperAdminRoutes().filter(route => 
    !['/projects', '/events', '/crowdfunding', '/reports'].includes(route.props.path)
  );

  return (
    <Routes>
      {/* Conflicting Routes Dispatcher */}
      <Route path="/projects" element={<RoleDispatcher adminComponent={SA_Projects} publicComponent={Public_Projects} />} />
      <Route path="/events" element={<RoleDispatcher adminComponent={SA_Events} publicComponent={Public_Events} />} />
      <Route path="/crowdfunding" element={<RoleDispatcher adminComponent={SA_Crowdfunding} publicComponent={Public_Crowdfunding} />} />
      <Route path="/reports" element={
        <ProtectedRoute role="super_admin">
          <Suspense fallback={<Preloader />}>
            <SA_Reports />
          </Suspense>
        </ProtectedRoute>
      } />

      {/* Login Dispatcher */}
      <Route path="/login" element={wrapSuspense(Public_Login)} />

      {/* Website Public Routes */}
      {WebsiteRoutes()}

      {/* Dashboards Routes */}
      {filteredSuperAdminRoutes}
      {AdminRoutes()}
      {MemberRoutes()}

      {/* Catch-all fallback redirects to the main Home Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SidebarProvider>
          <ToastProvider>
            {isInitializing ? <Preloader /> : <AppContent />}
          </ToastProvider>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
