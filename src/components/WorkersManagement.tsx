import { useState, useEffect }from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { workersApi, positionsApi } from '../services/api';
import type { Worker, Position, CreateWorkerRequest, WorkerSearchParams, PaginatedResponse } from '../types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  MoreVertical,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const WorkersManagement: React.FC = () => {
  const { theme } = useTheme();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search and filter states
  const [searchParams, setSearchParams] = useState<WorkerSearchParams>({
    page: 0,
    size: 20,
    keyword: '',
    status: undefined,
    payFrequency: undefined,
    payable: undefined,
    team: '',
    minRate: undefined,
    maxRate: undefined
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // Form state
  const [formData, setFormData] = useState<CreateWorkerRequest>({
    fullName: '',
    phone: '',
    email: '',
    payFrequency: 'WEEKLY',
    rate: 0,
    status: 'ACTIVE',
    nationalId: '',
    kraPin: '',
    team: '',
    positionUuid: ''
  });

  useEffect(() => {
    loadPositions();
    searchWorkers();
  }, []);

  useEffect(() => {
    searchWorkers();
  }, [searchParams.page, searchParams.size]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const loadPositions = async () => {
    try {
      const response = await positionsApi.list(true);
      if (response.success) {
        setPositions(response.data);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const searchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await workersApi.search(searchParams);

      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<Worker>;
        setWorkers(paginatedData.content);
        setPagination({
          page: paginatedData.number,
          size: paginatedData.size,
          totalElements: paginatedData.totalElements,
          totalPages: paginatedData.totalPages
        });
      } else {
        setError(response.message || 'Failed to load workers');
        setWorkers([]);
      }
    } catch (error) {
      console.error('Error searching workers:', error);
      setError('Failed to load workers. Please try again.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 0 }));
    searchWorkers();
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.positionUuid) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await workersApi.create({
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        team: formData.team.trim() || ''
      });

      if (response.success) {
        showSuccessMessage('Worker created successfully!');
        setShowCreateModal(false);
        resetForm();
        searchWorkers();
      } else {
        setError(response.message || 'Failed to create worker');
      }
    } catch (error: any) {
      console.error('Error creating worker:', error);
      setError(error.response?.data?.message || 'Failed to create worker. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.positionUuid) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await workersApi.update(selectedWorker.uuid, {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        team: formData.team.trim() || ''
      });

      if (response.success) {
        showSuccessMessage('Worker updated successfully!');
        setShowEditModal(false);
        resetForm();
        searchWorkers();
      } else {
        setError(response.message || 'Failed to update worker');
      }
    } catch (error: any) {
      console.error('Error updating worker:', error);
      setError(error.response?.data?.message || 'Failed to update worker. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorker = async () => {
    if (!workerToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await workersApi.delete(workerToDelete.uuid);
      if (response.success) {
        showSuccessMessage('Worker deleted successfully!');
        setShowDeleteModal(false);
        setWorkerToDelete(null);
        searchWorkers();
      } else {
        setError(response.message || 'Failed to delete worker');
      }
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      setError(error.response?.data?.message || 'Failed to delete worker. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePayable = async (worker: Worker) => {
    try {
      const response = await workersApi.togglePayable(worker.uuid, !worker.payable);
      if (response.success) {
        showSuccessMessage(`Worker ${!worker.payable ? 'enabled' : 'disabled'} for payroll successfully!`);
        searchWorkers();
      } else {
        setError(response.message || 'Failed to update worker payable status');
      }
    } catch (error: any) {
      console.error('Error toggling payable status:', error);
      setError('Failed to update worker payable status. Please try again.');
    }
  };

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormData({
      fullName: worker.fullName,
      phone: worker.phone,
      email: worker.email,
      payFrequency: worker.payFrequency,
      rate: worker.rate,
      status: worker.status,
      nationalId: worker.nationalId || '',
      kraPin: worker.kraPin || '',
      team: worker.team,
      positionUuid: worker.positionUuid
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (worker: Worker) => {
    setWorkerToDelete(worker);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      payFrequency: 'WEEKLY',
      rate: 0,
      status: 'ACTIVE',
      nationalId: '',
      kraPin: '',
      team: '',
      positionUuid: ''
    });
    setSelectedWorker(null);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams(prev => ({ ...prev, size: newSize, page: 0 }));
  };

  const clearFilters = () => {
    setSearchParams({
      page: 0,
      size: 20,
      keyword: '',
      status: undefined,
      payFrequency: undefined,
      payable: undefined,
      team: '',
      minRate: undefined,
      maxRate: undefined
    });
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(1, pagination.page - delta + 1);
         i <= Math.min(pagination.totalPages - 1, pagination.page + delta + 1);
         i++) {
      range.push(i);
    }

    if (pagination.page - delta > 1) {
      rangeWithDots.push(0, '...');
    } else {
      rangeWithDots.push(0);
    }

    rangeWithDots.push(...range);

    if (pagination.page + delta < pagination.totalPages - 2) {
      rangeWithDots.push('...', pagination.totalPages - 1);
    } else if (pagination.totalPages > 1) {
      rangeWithDots.push(pagination.totalPages - 1);
    }

    return rangeWithDots;
  };

  if (loading && workers.length === 0) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Loader2 className="spinner-border text-primary mb-3" size={48} />
            <p className="text-muted">Loading workers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Workers Management</h2>
          <small className="text-muted">
            {pagination.totalElements} worker{pagination.totalElements === 1 ? '' : 's'} found
          </small>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowCreateModal(true)}
          disabled={submitting}
        >
          <Plus size={20} />
          Add Worker
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
          <CheckCircle size={20} />
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Error Message */}
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

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, phone..."
                  value={searchParams.keyword || ''}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                />
              </div>
            </div>

            <div className="col-md-2">
              <select
                title='Status'
                className="form-select"
                value={searchParams.status || ''}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  status: e.target.value as 'ACTIVE' | 'INACTIVE' | undefined || undefined
                }))}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                title='Pay Frequency'
                className="form-select"
                value={searchParams.payFrequency || ''}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  payFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | undefined || undefined
                }))}
              >
                <option value="">All Frequency</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </div>

            <div className="col-md-2">
              <select
                title='Payable'
                className="form-select"
                value={searchParams.payable === undefined ? '' : searchParams.payable.toString()}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  payable: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
              >
                <option value="">All Payable</option>
                <option value="true">Payable</option>
                <option value="false">Not Payable</option>
              </select>
            </div>

            <div className="col-md-2">
              <div className="d-flex gap-2">
                <button
                  title='Search'
                  className="btn btn-outline-primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <Search size={16} />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Team"
                value={searchParams.team || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, team: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Min Rate"
                value={searchParams.minRate || ''}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  minRate: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Max Rate"
                value={searchParams.maxRate || ''}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  maxRate: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
            </div>
            <div className="col-md-3">
              <select
              title='Workers per page'
                className="form-select"
                value={searchParams.size}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading && (
            <div className="text-center p-3">
              <Loader2 className="spinner-border text-primary" size={24} />
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className={`table-${theme === 'dark' ? 'dark' : 'light'}`}>
                <tr>
                  <th>Worker</th>
                  <th>Contact</th>
                  <th>Position</th>
                  <th>Pay Info</th>
                  <th>Status</th>
                  <th>Team</th>
                  <th className="col-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="text-muted">
                        {pagination.totalElements === 0 ? (
                          <>
                            <Users size={48} className="mb-3 opacity-50" />
                            <p className="mb-2">No workers found</p>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowCreateModal(true)}
                            >
                              <Plus size={16} className="me-1" />
                              Add your first worker
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="mb-2">No workers match your current filters</p>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={clearFilters}
                            >
                              Clear filters
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => (
                    <tr key={worker.uuid}>
                      <td>
                        <div>
                          <div className="fw-medium">{worker.fullName}</div>
                          {worker.nationalId && (
                            <small className="text-muted">ID: {worker.nationalId}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <Mail size={14} />
                            <small>{worker.email}</small>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Phone size={14} />
                            <small>{worker.phone}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{worker.positionName}</span>
                      </td>
                      <td>
                        <div>
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <DollarSign size={14} />
                            <span>KES {worker.rate.toLocaleString()}</span>
                          </div>
                          <small className="text-muted">{worker.payFrequency}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className={`badge ${worker.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                            {worker.status}
                          </span>
                          <br />
                          <span className={`badge mt-1 ${worker.payable ? 'bg-info' : 'bg-warning'}`}>
                            {worker.payable ? 'Payable' : 'Not Payable'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {worker.team && (
                          <div className="d-flex align-items-center gap-1">
                            <MapPin size={14} />
                            <span>{worker.team}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-label="Worker actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => handleEdit(worker)}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => handleTogglePayable(worker)}
                              >
                                {worker.payable ? <UserX size={16} /> : <UserCheck size={16} />}
                                {worker.payable ? 'Disable Payroll' : 'Enable Payroll'}
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item text-danger d-flex align-items-center gap-2"
                                onClick={() => handleDeleteClick(worker)}
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </li>
                          </ul>
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
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Showing {pagination.page * pagination.size + 1} to{' '}
            {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
            {pagination.totalElements} entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${pagination.page === 0 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                >
                  <ChevronLeft size={16} />
                </button>
              </li>

              {getPageNumbers().map((pageNumber, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    pageNumber === pagination.page ? 'active' : ''
                  } ${pageNumber === '...' ? 'disabled' : ''}`}
                >
                  {pageNumber === '...' ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pageNumber as number)}
                    >
                      {(pageNumber as number) + 1}
                    </button>
                  )}
                </li>
              ))}

              <li className={`page-item ${pagination.page >= pagination.totalPages - 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {showCreateModal ? 'Add New Worker' : 'Edit Worker'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                  disabled={submitting}
                ></button>
              </div>
              <form onSubmit={showCreateModal ? handleCreateWorker : handleUpdateWorker}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="fullName" className="form-label">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        disabled={submitting}
                        maxLength={100}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="position" className="form-label">
                        Position *
                      </label>
                      <select
                        className="form-select"
                        id="position"
                        value={formData.positionUuid}
                        onChange={(e) => setFormData({ ...formData, positionUuid: e.target.value })}
                        required
                        disabled={submitting}
                      >
                        <option value="">Select Position</option>
                        {positions.map((position) => (
                          <option key={position.uuid} value={position.uuid}>
                            {position.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="team" className="form-label">
                        Team
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="team"
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        disabled={submitting}
                        maxLength={50}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="status" className="form-label">
                        Status *
                      </label>
                      <select
                        className="form-select"
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                        required
                        disabled={submitting}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="payFrequency" className="form-label">
                        Pay Frequency *
                      </label>
                      <select
                        className="form-select"
                        id="payFrequency"
                        value={formData.payFrequency}
                        onChange={(e) => setFormData({ ...formData, payFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' })}
                        required
                        disabled={submitting}
                      >
                        <option value="DAILY">DAILY</option>
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="rate" className="form-label">
                        Rate (KES) *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="rate"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                        required
                        min="0"
                        step="0.01"
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="nationalId" className="form-label">
                        National ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nationalId"
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        disabled={submitting}
                        maxLength={20}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="kraPin" className="form-label">
                        KRA PIN
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="kraPin"
                        value={formData.kraPin}
                        onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                        disabled={submitting}
                        maxLength={20}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
                    {submitting ? 'Saving...' : (showCreateModal ? 'Create' : 'Update')} Worker
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && workerToDelete && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the worker "{workerToDelete.fullName}"?
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={handleDeleteWorker}
                  disabled={deleting}
                >
                  {deleting && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
                  {deleting ? 'Deleting...' : 'Delete Worker'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersManagement;