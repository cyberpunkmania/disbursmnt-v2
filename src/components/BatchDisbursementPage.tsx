import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { disbursementsApi } from '../services/api';
import KPICard from './KPICard';
import { exportToExcel } from '../utils/excelExport';
import { ChevronLeft, ChevronRight, DollarSign, Users, Package, TrendingUp, FileSpreadsheet } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 10;

const BatchDisbursementPage: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Sorting states
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');

  // Modal states
  const [confirmBatchUuid, setConfirmBatchUuid] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchBatches();
    // eslint-disable-next-line
  }, [page, size, sortBy, direction]);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await disbursementsApi.getBatches(page, size, sortBy, direction);
      if (res && res.content) {
        setBatches(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } else {
        setBatches([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      setError('Failed to load batches');
      setBatches([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

//   const draftOnly = batches.filter((b: any) => b.status === 'DRAFT');
 const draftOnly = batches;

  // Calculate KPIs from current batches data
  const calculateKPIs = () => {
    const totalBatches = batches.length;
    const totalAmount = batches.reduce((sum, batch) => sum + (batch.amountTotal || 0), 0);
    const totalPayouts = batches.reduce((sum, batch) => sum + (batch.payoutCount || 0), 0);
    const draftBatches = batches.filter(b => b.status === 'DRAFT').length;
    const sentBatches = batches.filter(b => b.status === 'SENT').length;
    const completedBatches = batches.filter(b => b.status === 'COMPLETED').length;
    const averageAmount = totalBatches > 0 ? totalAmount / totalBatches : 0;

    return {
      totalBatches,
      totalAmount,
      totalPayouts,
      draftBatches,
      sentBatches,
      completedBatches,
      averageAmount
    };
  };

  const handleExportToExcel = () => {
    if (batches.length === 0) return;

    const data = batches.map(batch => ({
      'Source Type': batch.sourceType,
      'Source Ref': batch.sourceRef,
      'Status': batch.status,
      'Payout Count': batch.payoutCount,
      'Amount Total': batch.amountTotal,
      'Payroll Label': batch.payrollLabel || '',
      'Created At': new Date(batch.createdAt).toLocaleDateString(),
      'Updated At': new Date(batch.updatedAt).toLocaleDateString()
    }));

    exportToExcel({
      data,
      filename: 'disbursement-batches',
      sheetName: 'Batches'
    });
  };

  const doSend = async (uuid: string) => {
    setSending(true);
    setSuccessMessage(null);
    setError(null);
    try {
      await disbursementsApi.sendBatch(uuid);
      setSuccessMessage('Batch sent');
      setConfirmBatchUuid(null);
      fetchBatches();
    } catch {
      setError('Send failed');
    } finally {
      setSending(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'DRAFT':
        return <span className="badge bg-warning text-dark">Draft</span>;
        case 'SENT':
        return <span className="badge bg-primary">Sent</span>;
        case 'COMPLETED':
        return <span className="badge bg-success">Completed</span>;
        case 'FAILED':
        return <span className="badge bg-danger">Failed</span>;
        default:
        return <span className="badge bg-secondary">{status}</span>;
    }
    };

  return (
    <DashboardLayout>
      <div className="container-fluid p-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="h3 mb-1">Batch Disbursements</h2>
            <p className="text-muted mb-0">Manage and send batch disbursements</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-outline-success d-flex align-items-center"
              onClick={handleExportToExcel}
              disabled={batches.length === 0}
            >
              <FileSpreadsheet size={16} className="me-1" />
              Export Excel
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {batches.length > 0 && (() => {
          const kpis = calculateKPIs();
          return (
            <div className="row g-4 mb-4">
              <KPICard
                title="Total Batches"
                value={kpis.totalBatches}
                subtitle={`${kpis.draftBatches} draft, ${kpis.sentBatches} sent`}
                icon={Package}
                color="primary"
              />
              <KPICard
                title="Total Amount"
                value={`KES ${kpis.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle={`Avg: KES ${kpis.averageAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                color="success"
              />
              <KPICard
                title="Total Payouts"
                value={kpis.totalPayouts}
                icon={Users}
                color="info"
              />
              <KPICard
                title="Completed Batches"
                value={kpis.completedBatches}
                subtitle={`${kpis.totalBatches > 0 ? ((kpis.completedBatches / kpis.totalBatches) * 100).toFixed(1) : 0}% completion rate`}
                icon={TrendingUp}
                color="warning"
              />
            </div>
          );
        })()}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} />
          </div>
        )}
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <label className="me-2">Sort By:</label>
                <select
                  className="form-select d-inline-block w-auto"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Created At</option>
                  <option value="amountTotal">Amount</option>
                  <option value="payoutCount">Payouts</option>
                </select>
                <select
                  className="form-select d-inline-block w-auto ms-2"
                  value={direction}
                  onChange={e => setDirection(e.target.value as 'ASC' | 'DESC')}
                >
                  <option value="DESC">Desc</option>
                  <option value="ASC">Asc</option>
                </select>
              </div>
              <div>
                <label className="me-2">Page Size:</label>
                <select
                  className="form-select d-inline-block w-auto"
                  value={size}
                  onChange={e => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <h5 className="mb-3">Disbursement Batches</h5>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Source Type</th>
                    <th>Created</th>
                    <th>Payouts</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <div className="spinner-border text-primary" role="status" />
                      </td>
                    </tr>
                  ) : draftOnly.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No draft batches to display.
                      </td>
                    </tr>
                  ) : (
                    draftOnly.map(b => (
                      <tr key={b.batchUuid}>
                        <td>
                          <span className={`badge ${b.sourceType === 'SINGLE' ? 'bg-primary' : 'bg-info'}`}>
                            {b.sourceType}
                          </span>
                        </td>
                        <td>{new Date(b.createdAt).toLocaleString()}</td>
                        <td>{b.payoutCount}</td>
                        <td>KES {Number(b.amountTotal).toLocaleString()}</td>
                        <td>
                            {getStatusBadge(b.status)}
                        </td>

                        <td>
                          <button
                            className={`btn btn-sm ${b.status === 'DRAFT' ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                            onClick={() => setConfirmBatchUuid(b.batchUuid)}
                            disabled={b.status !== 'DRAFT'}
                            style={b.status !== 'DRAFT' ? { opacity: 1, cursor: 'not-allowed', color: '#888', borderColor: '#ccc', backgroundColor: '#f8f9fa' } : {}}
                          >
                            Disburse
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                      <button
                        aria-label="Previous"
                        className="page-link"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </li>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                      return (
                        <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum + 1}
                          </button>
                        </li>
                      );
                    })}
                    <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages - 1}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
            {/* Confirmation Dialog */}
            {confirmBatchUuid && (
              <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Disbursement</h5>
                      <button type="button" className="btn-close" onClick={() => setConfirmBatchUuid(null)} />
                    </div>
                    <div className="modal-body">
                      Are you sure you want to disburse this batch?
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={() => setConfirmBatchUuid(null)}>
                        Cancel
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => doSend(confirmBatchUuid!)}
                        disabled={sending}
                      >
                        {sending ? 'Sending...' : 'Yes, Disburse'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BatchDisbursementPage;