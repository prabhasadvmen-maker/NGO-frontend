import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getRoleFromPath, getToken, saveToken, clearToken } from './tokenStorage';
import API_BASE_URL from './apiConfig';

const AuthContext = createContext();

async function fetchMe(role, token) {
  let endpoint = '/auth/me';
  if (role === 'ADMIN') endpoint = '/admin/me';
  else if (role === 'MEMBER') endpoint = '/member/auth/me';
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  if (data.success) {
    return data.data || data.user || data;
  }
  if (data.id) {
    return data;
  }
  throw new Error('Invalid response format');
}

function loginEndpoint(role) {
  return '/api/auth/login';
}

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const portalRole = getRoleFromPath(location.pathname);
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  const token = useMemo(() => (portalRole ? getToken(portalRole) : null), [portalRole, status]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!portalRole) {
        setStatus('guest');
        setUser(null);
        return;
      }

      // Handle ?session= token in URL (for autologin flow)
      const params = new URLSearchParams(window.location.search);
      const sessionToken = params.get('session');
      if (sessionToken) {
        saveToken(portalRole, sessionToken);
        params.delete('session');
        const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
        window.history.replaceState({}, '', clean);
      }

      const t = getToken(portalRole);
      if (!t) {
        setStatus('guest');
        setUser(null);
        return;
      }

      try {
        const me = await fetchMe(portalRole, t);
        if (cancelled) return;
        setUser(me);
        setStatus('authed');
      } catch {
        if (cancelled) return;
        clearToken(portalRole);
        setUser(null);
        setStatus('guest');
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [portalRole]);

  const value = useMemo(() => {
    return {
      status,
      user,
      portalRole,
      async login(email, password, role = portalRole) {
        let endpoint = '/api/auth/login';
        if (role === 'ADMIN') endpoint = '/api/admin/login';
        else if (role === 'MEMBER') endpoint = '/api/member/auth/login';
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Login failed');
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Login failed');
        saveToken(role, data.token);
        setUser(data.user);
        setStatus('authed');
        return data.user;
      },
      setSession(role, accessToken, sessionUser) {
        saveToken(role, accessToken);
        setUser(sessionUser);
        setStatus('authed');
      },
      logout(role = portalRole) {
        if (role) clearToken(role);
        setUser(null);
        setStatus('guest');
      },
      token: portalRole ? getToken(portalRole) : null,
    };
  }, [status, user, portalRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
