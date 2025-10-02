import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Eye, EyeOff, LogIn, Moon, Sun } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await login(credentials);
      setSuccessMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Login failed:', err);
      setErrorMessage('Invalid credentials. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`min-vh-100 d-flex align-items-center justify-content-center ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
      <div className="position-absolute top-0 end-0 m-3">
        <button 
          className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
          onClick={toggleTheme}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className={`card shadow-lg border-0 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className={`card-header text-center py-4 ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
                <h3 className={`fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>Fund Disbursement System</h3>
                <p className="text-muted mb-0">Sign in to your account</p>
              </div>
              
              <div className="card-body p-4">
                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}
                
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                      id="username"
                      name="username"
                      value={credentials.username}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} className="me-2" />
                        Sign In
                      </>
                    )}
                  </button>
                </form>
              </div>
              
              <div className={`card-footer text-center py-3 ${isDarkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                <small className="text-muted">
                  Fund Disbursement System v1.0
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;