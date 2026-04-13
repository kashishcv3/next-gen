'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface MOCategory {
  id: string;
  name: string;
  description: string;
  product_count: number;
  position: number;
  status: string;
}

export default function OrderMOMBuilderCategoriesPage() {
  const params = useParams();
  const builderId = params.id as string;
  const [categories, setCategories] = useState<MOCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (builderId) {
      fetchCategories();
    }
  }, [builderId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/mom-builders/${builderId}/categories`);
      setCategories(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await api.delete(`/orders/mom-builders/${builderId}/categories/${categoryId}`);
      await fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category');
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>MOM Builder Categories</h1>
      <p className="text-muted">Manage categories for this MOM builder</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading categories...</div>}

      {!loading && categories.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Categories ({categories.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Position</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Products</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.position}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge">{category.product_count}</span>
                    </td>
                    <td>
                      <span className={`label label-${category.status === 'active' ? 'success' : 'default'}`}>
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/orders/mom-builder/categories/edit/${category.id}`}
                        className="btn btn-xs btn-primary"
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(category.id)}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && categories.length === 0 && !error && (
        <div className="alert alert-info">No categories configured for this MOM builder yet.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link href={`/orders/mom-builder/categories/edit?builder=${builderId}`} className="btn btn-primary">
          <i className="fa fa-plus"></i> Add Category
        </Link>
      </div>
    </div>
  );
}
