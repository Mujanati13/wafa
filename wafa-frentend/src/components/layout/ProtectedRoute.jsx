import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check for JWT token in localStorage (backend authentication)
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // User is authenticated if both token and user data exist
      if (token && user) {
        try {
          JSON.parse(user); // Verify user is valid JSON
          setAuthenticated(true);
        } catch (error) {
          console.error('Invalid user data in localStorage:', error);
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login if not authenticated, save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the children
  return children;
};

export default ProtectedRoute;
