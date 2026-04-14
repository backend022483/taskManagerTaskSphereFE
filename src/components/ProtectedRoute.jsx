import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth state is properly initialized
    console.log('ProtectedRoute - Auth state:', { isLoading, isAuthenticated });
    
    const timer = setTimeout(() => {
      console.log('ProtectedRoute - Ready to render');
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
  }

  return children;
};

export default ProtectedRoute;
