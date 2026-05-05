'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function AccountCreatePage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    co_name: '',
    email: '',
    support: '',
    phone: '',
    username: '',
    pw1: '',
    pw2: '',
    hint: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.pw1 !== formData.pw2) {
      setError('Passwords do not match');
      return;
    }

    try {
      await api.post('/accounts/create', {
        ...formData,
        acct_type: 'developer',
      });
      setSuccess('Developer account created successfully');
      setFormData({
        first_name: '', last_name: '', co_name: '', email: '',
        support: '', phone: '', username: '', pw1: '', pw2: '', hint: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create account');
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <div className="row">
        <div className="col-lg-12">
          <h1>Create An Account</h1>
        </div>
      </div>

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-success">{success}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-12">
            <p><i className="fa fa-info-circle"></i> Complete all fields of the form below. Be sure to record your username and password for future reference.</p>

            {/* Contact Information Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Contact Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.co_name} onChange={(e) => handleChange('co_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Support Email</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.support} onChange={(e) => handleChange('support', e.target.value)} />
                  <span className="help-block">Developers Only</span>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Account Information Panel */}
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-cogs"></i> Account Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.username} onChange={(e) => handleChange('username', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Password <small>&nbsp; Password must include at least one lowercase letter, one uppercase letter, one number and one special character and have a minimum of 12 characters. Passwords expire every 90 days for PCI Compliance.</small></label>
                  <input type="password" className="form-control" maxLength={50} value={formData.pw1} onChange={(e) => handleChange('pw1', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" className="form-control" maxLength={50} value={formData.pw2} onChange={(e) => handleChange('pw2', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Hint</label>
                  <input type="text" className="form-control" maxLength={50} value={formData.hint} onChange={(e) => handleChange('hint', e.target.value)} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              <i className="fa fa-user-plus"></i> Create Account
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
