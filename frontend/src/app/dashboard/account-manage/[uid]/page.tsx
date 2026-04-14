'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface SubUser {
  uid: number;
  username: string;
  co_name: string;
  user_type: string;
  last_login: string;
  last_login_ip: string;
}

interface ManageAccountData {
  subusers: SubUser[];
}

export default function AccountManagePage() {
  const params = useParams();
  const uid = params.uid as string;

  const [accountData, setAccountData] = useState<ManageAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountManageInfo();
  }, [uid]);

  const fetchAccountManageInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/accounts/manage/${uid}`);
      setAccountData(response.data);
    } catch (err) {
      console.error('Failed to fetch account manage info:', err);
      setError('Failed to load sub-user list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubUser = async (subuid: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete sub-user "${username}"?`)) {
      return;
    }

    try {
      await api.delete(`/accounts/${subuid}`);
      setAccountData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          subusers: prev.subusers.filter((user) => user.uid !== subuid),
        };
      });
    } catch (err) {
      console.error('Failed to delete sub-user:', err);
      setError('Failed to delete sub-user');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-info">Loading sub-users...</div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="container-fluid" style={{ padding: '20px' }}>
        <div className="alert alert-danger">Failed to load sub-users</div>
        <Link href="/dashboard/master-list" className="btn btn-default">
          Back to Master List
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Manage Sub-Users - Account {uid}</h1>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          <button type="button" className="close" onClick={() => setError(null)}>
            <span>&times;</span>
          </button>
          {error}
        </div>
      )}

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-heading">
          <h3 className="panel-title">Sub-Users ({accountData.subusers.length})</h3>
          <Link href={`/dashboard/account-create?parent_uid=${uid}`} className="btn btn-xs btn-success">
            <i className="fa fa-plus"></i> Add User
          </Link>
        </div>

        {accountData.subusers.length === 0 ? (
          <div className="panel-body">
            <p className="text-muted">No sub-users assigned to this account.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Company Name</th>
                  <th>User Type</th>
                  <th>Last Login</th>
                  <th>Last Login IP</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accountData.subusers.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.username}</td>
                    <td>{user.co_name}</td>
                    <td>
                      <span className="label label-default">{user.user_type}</span>
                    </td>
                    <td>{user.last_login || 'Never'}</td>
                    <td>{user.last_login_ip || '-'}</td>
                    <td>
                      <Link
                        href={`/dashboard/account-info/${user.uid}`}
                        className="btn btn-xs btn-info"
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDeleteSubUser(user.uid, user.username)}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <Link href="/dashboard/master-list" className="btn btn-default">
          <i className="fa fa-arrow-left"></i> Back to Master List
        </Link>
        <Link
          href={`/dashboard/account-info/${uid}`}
          className="btn btn-info"
          style={{ marginLeft: '10px' }}
        >
          <i className="fa fa-info"></i> View Account Info
        </Link>
      </div>
    </div>
  );
}
