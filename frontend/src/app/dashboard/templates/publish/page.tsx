'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function AddPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/templates', formData);
      router.push('/templates');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Publish Template</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="panel panel-default">
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
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
                rows={4}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <Link href="/templates" className="btn btn-default" style={{ marginLeft: '10px'}}>
              Cancel
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
