import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SessionNotificationProvider, useSessionNotification } from './components/SessionNotification';
import { SessionManager } from './utils/sessionManager';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Positions from './components/Positions';
import Workers from './components/Workers';
import Payroll from './components/Payroll';
import PayItems from './components/PayItems';
import DisbursementManagement from './components/DisbursementManagement';
import SingleDisbursementPage from './components/SingleDisbursementPage';
import BatchDisbursementPage from './components/BatchDisbursementPage';
import PayoutsPage from './components/PayoutsPage';

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
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
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
            <Route
              path="/pay-items"
              element={
                <ProtectedRoute>
                  <PayItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disbursements"
              element={
                <ProtectedRoute>
                  <DisbursementManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disbursement/single"
              element={
                <ProtectedRoute>
                  <SingleDisbursementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disbursement/batch"
              element={
                <ProtectedRoute>
                  <BatchDisbursementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disbursement/payouts"
              element={
                <ProtectedRoute>
                  <PayoutsPage />
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
