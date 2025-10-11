import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { disbursementsApi } from '../services/api';
import KPICard from './KPICard';
import { exportToExcel } from '../utils/excelExport';
import { ChevronLeft, ChevronRight, DollarSign, Users, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PayoutsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [payoutsData, setPayoutsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await disbursementsApi.getPayouts(page, size, 'createdAt,DESC');
        setPayoutsData(res);
      } catch {
        setPayoutsData(null);
        setError('Failed to load payouts');
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, [page, size]);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'SENT': return 'badge bg-primary';
      case 'PENDING': return 'badge bg-warning text-dark';
      case 'COMPLETED': return 'badge bg-success';
      case 'FAILED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredPayouts = useMemo(() => {
    if (!searchQuery || !payoutsData?.content) return payoutsData?.content || [];
    const query = searchQuery.toLowerCase();
    return payoutsData.content.filter(
      (payout: any) =>
        payout.workerName?.toLowerCase().includes(query) ||
        payout.workerPhone?.includes(query) ||
        payout.mpesaReceipt?.toLowerCase().includes(query)
    );
  }, [payoutsData, searchQuery]);

  // Calculate KPIs from current payouts data
  const calculateKPIs = () => {
    if (!payoutsData?.content) {
      return {
        totalPayouts: 0,
        totalAmount: 0,
        successfulPayouts: 0,
        failedPayouts: 0,
        successRate: 0
      };
    }

    const payouts = payoutsData.content;
    const totalPayouts = payouts.length;
    const totalAmount = payouts.reduce((sum: number, payout: any) => sum + payout.amount, 0);
    const successfulPayouts = payouts.filter((p: any) => p.state === 'SENT' || p.state === 'COMPLETED').length;
    const failedPayouts = payouts.filter((p: any) => p.state === 'FAILED').length;
    const successRate = totalPayouts > 0 ? (successfulPayouts / totalPayouts) * 100 : 0;

    return {
      totalPayouts,
      totalAmount,
      successfulPayouts,
      failedPayouts,
      successRate
    };
  };

  const handleExportToExcel = () => {
    if (!payoutsData?.content || payoutsData.content.length === 0) return;

    const data = payoutsData.content.map((payout: any) => ({
      'Worker Name': payout.workerName,
      'Worker Phone': payout.workerPhone,
      'Amount': payout.amount,
      'Status': payout.state,
      'MPESA Receipt': payout.mpesaReceipt || '',
      'Created At': formatDate(payout.createdAt),
      'Sent At': payout.sentAt ? formatDate(payout.sentAt) : ''
    }));

    exportToExcel({
      data,
      filename: 'payouts',
      sheetName: 'Payouts'
    });
  };

  return (
    <DashboardLayout>
      <div className="container-fluid p-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="h3 mb-1">Payouts</h2>
            <p className="text-muted mb-0">View and search all payouts</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-outline-success d-flex align-items-center"
              onClick={handleExportToExcel}
              disabled={!payoutsData?.content || payoutsData.content.length === 0}
            >
              <FileSpreadsheet size={16} className="me-1" />
              Export Excel
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {payoutsData?.content && (() => {
          const kpis = calculateKPIs();
          return (
            <div className="row g-4 mb-4">
              <KPICard
                title="Total Payouts"
                value={kpis.totalPayouts}
                icon={Users}
                color="primary"
              />
              <KPICard
                title="Total Amount"
                value={`KES ${kpis.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                color="success"
              />
              <KPICard
                title="Successful Payouts"
                value={kpis.successfulPayouts}
                subtitle={`${kpis.successRate.toFixed(1)}% success rate`}
                icon={CheckCircle}
                color="info"
              />
              <KPICard
                title="Failed Payouts"
                value={kpis.failedPayouts}
                subtitle={`${(100 - kpis.successRate).toFixed(1)}% failure rate`}
                icon={AlertCircle}
                color="warning"
              />
            </div>
          );
        })()}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button 
             aria-label="Close"
             type="button" className="btn-close" onClick={() => setError(null)} />
          </div>
        )}
        <div className="card mb-4">
          <div className="card-body">
            <div className="mb-3 d-flex align-items-center justify-content-between">
              <div className="input-group w-50">
                <span className="input-group-text">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, phone, or receipt..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="d-flex align-items-center ms-3">
                <label className="me-2 mb-0">Page Size:</label>
                <select
                  aria-label="Page size"
                  className="form-select form-select-sm w-auto"
                  value={size}
                  onChange={e => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Worker</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status" />
                      </td>
                    </tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No payouts found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p: any) => (
                      <tr key={p.uuid}>
                        <td>
                          <div>
                            <span className="fw-medium">{p.workerName}</span>
                            <br />
                            <small className="text-muted">{p.workerPhone}</small>
                          </div>
                        </td>
                        <td>
                          <strong>KES {p.amount.toLocaleString()}</strong>
                        </td>
                        <td>
                          <span className={getStateColor(p.state)}>{p.state}</span>
                        </td>
                        <td>
                          <small>{formatDate(p.createdAt)}</small>
                        </td>
                        <td>
                          <small>{p.sentAt ? formatDate(p.sentAt) : '-'}</small>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {payoutsData && payoutsData.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {page * size + 1} to {Math.min((page + 1) * size, payoutsData.totalElements)} of {payoutsData.totalElements} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                      <button
                        aria-label="Previous"
                        className="page-link"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, payoutsData.totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(payoutsData.totalPages - 5, page - 2)) + i;
                      return (
                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum + 1}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${page === payoutsData.totalPages - 1 ? 'disabled' : ''}`}>
                      <button
                        aria-label="Next"
                        className="page-link"
                        onClick={() => setPage(page + 1)}
                        disabled={page === payoutsData.totalPages - 1}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PayoutsPage;