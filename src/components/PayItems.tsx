import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { payItemsApi, payrollApi } from '../services/api';
import type { PayItem } from '../types';
import { ChevronLeft, Download, RefreshCcw } from 'lucide-react';

const PayItems: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const periodUuid = searchParams.get('periodUuid') || '';
  const periodLabelParam = searchParams.get('label') || '';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PayItem[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [periodLabel, setPeriodLabel] = useState(periodLabelParam);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!periodUuid) return;
    fetchPeriodLabel();
  }, [periodUuid]);

  useEffect(() => {
    if (!periodUuid) return;
    fetchItems();
  }, [periodUuid, page, size]);

  const fetchPeriodLabel = async () => {
    try {
      const res = await payrollApi.getPeriod(periodUuid);
      if (res.success) setPeriodLabel(res.data.label);
    } catch (e) {
      // ignore; label fallback from params
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await payItemsApi.search({ periodUuid, page, size });
      if (res.success) {
        setItems(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        setError(res.message || 'Failed to load pay items');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load pay items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownload = () => {
    // simple client-side CSV from currently loaded page
    const headers = ['Worker Name','Phone','Gross','Deductions','Net','State'];
    const rows = items.map(i => [i.workerName, i.workerPhone, i.grossAmount, i.deductions, i.netAmount, i.state]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pay-items-${periodLabel || periodUuid}-page${page+1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  return (
    <DashboardLayout>
      <div className="container-fluid p-4">
        <div className="d-flex align-items-center mb-3 gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)} title="Back">
            <ChevronLeft size={18} />
          </button>
          <h3 className="mb-0">Pay Items</h3>
          <span className="badge bg-info text-dark ms-2">Period: {periodLabel || periodUuid}</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-success d-flex align-items-center" disabled={!items.length} onClick={handleDownload}>
              <Download size={16} className="me-1" /> Export Page CSV
            </button>
            <button className="btn btn-outline-primary d-flex align-items-center" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <div className="spinner-border spinner-border-sm me-1" /> : <RefreshCcw size={16} className="me-1" />} Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex justify-content-between" role="alert">
            <div>{error}</div>
            <button className="btn-close" onClick={() => setError(null)} />
          </div>
        )}

        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-5 text-muted">No pay items found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Worker</th>
                      <th>Phone</th>
                      <th className="text-end">Gross</th>
                      <th className="text-end">Deductions</th>
                      <th className="text-end">Net</th>
                      <th>State</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.uuid}>
                        <td>{page * size + idx + 1}</td>
                        <td className="fw-medium">{item.workerName}</td>
                        <td><small className="text-muted">{item.workerPhone}</small></td>
                        <td className="text-end">{item.grossAmount.toFixed(2)}</td>
                        <td className="text-end">{item.deductions.toFixed(2)}</td>
                        <td className="text-end fw-semibold">{item.netAmount.toFixed(2)}</td>
                        <td><span className="badge bg-secondary">{item.state}</span></td>
                        <td><small className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements}
            </div>
            <div className="d-flex gap-2 align-items-center">
              <select className="form-select form-select-sm" style={{ width: 100 }} value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-secondary" disabled={page===0} onClick={() => setPage(p => p-1)}>Prev</button>
                <button className="btn btn-sm btn-outline-secondary" disabled={page===totalPages-1} onClick={() => setPage(p => p+1)}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PayItems;
