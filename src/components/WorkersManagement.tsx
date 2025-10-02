import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { workersApi, positionsApi } from '../services/api';
import type { Worker, Position, CreateWorkerRequest } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Phone, 
  Mail, 
  DollarSign,
  MapPin,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Eye
} from 'lucide-react';

const WorkersManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CreateWorkerRequest>({
    fullName: '',
    phone: '',
    email: '',
    payFrequency: 'WEEKLY',
    rate: 0,
    nationalId: '',
    kraPin: '',
    team: '',
    positionUuid: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersResponse, positionsResponse] = await Promise.all([
        workersApi.list(),
        positionsApi.list(true)
      ]);

      if (workersResponse.success) {
        setWorkers(workersResponse.data);
      }
      if (positionsResponse.success) {
        setPositions(positionsResponse.data);
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const response = await workersApi.create(formData);
      if (response.success) {
        setSuccess('Worker created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to create worker. Please try again.');
      console.error('Error creating worker:', err);
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    try {
      setError('');
      const response = await workersApi.update(selectedWorker.uuid, formData);
      if (response.success) {
        setSuccess('Worker updated successfully!');
        setShowEditModal(false);
        setSelectedWorker(null);
        resetForm();
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update worker. Please try again.');
      console.error('Error updating worker:', err);
    }
  };

  const handleDeleteWorker = async (worker: Worker) => {
    if (!window.confirm(`Are you sure you want to delete ${worker.fullName}?`)) return;

    try {
      setError('');
      const response = await workersApi.delete(worker.uuid);
      if (response.success) {
        setSuccess('Worker deleted successfully!');
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete worker. Please try again.');
      console.error('Error deleting worker:', err);
    }
  };

  const handleTogglePayable = async (worker: Worker) => {
    try {
      setError('');
      const response = await workersApi.togglePayable(worker.uuid, !worker.payable);
      if (response.success) {
        setSuccess(`Worker ${worker.payable ? 'disabled' : 'enabled'} for payroll!`);
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update worker payroll status.');
      console.error('Error toggling payable:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      payFrequency: 'WEEKLY',
      rate: 0,
      nationalId: '',
      kraPin: '',
      team: '',
      positionUuid: ''
    });
  };

  const openEditModal = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormData({
      fullName: worker.fullName,
      phone: worker.phone,
      email: worker.email,
      payFrequency: worker.payFrequency,
      rate: worker.rate,
      nationalId: worker.nationalId || '',
      kraPin: worker.kraPin || '',
      team: worker.team || '',
      positionUuid: worker.positionUuid
    });
    setShowEditModal(true);
  };

  // Filter workers based on search and filters
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.phone.includes(searchTerm);
    
    const matchesPosition = !selectedPosition || worker.positionUuid === selectedPosition;
    const matchesStatus = !statusFilter || worker.status === statusFilter;
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badgeClass = status === 'ACTIVE' ? 'bg-success' : 'bg-danger';
    return <span className={`badge ${badgeClass}`}>{status}</span>;
  };

  const getPayableBadge = (payable: boolean) => {
    const badgeClass = payable ? 'bg-info' : 'bg-secondary';
    const text = payable ? 'Payable' : 'Not Payable';
    return <span className={`badge ${badgeClass}`}>{text}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className={`fw-bold mb-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                <Users className="me-2" size={28} />
                Workers Management
              </h2>
              <p className="text-muted mb-0">Manage your workforce and employee information</p>
            </div>
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} className="me-2" />
              Add Worker
            </button>
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
            onClick={() => setError('')}
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
            onClick={() => setSuccess('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Filters */}
      <div className={`card mb-4 ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="position-relative">
                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                <input
                  type="text"
                  className={`form-control ps-5 ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className={`form-select ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value="">All Positions</option>
                {positions.map(position => (
                  <option key={position.uuid} value={position.uuid}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className={`form-select ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPosition('');
                  setStatusFilter('');
                }}
              >
                <Filter size={16} className="me-1" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                <tr>
                  <th>Worker</th>
                  <th>Position</th>
                  <th>Contact</th>
                  <th>Pay Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="text-muted">
                        <Users size={48} className="mb-3 opacity-50" />
                        <p className="mb-0">No workers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => (
                    <tr key={worker.uuid}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                               style={{ width: '40px', height: '40px' }}>
                            <span className="text-white fw-bold">
                              {worker.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="fw-semibold">{worker.fullName}</div>
                            <small className="text-muted">{worker.team}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">{worker.positionName}</span>
                      </td>
                      <td>
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <Phone size={14} className="me-2 text-muted" />
                            <small>{worker.phone}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Mail size={14} className="me-2 text-muted" />
                            <small>{worker.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <DollarSign size={14} className="me-2 text-muted" />
                            <span className="fw-semibold">KES {worker.rate.toLocaleString()}</span>
                          </div>
                          <small className="text-muted">{worker.payFrequency}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {getStatusBadge(worker.status)}
                          <div className="mt-1">
                            {getPayableBadge(worker.payable)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <MoreVertical size={14} />
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => openEditModal(worker)}
                              >
                                <Edit2 size={14} className="me-2" />
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleTogglePayable(worker)}
                              >
                                {worker.payable ? (
                                  <>
                                    <UserX size={14} className="me-2" />
                                    Disable Payroll
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={14} className="me-2" />
                                    Enable Payroll
                                  </>
                                )}
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDeleteWorker(worker)}
                              >
                                <Trash2 size={14} className="me-2" />
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

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <div className="card-body text-center">
              <Users size={32} className="text-primary mb-2" />
              <h4 className="fw-bold">{workers.length}</h4>
              <small className="text-muted">Total Workers</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <div className="card-body text-center">
              <UserCheck size={32} className="text-success mb-2" />
              <h4 className="fw-bold">{workers.filter(w => w.status === 'ACTIVE').length}</h4>
              <small className="text-muted">Active Workers</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <div className="card-body text-center">
              <DollarSign size={32} className="text-info mb-2" />
              <h4 className="fw-bold">{workers.filter(w => w.payable).length}</h4>
              <small className="text-muted">Payable Workers</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
            <div className="card-body text-center">
              <MapPin size={32} className="text-warning mb-2" />
              <h4 className="fw-bold">{positions.length}</h4>
              <small className="text-muted">Total Positions</small>
            </div>
          </div>
        </div>
      </div>

      {/* Create Worker Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className={`modal-content ${isDarkMode ? 'bg-dark text-white' : ''}`}>
              <div className="modal-header">
                <h5 className="modal-title">Add New Worker</h5>
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
              <form onSubmit={handleCreateWorker}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Position *</label>
                      <select
                        className={`form-select ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.positionUuid}
                        onChange={(e) => setFormData({ ...formData, positionUuid: e.target.value })}
                        required
                      >
                        <option value="">Select Position</option>
                        {positions.map(position => (
                          <option key={position.uuid} value={position.uuid}>
                            {position.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pay Frequency *</label>
                      <select
                        className={`form-select ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.payFrequency}
                        onChange={(e) => setFormData({ ...formData, payFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' })}
                        required
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rate (KES) *</label>
                      <input
                        type="number"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">National ID</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">KRA PIN</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.kraPin}
                        onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
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
                  <button type="submit" className="btn btn-primary">
                    Create Worker
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditModal && selectedWorker && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className={`modal-content ${isDarkMode ? 'bg-dark text-white' : ''}`}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Worker: {selectedWorker.fullName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWorker(null);
                    resetForm();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleUpdateWorker}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Position *</label>
                      <select
                        className={`form-select ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.positionUuid}
                        onChange={(e) => setFormData({ ...formData, positionUuid: e.target.value })}
                        required
                      >
                        <option value="">Select Position</option>
                        {positions.map(position => (
                          <option key={position.uuid} value={position.uuid}>
                            {position.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Pay Frequency *</label>
                      <select
                        className={`form-select ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.payFrequency}
                        onChange={(e) => setFormData({ ...formData, payFrequency: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' })}
                        required
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rate (KES) *</label>
                      <input
                        type="number"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">National ID</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">KRA PIN</label>
                      <input
                        type="text"
                        className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        value={formData.kraPin}
                        onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
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
                      setSelectedWorker(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Worker
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

export default WorkersManagement;