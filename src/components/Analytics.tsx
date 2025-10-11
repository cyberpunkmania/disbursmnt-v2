import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { kpiApi } from '../services/api';
import type { WorkersKPI, PayoutsKPI, PayItemsKPI, PayPeriodsKPI } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { isDarkMode } = useTheme();
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

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
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
      setError('Failed to load analytics data. Please try again.');
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Colors for charts
  const colors = ['#0d6efd', '#198754', '#fd7e14', '#dc3545', '#6f42c1', '#20c997'];

  // Chart data preparation
  const workersStatusData = kpiData.workers ? [
    { name: 'Active', value: kpiData.workers.activeWorkers, color: colors[1] },
    { name: 'Inactive', value: kpiData.workers.inactiveWorkers, color: colors[3] }
  ] : [];

  const workersFrequencyData = kpiData.workers ? [
    { name: 'Daily', active: kpiData.workers.byFrequencyActive.daily, total: kpiData.workers.byFrequencyOverall.daily },
    { name: 'Weekly', active: kpiData.workers.byFrequencyActive.weekly, total: kpiData.workers.byFrequencyOverall.weekly },
    { name: 'Monthly', active: kpiData.workers.byFrequencyActive.monthly, total: kpiData.workers.byFrequencyOverall.monthly }
  ] : [];

  const payoutsData = kpiData.payouts ? [
    { name: 'Successful', value: kpiData.payouts.success, amount: kpiData.payouts.successAmount, color: colors[1] },
    { name: 'Pending', value: kpiData.payouts.pending, amount: 0, color: colors[2] },
    { name: 'Failed', value: kpiData.payouts.failed, amount: 0, color: colors[3] }
  ] : [];

  const payPeriodsFrequencyData = kpiData.payPeriods ? [
    { name: 'Daily', count: kpiData.payPeriods.byFrequency.counts.DAILY, amount: 0 },
    { name: 'Weekly', count: kpiData.payPeriods.byFrequency.counts.WEEKLY, amount: 0 },
    { name: 'Monthly', count: kpiData.payPeriods.byFrequency.counts.MONTHLY, amount: 0 }
  ] : [];

  // Sample trend data (in real app, this would come from API)
  const trendData = [
    { month: 'Jan', workers: 120, payouts: 85000, payPeriods: 15 },
    { month: 'Feb', workers: 135, payouts: 92000, payPeriods: 18 },
    { month: 'Mar', workers: 145, payouts: 98000, payPeriods: 20 },
    { month: 'Apr', workers: 150, payouts: 105000, payPeriods: 22 },
    { month: 'May', workers: 165, payouts: 112000, payPeriods: 25 },
    { month: 'Jun', workers: 180, payouts: 125000, payPeriods: 28 }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <Loader2 className="spinner-border text-primary" size={48} />
          <p className="mt-3 text-muted">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <AlertTriangle className="me-2" size={20} />
        {error}
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={loadAnalyticsData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h2 className={`h3 fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            <BarChart3 size={28} className="me-2" />
            Analytics Dashboard
          </h2>
          <p className="text-muted mb-0">Comprehensive insights and data visualization</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <Download size={16} className="me-1" />
            Export Report
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadAnalyticsData}>
            <RefreshCw size={16} className="me-1" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} border-start border-primary border-4`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Workers</h6>
                  <h3 className="text-primary mb-0">{kpiData.workers?.totalWorkers || 0}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    {kpiData.workers?.activeWorkers || 0} Active
                  </small>
                </div>
                <Users size={32} className="text-primary opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} border-start border-success border-4`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Payouts</h6>
                  <h3 className="text-success mb-0">KES {kpiData.payouts?.totalAmount.toLocaleString() || 0}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    {kpiData.payouts?.total || 0} Transactions
                  </small>
                </div>
                <DollarSign size={32} className="text-success opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} border-start border-info border-4`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Pay Periods</h6>
                  <h3 className="text-info mb-0">{kpiData.payPeriods?.totalPeriods || 0}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    {kpiData.payPeriods?.approvedPeriods || 0} Approved
                  </small>
                </div>
                <Calendar size={32} className="text-info opacity-50" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''} border-start border-warning border-4`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Success Rate</h6>
                  <h3 className="text-warning mb-0">
                    {kpiData.payouts?.total ? Math.round((kpiData.payouts.success / kpiData.payouts.total) * 100) : 0}%
                  </h3>
                  <small className="text-success">
                    <Activity size={12} className="me-1" />
                    {kpiData.payouts?.success || 0} Successful
                  </small>
                </div>
                <PieChartIcon size={32} className="text-warning opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4">
        {/* Workers Status Pie Chart */}
        <div className="col-12 col-lg-6">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h6 className="mb-0 fw-bold">Workers Status Distribution</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workersStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workersStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payouts Status */}
        <div className="col-12 col-lg-6">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h6 className="mb-0 fw-bold">Payouts by Status</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={payoutsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={colors[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-4 mb-4">
        {/* Workers by Frequency */}
        <div className="col-12 col-lg-6">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h6 className="mb-0 fw-bold">Workers by Pay Frequency</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workersFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill={colors[1]} name="Active" />
                  <Bar dataKey="total" fill={colors[0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pay Periods Analysis */}
        <div className="col-12 col-lg-6">
          <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h6 className="mb-0 fw-bold">Pay Periods by Frequency</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={payPeriodsFrequencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="count" stackId="1" stroke={colors[2]} fill={colors[2]} name="Count" />
                  <Area type="monotone" dataKey="amount" stackId="2" stroke={colors[4]} fill={colors[4]} name="Amount (KES)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="row g-4">
        <div className="col-12">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h6 className="mb-0 fw-bold">6-Month Trend Analysis</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="workers" stroke={colors[0]} strokeWidth={3} name="Workers" />
                  <Line yAxisId="right" type="monotone" dataKey="payouts" stroke={colors[1]} strokeWidth={3} name="Payouts (KES)" />
                  <Line yAxisId="left" type="monotone" dataKey="payPeriods" stroke={colors[2]} strokeWidth={3} name="Pay Periods" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;