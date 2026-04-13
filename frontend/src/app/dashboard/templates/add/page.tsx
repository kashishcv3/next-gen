'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TemplateAddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    status: 'draft',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/templates', formData);
      router.push('/templates/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Add New Template</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Template Information</h3>
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
              <label htmlFor="content">Template Content</label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                placeholder="Enter HTML content..."
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <i className="fa fa-save"></i> {loading ? 'Creating...' : 'Create Template'}
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
