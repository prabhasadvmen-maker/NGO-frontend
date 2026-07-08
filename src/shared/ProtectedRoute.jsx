import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  // Wait for auth check to complete before making any decision
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  // No authenticated user - redirect to login
  if (status === 'guest') {
    const loginPath = role === 'admin' ? '/admin/login' : role === 'member' ? '/member/login' : '/superadmin/login';
    return <Navigate to={loginPath} replace />;
  }

  // Role mismatch - redirect to appropriate dashboard
  if (role && user?.role !== role) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'super_admin') return <Navigate to="/dashboard" replace />;
    if (user?.role === 'member') return <Navigate to="/member/dashboard" replace />;
    return <Navigate to="/superadmin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
