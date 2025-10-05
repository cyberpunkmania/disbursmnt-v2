import { SessionManager } from '../utils/sessionManager';

// Testing utilities for session handling
export const SessionTestUtils = {
  // Simulate a 403 session expiry
  simulateSessionExpiry: () => {
    SessionManager.handleSessionExpiry();
  },
  
  // Simulate an API 403 error
  simulateApiError: () => {
    const mockError = {
      response: {
        status: 403,
        data: {
          success: false,
          responseCode: 403,
          responseMessage: 'FORBIDDEN',
          message: 'Session expired or insufficient permissions'
        }
      }
    };
    
    // This would normally be handled by the axios interceptor
    SessionManager.handleSessionExpiry();
    return mockError;
  },
  
  // Check if tokens exist
  hasValidTokens: () => {
    const accessToken = SessionManager.getAccessToken();
    const refreshToken = SessionManager.getRefreshToken();
    return !!(accessToken && refreshToken);
  },
  
  // Get token expiry info
  getTokenInfo: () => {
    const token = SessionManager.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.id,
        email: payload.sub,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        isExpired: SessionManager.isTokenExpired(token)
      };
    } catch (error) {
      return null;
    }
  }
};

// Only available in development
export const DevSessionControls = import.meta.env.DEV ? SessionTestUtils : null;