'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/recipes', formData);
      router.push('/recipes/list');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px'}}>
      <h1>Add Category</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="panel panel-default">
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            <Link href="/recipes/list" className="btn btn-default" style={{ marginLeft: '10px'}}>Cancel</Link>
          </form>
        </div>
      </div>
    </div>
  );
}
