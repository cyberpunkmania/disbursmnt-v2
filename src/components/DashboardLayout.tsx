import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  LogOut, 
  Bell,
  Search,
  Menu,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  BarChart3
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(false); // Don't auto-collapse on mobile - let user choose
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Briefcase, label: 'Positions', path: '/positions' },
    { icon: Users, label: 'Workers', path: '/workers' },
    { icon: Calendar, label: 'Payroll', path: '/payroll' },
    { icon: DollarSign, label: 'Disbursements', path: '/disbursements' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="d-flex vh-100">
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`sidebar-overlay ${showMobileSidebar ? 'show' : ''}`}
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile && showMobileSidebar ? 'show' : ''} ${isMobile && !showMobileSidebar ? 'd-none' : ''} ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark border-end'}`}>
        <div className={`d-flex align-items-center justify-content-between p-3 border-bottom ${isDarkMode ? 'border-secondary' : 'border-light-subtle'}`}>
          {!sidebarCollapsed && (
            <h5 className="mb-0 fw-bold">Fund System</h5>
          )}
          <button 
            className={`btn btn-sm ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? (
              showMobileSidebar ? <ChevronLeft size={16} /> : <Menu size={16} />
            ) : (
              sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
            )}
          </button>
        </div>
        
        <nav className="mt-3">
          {sidebarItems.slice(0, 6).map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${isActive ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                title={sidebarCollapsed ? item.label : ''}
                onClick={() => isMobile && setShowMobileSidebar(false)}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && (
                  <span className="ms-3">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* Disbursement Accordion */}
          <div className="accordion mt-2" id="disbursementAccordion">
            <div className="accordion-item bg-transparent border-0">
              <h2 className="accordion-header" id="disbursementHeading">
                <button
                  className={`accordion-button ${sidebarCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#disbursementCollapse"
                  aria-expanded="true"
                  aria-controls="disbursementCollapse"
                  style={{ boxShadow: 'none', paddingLeft: '1rem' }}
                >
                  <DollarSign size={20} className="me-2" />
                  {!sidebarCollapsed && <span>Disbursement</span>}
                </button>
              </h2>
              <div
                id="disbursementCollapse"
                className="accordion-collapse collapse show"
                aria-labelledby="disbursementHeading"
                data-bs-parent="#disbursementAccordion"
              >
                <div className="accordion-body p-0">
                  <Link
                    to="/disbursement/single"
                    className={`d-flex align-items-center p-3 ps-5 text-decoration-none sidebar-item ${location.pathname === '/disbursement/single' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                    onClick={() => isMobile && setShowMobileSidebar(false)}
                  >
                    {!sidebarCollapsed && <span>Single</span>}
                  </Link>
                  <Link
                    to="/disbursement/batch"
                    className={`d-flex align-items-center p-3 ps-5 text-decoration-none sidebar-item ${location.pathname === '/disbursement/batch' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                    onClick={() => isMobile && setShowMobileSidebar(false)}
                  >
                    {!sidebarCollapsed && <span>Batch</span>}
                  </Link>
                  <Link
                    to="/disbursement/payouts"
                    className={`d-flex align-items-center p-3 ps-5 text-decoration-none sidebar-item ${location.pathname === '/disbursement/payouts' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                    onClick={() => isMobile && setShowMobileSidebar(false)}
                  >
                    {!sidebarCollapsed && <span>Payouts</span>}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <Link
            to="/settings"
            className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${location.pathname === '/settings' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
            title={sidebarCollapsed ? 'Settings' : ''}
            onClick={() => isMobile && setShowMobileSidebar(false)}
          >
            <Settings size={20} />
            {!sidebarCollapsed && (
              <span className="ms-3">Settings</span>
            )}
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className={`shadow-sm border-bottom p-3 ${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {isMobile && (
                <button 
                  className={`btn btn-outline-secondary me-3 ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  title="Toggle sidebar"
                >
                  <Menu size={18} />
                </button>
              )}
              <h4 className={`mb-0 fw-semibold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Dashboard</h4>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative d-none d-md-block">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="form-control ps-5 search-input"
                />
              </div>
              
              <button 
                className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                onClick={toggleTheme}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} position-relative`} title="Notifications">
                <Bell size={18} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              
              <div className="dropdown">
                <button 
                  className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} dropdown-toggle d-flex align-items-center gap-2`} 
                  type="button" 
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="text-end d-none d-md-block">
                    <div className={`fw-medium small ${isDarkMode ? 'text-white' : 'text-dark'}`}>{user?.sub?.split('@')[0]}</div>
                    <div className="text-muted text-xs">{user?.role}</div>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
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
        <main className={`flex-grow-1 p-4 overflow-auto ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;