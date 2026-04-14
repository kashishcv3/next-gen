'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface PreferencesData {
  uid: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mfa?: {
    id: number | null;
    user_id: number;
    mfa_type: string;
    is_mfa_set: string;
  };
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<PreferencesData>>({});
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [mfaSettings, setMfaSettings] = useState({
    enabled: false,
    mfa_type: 'email_based',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get uid from auth cookie
      const authUser = Cookies.get('auth_user');
      if (!authUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(authUser);
      const uid = userData.uid;

      const response = await api.get(`/accounts/preferences/${uid}`);
      setPreferences(response.data);
      setEditData(response.data);

      // Initialize MFA settings
      if (response.data.mfa) {
        setMfaSettings({
          enabled: response.data.mfa.is_mfa_set === 'y',
          mfa_type: response.data.mfa.mfa_type || 'email_based',
        });
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field: string, value: string | boolean) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put(`/accounts/preferences/${preferences?.uid}`, {
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email,
        phone: editData.phone,
      });

      setPreferences((prev) => (prev ? { ...prev, ...editData } : null));
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);

    // Validation
    if (!passwordData.current_password) {
      setError('Current password is required');
      return;
    }
    if (!passwordData.new_password) {
      setError('New password is required');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      await api.post(`/accounts/preferences/${preferences?.uid}/change-password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setError('Failed to change password. Current password may be incorrect.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMFA = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.post(`/accounts/preferences/${preferences?.uid}/mfa`, {
        enabled: !mfaSettings.enabled,
        mfa_type: mfaSettings.mfa_type,
      });

      setMfaSettings((prev) => ({
        ...prev,
        enabled: !prev.enabled,
      }));
      setSuccess(`MFA ${!mfaSettings.enabled ? 'enabled' : 'disabled'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to toggle MFA:', err);
      setError('Failed to update MFA settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading preferences...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">Failed to load preferences</div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Account Preferences</h1>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" onClick={() => setError(null)}>
            <span>&times;</span>
          </button>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          <button type="button" className="close" onClick={() => setSuccess(null)}>
            <span>&times;</span>
          </button>
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Profile Information</h3>
          {!editMode && (
            <button
              className="btn btn-xs btn-primary"
              onClick={() => setEditMode(true)}
              style={{ marginLeft: '10px' }}
            >
              Edit
            </button>
          )}
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Username</label>
                <p className="form-control-static">{preferences.username}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Email</label>
                {editMode ? (
                  <input
                    type="email"
                    className="form-control"
                    value={editData.email || ''}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                  />
                ) : (
                  <p className="form-control-static">{preferences.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>First Name</label>
                {editMode ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editData.first_name || ''}
                    onChange={(e) => handleEditChange('first_name', e.target.value)}
                  />
                ) : (
                  <p className="form-control-static">{preferences.first_name}</p>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Last Name</label>
                {editMode ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editData.last_name || ''}
                    onChange={(e) => handleEditChange('last_name', e.target.value)}
                  />
                ) : (
                  <p className="form-control-static">{preferences.last_name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Phone</label>
            {editMode ? (
              <input
                type="tel"
                className="form-control"
                value={editData.phone || ''}
                onChange={(e) => handleEditChange('phone', e.target.value)}
              />
            ) : (
              <p className="form-control-static">{preferences.phone}</p>
            )}
          </div>

          {editMode && (
            <div style={{ marginTop: '15px' }}>
              <button
                className="btn btn-success"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn btn-default"
                onClick={() => {
                  setEditMode(false);
                  setEditData(preferences);
                }}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MFA Section */}
      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Two-Factor Authentication</h3>
        </div>
        <div className="panel-body">
          <div className="form-group">
            <label>MFA Status</label>
            <p>
              <span className={`label ${mfaSettings.enabled ? 'label-success' : 'label-default'}`}>
                {mfaSettings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>

          {mfaSettings.enabled && (
            <div className="form-group">
              <label>MFA Type</label>
              <select
                className="form-control"
                value={mfaSettings.mfa_type}
                onChange={(e) =>
                  setMfaSettings((prev) => ({
                    ...prev,
                    mfa_type: e.target.value,
                  }))
                }
                style={{ width: '300px' }}
              >
                <option value="email_based">Email Based</option>
                <option value="auth_based">Authenticator App</option>
              </select>
            </div>
          )}

          <button
            className={`btn ${mfaSettings.enabled ? 'btn-danger' : 'btn-success'}`}
            onClick={handleToggleMFA}
            disabled={saving}
          >
            {saving ? 'Updating...' : mfaSettings.enabled ? 'Disable MFA' : 'Enable MFA'}
          </button>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Change Password</h3>
        </div>
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="current_password">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="current_password"
                  value={passwordData.current_password}
                  onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="new_password"
                  value={passwordData.new_password}
                  onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                />
                <small className="form-text text-muted">Minimum 8 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
