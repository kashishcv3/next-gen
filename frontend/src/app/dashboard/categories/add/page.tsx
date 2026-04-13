'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  parent_id: string;
  url: string;
  description: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface Category {
  id: string;
  name: string;
}

export default function CategoryAddPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    parent_id: '',
    url: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
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
      const payload = {
        ...formData,
        parent_id: formData.parent_id || null,
      };

      await api.post('/categories', payload);
      router.push('/categories/list');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Add Category</h1>
          <p><i className="fa fa-info-circle"></i> Enter category information below.</p>
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
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Category Information</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Category Name *</label>
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
                  <label>Parent Category</label>
                  <select
                    className="form-control"
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                  >
                    <option value="">No Parent (Root Category)</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>URL Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                  />
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

            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title">Meta Data</h3>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea
                    className="form-control"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label>Meta Keywords</label>
                  <textarea
                    className="form-control"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Add Category'}
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
