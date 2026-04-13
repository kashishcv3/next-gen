'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  category_id: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CategoryRefinedAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category_id: '',
    description: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/categories/refined', formData);
      router.push('/categories/refined');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create refined category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Refined Category</h1>
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
                <h3 className="panel-title">Refined Category Details</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-control"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
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

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Add'}
            </button>
            <a href="/categories/refined" className="btn btn-default">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
