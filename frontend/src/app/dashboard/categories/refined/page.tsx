'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface RefinedCategory {
  id: string;
  name: string;
  category_name: string;
}

export default function CategoryRefinedPage() {
  const [categories, setCategories] = useState<RefinedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRefined();
  }, []);

  const fetchRefined = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories/refined');
      setCategories(response.data.data || []);
    } catch (err) {
      setError('Failed to load refined categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Refined Search Categories</h1>
          <p><i className="fa fa-search"></i> Manage refined search categories.</p>
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

      <div className="row">
        <div className="col-lg-12">
          <Link href="/categories/refined/add" className="btn btn-primary">
            <i className="fa fa-plus"></i> Add Refined
          </Link>
          <Link href="/categories/refined/export" className="btn btn-default">
            <i className="fa fa-download"></i> Export
          </Link>
          <Link href="/categories/refined/import" className="btn btn-default">
            <i className="fa fa-upload"></i> Import
          </Link>
        </div>
      </div>
      <br />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Refined Categories ({categories.length})</h3>
              </div>
              <div className="panel-body">
                {categories.length === 0 ? (
                  <p className="text-muted">No refined categories found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id}>
                          <td>{cat.name}</td>
                          <td>{cat.category_name}</td>
                          <td>
                            <Link
                              href={`/categories/refined/edit/${cat.id}`}
                              className="btn btn-sm btn-default"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
