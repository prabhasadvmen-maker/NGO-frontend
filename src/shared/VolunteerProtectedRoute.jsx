import React from 'react';
import { Navigate } from 'react-router-dom';

const VolunteerProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem('savitram_volunteer_token') ||
    localStorage.getItem('savitram_admin_token') ||
    localStorage.getItem('savitram_superadmin_token') ||
    localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/volunteer/login" replace />;
  }

  return children;
};

export default VolunteerProtectedRoute;
