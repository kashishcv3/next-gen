'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface GatewayPage {
  id: string;
  name: string;
  url: string;
  description: string;
  status: string;
  created_date: string;
}

export default function GatewayPagesListPage() {
  const [pages, setPages] = useState<GatewayPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/metagateway');
      setPages(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch gateway pages:', err);
      setError('Failed to load gateway pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/metagateway/${id}`);
        fetchPages();
      } catch (err) {
        console.error('Failed to delete page:', err);
        setError('Failed to delete page');
      }
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
      <h1>Meta Gateway Pages</h1>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/metagateway/add" className="btn btn-success">
          <i className="fa fa-plus"></i> Add Gateway Page
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading gateway pages...</div>}

      {!loading && pages.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Gateway Pages ({pages.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>{page.name}</td>
                    <td>{page.url}</td>
                    <td>{page.description}</td>
                    <td>
                      <span className={`label label-${page.status === 'active' ? 'success' : 'default'}`}>
                        {page.status}
                      </span>
                    </td>
                    <td>{formatDate(page.created_date)}</td>
                    <td>
                      <Link href={`/metagateway/edit/${page.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(page.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && pages.length === 0 && !error && (
        <div className="alert alert-info">No gateway pages found.</div>
      )}
    </div>
  );
}
