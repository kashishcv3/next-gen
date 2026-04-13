'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface MOMBuilder {
  id: string;
  name: string;
  description: string;
  category_count: number;
  product_count: number;
  created_at: string;
  status: string;
}

export default function OrderMOMBuilderPage() {
  const [builders, setBuilders] = useState<MOMBuilder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMOMBuilders();
  }, []);

  const fetchMOMBuilders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/mom-builders');
      setBuilders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch MOM builders:', err);
      setError('Failed to load MOM builders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>MOM Builder</h1>
      <p className="text-muted">Manage Multiple Order Manager (MOM) builders</p>
      <hr />

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading MOM builders...</div>}

      {!loading && builders.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">MOM Builders ({builders.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Categories</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Products</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {builders.map((builder) => (
                  <tr key={builder.id}>
                    <td>{builder.name}</td>
                    <td>{builder.description}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge">{builder.category_count}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge">{builder.product_count}</span>
                    </td>
                    <td>{formatDate(builder.created_at)}</td>
                    <td>
                      <span className={`label label-${builder.status === 'active' ? 'success' : 'default'}`}>
                        {builder.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/orders/mom-builder/edit/${builder.id}`} className="btn btn-xs btn-primary">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <Link href={`/orders/mom-builder/categories/${builder.id}`} className="btn btn-xs btn-info" style={{ marginLeft: '5px' }}>
                        <i className="fa fa-sitemap"></i> Categories
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && builders.length === 0 && !error && (
        <div className="alert alert-info">No MOM builders configured yet.</div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-primary">
          <i className="fa fa-plus"></i> Create New MOM Builder
        </button>
      </div>
    </div>
  );
}
