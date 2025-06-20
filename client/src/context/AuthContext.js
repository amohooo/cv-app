import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Only check auth once on initial mount
  useEffect(() => {
    // Detect container restart or new browser session
    const detectRestart = () => {
      try {
        // Generate a unique session ID for this browser tab
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('sessionId', sessionId);
          console.log('New session started, clearing authentication state');
          localStorage.removeItem('token');
          return true;
        }
        
        // Check if this is a new page load (not just a React re-render)
        const lastLoadTime = sessionStorage.getItem('lastLoadTime');
        const currentTime = Date.now();
        
        if (!lastLoadTime) {
          // This is a new page load
          sessionStorage.setItem('lastLoadTime', currentTime.toString());
          
          // Check if it's been more than 1 minute since the last recorded load
          // This would suggest a container restart or browser restart
          const lastRecordedTime = localStorage.getItem('lastRecordedTime');
          if (!lastRecordedTime || (currentTime - parseInt(lastRecordedTime)) > 60000) {
            console.log('Container restart or new browser session detected');
            localStorage.removeItem('token');
            localStorage.setItem('lastRecordedTime', currentTime.toString());
            return true;
          }
          
          localStorage.setItem('lastRecordedTime', currentTime.toString());
        }
        
        return false;
      } catch (err) {
        console.error('Error in session detection:', err);
        return false;
      }
    };
    
    // Run detection and auth check
    const isRestart = detectRestart();
    if (isRestart) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
    } else if (!initialized) {
      checkAuthOnStartup();
    }
  }, [initialized]);

  const checkAuthOnStartup = async () => {
    // Skip auth check on login and register pages
    if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return;
      }

      // Add token verification check to ensure it's still valid
      try {
        const response = await api.get('/auth/check');
        
        if (response.data.authenticated) {
          setUser(response.data.user);
        } else {
          // Token not valid anymore
          setUser(null);
          localStorage.removeItem('token');
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
      } catch (error) {
        // If auth check fails, clear token and redirect to login
        console.error('Auth check error:', error);
        setUser(null);
        localStorage.removeItem('token');
        
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { 
        username, 
        password 
      });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      setUser(user);
      
      // Use a synchronous redirect
      window.location.href = '/';
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      localStorage.removeItem('token');
      setError(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/auth/logout');
      setUser(null);
      localStorage.removeItem('token');
      setError(null);
      
      // Use a synchronous redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 