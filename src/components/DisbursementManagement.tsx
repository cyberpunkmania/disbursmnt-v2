import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { disbursementsApi, workersApi } from '../services/api';
import type { DisbursementBatch, Payout, Worker, CreateSinglePayoutRequest } from '../types';
import { 
  Send, 
  Plus, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DisbursementManagement: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Single payout modal
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [singlePayoutForm, setSinglePayoutForm] = useState<CreateSinglePayoutRequest>({
    workerUuid: '',
    amount: 0,
    clientRef: ''
  });
  const [creatingPayout, setCreatingPayout] = useState(false);
  
  // Batch details modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<DisbursementBatch | null>(null);
  const [batchPayouts, setBatchPayouts] = useState<Payout[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  
  // Loading states
  const [sendingBatch, setSendingBatch] = useState<string | null>(null);

  useEffect(() => {
    // For demo purposes - we'll need a list batches endpoint or store created batches
    // For now, just show empty state
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await workersApi.search({ page: 0, size: 100 });
      if (response.success) {
        setWorkers(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchBatchPayouts = async (batchUuid: string) => {
    try {
      setLoadingPayouts(true);
      const response = await disbursementsApi.getBatchPayouts(batchUuid);
      if (response.success) {
        setBatchPayouts(response.data);
      } else {
        setError(response.message || 'Failed to fetch batch payouts');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch batch payouts');
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleCreateSinglePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingPayout(true);
      setError(null);
      
      const response = await disbursementsApi.createSinglePayout(singlePayoutForm);
      if (response.success) {
        setSuccess(`Single payout batch created successfully! Batch ID: ${response.data.batchUuid}`);
        setShowSingleModal(false);
        resetSinglePayoutForm();
        // Optionally refresh batches list here
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.message || 'Failed to create single payout');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create single payout');
    } finally {
      setCreatingPayout(false);
    }
  };

  const handleSendBatch = async (batchUuid: string) => {
    try {
      setSendingBatch(batchUuid);
      setError(null);
      
      const response = await disbursementsApi.sendBatch(batchUuid);
      if (response.success) {
        setSuccess(`Batch sent to M-Pesa successfully! Status: ${response.data.status}`);
        // Refresh batch details if modal is open
        if (selectedBatch?.uuid === batchUuid) {
          fetchBatchDetails(batchUuid);
        }
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.message || 'Failed to send batch');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send batch');
    } finally {
      setSendingBatch(null);
    }
  };

  const fetchBatchDetails = async (batchUuid: string) => {
    try {
      const response = await disbursementsApi.getBatch(batchUuid);
      if (response.success) {
        setSelectedBatch(response.data);
        fetchBatchPayouts(batchUuid);
        setShowBatchModal(true);
      } else {
        setError(response.message || 'Failed to fetch batch details');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch batch details');
    }
  };

  const resetSinglePayoutForm = () => {
    setSinglePayoutForm({
      workerUuid: '',
      amount: 0,
      clientRef: ''
    });
  };

  const openSinglePayoutModal = () => {
    setError(null);
    fetchWorkers();
    setShowSingleModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { class: 'bg-secondary', icon: Clock },
      SENT: { class: 'bg-warning', icon: Send },
      COMPLETED: { class: 'bg-success', icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class} d-flex align-items-center gap-1`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getPayoutStateBadge = (state: string) => {
    const stateConfig = {
      PENDING: { class: 'bg-secondary', icon: Clock },
      SENT: { class: 'bg-info', icon: Send },
      SUCCESS: { class: 'bg-success', icon: CheckCircle },
      FAILED: { class: 'bg-danger', icon: AlertCircle }
    };
    
    const config = stateConfig[state as keyof typeof stateConfig] || stateConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class} d-flex align-items-center gap-1`}>
        <Icon size={12} />
        {state}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="h3 mb-1 d-flex align-items-center">
                  <DollarSign className="me-2" size={28} />
                  Disbursement Management
                </h2>
                <p className="text-muted mb-0">Manage bulk and single payouts to workers</p>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary d-flex align-items-center"
                  onClick={openSinglePayoutModal}
                >
                  <Plus size={18} className="me-2" />
                  Single Payout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Empty State for Batches */}
        <div className="card">
          <div className="card-body text-center py-5">
            <DollarSign size={64} className="text-muted mb-3" />
            <h5 className="text-muted">No Disbursement Batches</h5>
            <p className="text-muted">
              Disbursement batches will appear here when created from approved payroll periods or single payouts.
            </p>
            <p className="text-muted small">
              To create bulk disbursements, go to Payroll → find an APPROVED period → Create Disbursement Batch
            </p>
          </div>
        </div>

        {/* Single Payout Modal */}
        {showSingleModal && (
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create Single Payout</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowSingleModal(false);
                      resetSinglePayoutForm();
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleCreateSinglePayout}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setError(null)}
                          aria-label="Close"
                        ></button>
                      </div>
                    )}
                    
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="workerSelect" className="form-label">Worker *</label>
                        <select
                          className="form-select"
                          id="workerSelect"
                          value={singlePayoutForm.workerUuid}
                          onChange={(e) => setSinglePayoutForm({ ...singlePayoutForm, workerUuid: e.target.value })}
                          required
                        >
                          <option value="">Select a worker</option>
                          {workers.map((worker) => (
                            <option key={worker.uuid} value={worker.uuid}>
                              {worker.fullName} - {worker.phone}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label htmlFor="amount" className="form-label">Amount *</label>
                        <input
                          type="number"
                          className="form-control"
                          id="amount"
                          value={singlePayoutForm.amount}
                          onChange={(e) => setSinglePayoutForm({ ...singlePayoutForm, amount: Number(e.target.value) })}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="clientRef" className="form-label">Client Reference (Optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="clientRef"
                          value={singlePayoutForm.clientRef}
                          onChange={(e) => setSinglePayoutForm({ ...singlePayoutForm, clientRef: e.target.value })}
                          placeholder="External reference for tracking"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowSingleModal(false);
                        resetSinglePayoutForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={creatingPayout}>
                      {creatingPayout ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" />
                          Creating...
                        </>
                      ) : (
                        'Create Payout'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Batch Details Modal */}
        {showBatchModal && selectedBatch && (
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Batch Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowBatchModal(false);
                      setSelectedBatch(null);
                      setBatchPayouts([]);
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Batch Summary */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <strong>Batch ID:</strong> {selectedBatch.uuid}
                    </div>
                    <div className="col-md-6">
                      <strong>Status:</strong> {getStatusBadge(selectedBatch.status)}
                    </div>
                    <div className="col-md-6">
                      <strong>Source Type:</strong> {selectedBatch.sourceType}
                    </div>
                    <div className="col-md-6">
                      <strong>Total Amount:</strong> {selectedBatch.totalAmount.toFixed(2)}
                    </div>
                    <div className="col-12">
                      <strong>Created:</strong> {new Date(selectedBatch.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Counts Summary */}
                  <div className="row g-2 mb-4">
                    <div className="col">
                      <div className="card text-center">
                        <div className="card-body py-2">
                          <div className="fs-5 fw-bold">{selectedBatch.counts.total}</div>
                          <small className="text-muted">Total</small>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card text-center">
                        <div className="card-body py-2">
                          <div className="fs-5 fw-bold text-info">{selectedBatch.counts.sent}</div>
                          <small className="text-muted">Sent</small>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card text-center">
                        <div className="card-body py-2">
                          <div className="fs-5 fw-bold text-success">{selectedBatch.counts.success}</div>
                          <small className="text-muted">Success</small>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card text-center">
                        <div className="card-body py-2">
                          <div className="fs-5 fw-bold text-danger">{selectedBatch.counts.failed}</div>
                          <small className="text-muted">Failed</small>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="card text-center">
                        <div className="card-body py-2">
                          <div className="fs-5 fw-bold text-warning">{selectedBatch.counts.pending}</div>
                          <small className="text-muted">Pending</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payouts Table */}
                  <h6>Payouts</h6>
                  {loadingPayouts ? (
                    <div className="text-center py-3">
                      <div className="spinner-border" role="status" />
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Worker</th>
                            <th>Phone</th>
                            <th className="text-end">Amount</th>
                            <th>State</th>
                            <th>Sent At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchPayouts.map((payout) => (
                            <tr key={payout.uuid}>
                              <td>{payout.workerName}</td>
                              <td><small>{payout.msisdn}</small></td>
                              <td className="text-end">{payout.amount.toFixed(2)}</td>
                              <td>{getPayoutStateBadge(payout.state)}</td>
                              <td>
                                <small>
                                  {payout.sentAt ? new Date(payout.sentAt).toLocaleString() : '-'}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {selectedBatch.status === 'DRAFT' && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleSendBatch(selectedBatch.uuid)}
                      disabled={sendingBatch === selectedBatch.uuid}
                    >
                      {sendingBatch === selectedBatch.uuid ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="me-1" />
                          Send to M-Pesa
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowBatchModal(false);
                      setSelectedBatch(null);
                      setBatchPayouts([]);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DisbursementManagement;