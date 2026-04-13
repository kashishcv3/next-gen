'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

export default function CategoryDeletePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await api.delete(`/categories/${selectedCategory}`);
      router.push('/categories/list');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="row"><div className="col-lg-12"><p>Loading...</p></div></div>;
  }

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Delete Category</h1>
          <p><i className="fa fa-warning"></i> Select a category to delete.</p>
        </div>
      </div>
      <br />

      {error && (
        <div className="row">
          <div className="col-lg-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Select Category to Delete</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={deleting || !selectedCategory}
            >
              {deleting ? 'Deleting...' : 'Delete Category'}
            </button>
            <a href="/categories/list" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
