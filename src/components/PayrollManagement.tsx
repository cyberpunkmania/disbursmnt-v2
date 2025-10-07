import React, { useState, useEffect } from 'react';
import { payrollApi } from '../services/api';
import type { PayPeriod, CreatePayPeriodRequest, UpdatePayPeriodRequest, PayrollSearchParams } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Search, 
  Plus, 
  Edit, 
  Download, 
  Users, 
  CheckCircle, 
  Clock, 
  Filter,
  MoreVertical,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PayrollManagement: React.FC = () => {
  const { theme } = useTheme();
  const [payrolls, setPayrolls] = useState<PayPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search and filter states
  const [searchParams, setSearchParams] = useState<PayrollSearchParams>({
    page: 0,
    size: 10,
    sort: 'createdAt,desc'
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayPeriod | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreatePayPeriodRequest>({
    frequency: 'MONTHLY',
    startDate: '',
    endDate: '',
    label: ''
  });

  // Loading states for buttons
  const [autoAssignLoading, setAutoAssignLoading] = useState<string | null>(null);
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, [searchParams]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollApi.search(searchParams);
      if (response.success) {
        setPayrolls(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setError(response.message || 'Failed to fetch payrolls');
      }
    } catch (error: any) {
      console.error('Error fetching payrolls:', error);
      setError('Failed to fetch payrolls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ...searchParams, page: 0 });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      setError(null);
      const response = await payrollApi.createPeriod(formData);
      if (response.success) {
        setSuccess('Payroll period created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchPayrolls();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to create payroll period');
      }
    } catch (error: any) {
      console.error('Error creating payroll:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create payroll period. Please try again.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    try {
      setUpdateLoading(true);
      setError(null);
      const updateData: UpdatePayPeriodRequest = {
        label: formData.label,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      
      const response = await payrollApi.updatePeriod(editingPayroll.uuid, updateData);
      if (response.success) {
        setSuccess('Payroll period updated successfully!');
        setShowEditModal(false);
        setEditingPayroll(null);
        resetForm();
        fetchPayrolls();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to update payroll period');
      }
    } catch (error: any) {
      console.error('Error updating payroll:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update payroll period. Please try again.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAutoAssign = async (payroll: PayPeriod) => {
    if (payroll.status !== 'DRAFT') return;
    
    try {
      setAutoAssignLoading(payroll.uuid);
      setError(null);
      
      const response = await payrollApi.autoAssignWorkers(payroll.uuid);
      if (response.success) {
        setSuccess('Workers auto-assigned successfully!');
        fetchPayrolls();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to auto-assign workers');
      }
    } catch (error: any) {
      console.error('Error auto-assigning workers:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to auto-assign workers. Please try again.');
      }
    } finally {
      setAutoAssignLoading(null);
    }
  };

  const handleApprove = async (payroll: PayPeriod) => {
    if (payroll.status !== 'PENDING') return;
    
    try {
      setApproveLoading(payroll.uuid);
      setError(null);
      
      const response = await payrollApi.approvePeriod(payroll.uuid);
      if (response.success) {
        setSuccess('Payroll period approved successfully!');
        fetchPayrolls();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to approve payroll period');
      }
    } catch (error: any) {
      console.error('Error approving payroll:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to approve payroll period. Please try again.');
      }
    } finally {
      setApproveLoading(null);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloadLoading(true);
      setError(null);
      
      console.log('Starting CSV download...');
      const blob = await payrollApi.downloadCSV();
      
      // Verify blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Empty or invalid CSV data received');
      }
      
      console.log('CSV blob received, size:', blob.size);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-periods-${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setSuccess('Payroll data downloaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error downloading CSV:', error);
      
      // More specific error handling
      if (error.message?.includes('No payroll data available')) {
        setError('No payroll periods found to export. Please create some payroll periods first.');
      } else if (error.message?.includes('not CSV format') || error.message?.includes('invalid data')) {
        setError('The server CSV endpoint is not working properly. Generated CSV from available data instead.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred while generating CSV. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Download timeout. Please try again.');
      } else if (error.message?.includes('Empty or invalid')) {
        setError('No data available for export. Please ensure there are payroll records to download.');
      } else {
        setError(error.message || 'Failed to download CSV. Please try again.');
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  const openEditModal = (payroll: PayPeriod) => {
    setEditingPayroll(payroll);
    setFormData({
      frequency: payroll.frequency,
      startDate: payroll.startDate,
      endDate: payroll.endDate,
      label: payroll.label
    });
    setError(null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      frequency: 'MONTHLY',
      startDate: '',
      endDate: '',
      label: ''
    });
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { class: 'bg-secondary', icon: Clock },
      PENDING: { class: 'bg-warning', icon: Clock },
      APPROVED: { class: 'bg-success', icon: CheckCircle },
      COMPLETED: { class: 'bg-primary', icon: CheckCircle }
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

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...searchParams, page: newPage });
  };

  if (loading && payrolls.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-25">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="h3 mb-1 d-flex align-items-center">
                <Calendar className="me-2" size={28} />
                Payroll Management
              </h2>
              <p className="text-muted mb-0">Manage payroll periods and worker assignments</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={handleDownloadCSV}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                ) : (
                  <Download size={18} className="me-2" />
                )}
                {downloadLoading ? 'Downloading...' : 'Export CSV'}
              </button>
              <button
                className="btn btn-primary d-flex align-items-center"
                onClick={() => {
                  setError(null);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={18} className="me-2" />
                Create Period
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

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="position-relative">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search payrolls..."
                    value={searchParams.q || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, q: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={searchParams.status || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={searchParams.frequency || ''}
                  onChange={(e) => setSearchParams({ ...searchParams, frequency: e.target.value })}
                  aria-label="Filter by frequency"
                >
                  <option value="">All Frequencies</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={searchParams.size}
                  onChange={(e) => setSearchParams({ ...searchParams, size: Number(e.target.value), page: 0 })}
                  aria-label="Items per page"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <div className="col-md-3">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-outline-primary">
                    <Search size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchParams({ page: 0, size: 10, sort: 'createdAt,desc' });
                    }}
                  >
                    <Filter size={16} className="me-1" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className={`table-${theme === 'dark' ? 'dark' : 'light'}`}>
                <tr>
                  <th>Label</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Created</th>
                  <th className="col-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No payroll periods found
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll.uuid}>
                      <td className="fw-medium">{payroll.label}</td>
                      <td>{payroll.frequency}</td>
                      <td>{getStatusBadge(payroll.status)}</td>
                      <td>
                        <small className="text-muted">
                          {new Date(payroll.startDate).toLocaleDateString()} - {new Date(payroll.endDate).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {payroll.createdAt ? new Date(payroll.createdAt).toLocaleDateString() : '-'}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {payroll.status === 'DRAFT' && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleAutoAssign(payroll)}
                              disabled={autoAssignLoading === payroll.uuid}
                              title="Auto-assign workers"
                            >
                              {autoAssignLoading === payroll.uuid ? (
                                <div className="spinner-border spinner-border-sm" role="status" />
                              ) : (
                                <>
                                  <Users size={14} className="me-1" />
                                  Auto-assign
                                </>
                              )}
                            </button>
                          )}
                          
                          {payroll.status === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleApprove(payroll)}
                              disabled={approveLoading === payroll.uuid}
                              title="Approve payroll"
                            >
                              {approveLoading === payroll.uuid ? (
                                <div className="spinner-border spinner-border-sm" role="status" />
                              ) : (
                                <>
                                  <CheckCircle size={14} className="me-1" />
                                  Approve
                                </>
                              )}
                            </button>
                          )}
                          
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-label="More actions"
                            >
                              <MoreVertical size={14} />
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item d-flex align-items-center gap-2"
                                  onClick={() => openEditModal(payroll)}
                                >
                                  <Edit size={14} />
                                  Edit
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {searchParams.page! * searchParams.size! + 1} to{' '}
            {Math.min((searchParams.page! + 1) * searchParams.size!, totalElements)} of{' '}
            {totalElements} entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${searchParams.page === 0 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(searchParams.page! - 1)}
                  disabled={searchParams.page === 0}
                >
                  <ChevronLeft size={16} />
                </button>
              </li>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(0, Math.min(totalPages - 5, searchParams.page! - 2)) + i;
                return (
                  <li key={page} className={`page-item ${searchParams.page === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page + 1}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${searchParams.page === totalPages - 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(searchParams.page! + 1)}
                  disabled={searchParams.page === totalPages - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Payroll Period</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleCreate}>
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
                      <label htmlFor="createLabel" className="form-label">Label *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="createLabel"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="createFrequency" className="form-label">Frequency *</label>
                      <select
                        className="form-select"
                        id="createFrequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' })}
                        required
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="createStartDate" className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="createStartDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="createEndDate" className="form-label">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="createEndDate"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status" />
                        Creating...
                      </>
                    ) : (
                      'Create Period'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPayroll && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Payroll Period</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPayroll(null);
                    resetForm();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleUpdate}>
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
                      <label htmlFor="editLabel" className="form-label">Label *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editLabel"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="editFrequency" className="form-label">Frequency *</label>
                      <select
                        className="form-select"
                        id="editFrequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' })}
                        required
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="editStartDate" className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="editStartDate"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="editEndDate" className="form-label">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="editEndDate"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPayroll(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={updateLoading}>
                    {updateLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status" />
                        Updating...
                      </>
                    ) : (
                      'Update Period'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;