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
      path: '/disbursement/single',
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
      {/* Header Section */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div className="mb-3 mb-md-0">
            <h2 className={`h3 fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>Dashboard</h2>
            <p className="text-muted mb-0">Real-time disbursement management overview</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={loadKPIData}>
              <TrendingUp size={16} className="me-1" />
              Refresh
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={downloadWorkersKPI}>
              <Download size={16} className="me-1" />
              Workers CSV
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={downloadPayPeriodsKPI}>
              <Download size={16} className="me-1" />
              Pay Periods CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="row g-4 mb-4">
        {workers && (
          <>
            <KPICard
              title="Total Workers"
              value={workers.totalWorkers}
              subtitle={`${workers.activeWorkers} active`}
              icon={Users}
              color="primary"
            />
            <KPICard
              title="Payable Workers"
              value={workers.payableWorkers}
              subtitle={`${((workers.payableWorkers / workers.totalWorkers) * 100).toFixed(1)}% of total`}
              icon={CreditCard}
              color="info"
            />
          </>
        )}
        {payouts && (
          <>
            <KPICard
              title="Total Payouts"
              value={payouts.total}
              subtitle={`KES ${payouts.totalAmount.toLocaleString()}`}
              icon={DollarSign}
              color="success"
            />
            <KPICard
              title="Success Rate"
              value={`${((payouts.success / payouts.total) * 100).toFixed(1)}%`}
              subtitle={`${payouts.success} successful`}
              icon={CheckCircle}
              color="success"
            />
          </>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header bg-primary bg-opacity-10">
              <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                <Activity size={16} className="me-2" />
                Quick Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {quickActions.map((action, index) => (
                  <div key={index} className="col-12 col-sm-6 col-lg-3">
                    <button
                      className={`btn btn-outline-${action.color} w-100 d-flex align-items-center justify-content-center py-3`}
                      onClick={() => navigate(action.path)}
                    >
                      <action.icon size={20} className="me-2" />
                      <span>{action.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Section */}
      {workers && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <Users className="me-2 text-primary" size={24} />
              <h5 className="mb-0 fw-bold">Workers Overview</h5>
            </div>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigate('/workers')}
            >
              View All Workers
            </button>
          </div>

          <div className="row g-4 mb-3">
            <KPICard
              title="Active Workers"
              value={workers.activeWorkers}
              subtitle={`${workers.inactiveWorkers} inactive`}
              icon={UserCheck}
              color="success"
            />
            <KPICard
              title="Daily Workers"
              value={workers.byFrequencyActive.daily}
              subtitle="Active daily workers"
              icon={Calendar}
              color="primary"
            />
            <KPICard
              title="Weekly Workers"
              value={workers.byFrequencyActive.weekly}
              subtitle="Active weekly workers"
              icon={Calendar}
              color="info"
            />
            <KPICard
              title="Monthly Workers"
              value={workers.byFrequencyActive.monthly}
              subtitle="Active monthly workers"
              icon={Calendar}
              color="success"
            />
          </div>

          {workers.kycGaps > 0 && (
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <AlertTriangle className="me-2" size={20} />
              <div>
                <strong>{workers.kycGaps} workers</strong> have incomplete KYC information. 
                <span className="ms-2">Phone validation: {workers.phoneValidPct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payouts Section */}
      {payouts && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <Banknote className="me-2 text-success" size={24} />
              <h5 className="mb-0 fw-bold">Payouts Overview</h5>
            </div>
            <button 
              className="btn btn-sm btn-outline-success"
              onClick={() => navigate('/disbursement/payouts')}
            >
              View All Payouts
            </button>
          </div>

          <div className="row g-4">
            <KPICard
              title="Successful Payouts"
              value={payouts.success}
              subtitle={`KES ${payouts.successAmount.toLocaleString()}`}
              icon={CheckCircle}
              color="success"
            />
            <KPICard
              title="Pending Payouts"
              value={payouts.pending}
              subtitle="Awaiting processing"
              icon={Clock}
              color="warning"
            />
            <KPICard
              title="Failed Payouts"
              value={payouts.failed}
              subtitle="Requires attention"
              icon={AlertTriangle}
              color="danger"
            />
            <KPICard
              title="Total Amount"
              value={`KES ${payouts.totalAmount.toLocaleString()}`}
              subtitle={`${payouts.total} total payouts`}
              icon={DollarSign}
              color="primary"
            />
          </div>
        </div>
      )}

      {/* Pay Periods & Items Section */}
      <div className="row g-4 mb-4">
        {payPeriods && (
          <div className="col-12 col-lg-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <Calendar className="me-2 text-info" size={20} />
                  <h6 className="mb-0 fw-bold">Pay Periods</h6>
                </div>
                <button 
                  className="btn btn-sm btn-outline-info"
                  onClick={() => navigate('/payroll')}
                >
                  Manage
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-4 text-center">
                    <h3 className="text-primary mb-1">{payPeriods.totalPeriods}</h3>
                    <small className="text-muted">Total Periods</small>
                  </div>
                  <div className="col-4 text-center">
                    <h3 className="text-success mb-1">{payPeriods.approvedPeriods}</h3>
                    <small className="text-muted">Approved</small>
                  </div>
                  <div className="col-4 text-center">
                    <h3 className="text-info mb-1">
                      {(payPeriods.totalNetAmount / 1000).toFixed(0)}K
                    </h3>
                    <small className="text-muted">Net Amount (KES)</small>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="row g-2">
                  <div className="col-4 text-center">
                    <div className="badge bg-primary bg-opacity-15 text-primary w-100 py-2">
                      <div className="fw-bold">{payPeriods.byFrequency.counts.DAILY}</div>
                      <small>Daily</small>
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="badge bg-success bg-opacity-15 text-success w-100 py-2">
                      <div className="fw-bold">{payPeriods.byFrequency.counts.WEEKLY}</div>
                      <small>Weekly</small>
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="badge bg-info bg-opacity-15 text-info w-100 py-2">
                      <div className="fw-bold">{payPeriods.byFrequency.counts.MONTHLY}</div>
                      <small>Monthly</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {payItems && (
          <div className="col-12 col-lg-6">
            <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <Package className="me-2 text-warning" size={20} />
                  <h6 className="mb-0 fw-bold">Pay Items</h6>
                </div>
              </div>
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="row w-100">
                  <div className="col-6 text-center">
                    <h2 className="text-primary mb-2">{payItems.total}</h2>
                    <p className="text-muted mb-0">Total Pay Items</p>
                  </div>
                  <div className="col-6 text-center">
                    <h2 className="text-warning mb-2">{payItems.locked}</h2>
                    <p className="text-muted mb-0">Locked Items</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity & Status Row */}
      <div className="row g-4 mb-4">
        {/* Recent Activity */}
        <div className="col-12 col-lg-8">
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
                    <div className={`me-3 mt-1 p-2 rounded-circle bg-${activity.color} bg-opacity-15 d-flex align-items-center justify-content-center`} style={{width: '36px', height: '36px'}}>
                      <activity.icon size={16} className={`text-${activity.color}`} />
                    </div>
                    <div className="flex-grow-1">
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
                  <div key={status.id} className={`d-flex align-items-center justify-content-between p-2 rounded ${isDarkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                    <div className="d-flex align-items-center">
                      <div className={`me-2 p-1 rounded bg-${status.color} bg-opacity-15`} style={{width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <status.icon size={14} className={`text-${status.color}`} />
                      </div>
                      <span className="fw-medium small">{status.name}</span>
                    </div>
                    <span className={`badge bg-${status.color} bg-opacity-20 text-${status.color} border border-${status.color} border-opacity-25`} style={{fontSize: '0.7rem'}}>
                      {status.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Modules */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <h5 className={`mb-3 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Management Modules</h5>
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div 
                className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center cursor-pointer`}
                onClick={() => navigate('/workers')}
                style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body py-4">
                  <Users className="text-primary mb-2" size={40} />
                  <h6 className="card-title mb-1">Workers</h6>
                  <p className="card-text text-muted small mb-0">Manage profiles & rates</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div 
                className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center cursor-pointer`}
                onClick={() => navigate('/positions')}
                style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body py-4">
                  <Briefcase className="text-success mb-2" size={40} />
                  <h6 className="card-title mb-1">Positions</h6>
                  <p className="card-text text-muted small mb-0">Job positions</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div 
                className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center cursor-pointer`}
                onClick={() => navigate('/payroll')}
                style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body py-4">
                  <Calendar className="text-info mb-2" size={40} />
                  <h6 className="card-title mb-1">Payroll</h6>
                  <p className="card-text text-muted small mb-0">Pay periods</p>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div 
                className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} text-center cursor-pointer`}
                onClick={() => navigate('/disbursement/single')}
                style={{cursor: 'pointer', transition: 'transform 0.2s'}}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="card-body py-4">
                  <DollarSign className="text-warning mb-2" size={40} />
                  <h6 className="card-title mb-1">Disbursements</h6>
                  <p className="card-text text-muted small mb-0">Payment tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics CTA */}
      <div className="row g-4">
        <div className="col-12">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''} border-primary border-2`}>
            <div className="card-body text-center py-4">
              <TrendingUp size={48} className="text-primary mb-3" />
              <h5 className="mb-2 text-primary fw-bold">Advanced Analytics & Reports</h5>
              <p className="text-muted mb-3">View detailed charts, trends, and comprehensive KPI analysis with interactive graphs</p>
              <button 
                className="btn btn-primary btn-lg px-5"
                onClick={() => navigate('/analytics')}
              >
                View Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;