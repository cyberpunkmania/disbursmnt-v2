import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard';
import Positions from './components/Positions';
import Workers from './components/Workers';

function App() {
  return (
    <AuthProvider>
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
