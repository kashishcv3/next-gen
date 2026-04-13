'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserInfo {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function AccountPwPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/account/profile-info');
      const data = response.data.data;
      setUserInfo(data);
      setFormData(prev => ({
        ...prev,
        username: data.username || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile info');
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
    setMessage(null);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (formData.newPassword.length < 12) {
        throw new Error('Password must be at least 12 characters long');
      }

      const payload = {
        username: formData.username,
        fname: formData.firstName,
        lname: formData.lastName,
        email: formData.email,
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      };

      await api.post('/account/update-profile', payload);
      setMessage('Profile updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Preferences</h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      <br />

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">
                  <i className="fa fa-cogs"></i> Profile Settings
                </h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    value={formData.username}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    New Password
                    <small>
                      &nbsp; Password must include at least one lowercase letter, one uppercase letter, one number and
                      one special character and have a minimum of 12 characters. Passwords expire every 90 days for PCI
                      Compliance.
                    </small>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    maxLength={50}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
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
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
