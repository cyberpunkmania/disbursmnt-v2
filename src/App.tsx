import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SessionNotificationProvider, useSessionNotification } from './components/SessionNotification';
import { SessionManager } from './utils/sessionManager';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard';
import Positions from './components/Positions';
import Workers from './components/Workers';
import Payroll from './components/Payroll';

// Component to set up the session notification callback
const SessionNotificationSetup = () => {
  const { showSessionExpired } = useSessionNotification();
  
  useEffect(() => {
    SessionManager.setNotificationCallback(showSessionExpired);
  }, [showSessionExpired]);
  
  return null;
};

function App() {
  return (
    <AuthProvider>
      <SessionNotificationProvider>
        <SessionNotificationSetup />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/positions" 
              element={
                <ProtectedRoute>
                  <Positions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workers" 
              element={
                <ProtectedRoute>
                  <Workers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payroll" 
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SessionNotificationProvider>
    </AuthProvider>
  );
}

export default App;
