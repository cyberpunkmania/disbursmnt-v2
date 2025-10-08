import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SessionManager } from '../utils/sessionManager';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If not loading and no authenticated user, ensure we don't flash a protected page
  if (!isLoading && !isAuthenticated) {
    const token = SessionManager.getAccessToken();
    if (!token || SessionManager.isTokenExpired(token)) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  }

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;