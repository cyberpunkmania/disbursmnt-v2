import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const stats = [
    { 
      name: 'Total Workers', 
      value: '2,345', 
      change: '+12%', 
      changeType: 'positive',
      icon: Users, 
      color: 'primary' 
    },
    { 
      name: 'Active Positions', 
      value: '12', 
      change: '+2', 
      changeType: 'positive',
      icon: Briefcase, 
      color: 'success' 
    },
    { 
      name: 'Pay Periods', 
      value: '8', 
      change: 'This month', 
      changeType: 'neutral',
      icon: Calendar, 
      color: 'info' 
    },
    { 
      name: 'Total Disbursed', 
      value: 'KES 1.2M', 
      change: '+8.2%', 
      changeType: 'positive',
      icon: DollarSign, 
      color: 'warning' 
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: 'New worker added', 
      details: 'Jane Doe added to Site A team', 
      time: '2 hours ago',
      type: 'success'
    },
    { 
      id: 2, 
      action: 'Payroll processed', 
      details: 'Weekly payroll for 150 workers', 
      time: '4 hours ago',
      type: 'info'
    },
    { 
      id: 3, 
      action: 'Disbursement sent', 
      details: 'KES 45,000 sent via M-Pesa', 
      time: '6 hours ago',
      type: 'success'
    },
    { 
      id: 4, 
      action: 'Position updated', 
      details: 'Supervisor role modified', 
      time: '1 day ago',
      type: 'warning'
    },
  ];

  const quickActions = [
    { icon: Users, label: 'Add New Worker', color: 'primary', path: '/workers/new' },
    { icon: Calendar, label: 'Create Pay Period', color: 'success', path: '/payroll/new' },
    { icon: DollarSign, label: 'Process Disbursement', color: 'warning', path: '/disbursements/new' },
    { icon: Briefcase, label: 'Manage Positions', color: 'info', path: '/positions' },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-4">
        <h2 className={`h3 fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>Welcome back!</h2>
        <p className="text-muted">Here's what's happening with your disbursements today.</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-xl-3 col-md-6">
            <div className={`card dashboard-card stat-card ${stat.color} h-100 ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">{stat.name}</p>
                    <h4 className="fw-bold mb-0">{stat.value}</h4>
                    <small className={`text-${stat.changeType === 'positive' ? 'success' : stat.changeType === 'negative' ? 'danger' : 'muted'}`}>
                      {stat.changeType === 'positive' && <TrendingUp size={12} className="me-1" />}
                      {stat.change}
                    </small>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 rounded-3 p-3`}>
                    <stat.icon size={24} className={`text-${stat.color}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-xl-4 col-lg-6">
          <div className="card dashboard-card h-100">
            <div className="card-header bg-transparent">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    className={`btn btn-outline-${action.color} text-start d-flex align-items-center`}
                  >
                    <action.icon size={20} className="me-3" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-xl-4 col-lg-6">
          <div className="card dashboard-card h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Activity</h5>
              <Activity size={18} className="text-muted" />
            </div>
            <div className="card-body">
              <div className="timeline">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className={`d-flex mb-3 ${index === recentActivities.length - 1 ? '' : 'pb-3 border-bottom'}`}>
                    <div className={`me-3 mt-1`}>
                      <div className={`rounded-circle bg-${activity.type} bg-opacity-20 p-1`}>
                        <CheckCircle size={12} className={`text-${activity.type}`} />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="small fw-medium mb-1">{activity.action}</h6>
                      <p className="small text-muted mb-1">{activity.details}</p>
                      <small className="text-muted">
                        <Clock size={10} className="me-1" />
                        {activity.time}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="col-xl-4 col-lg-12">
          <div className={`card dashboard-card h-100 ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header bg-transparent">
              <h5 className="card-title mb-0">System Status</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-20 rounded-circle p-1 me-2">
                      <CheckCircle size={12} className="text-success" />
                    </div>
                    <span className="small">API Status</span>
                  </div>
                  <span className="badge bg-success">Operational</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-20 rounded-circle p-1 me-2">
                      <CheckCircle size={12} className="text-success" />
                    </div>
                    <span className="small">M-Pesa Integration</span>
                  </div>
                  <span className="badge bg-success">Connected</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-20 rounded-circle p-1 me-2">
                      <CheckCircle size={12} className="text-success" />
                    </div>
                    <span className="small">Database</span>
                  </div>
                  <span className="badge bg-success">Healthy</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-20 rounded-circle p-1 me-2">
                      <Clock size={12} className="text-warning" />
                    </div>
                    <span className="small">Last Backup</span>
                  </div>
                  <span className="badge bg-warning">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Management Cards */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className={`card dashboard-card ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}>
            <div className="card-header bg-transparent">
              <h5 className="card-title mb-0">Management Modules</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <div className="text-center p-4 border rounded-3 h-100 dashboard-card">
                    <Users size={48} className="text-primary mb-3" />
                    <h6 className="fw-semibold">Workers Management</h6>
                    <p className="small text-muted mb-3">Manage worker profiles, rates, and status</p>
                    <button className="btn btn-outline-primary btn-sm">View Workers</button>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="text-center p-4 border rounded-3 h-100 dashboard-card">
                    <Briefcase size={48} className="text-success mb-3" />
                    <h6 className="fw-semibold">Positions</h6>
                    <p className="small text-muted mb-3">Define and manage job positions</p>
                    <button className="btn btn-outline-success btn-sm">Manage Positions</button>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="text-center p-4 border rounded-3 h-100 dashboard-card">
                    <Calendar size={48} className="text-info mb-3" />
                    <h6 className="fw-semibold">Payroll</h6>
                    <p className="small text-muted mb-3">Create pay periods and generate payroll</p>
                    <button className="btn btn-outline-info btn-sm">Process Payroll</button>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="text-center p-4 border rounded-3 h-100 dashboard-card">
                    <DollarSign size={48} className="text-warning mb-3" />
                    <h6 className="fw-semibold">Disbursements</h6>
                    <p className="small text-muted mb-3">Process and track payment disbursements</p>
                    <button className="btn btn-outline-warning btn-sm">View Disbursements</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;