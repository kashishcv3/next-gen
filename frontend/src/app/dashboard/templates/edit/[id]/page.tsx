'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface TemplateData {
  id: string;
  name: string;
  description: string;
  content: string;
  status: string;
}

export default function TemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateData>({
    id: '',
    name: '',
    description: '',
    content: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/${id}`);
      setFormData(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/templates/${id}`, formData);
      router.push('/templates/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="alert alert-info">Loading...</div>;

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Template - {formData.name}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Template Editor (Code)</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Template Name *</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="content">Template Content (HTML/Code)</label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                style={{ fontFamily: 'monospace' }}
                placeholder="Enter HTML/template code..."
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                className="form-control"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className="fa fa-save"></i> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/templates/list" className="btn btn-default" style={{ marginLeft: '10px' }}>
              Cancel
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
