import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();
const BYPASS_AUTH = (() => {
  const host = window.location.hostname || '';
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local');
})();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const location = useLocation();
  const navigate = useNavigate();

  // Check for token in URL (from Okta callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
        
    if (urlToken) {
      localStorage.setItem('auth_token', urlToken);
      setToken(urlToken);
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);
  // Check auth status when token changes
  useEffect(() => {
    checkAuth();
  }, [token]);

  const checkAuth = async () => {
    if (BYPASS_AUTH) {
      setUser({ authenticated: true, name: 'Local Admin', email: 'local@example.com' });
      setLoading(false);
      return;
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data);
        } else {
          setUser(null);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to backend login endpoint
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const getAuthHeader = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}