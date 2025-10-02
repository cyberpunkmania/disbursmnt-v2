import React, { useState, useEffect } from 'react';
import { positionsApi } from '../services/api';
import type { Position, CreatePositionRequest, UpdatePositionRequest } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const PositionsManagement: React.FC = () => {
  const { theme } = useTheme();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

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
  }, [pagination.currentPage, activeFilter]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const activeOnly = activeFilter === 'all' ? undefined : activeFilter === 'active';
      const response = await positionsApi.list(activeOnly);
      
      if (response.success) {
        // Since the API doesn't provide pagination info, we'll implement client-side pagination
        const allPositions = response.data;
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        const paginatedPositions = allPositions.slice(startIndex, endIndex);
        
        setPositions(paginatedPositions);
        setPagination(prev => ({
          ...prev,
          totalItems: allPositions.length,
          totalPages: Math.ceil(allPositions.length / prev.itemsPerPage)
        }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      if (editingPosition) {
        const updateData: UpdatePositionRequest = {
          name: formData.name,
          description: formData.description,
          active: formData.active
        };
        
        const response = await positionsApi.update(editingPosition.uuid, updateData);
        if (response.success) {
          await fetchPositions();
          handleCloseModal();
        } else {
          setError(response.message || 'Failed to update position');
        }
      } else {
        const response = await positionsApi.create(formData);
        if (response.success) {
          await fetchPositions();
          handleCloseModal();
        } else {
          setError(response.message || 'Failed to create position');
        }
      }
    } catch (error) {
      console.error('Error saving position:', error);
      setError('Failed to save position. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!positionToDelete) return;
    
    try {
      setError(null);
      const response = await positionsApi.delete(positionToDelete.uuid);
      if (response.success) {
        await fetchPositions();
        setShowDeleteModal(false);
        setPositionToDelete(null);
      } else {
        setError(response.message || 'Failed to delete position');
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      setError('Failed to delete position. Please try again.');
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

  const filteredPositions = positions.filter(position =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="d-flex justify-content-center align-items-center min-vh-25">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Positions Management</h2>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          Add Position
        </button>
      </div>

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
                {filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No positions found
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((position) => (
                    <tr key={position.uuid}>
                      <td className="fw-medium">{position.name}</td>
                      <td>{position.description}</td>
                      <td>
                        <span className={`badge ${position.active ? 'bg-success' : 'bg-secondary'}`}>
                          {position.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {new Date().toLocaleDateString()} {/* Since timestamp is not in the response */}
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
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
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
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPosition ? 'Update' : 'Create'} Position
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Position
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