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
  BarChart3
} from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(s => !s);

  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Positions', path: '/positions', icon: Briefcase },
    { label: 'Workers', path: '/workers', icon: Users },
    { label: 'Payroll', path: '/payroll', icon: Calendar }
    // Disbursements and Analytics handled separately to allow submenu/order control
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {isMobile && showMobileSidebar && (
        <div 
          className="sidebar-overlay show" 
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar border-end ${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'} ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile && showMobileSidebar ? 'show' : ''}`}
        style={{ width: sidebarCollapsed ? 64 : 240 }}
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          {!sidebarCollapsed && <div className={`fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Boker</div>}
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={toggleSidebar} aria-label="Toggle sidebar">
              {sidebarCollapsed ? <Menu size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <nav className="mt-3">
          {sidebarItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${isActive ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                title={sidebarCollapsed ? item.label : ''}
                onClick={() => isMobile && setShowMobileSidebar(false)}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="ms-3">{item.label}</span>}
              </Link>
            );
          })}

          {/* Disbursements (single top-level with submenu) */}
          {!sidebarCollapsed ? (
            <div className="mt-2">
              <div className="bg-transparent border-0">
                <h2 className="mb-0">
                  <button
                    className="accordion-button accordion-button-sidebar"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#disbursementCollapse"
                    aria-expanded="true"
                    aria-controls="disbursementCollapse"
                  >
                    <DollarSign size={20} className="me-2" />
                    <span>Disbursements</span>
                  </button>
                </h2>
                <div id="disbursementCollapse" className="accordion-collapse collapse show" aria-labelledby="disbursementHeading">
                  <div className="p-0">
                    <Link
                      to="/disbursement/single"
                      className={`d-flex align-items-center p-3 ps-5 text-decoration-none sidebar-item ${location.pathname === '/disbursement/single' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                      onClick={() => isMobile && setShowMobileSidebar(false)}
                    >
                      <Send size={16} className="me-2" />
                      <span>Single Payout</span>
                    </Link>

                    <Link
                      to="/disbursement/batch"
                      className={`d-flex align-items-center p-3 ps-5 text-decoration-none sidebar-item ${location.pathname === '/disbursement/batch' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                      onClick={() => isMobile && setShowMobileSidebar(false)}
                    >
                      <Plus size={16} className="me-2" />
                      <span>Batch Creation</span>
                    </Link>

                    <Link
                      to="/disbursement/payouts"
                      className={`d-flex align-items-center p-3 ps-5 text-decoration-none sidebar-item ${location.pathname === '/disbursement/payouts' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                      onClick={() => isMobile && setShowMobileSidebar(false)}
                    >
                      <CreditCard size={16} className="me-2" />
                      <span>Payouts</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed disbursement items - show as individual icons */
            <>
              <Link
                to="/disbursement/single"
                className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${location.pathname === '/disbursement/single' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                title="Single Payout"
                onClick={() => isMobile && setShowMobileSidebar(false)}
              >
                <Send size={20} />
              </Link>

              <Link
                to="/disbursement/batch"
                className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${location.pathname === '/disbursement/batch' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                title="Batch Creation"
                onClick={() => isMobile && setShowMobileSidebar(false)}
              >
                <Plus size={20} />
              </Link>

              <Link
                to="/disbursement/payouts"
                className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${location.pathname === '/disbursement/payouts' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
                title="Payouts"
                onClick={() => isMobile && setShowMobileSidebar(false)}
              >
                <CreditCard size={20} />
              </Link>
            </>
          )}

          {/* Analytics (below Disbursements) */}
          <Link
            to="/analytics"
            className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${location.pathname === '/analytics' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
            title={sidebarCollapsed ? 'Analytics' : ''}
            onClick={() => isMobile && setShowMobileSidebar(false)}
          >
            <BarChart3 size={20} />
            {!sidebarCollapsed && <span className="ms-3">Analytics</span>}
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`d-flex align-items-center p-3 text-decoration-none sidebar-item ${location.pathname === '/settings' ? 'active' : ''} ${isDarkMode ? 'text-white' : 'text-dark'}`}
            title={sidebarCollapsed ? 'Settings' : ''}
            onClick={() => isMobile && setShowMobileSidebar(false)}
          >
            <Settings size={20} />
            {!sidebarCollapsed && <span className="ms-3">Settings</span>}
          </Link>
        </nav>
      </aside>

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
                <input type="text" placeholder="Search..." className="form-control ps-5 search-input" />
              </div>

              <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`} onClick={toggleTheme} title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} position-relative`} title="Notifications">
                <Bell size={18} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
              </button>

              <div className="dropdown">
                <button className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} dropdown-toggle d-flex align-items-center gap-2`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
        <main className={`flex-grow-1 p-4 overflow-auto ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
