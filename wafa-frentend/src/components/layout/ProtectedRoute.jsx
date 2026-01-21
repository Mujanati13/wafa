import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '@/config/firebase';
import { isAuthenticated } from '@/services/authService';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in with Firebase
        // Check if we also have the JWT token
        const hasToken = localStorage.getItem('token') !== null;
        
        if (!hasToken) {
          // Firebase user exists but no JWT token - get new token
          user.getIdToken().then(idToken => {
            // Try to refresh the JWT token from backend
            console.log('Refreshing JWT token...');
            // For now, mark as authenticated - the API interceptor will handle token refresh
            setAuthenticated(true);
            setLoading(false);
          }).catch(error => {
            console.error('Error getting Firebase token:', error);
            setAuthenticated(false);
            setLoading(false);
          });
        } else {
          setAuthenticated(true);
          setLoading(false);
        }
      } else {
        // No Firebase user
        setAuthenticated(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
