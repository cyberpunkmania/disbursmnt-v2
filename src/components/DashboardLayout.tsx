import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  Send,
  Plus,
  CreditCard,
  LogOut,
  Bell,
  Search,
  Menu,
  Home,
  Settings,
  Moon,
  Sun,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [disbursementsOpen, setDisbursementsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close mobile sidebar when resizing to desktop
      if (!mobile) {
        setShowMobileSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Positions', path: '/positions', icon: Briefcase },
    { label: 'Workers', path: '/workers', icon: Users },
    { label: 'Payroll', path: '/payroll', icon: Calendar }
  ];

  const disbursementItems = [
    { label: 'Single Payout', path: '/disbursement/single', icon: Send },
    { label: 'Batch Creation', path: '/disbursement/batch', icon: Plus },
    { label: 'Payouts', path: '/disbursement/payouts', icon: CreditCard }
  ];

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Mobile Overlay */}
      {isMobile && showMobileSidebar && (
        <div 
          className="sidebar-overlay show" 
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isDarkMode ? 'sidebar-dark' : 'sidebar-light'} 
          ${!isMobile && sidebarCollapsed ? 'sidebar-collapsed' : ''} 
          ${isMobile ? 'sidebar-mobile' : ''} 
          ${isMobile && showMobileSidebar ? 'show' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {(!sidebarCollapsed || isMobile) && (
            <div className="sidebar-brand">Boker</div>
          )}
          <div className="sidebar-header-actions">
            {!isMobile && (
              <button 
                className="btn-sidebar-toggle"
                onClick={toggleSidebar} 
                aria-label="Toggle sidebar"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
            {isMobile && (
              <button 
                className="btn-sidebar-close"
                onClick={() => setShowMobileSidebar(false)} 
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed && !isMobile ? item.label : ''}
              >
                <Icon size={20} className="sidebar-icon" />
                {(!sidebarCollapsed || isMobile) && (
                  <span className="sidebar-label">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Disbursements Section */}
          <div className="disbursements-section">
            {(!sidebarCollapsed || isMobile) ? (
              <div className="sidebar-accordion">
                <button
                  className="sidebar-item accordion-toggle"
                  onClick={() => setDisbursementsOpen(!disbursementsOpen)}
                  type="button"
                >
                  <DollarSign size={20} className="sidebar-icon" />
                  <span className="sidebar-label">Disbursements</span>
                  {disbursementsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {disbursementsOpen && (
                  <div className="accordion-content">
                    {disbursementItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`sidebar-item sidebar-subitem ${isActive ? 'active' : ''}`}
                        >
                          <Icon size={16} className="sidebar-icon" />
                          <span className="sidebar-label">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Collapsed disbursement items */
              <>
                {disbursementItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      title={item.label}
                    >
                      <Icon size={20} className="sidebar-icon" />
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* Analytics */}
          <Link
            to="/analytics"
            className={`sidebar-item ${location.pathname === '/analytics' ? 'active' : ''}`}
            title={sidebarCollapsed && !isMobile ? 'Analytics' : ''}
          >
            <BarChart3 size={20} className="sidebar-icon" />
            {(!sidebarCollapsed || isMobile) && (
              <span className="sidebar-label">Analytics</span>
            )}
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}
            title={sidebarCollapsed && !isMobile ? 'Settings' : ''}
          >
            <Settings size={20} className="sidebar-icon" />
            {(!sidebarCollapsed || isMobile) && (
              <span className="sidebar-label">Settings</span>
            )}
          </Link>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`main-wrapper ${!isMobile && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className={`main-header ${isDarkMode ? 'header-dark' : 'header-light'}`}>
          <div className="header-content">
            <div className="header-left">
              {isMobile && (
                <button
                  className="btn-mobile-menu"
                  onClick={toggleSidebar}
                  aria-label="Toggle menu"
                >
                  <Menu size={20} />
                </button>
              )}
              <h4 className="header-title">Dashboard</h4>
            </div>

            <div className="header-right">
              {/* Search - Hidden on mobile */}
              <div className="search-wrapper d-none d-md-block">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={`search-input ${isDarkMode ? 'search-dark' : 'search-light'}`}
                />
              </div>

              {/* Theme Toggle */}
              <button 
                className="btn-icon"
                onClick={toggleTheme} 
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <button 
                className="btn-icon notification-btn"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>

              {/* User Dropdown */}
              <div className="dropdown">
                <button 
                  className="btn-user dropdown-toggle"
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <div className="user-avatar">
                    {user?.sub?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info d-none d-lg-block">
                    <div className="user-name">
                      {user?.sub?.split('@')[0]}
                    </div>
                    <div className="user-role">{user?.role}</div>
                  </div>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                  <li><a className="dropdown-item" href="#profile">Profile</a></li>
                  <li><a className="dropdown-item" href="#settings">Settings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <LogOut size={16} className="me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`main-content ${isDarkMode ? 'content-dark' : 'content-light'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;