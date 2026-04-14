'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface MetaTag {
  id: number;
  name: string;
  title?: string;
  description?: string;
  keywords?: string;
}

export default function MetaTagListPage() {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchMetaTags();
  }, [page]);

  const fetchMetaTags = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/marketing/meta-tags?page=${page}&page_size=${pageSize}`);
      setMetaTags(response.data.items || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch meta tags:', err);
      setError('Failed to load meta tags');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (id === 1) {
      alert('You cannot delete the default meta tag set');
      return;
    }
    if (window.confirm('Are you sure you want to delete this meta tag?')) {
      try {
        await api.delete(`/marketing/meta-tags/${id}`);
        fetchMetaTags();
      } catch (err) {
        console.error('Failed to delete meta tag:', err);
        setError('Failed to delete meta tag');
      }
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Meta Tag Sets</h1>

      <div className="panel panel-default" style={{ marginBottom: '20px' }}>
        <div className="panel-body">
          <Link href="/dashboard/meta/add" className="btn btn-success">
            <i className="fa fa-plus"></i> Create New Set
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading meta tags...</div>}

      {!loading && metaTags.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Meta Tag Sets ({total})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Set Name</th>
                  <th>Title Tag</th>
                  <th>Description</th>
                  <th>Keywords</th>
                  <th>ID</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {metaTags.map((tag) => (
                  <tr key={tag.id}>
                    <td>
                      <Link href={`/dashboard/meta/edit/${tag.id}`}>{tag.name}</Link>
                    </td>
                    <td>{tag.title ? tag.title.substring(0, 50) : '-'}</td>
                    <td>{tag.description ? tag.description.substring(0, 50) : '-'}</td>
                    <td>{tag.keywords ? tag.keywords.substring(0, 50) : '-'}</td>
                    <td>{tag.id}</td>
                    <td>
                      <Link
                        href={`/dashboard/meta/edit/${tag.id}`}
                        className="btn btn-xs btn-warning"
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      {tag.id !== 1 && (
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={() => handleDelete(tag.id)}
                          style={{ marginLeft: '5px' }}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      )}
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

      {!loading && metaTags.length === 0 && !error && (
        <div className="alert alert-info">
          No meta tag sets found. <Link href="/dashboard/meta/add">Create one now</Link>
        </div>
      )}
    </div>
  );
}
