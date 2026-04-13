'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface PriceCategory {
  id: string;
  name: string;
  percentage: number;
}

export default function ProductPriceCategoriesPage() {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/price-categories');
      setCategories(response.data.data || []);
    } catch (err) {
      setError('Failed to load price categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h1>Price Categories</h1>
          <p><i className="fa fa-list"></i> Manage price categories.</p>
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="row">
          <div className="col-lg-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Price Categories ({categories.length})</h3>
              </div>
              <div className="panel-body">
                {categories.length === 0 ? (
                  <p className="text-muted">No price categories found.</p>
                ) : (
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id}>
                          <td>{cat.name}</td>
                          <td>{cat.percentage}%</td>
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
