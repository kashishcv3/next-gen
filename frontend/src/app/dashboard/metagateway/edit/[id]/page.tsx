'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

interface FormData {
  meta_name: string;
  display_name: string;
  meta_id: number;
  destination: string;
}

interface MetaOption {
  id: number;
  name: string;
}

export default function MetaGatewayEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaOptions, setMetaOptions] = useState<MetaOption[]>([]);
  const [formData, setFormData] = useState<FormData>({
    meta_name: '',
    display_name: '',
    meta_id: 0,
    destination: '',
  });

  useEffect(() => {
    fetchMetaTags();
    fetchGateway();
  }, [id]);

  const fetchMetaTags = async () => {
    try {
      const response = await api.get('/marketing/meta-tags?page=1&page_size=1000');
      setMetaOptions(response.data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
      })));
    } catch (err) {
      console.error('Failed to fetch meta tags:', err);
    } finally {
      setMetaLoading(false);
    }
  };

  const fetchGateway = async () => {
    try {
      const response = await api.get(`/marketing/meta-gateways/${id}`);
      setFormData({
        meta_name: response.data.meta_name,
        display_name: response.data.display_name,
        meta_id: response.data.meta_id,
        destination: response.data.destination,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to fetch gateway:', err);
      setError('Failed to load gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'meta_id' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.put(`/marketing/meta-gateways/${id}`, formData);
      router.push('/dashboard/metagateway/list');
    } catch (err) {
      console.error('Failed to update gateway:', err);
      setError('Failed to update gateway');
    } finally {
      setSaving(false);
    }
  };

  if (loading || metaLoading) {
    return <div className="alert alert-info">Loading...</div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Meta Gateway</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="form-group">
              <label htmlFor="meta_name">Gateway Name</label>
              <input
                type="text"
                className="form-control"
                id="meta_name"
                name="meta_name"
                value={formData.meta_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="display_name">Display Name</label>
              <input
                type="text"
                className="form-control"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meta_id">Meta Tag Set</label>
              <select
                className="form-control"
                id="meta_id"
                name="meta_id"
                value={formData.meta_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a meta tag set</option>
                {metaOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <input
                type="text"
                className="form-control"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <i className="fa fa-save"></i> Save Changes
              </button>
              <a href="/dashboard/metagateway/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
                Cancel
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
