import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
import { SidebarProvider } from './shared/SidebarContext';
import { ToastProvider } from './shared/ToastContext';
import SuperAdminRoutes from './superadmin/routes/SuperAdminRoutes';
import AdminRoutes from './admin/routes/AdminRoutes';
import MemberRoutes from './member/routes/MemberRoutes';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SidebarProvider>
          <ToastProvider>
            <Routes>
              {SuperAdminRoutes()}
              {AdminRoutes()}
              {MemberRoutes()}
              <Route path="/login" element={<Navigate to="/superadmin/login" replace />} />
              <Route path="/" element={<Navigate to="/superadmin/login" replace />} />
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/superadmin/login" replace />} />
            </Routes>
          </ToastProvider>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
