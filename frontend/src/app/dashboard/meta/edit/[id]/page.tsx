'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface MetaTag {
  id: string;
  name: string;
  key: string;
  value: string;
}

export default function EditMetaTagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.id as string;

  const [formData, setFormData] = useState<MetaTag>({
    id: '',
    name: '',
    key: '',
    value: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTag();
  }, [tagId]);

  const fetchTag = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/meta/${tagId}`);
      setFormData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch meta tag:', err);
      setError('Failed to load meta tag');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/meta/${tagId}`, formData);
      router.push('/meta/list');
    } catch (err) {
      console.error('Failed to save meta tag:', err);
      setError('Failed to save meta tag');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading meta tag...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Meta Tag</h1>

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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                />
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
