import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { kpiApi } from '../services/api';
import KPICard from './KPICard';
import type { WorkersKPI, PayoutsKPI, PayItemsKPI, PayPeriodsKPI } from '../types';
import { 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
  CreditCard,
  Package,
  FileText,
  Banknote,
  UserCheck,
  UserPlus,
  Briefcase,
  Activity,
  Wifi,
  Database,
  Shield,
  HardDrive
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<{
    workers: WorkersKPI | null;
    payouts: PayoutsKPI | null;
    payItems: PayItemsKPI | null;
    payPeriods: PayPeriodsKPI | null;
  }>({
    workers: null,
    payouts: null,
    payItems: null,
    payPeriods: null
  });

  // Sample activity data - in real app, this would come from API
  const recentActivity = [
    {
      id: 1,
      type: 'worker_added',
      title: 'New worker added',
      description: 'Jane Doe added to Site A team',
      time: '2 hours ago',
      icon: UserPlus,
      color: 'success'
    },
    {
      id: 2,
      type: 'payroll_processed',
      title: 'Payroll processed',
      description: 'Weekly payroll for 150 workers',
      time: '4 hours ago',
      icon: DollarSign,
      color: 'primary'
    },
    {
      id: 3,
      type: 'disbursement_sent',
      title: 'Disbursement sent',
      description: 'KES 45,000 sent via M-Pesa',
      time: '6 hours ago',
      icon: Banknote,
      color: 'success'
    },
    {
      id: 4,
      type: 'position_updated',
      title: 'Position updated',
      description: 'Supervisor role modified',
      time: '1 day ago',
      icon: Briefcase,
      color: 'warning'
    }
  ];

  // Sample system status data - in real app, this would come from API
  const systemStatus = [
    {
      id: 1,
      name: 'API Status',
      status: 'operational',
      icon: Wifi,
      color: 'success'
    },
    {
      id: 2,
      name: 'M-Pesa Integration',
      status: 'connected',
      icon: Shield,
      color: 'success'
    },
    {
      id: 3,
      name: 'Database',
      status: 'healthy',
      icon: Database,
      color: 'success'
    },
    {
      id: 4,
      name: 'Last Backup',
      status: '2 hours ago',
      icon: HardDrive,
      color: 'warning'
    }
  ];

  const quickActions = [
    {
      icon: UserPlus,
      label: 'Add New Worker',
      path: '/workers',
      color: 'primary'
    },
    {
      icon: Calendar,
      label: 'Create Pay Period',
      path: '/payroll',
      color: 'success'
    },
    {
      icon: DollarSign,
      label: 'Process Disbursement',
      path: '/disbursements',
      color: 'warning'
    },
    {
      icon: Briefcase,
      label: 'Manage Positions',
      path: '/positions',
      color: 'info'
    }
  ];

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [workersResponse, payoutsResponse, payItemsResponse, payPeriodsResponse] = await Promise.all([
        kpiApi.getWorkersKPI(),
        kpiApi.getPayoutsKPI(),
        kpiApi.getPayItemsKPI(),
        kpiApi.getPayPeriodsKPI()
      ]);

      setKpiData({
        workers: workersResponse.success ? workersResponse.data : null,
        payouts: payoutsResponse.success ? payoutsResponse.data : null,
        payItems: payItemsResponse.success ? payItemsResponse.data : null,
        payPeriods: payPeriodsResponse.success ? payPeriodsResponse.data : null
      });
    } catch (error: any) {
      console.error('Error loading KPI data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const downloadWorkersKPI = async () => {
    try {
      const blob = await kpiApi.downloadWorkersKPI();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workers-kpi-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading workers KPI:', error);
    }
  };

  const downloadPayPeriodsKPI = async () => {
    try {
      const blob = await kpiApi.downloadPayPeriodsKPI();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pay-periods-kpi-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading pay periods KPI:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Loader2 className="spinner-border text-primary" size={48} />
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <AlertTriangle className="me-2" size={20} />
        {error}
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={loadKPIData}>
          Retry
        </button>
      </div>
    );
  }

  const { workers, payouts, payItems, payPeriods } = kpiData;

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div className="mb-3 mb-md-0">
            <h2 className={`h3 fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>Dashboard</h2>
            <p className="text-muted mb-0">Real-time disbursement management overview</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={downloadWorkersKPI}>
              <Download size={16} className="me-1" />
              Workers CSV
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={downloadPayPeriodsKPI}>
              <Download size={16} className="me-1" />
              Pay Periods CSV
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={loadKPIData}>
              <TrendingUp size={16} className="me-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Top Row: Quick Actions, Recent Activity, System Status */}
      <div className="row g-4 mb-4">
        {/* Quick Actions */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header bg-primary bg-opacity-10">
              <h6 className="mb-0 fw-bold text-primary">
                <Activity size={16} className="me-2" />
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn btn-outline-${action.color} btn-sm d-flex align-items-center justify-content-start text-start`}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={16} className="me-2 flex-shrink-0" />
                    <span className="flex-grow-1">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-12 col-md-6 col-lg-4">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header bg-info bg-opacity-10">
              <h6 className="mb-0 fw-bold text-info d-flex align-items-center">
                <Clock size={16} className="me-2" />
                Recent Activity
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={`list-group-item ${isDarkMode ? 'bg-dark border-secondary' : ''} d-flex align-items-start p-3`}>
                    <div className={`me-3 mt-1 p-2 rounded-circle bg-${activity.color} bg-opacity-15 d-flex align-items-center justify-content-center activity-icon`}>
                      <activity.icon size={14} className={`text-${activity.color}`} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h6 className="mb-1 fs-6 fw-semibold">{activity.title}</h6>
                      <p className="mb-1 text-muted small">{activity.description}</p>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="col-12 col-lg-4">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header bg-success bg-opacity-10">
              <h6 className="mb-0 fw-bold text-success d-flex align-items-center">
                <Shield size={16} className="me-2" />
                System Status
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                {systemStatus.map((status) => (
                  <div key={status.id} className={`d-flex align-items-center justify-content-between p-2 rounded status-item ${isDarkMode ? 'dark' : ''}`}>
                    <div className="d-flex align-items-center">
                      <div className={`me-2 p-1 rounded bg-${status.color} bg-opacity-15 d-flex align-items-center justify-content-center status-icon`}>
                        <status.icon size={12} className={`text-${status.color}`} />
                      </div>
                      <span className="fw-medium">{status.name}</span>
                    </div>
                    <span className={`badge bg-${status.color} bg-opacity-20 text-${status.color} border border-${status.color} border-opacity-25 px-2 py-1`}>
                      {status.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Navigation */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''} border-primary border-2`}>
            <div className="card-body text-center py-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="mb-2 text-primary fw-bold">📊 Advanced Analytics & Reports</h5>
                  <p className="text-muted mb-0">View detailed charts, trends, and comprehensive KPI analysis with interactive graphs</p>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-primary btn-lg px-4"
                    onClick={() => navigate('/analytics')}
                  >
                    <TrendingUp size={20} className="me-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Modules */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <h5 className={`mb-3 ${isDarkMode ? 'text-white' : 'text-dark'}`}>Management Modules</h5>
          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center`}>
                <div className="card-body">
                  <Users className="text-primary mb-3" size={48} />
                  <h6 className="card-title">Workers Management</h6>
                  <p className="card-text text-muted small">Manage worker profiles, rates, and status</p>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/workers')}
                  >
                    View Workers
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center`}>
                <div className="card-body">
                  <Briefcase className="text-success mb-3" size={48} />
                  <h6 className="card-title">Positions</h6>
                  <p className="card-text text-muted small">Define and manage job positions</p>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate('/positions')}
                  >
                    Manage Positions
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center`}>
                <div className="card-body">
                  <Calendar className="text-info mb-3" size={48} />
                  <h6 className="card-title">Payroll</h6>
                  <p className="card-text text-muted small">Create pay periods and generate payroll</p>
                  <button 
                    className="btn btn-outline-info btn-sm"
                    onClick={() => navigate('/payroll')}
                  >
                    Process Payroll
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center`}>
                <div className="card-body">
                  <DollarSign className="text-warning mb-3" size={48} />
                  <h6 className="card-title">Disbursements</h6>
                  <p className="card-text text-muted small">Process and track payment disbursements</p>
                  <button 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => navigate('/disbursements')}
                  >
                    View Disbursements
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workers KPIs */}
      {workers && (
        <>
          <div className="d-flex align-items-center mb-3">
            <Users className="me-2" size={20} />
            <h5 className="mb-0">Workers Overview</h5>
          </div>
          <div className="row g-4 mb-4">
            <KPICard
              title="Total Workers"
              value={workers.totalWorkers}
              icon={Users}
              color="primary"
            />
            <KPICard
              title="Active Workers"
              value={workers.activeWorkers}
              subtitle={`${workers.inactiveWorkers} inactive`}
              icon={UserCheck}
              color="success"
            />
            <KPICard
              title="Payable Workers"
              value={workers.payableWorkers}
              subtitle={`${((workers.payableWorkers / workers.totalWorkers) * 100).toFixed(1)}% of total`}
              icon={CreditCard}
              color="info"
            />
            <KPICard
              title="KYC Gaps"
              value={workers.kycGaps}
              subtitle={`${workers.phoneValidPct.toFixed(1)}% phone valid`}
              icon={AlertTriangle}
              color={workers.kycGaps > 0 ? "warning" : "success"}
            />
          </div>

          {/* Workers by Frequency */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body text-center">
                  <h6 className="card-subtitle mb-3 text-muted">Daily Workers</h6>
                  <h3 className="text-primary">{workers.byFrequencyActive.daily}</h3>
                  <small className="text-muted">Active daily workers</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body text-center">
                  <h6 className="card-subtitle mb-3 text-muted">Weekly Workers</h6>
                  <h3 className="text-success">{workers.byFrequencyActive.weekly}</h3>
                  <small className="text-muted">Active weekly workers</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body text-center">
                  <h6 className="card-subtitle mb-3 text-muted">Monthly Workers</h6>
                  <h3 className="text-info">{workers.byFrequencyActive.monthly}</h3>
                  <small className="text-muted">Active monthly workers</small>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payouts KPIs */}
      {payouts && (
        <>
          <div className="d-flex align-items-center mb-3">
            <Banknote className="me-2" size={20} />
            <h5 className="mb-0">Payouts Overview</h5>
          </div>
          <div className="row g-4 mb-4">
            <KPICard
              title="Total Payouts"
              value={payouts.total}
              subtitle={`KES ${payouts.totalAmount.toLocaleString()}`}
              icon={DollarSign}
              color="primary"
            />
            <KPICard
              title="Successful"
              value={payouts.success}
              subtitle={`KES ${payouts.successAmount.toLocaleString()}`}
              icon={CheckCircle}
              color="success"
            />
            <KPICard
              title="Pending"
              value={payouts.pending}
              icon={Clock}
              color="warning"
            />
            <KPICard
              title="Failed"
              value={payouts.failed}
              icon={AlertTriangle}
              color="danger"
            />
          </div>
        </>
      )}

      {/* Pay Items and Periods */}
      <div className="row g-4 mb-4">
        {payItems && (
          <div className="col-md-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <Package className="me-2" size={20} />
                  <h6 className="mb-0">Pay Items</h6>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6 text-center">
                    <h4 className="text-primary">{payItems.total}</h4>
                    <small className="text-muted">Total Items</small>
                  </div>
                  <div className="col-6 text-center">
                    <h4 className="text-warning">{payItems.locked}</h4>
                    <small className="text-muted">Locked</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {payPeriods && (
          <div className="col-md-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <Calendar className="me-2" size={20} />
                  <h6 className="mb-0">Pay Periods</h6>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-4 text-center">
                    <h4 className="text-primary">{payPeriods.totalPeriods}</h4>
                    <small className="text-muted">Total</small>
                  </div>
                  <div className="col-4 text-center">
                    <h4 className="text-success">{payPeriods.approvedPeriods}</h4>
                    <small className="text-muted">Approved</small>
                  </div>
                  <div className="col-4 text-center">
                    <h4 className="text-info">KES {payPeriods.totalNetAmount.toLocaleString()}</h4>
                    <small className="text-muted">Net Amount</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pay Period Frequency Breakdown */}
      {payPeriods && (
        <div className="row g-4">
          <div className="col-12">
            <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <FileText className="me-2" size={20} />
                  <h6 className="mb-0">Pay Period Frequency Breakdown</h6>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <h4 className="text-primary">{payPeriods.byFrequency.counts.DAILY}</h4>
                    <p className="text-muted mb-0">Daily Periods</p>
                  </div>
                  <div className="col-md-4 text-center">
                    <h4 className="text-success">{payPeriods.byFrequency.counts.WEEKLY}</h4>
                    <p className="text-muted mb-0">Weekly Periods</p>
                  </div>
                  <div className="col-md-4 text-center">
                    <h4 className="text-info">{payPeriods.byFrequency.counts.MONTHLY}</h4>
                    <p className="text-muted mb-0">Monthly Periods</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;