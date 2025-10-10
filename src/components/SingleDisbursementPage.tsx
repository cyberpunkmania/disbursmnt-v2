import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { workersApi, disbursementsApi } from '../services/api';

const SingleDisbursementPage: React.FC = () => {
  interface Worker {
    uuid: string;
    fullName: string;
    email: string;
    phone: string;
  }
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [single, setSingle] = useState({ workerUuid: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const res = await workersApi.list();
        setWorkers(res.data || []);
      } catch {
        setWorkers([]);
        setError('Failed to load workers');
      } finally {
        setLoadingWorkers(false);
      }
    };
    fetchWorkers();
  }, []);

  const submitSingle = async () => {
    setSuccessMessage(null);
    setError(null);
    if (!single.workerUuid || !single.amount) {
      setError('Please select a worker and enter an amount');
      return;
    }
    setSubmitting(true);
    try {
      await disbursementsApi.createSinglePayout({
        workerUuid: single.workerUuid,
        amount: parseFloat(single.amount),
      });
      setSuccessMessage('Single disbursement batch created');
      setSingle({ workerUuid: '', amount: '' });
    } catch {
      setError('Failed to create disbursement');
    } finally {
      setSubmitting(false);
    }
  };

  const singlePreview = useMemo(() => {
    const w = workers.find((w: any) => w.uuid === single.workerUuid);
    return w
      ? [
          {
            uuid: w.uuid,
            fullName: w.fullName,
            email: w.email,
            phone: w.phone,
            amount: single.amount,
          },
        ]
      : [];
  }, [workers, single]);

  return (
    <DashboardLayout>
      <div className="container-fluid p-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="h3 mb-1">Single Disbursement</h2>
            <p className="text-muted mb-0">Send a single payout to a worker</p>
          </div>
        </div>
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} />
          </div>
        )}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)} />
          </div>
        )}
        <div className="card mb-4">
          <div className="card-body">
            <form
              onSubmit={e => {
                e.preventDefault();
                submitSingle();
              }}
            >
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Select Worker</label>
                  <select
                    className="form-select"
                    value={single.workerUuid}
                    onChange={e => setSingle({ ...single, workerUuid: e.target.value })}
                    disabled={loadingWorkers}
                  >
                    <option value="">Select worker</option>
                    {workers.map((w: any) => (
                      <option key={w.uuid} value={w.uuid}>
                        {w.fullName} - {w.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Amount (KES)</label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    value={single.amount}
                    onChange={e => setSingle({ ...single, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting || !single.workerUuid || !single.amount}
                >
                  {submitting ? 'Creating...' : 'Create Disbursement Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
        {single.workerUuid && (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Preview</h5>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {singlePreview.map(r => (
                      <tr key={r.uuid}>
                        <td>{r.fullName}</td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>
                          <strong>
                            KES {r.amount ? Number(r.amount).toLocaleString() : '-'}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SingleDisbursementPage;