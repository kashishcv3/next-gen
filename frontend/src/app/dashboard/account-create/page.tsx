'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AccountCreatePage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    co_name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirm_password: '',
    account_type: 'merchant',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/accounts', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        co_name: formData.co_name,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password,
        user_type: formData.account_type,
      });

      setSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        co_name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirm_password: '',
        account_type: 'merchant',
      });

      setTimeout(() => {
        window.location.href = '/dashboard/master-list';
      }, 2000);
    } catch (err) {
      console.error('Failed to create account:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-md-8 col-md-offset-2">
          <h1>Create New Account</h1>

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
              Account created successfully! Redirecting...
            </div>
          )}

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Account Information</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="first_name">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="last_name">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="co_name">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="co_name"
                    name="co_name"
                    value={formData.co_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="username">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="account_type">Account Type</label>
                      <select
                        className="form-control"
                        id="account_type"
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                      >
                        <option value="merchant">Merchant</option>
                        <option value="developer">Developer</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="password">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <small className="form-text text-muted">Minimum 8 characters</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="confirm_password">Confirm Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <Link href="/dashboard/master-list" className="btn btn-default" style={{ marginLeft: '10px' }}>
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
