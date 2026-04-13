'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface MOCategoryEdit {
  id?: string;
  name: string;
  description: string;
  position: number;
  status: string;
  enabled: boolean;
}

export default function OrderMOMBuilderCategoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;
  const builderId = searchParams.get('builder') || '';
  const isNew = !categoryId;

  const [category, setCategory] = useState<MOCategoryEdit>({
    name: '',
    description: '',
    position: 0,
    status: 'active',
    enabled: true,
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isNew && categoryId) {
      fetchCategory();
    }
  }, [categoryId, isNew]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/mom-builder/categories/${categoryId}`);
      setCategory(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!category.name) {
      setError('Category name is required');
      return;
    }

    try {
      setSaving(true);
      if (isNew && builderId) {
        await api.post(`/orders/mom-builders/${builderId}/categories`, category);
      } else if (categoryId) {
        await api.put(`/orders/mom-builder/categories/${categoryId}`, category);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.back();
      }, 2000);
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container-fluid" style={{ padding: '20px' }}><div className="alert alert-info">Loading category...</div></div>;
  }

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>{isNew ? 'Add New' : 'Edit'} MOM Category</h1>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Category saved successfully!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Category Details</h3>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={category.name}
                  onChange={(e) => setCategory({ ...category, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  value={category.description}
                  onChange={(e) => setCategory({ ...category, description: e.target.value })}
                  rows={3}
                  placeholder="Category description"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="number"
                  className="form-control"
                  id="position"
                  value={category.position}
                  onChange={(e) => setCategory({ ...category, position: parseInt(e.target.value) })}
                  min="0"
                />
                <p className="help-block">Display order position (lower numbers appear first)</p>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="form-control"
                  id="status"
                  value={category.status}
                  onChange={(e) => setCategory({ ...category, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={category.enabled}
                    onChange={(e) => setCategory({ ...category, enabled: e.target.checked })}
                  />
                  Enable this category
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save"></i> Save Category
                    </>
                  )}
                </button>
                <button
                  className="btn btn-default btn-lg"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="panel panel-info">
            <div className="panel-heading">
              <h3 className="panel-title">Help</h3>
            </div>
            <div className="panel-body">
              <p>
                <strong>Category Management:</strong> Create and organize categories for your MOM builder.
              </p>
              <hr />
              <p>
                Categories help organize products in a logical structure for customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
