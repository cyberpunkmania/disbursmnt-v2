
import React, { useState, useEffect } from 'react';
import { positionsApi } from '../services/api';
import type { Position, CreatePositionRequest, UpdatePositionRequest } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, MoreVertical, CheckCircle, Loader2 } from 'lucide-react';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const PositionsManagement: React.FC = () => {
  const { theme } = useTheme();
  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Form state
  const [formData, setFormData] = useState<CreatePositionRequest>({
    name: '',
    description: '',
    active: true
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    // Update pagination when search or filter changes
    updatePagination();
  }, [searchTerm, activeFilter, allPositions]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await positionsApi.list();
      
      if (response.success) {
        setAllPositions(response.data);
      } else {
        setError(response.message || 'Failed to fetch positions');
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setError('Failed to fetch positions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePagination = () => {
    const filtered = getFilteredPositions();
    const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
    
    setPagination(prev => ({
      ...prev,
      totalItems: filtered.length,
      totalPages: totalPages,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));
  };

  const getFilteredPositions = () => {
    let filtered = allPositions;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(position => 
        activeFilter === 'active' ? position.active : !position.active
      );
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(position =>
        position.name.toLowerCase().includes(searchLower) ||
        position.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const getPaginatedPositions = () => {
    const filtered = getFilteredPositions();
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      if (editingPosition) {
        const updateData: UpdatePositionRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          active: formData.active
        };
        
        const response = await positionsApi.update(editingPosition.uuid, updateData);
        if (response.success) {
          await fetchPositions();
          handleCloseModal();
          showSuccessMessage('Position updated successfully!');
        } else {
          setError(response.message || 'Failed to update position');
        }
      } else {
        const createData: CreatePositionRequest = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          active: formData.active
        };
        
        const response = await positionsApi.create(createData);
        if (response.success) {
          await fetchPositions();
          handleCloseModal();
          showSuccessMessage('Position created successfully!');
        } else {
          setError(response.message || 'Failed to create position');
        }
      }
    } catch (error) {
      console.error('Error saving position:', error);
      setError('Failed to save position. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!positionToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);
      const response = await positionsApi.delete(positionToDelete.uuid);
      if (response.success) {
        await fetchPositions();
        setShowDeleteModal(false);
        setPositionToDelete(null);
        showSuccessMessage('Position deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete position');
      }
    } catch (error: any) {
      console.error('Error deleting position:', error);
      if (error.response?.status === 500) {
        setError('Cannot delete position. It may be assigned to workers or have dependencies.');
      } else if (error.response?.status === 404) {
        setError('Position not found. It may have already been deleted.');
      } else {
        setError('Failed to delete position. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      description: position.description,
      active: position.active
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPosition(null);
    setFormData({
      name: '',
      description: '',
      active: true
    });
    setError(null);
  };

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setShowDeleteModal(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1
    }));
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, pagination.currentPage - delta);
         i <= Math.min(pagination.totalPages - 1, pagination.currentPage + delta);
         i++) {
      range.push(i);
    }

    if (pagination.currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (pagination.currentPage + delta < pagination.totalPages - 1) {
      rangeWithDots.push('...', pagination.totalPages);
    } else {
      rangeWithDots.push(pagination.totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Loader2 className="spinner-border text-primary mb-3" size={48} />
            <p className="text-muted">Loading positions...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayedPositions = getPaginatedPositions();

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Positions Management</h2>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
          disabled={submitting}
        >
          <Plus size={20} />
          Add Position
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

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
            aria-label="Filter positions by status"
          >
            <option value="all">All Positions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={pagination.itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            aria-label="Items per page"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3">
        <small className="text-muted">
          {pagination.totalItems === 0 ? (
            'No positions found'
          ) : (
            `Showing ${displayedPositions.length} of ${pagination.totalItems} position${pagination.totalItems === 1 ? '' : 's'}`
          )}
          {searchTerm && ` matching "${searchTerm}"`}
          {activeFilter !== 'all' && ` (${activeFilter} only)`}
        </small>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className={`table-${theme === 'dark' ? 'dark' : 'light'}`}>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="col-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedPositions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="text-muted">
                        {pagination.totalItems === 0 ? (
                          <>
                            <p className="mb-2">No positions found</p>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowModal(true)}
                            >
                              <Plus size={16} className="me-1" />
                              Create your first position
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="mb-2">No positions match your current filters</p>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => {
                                setSearchTerm('');
                                setActiveFilter('all');
                              }}
                            >
                              Clear filters
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedPositions.map((position) => (
                    <tr key={position.uuid}>
                      <td className="fw-medium">{position.name}</td>
                      <td>{position.description}</td>
                      <td>
                        <span className={`badge ${position.active ? 'bg-success' : 'bg-secondary'}`}>
                          {position.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {new Date().toLocaleDateString()}
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-label="Position actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                onClick={() => handleEdit(position)}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger d-flex align-items-center gap-2"
                                onClick={() => handleDeleteClick(position)}
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
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
              </li>

              {getPageNumbers().map((pageNumber, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    pageNumber === pagination.currentPage ? 'active' : ''
                  } ${pageNumber === '...' ? 'disabled' : ''}`}
                >
                  {pageNumber === '...' ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pageNumber as number)}
                    >
                      {pageNumber}
                    </button>
                  )}
                </li>
              ))}
              
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPosition ? 'Edit Position' : 'Add New Position'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                  disabled={submitting}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="positionName" className="form-label">
                      Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="positionName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={submitting}
                      maxLength={100}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="positionDescription" className="form-label">
                      Description *
                    </label>
                    <textarea
                      className="form-control"
                      id="positionDescription"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      disabled={submitting}
                      maxLength={500}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="positionActive"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        disabled={submitting}
                      />
                      <label className="form-check-label" htmlFor="positionActive">
                        Active
                      </label>
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
                    {submitting ? 'Saving...' : (editingPosition ? 'Update' : 'Create')} Position
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && positionToDelete && (
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
                  Are you sure you want to delete the position "{positionToDelete.name}"?
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
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader2 size={16} className="spinner-border spinner-border-sm" />}
                  {deleting ? 'Deleting...' : 'Delete Position'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionsManagement;