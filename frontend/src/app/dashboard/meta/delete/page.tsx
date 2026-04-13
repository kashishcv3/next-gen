'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface MetaTag {
  id: string;
  name: string;
  key: string;
}

export default function DeleteMetaTagPage() {
  const router = useRouter();
  const [tags, setTags] = useState<MetaTag[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!selectedId) {
      setError('Please select a meta tag');
      return;
    }

    if (!window.confirm('Are you sure?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/meta/${selectedId}`);
      router.push('/meta/list');
    } catch (err) {
      console.error('Failed to delete meta tag:', err);
      setError('Failed to delete meta tag');
    } finally {
      setDeleting(false);
    }
  };

  const selected = tags.find((t) => t.id === selectedId);

  return (
    <div className="container-fluid" style={{ padding: '20px' }}>
      <h1>Delete Meta Tag</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading meta tags...</div>}

      {!loading && (
        <div className="row">
          <div className="col-md-6">
            <div className="panel panel-danger">
              <div className="panel-heading">
                <h3 className="panel-title">Delete Meta Tag</h3>
              </div>
              <div className="panel-body">
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action is permanent.
                </div>

                <div className="form-group">
                  <label htmlFor="tag">Select Meta Tag</label>
                  <select
                    className="form-control"
                    id="tag"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    disabled={deleting}
                  >
                    <option value="">-- Select a meta tag --</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selected && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h3 className="panel-title">Tag Details</h3>
                    </div>
                    <div className="panel-body">
                      <p>
                        <strong>Name:</strong> {selected.name}
                      </p>
                      <p>
                        <strong>Key:</strong> {selected.key}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleDelete}
                  disabled={deleting || !selectedId}
                >
                  <i className="fa fa-trash"></i> Delete Meta Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
