'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LinkEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/links', formData);
      router.push('/links');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Edit Link</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-default">
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
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
                rows={4}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <i className="fa fa-save"></i> {loading ? 'Saving...' : 'Save Link'}
            </button>
            <Link href="/links" className="btn btn-default" style={{ marginLeft: '10px' }}>
              Cancel
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
