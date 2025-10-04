import { useCallback } from 'react';
import { SessionManager } from '../utils/sessionManager';
import { useAuth } from '../contexts/AuthContext';

export const useSessionManager = () => {
  const { logout } = useAuth();
  
  const checkTokenExpiry = useCallback(() => {
    const token = SessionManager.getAccessToken();
    if (token && SessionManager.isTokenExpired(token)) {
      SessionManager.handleSessionExpiry();
      logout();
      return true;
    }
    return false;
  }, [logout]);
  
  const handleApiError = useCallback((error: any) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      SessionManager.handleSessionExpiry();
      logout();
      return true;
    }
    return false;
  }, [logout]);
  
  const isSessionValid = useCallback(() => {
    const token = SessionManager.getAccessToken();
    return token && !SessionManager.isTokenExpired(token);
  }, []);
  
  return {
    checkTokenExpiry,
    handleApiError,
    isSessionValid,
    clearSession: () => {
      SessionManager.clearTokens();
      logout();
    }
  };
};