'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface AccountInfoData {
  uid: number;
  username: string;
  co_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_type: string;
  date_created: string;
  ip: string;
  browser: string;
  inactive: boolean;
  stores: Array<{
    site_id: number;
    name: string;
  }>;
}

export default function AccountInfoPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [accountInfo, setAccountInfo] = useState<AccountInfoData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<AccountInfoData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAccountInfo();
  }, [uid]);

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/accounts/info/${uid}`);
      setAccountInfo(response.data);
      setEditData(response.data);
    } catch (err) {
      console.error('Failed to fetch account info:', err);
      setError('Failed to load account information');
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

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.put(`/accounts/info/${uid}`, {
        first_name: editData.first_name,
        last_name: editData.last_name,
        co_name: editData.co_name,
        email: editData.email,
        phone: editData.phone,
      });

      setAccountInfo((prev) => (prev ? { ...prev, ...editData } : null));
      setEditMode(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm('Send password reset email to this user?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.post(`/accounts/info/${uid}/reset-password`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to reset password:', err);
      setError('Failed to send password reset email');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading account information...</div>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">Account not found</div>
        <Link href="/dashboard/master-list" className="btn btn-default">
          Back to Master List
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Account Information - {accountInfo.username}</h1>

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
          <button type="button" className="close" onClick={() => setSuccess(false)}>
            <span>&times;</span>
          </button>
          Changes saved successfully!
        </div>
      )}

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Account Details</h3>
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
        <div className="table-responsive">
          <table className="table">
            <tbody>
              <tr>
                <th style={{ width: '150px' }}>Username</th>
                <td>{accountInfo.username}</td>
              </tr>
              <tr>
                <th>First Name</th>
                <td>
                  {editMode ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.first_name || ''}
                      onChange={(e) => handleEditChange('first_name', e.target.value)}
                      style={{ width: '300px' }}
                    />
                  ) : (
                    accountInfo.first_name
                  )}
                </td>
              </tr>
              <tr>
                <th>Last Name</th>
                <td>
                  {editMode ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.last_name || ''}
                      onChange={(e) => handleEditChange('last_name', e.target.value)}
                      style={{ width: '300px' }}
                    />
                  ) : (
                    accountInfo.last_name
                  )}
                </td>
              </tr>
              <tr>
                <th>Company Name</th>
                <td>
                  {editMode ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.co_name || ''}
                      onChange={(e) => handleEditChange('co_name', e.target.value)}
                      style={{ width: '300px' }}
                    />
                  ) : (
                    accountInfo.co_name
                  )}
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  {editMode ? (
                    <input
                      type="email"
                      className="form-control"
                      value={editData.email || ''}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      style={{ width: '300px' }}
                    />
                  ) : (
                    accountInfo.email
                  )}
                </td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>
                  {editMode ? (
                    <input
                      type="tel"
                      className="form-control"
                      value={editData.phone || ''}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                      style={{ width: '300px' }}
                    />
                  ) : (
                    accountInfo.phone
                  )}
                </td>
              </tr>
              <tr>
                <th>Account Type</th>
                <td>{accountInfo.user_type}</td>
              </tr>
              <tr>
                <th>Date Created</th>
                <td>{accountInfo.date_created}</td>
              </tr>
              <tr>
                <th>IP Address</th>
                <td>{accountInfo.ip}</td>
              </tr>
              <tr>
                <th>Browser</th>
                <td>{accountInfo.browser}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  <span className={`label ${accountInfo.inactive ? 'label-danger' : 'label-success'}`}>
                    {accountInfo.inactive ? 'Inactive' : 'Active'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {editMode && (
        <div style={{ marginTop: '20px' }}>
          <button
            className="btn btn-success"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="btn btn-default"
            onClick={() => {
              setEditMode(false);
              setEditData(accountInfo);
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      )}

      {accountInfo.stores && accountInfo.stores.length > 0 && (
        <div className="panel panel-default" style={{ marginTop: '20px' }}>
          <div className="panel-heading">
            <h3 className="panel-title">Associated Stores</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Site ID</th>
                  <th>Store Name</th>
                </tr>
              </thead>
              <tbody>
                {accountInfo.stores.map((store) => (
                  <tr key={store.site_id}>
                    <td>{store.site_id}</td>
                    <td>{store.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          className="btn btn-warning"
          onClick={handleResetPassword}
          disabled={saving}
        >
          Reset Password
        </button>
        <Link href="/dashboard/master-list" className="btn btn-default" style={{ marginLeft: '10px' }}>
          Back to Master List
        </Link>
      </div>
    </div>
  );
}
