'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NewGatewayPage {
  name: string;
  url: string;
  description: string;
  status: string;
}

export default function AddGatewayPagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewGatewayPage>({
    name: '',
    url: '',
    description: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/metagateway', formData);
      router.push('/metagateway/list');
    } catch (err) {
      console.error('Failed to add gateway page:', err);
      setError('Failed to add gateway page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add Gateway Page</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Gateway Page Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Page Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Gateway page name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  disabled={loading}
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
                  placeholder="Page description"
                  disabled={loading}
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
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                  <i className="fa fa-save"></i> Add Gateway Page
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
