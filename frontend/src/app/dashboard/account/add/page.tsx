'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  hint: string;
  access: string[];
  ipRestriction: string;
}

interface AccessOption {
  [key: string]: string;
}

export default function AccountAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    hint: '',
    access: [],
    ipRestriction: '',
  });

  const [accessOptions, setAccessOptions] = useState<AccessOption>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [lockAddUsers, setLockAddUsers] = useState(false);

  useEffect(() => {
    fetchAccessOptions();
  }, []);

  const fetchAccessOptions = async () => {
    try {
      const response = await api.get('/account/access-options');
      setAccessOptions(response.data.data || {});

      const userResponse = await api.get('/account/user-info');
      setUserType(userResponse.data.data?.user_type || '');
      setLockAddUsers(userResponse.data.data?.lock_add_users === 'y');
    } catch (err) {
      console.error('Failed to fetch options:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      access: checked
        ? [...prev.access, value]
        : prev.access.filter(item => item !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const payload = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        hint: formData.hint,
        access: formData.access,
        ip_restriction: formData.ipRestriction,
      };

      await api.post('/account/add', payload);
      router.push('/account/manage');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (lockAddUsers) {
    return (
      <div className="row">
        <div className="col-lg-12">
          <h1>Create User Account</h1>
          <div className="alert alert-danger">
            <span className="label label-danger">Note</span> Account creation is disabled at this time.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Create User Account</h1>
          <p>
            <i className="fa fa-info-circle"></i> Create a new user account by providing the information below. Choose the
            sections of the site you would like to allow the user to access.
          </p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Create User Account
                </h3>
              </div>
              <div className="panel-body">
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
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Password
                    <small>
                      &nbsp; Password must include at least one lowercase letter, one uppercase letter, one number and
                      one special character and have a minimum of 12 characters. Passwords expire every 90 days for PCI
                      Compliance.
                    </small>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hint</label>
                  <input
                    type="text"
                    className="form-control"
                    name="hint"
                    value={formData.hint}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>User Access</label>
                  <div>
                    {Object.entries(accessOptions).map(([key, value]) => (
                      <div key={key} className="checkbox">
                        <label>
                          <input
                            type="checkbox"
                            value={key}
                            checked={formData.access.includes(key)}
                            onChange={handleAccessChange}
                          />
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Enter the IPs where the user can access the admin: (leave blank for all)</label>
                  <textarea
                    className="form-control"
                    name="ipRestriction"
                    value={formData.ipRestriction}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
