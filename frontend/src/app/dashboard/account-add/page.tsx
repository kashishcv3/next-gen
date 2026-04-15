'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await api.post('/users/create', formData);
      setSuccess('User added successfully');
      setFormData({ email: '', name: '', password: '', role: 'user' });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{padding:'20px'}}>
      <div className="row"><div className="col-lg-12">
        <h1><i className="fa fa-user-plus"></i> Add User</h1>
        <p><i className="fa fa-info-circle"></i> Create a new user account</p>
      </div></div>
      {error && <div className="row"><div className="col-lg-12"><div className="alert alert-danger">{error}</div></div></div>}
      {success && <div className="row"><div className="col-lg-12"><div className="alert alert-success">{success}</div></div></div>}
      <form onSubmit={handleSubmit}>
        <div className="row"><div className="col-lg-8">
          <div className="well well-cv3-table">
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
        </div></div>
        <div className="row"><div className="col-lg-8">
          <button type="submit" className="btn btn-primary" disabled={loading}><i className="fa fa-user-plus"></i> {loading ? 'Adding...' : 'Add User'}</button>
        </div></div>
      </form>
    </div>
  );
}
