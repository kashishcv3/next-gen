'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface MetaTag {
  id: string;
  name: string;
  key: string;
  value: string;
  created_date: string;
}

export default function MetaTagsListPage() {
  const [tags, setTags] = useState<MetaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/meta');
      setTags(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch meta tags:', err);
      setError('Failed to load meta tags');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/meta/${id}`);
        fetchTags();
      } catch (err) {
        console.error('Failed to delete tag:', err);
        setError('Failed to delete tag');
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
      <h1>Meta Tags</h1>

      <div style={{ marginBottom: '20px' }}>
        <Link href="/meta/add" className="btn btn-success">
          <i className="fa fa-plus"></i> Add Meta Tag
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading meta tags...</div>}

      {!loading && tags.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Meta Tags ({tags.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Created</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag.id}>
                    <td>{tag.name}</td>
                    <td>{tag.key}</td>
                    <td>{tag.value}</td>
                    <td>{formatDate(tag.created_date)}</td>
                    <td>
                      <Link href={`/meta/edit/${tag.id}`} className="btn btn-xs btn-warning">
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleDelete(tag.id)}
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

      {!loading && tags.length === 0 && !error && (
        <div className="alert alert-info">No meta tags found.</div>
      )}
    </div>
  );
}
