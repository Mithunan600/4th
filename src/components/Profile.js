import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, LogOut, Edit3, Save, X } from 'lucide-react';
import './Profile.css';

const Profile = ({ user, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!editData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!editData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editData.name.trim(),
          email: editData.email.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        onUpdateProfile(data.user);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={60} />
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'User'}</h2>
            <p className="profile-email">{user?.email || 'No email'}</p>
            <p className="profile-phone">{user?.phone || 'No phone'}</p>
          </div>
          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="action-btn save-btn"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="action-btn cancel-btn"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="action-btn edit-btn"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{user?.name || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{user?.email || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Phone Number</label>
                <p>{user?.phone || 'Not provided'}</p>
                <small>Phone number cannot be changed</small>
              </div>

              <div className="info-item">
                <label>Member Since</label>
                <p>{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{user?.analysisCount || 0}</div>
                <div className="stat-label">Plant Analyses</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{user?.diseasesDetected || 0}</div>
                <div className="stat-label">Diseases Detected</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{user?.plantsSaved || 0}</div>
                <div className="stat-label">Plants Saved</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <CheckCircle size={16} />
              {success}
            </div>
          )}
        </div>

        <div className="profile-footer">
          <button
            onClick={onLogout}
            className="logout-button"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
