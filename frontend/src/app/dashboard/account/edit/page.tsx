'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface AccountInfo {
  username: string;
  email: string;
}

export default function AccountEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';

  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    accessPermissions: [] as string[],
  });

  useEffect(() => {
    if (username) {
      fetchAccountInfo();
    }
  }, [username]);

  const fetchAccountInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/account/edit/${username}`);
      setInfo(response.data.data);
      setFormData(prev => ({
        ...prev,
        email: response.data.data?.email || '',
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch account info');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (formData.password && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const payload = {
        username: info?.username,
        email: formData.email,
        password: formData.password || undefined,
      };

      await api.post('/account/edit', payload);
      router.push('/account/manage');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  if (error && !info) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <h1>Edit User Account</h1>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Edit User Account</h1>
          <p>
            <i className="fa fa-info-circle"></i> If you would like the user's password to remain the same leave
            password field blank.
          </p>
        </div>
      </div>
      <br />

      <p>
        <a className="btn btn-primary btn-sm" href="/account/manage">
          Manage Users
        </a>
      </p>
      <br />

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {info && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-12">
              <div className="panel panel-primary">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    <i className="fa fa-cogs"></i> Edit User Account
                  </h3>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>Username</label>
                    <p>{info.username}</p>
                    <input type="hidden" value={info.username} />
                  </div>

                  <div className="form-group">
                    <label>E-mail</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      maxLength={50}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Change Password
                      <small>
                        &nbsp; Password must include at least one lowercase letter, one uppercase letter, one number and
                        one special character and have a minimum of 12 characters. Passwords expire every 90 days for
                        PCI Compliance.
                      </small>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Account'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
