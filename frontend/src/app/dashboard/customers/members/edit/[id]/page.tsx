'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [formData, setFormData] = useState<Member>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'member',
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/members/${memberId}`);
      setFormData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch member:', err);
      setError('Failed to load member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/members/${memberId}`, formData);
      router.push('/customers/members/search');
    } catch (err) {
      console.error('Failed to save member:', err);
      setError('Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading member...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Member</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Member Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="form-control"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                  <i className="fa fa-save"></i> Save Changes
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                  disabled={saving}
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
