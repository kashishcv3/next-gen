'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NewMember {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function AddMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewMember>({
    name: '',
    email: '',
    phone: '',
    role: 'member',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/members', formData);
      router.push('/customers/members/search');
    } catch (err) {
      console.error('Failed to add member:', err);
      setError('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add Member</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Member Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0000"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  className="form-control"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <i className="fa fa-save"></i> Add Member
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                  disabled={loading}
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fa fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
