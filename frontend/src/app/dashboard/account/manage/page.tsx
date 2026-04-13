'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Account {
  username: string;
  permissions: string;
  mfa_reset_code?: string;
  last_login: string;
  uid: string;
}

export default function AccountManagePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/account/manage');
      setAccounts(response.data.data || []);

      const userResponse = await api.get('/account/user-info');
      setUserType(userResponse.data.data?.user_type || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const isBigAdmin = userType === 'bigadmin' || userType === 'bigadmin_limit';

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Manage Users</h1>
        </div>
      </div>
      <br />

      {error && (
        <div className="alert alert-danger">
          <p>Error: {error}</p>
        </div>
      )}

      {!error && (
        <>
          <p>
            <a className="btn btn-primary btn-sm" href="/account/add">
              Add New User
            </a>
            <a className="btn btn-primary btn-sm" href="/account/log" style={{ marginLeft: '10px' }}>
              View User Log
            </a>
          </p>
          <br />

          {loading && <p>Loading...</p>}

          {!loading && accounts.length > 0 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="well well-cv3-table">
                  <div className="table-responsive">
                    <table className="table table-hover table-striped cv3-data-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Permissions</th>
                          <th>MFA Reset Code (only web service access)</th>
                          <th>Last Login</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((account) => (
                          <tr key={account.uid}>
                            <td>{account.username}</td>
                            <td>{account.permissions}</td>
                            <td>{account.mfa_reset_code || '-'}</td>
                            <td>{account.last_login}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <Link
                                href={`/account/info?uid=${account.uid}`}
                                className="btn btn-xs btn-default"
                                style={{ marginRight: '5px' }}
                              >
                                View
                              </Link>
                              <Link
                                href={`/account/edit?username=${account.username}`}
                                className="btn btn-xs btn-default"
                                style={{ marginRight: '5px' }}
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/account/delete?account=${account.username}&type=${isBigAdmin ? 'bigadmin' : 'user'}`}
                                className="btn btn-xs btn-danger"
                              >
                                Delete
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && accounts.length === 0 && (
            <div className="alert alert-info">
              No user accounts found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
