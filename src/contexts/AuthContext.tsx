import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/api';
import { SessionManager } from '../utils/sessionManager';
import type { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Decode JWT token to get user info
const decodeToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      role: payload.role,
      sub: payload.sub,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount validate stored token (existence + expiry)
    const token = SessionManager.getAccessToken();
    if (token) {
      if (!SessionManager.isTokenExpired(token)) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          SessionManager.clearTokens();
        }
      } else {
        // Expired token – purge immediately so ProtectedRoute redirects straight to login
        SessionManager.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      console.log('Login response:', response);
      
      if (response.success) {
        const { access_token, refresh_token } = response.data;
        SessionManager.setTokens(access_token, refresh_token);
        
        const decodedUser = decodeToken(access_token);
        console.log('Decoded user:', decodedUser);
        setUser(decodedUser);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    SessionManager.clearTokens();
    setUser(null);
    // Remove any existing session expired alerts
    const existingAlert = document.getElementById('session-expired-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};