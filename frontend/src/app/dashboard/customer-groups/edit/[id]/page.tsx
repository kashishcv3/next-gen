'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface CustomerGroup {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function EditCustomerGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [formData, setFormData] = useState<CustomerGroup>({
    id: '',
    name: '',
    description: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customer-groups/${groupId}`);
      setFormData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch group:', err);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/customer-groups/${groupId}`, formData);
      router.push('/customer-groups/list');
    } catch (err) {
      console.error('Failed to save group:', err);
      setError('Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading group...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Customer Group</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Group Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Group Name</label>
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
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={saving}
                />
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
