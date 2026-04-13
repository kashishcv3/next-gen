'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NewMetaTag {
  name: string;
  key: string;
  value: string;
}

export default function AddMetaTagPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewMetaTag>({
    name: '',
    key: '',
    value: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.key.trim()) {
      setError('Key is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/meta', formData);
      router.push('/meta/list');
    } catch (err) {
      console.error('Failed to add meta tag:', err);
      setError('Failed to add meta tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add Meta Tag</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Meta Tag Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Meta tag name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="key">Key</label>
                <input
                  type="text"
                  className="form-control"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="meta_key"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="value">Value</label>
                <textarea
                  className="form-control"
                  id="value"
                  name="value"
                  rows={4}
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="Meta tag value"
                  disabled={loading}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                  <i className="fa fa-save"></i> Add Meta Tag
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
