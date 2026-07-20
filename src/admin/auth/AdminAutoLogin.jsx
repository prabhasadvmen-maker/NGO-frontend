import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../shared/AuthContext';

import SEOHead from '../../Website/components/SEOHead';

const AdminAutoLogin = () => {
  const [searchParams] = useSearchParams();
  const { setSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = searchParams.get('session');
    const userParam = searchParams.get('user');
    
    if (sessionToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setSession('ADMIN', sessionToken, user);
        navigate('/admin/dashboard', { replace: true });
      } catch {
        navigate('/admin/login', { replace: true });
      }
    } else {
      navigate('/admin/login', { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SEOHead title="Admin Auto Login" noindex={true} />
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
    </div>
  );
};

export default AdminAutoLogin;
