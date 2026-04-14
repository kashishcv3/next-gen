'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Promo {
  promo_id: number;
  promo_name: string;
  description?: string;
  promo_type: string;
  promo_level: string;
  active: number;
}

export default function PromoListPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchPromos();
  }, [page]);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/marketing/promos?page=${page}&page_size=${pageSize}`);
      setPromos(response.data.items || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch promos:', err);
      setError('Failed to load promos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.put(`/marketing/promos/${id}/toggle`);
      fetchPromos();
    } catch (err) {
      console.error('Failed to toggle promo:', err);
      setError('Failed to toggle promo status');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this promo?')) {
      try {
        await api.delete(`/marketing/promos/${id}`);
        fetchPromos();
      } catch (err) {
        console.error('Failed to delete promo:', err);
        setError('Failed to delete promo');
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Promotions</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <Link href="/dashboard/promos/add" className="btn btn-success">
            <i className="fa fa-plus"></i> Create New Promotion
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading promos...</div>}

      {!loading && promos.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Promotions ({total})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo.promo_id}>
                    <td>
                      <Link href={`/dashboard/promos/edit/${promo.promo_id}`}>{promo.promo_name}</Link>
                    </td>
                    <td>{promo.promo_type}</td>
                    <td>{promo.promo_level}</td>
                    <td>{promo.description ? promo.description.substring(0, 50) : '-'}</td>
                    <td>
                      <span className={`label label-${promo.active ? 'success' : 'danger'}`}>
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/promos/edit/${promo.promo_id}`}
                        className="btn btn-xs btn-warning"
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className={`btn btn-xs btn-${promo.active ? 'danger' : 'success'}`}
                        onClick={() => handleToggle(promo.promo_id)}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-toggle-on"></i> {promo.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(promo.promo_id)}
                        style={{ marginLeft: '5px' }}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav style={{ marginTop: '20px', textAlign: 'center' }}>
              <ul className="pagination">
                <li className={page === 1 ? 'disabled' : ''}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                  >
                    Previous
                  </a>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={p === page ? 'active' : ''}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </a>
                  </li>
                ))}
                <li className={page === totalPages ? 'disabled' : ''}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                  >
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}

      {!loading && promos.length === 0 && !error && (
        <div className="alert alert-info">
          No promotions found. <Link href="/dashboard/promos/add">Create one now</Link>
        </div>
      )}
    </div>
  );
}
