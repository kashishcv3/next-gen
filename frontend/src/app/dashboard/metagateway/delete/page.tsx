'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface GatewayPage {
  id: string;
  name: string;
  url: string;
}

export default function DeleteGatewayPagePage() {
  const router = useRouter();
  const [pages, setPages] = useState<GatewayPage[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!selectedId) {
      setError('Please select a gateway page');
      return;
    }

    if (!window.confirm('Are you sure?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/metagateway/${selectedId}`);
      router.push('/metagateway/list');
    } catch (err) {
      console.error('Failed to delete gateway page:', err);
      setError('Failed to delete gateway page');
    } finally {
      setDeleting(false);
    }
  };

  const selected = pages.find((p) => p.id === selectedId);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Gateway Page</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading gateway pages...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">Delete Gateway Page</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action is permanent.
                </div>

                <div className="form-group">
                  <label htmlFor="page">Select Gateway Page</label>
                  <select
                    className="form-control"
                    id="page"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={deleting}
                  >
                    <option value="">-- Select a gateway page --</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Page Details</h3>
                    </div>
                    <div className="panel-body">
                      <p>
                        <strong>Name:</strong> {selected.name}
                      </p>
                      <p>
                        <strong>URL:</strong> {selected.url}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleDelete}
                  disabled={deleting || !selectedId}
                >
                  <i className="fa fa-trash"></i> Delete Gateway Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
