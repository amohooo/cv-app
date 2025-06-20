import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminManagement.css';

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'admin'
  });

  useEffect(() => {
    if (user && user.role === 'master') {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        // Update existing admin
        await api.put(`/auth/admins/${editingAdmin.id}`, formData);
        setEditingAdmin(null);
      } else {
        // Register new admin (using master admin route)
        await api.post('/auth/register-admin', formData);
        setShowRegisterForm(false);
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        email: '',
        role: 'admin'
      });
      
      // Refresh admin list
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      setError(error.response?.data?.error || 'Failed to save admin');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      email: admin.email || '',
      role: admin.role
    });
    setShowRegisterForm(true);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }
    
    try {
      await api.delete(`/auth/admins/${adminId}`);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error.response?.data?.error || 'Failed to delete admin');
    }
  };

  const handleCancel = () => {
    setShowRegisterForm(false);
    setEditingAdmin(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      role: 'admin'
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user || user.role !== 'master') {
    return (
      <div className="admin-management">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only master administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-management">
        <div className="loading">Loading admins...</div>
      </div>
    );
  }

  return (
    <div className="admin-management">
      <div className="admin-header">
        <h2>Admin Management</h2>
        <button
          className="add-admin-button"
          onClick={() => setShowRegisterForm(true)}
        >
          Add New Admin
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showRegisterForm && (
        <div className="admin-form-modal">
          <div className="admin-form-content">
            <div className="form-header">
              <h3>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h3>
              <button className="close-button" onClick={handleCancel}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!editingAdmin && (
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingAdmin ? 'Update Admin' : 'Add Admin'}
                </button>
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admins-list">
        <h3>All Admins</h3>
        {admins.length === 0 ? (
          <p>No admins found.</p>
        ) : (
          <div className="admins-grid">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-card">
                <div className="admin-info">
                  <h4>{admin.username}</h4>
                  <p className="admin-role">{admin.role}</p>
                  {admin.email && <p className="admin-email">{admin.email}</p>}
                  <p className="admin-status">
                    Status: <span className={admin.isActive ? 'active' : 'inactive'}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p className="admin-created">
                    Created: {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="admin-actions">
                  {admin.id !== user.id && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(admin)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(admin.id)}
                        disabled={admin.role === 'master'}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement; 