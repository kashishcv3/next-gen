'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DeleteConfirmData {
  uid: number;
  username: string;
  co_name: string;
}

export default function AccountDeletePage() {
  const params = useParams();
  const username = params.username as string;

  const [accountData, setAccountData] = useState<DeleteConfirmData | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeleteInfo();
  }, [username]);

  const fetchDeleteInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/accounts/delete-info/${username}`);
      setAccountData(response.data);
    } catch (err) {
      console.error('Failed to fetch account data:', err);
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmed) {
      setError('Please confirm deletion before proceeding');
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await api.delete(`/accounts/${accountData?.uid}`);

      // Redirect to master list after successful deletion
      setTimeout(() => {
        window.location.href = '/dashboard/master-list';
      }, 1500);
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading account information...</div>
      </div>
    );
  }

  if (!accountData) {
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
      <div className="row">
        <div className="col-md-8 col-md-offset-2">
          <h1>Delete Account</h1>

          {error && (
            <div className="alert alert-danger alert-dismissible" role="alert">
              <button type="button" className="close" onClick={() => setError(null)}>
                <span>&times;</span>
              </button>
              {error}
            </div>
          )}

          <div className="panel panel-danger">
            <div className="panel-heading">
              <h3 className="panel-title">Confirm Account Deletion</h3>
            </div>
            <div className="panel-body">
              <div className="alert alert-warning">
                <strong>Warning:</strong> This action cannot be undone. All data associated with this account will be permanently deleted.
              </div>

              <table className="table" style={{ marginBottom: '20px' }}>
                <tbody>
                  <tr>
                    <th style={{ width: '150px' }}>Username</th>
                    <td>{accountData.username}</td>
                  </tr>
                  <tr>
                    <th>Company Name</th>
                    <td>{accountData.co_name}</td>
                  </tr>
                  <tr>
                    <th>UID</th>
                    <td>{accountData.uid}</td>
                  </tr>
                </tbody>
              </table>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  {' '}
                  I understand this will permanently delete the account "{accountData.username}" and all associated data
                </label>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={!confirmed || deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <Link href="/dashboard/master-list" className="btn btn-default" style={{ marginLeft: '10px' }}>
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
